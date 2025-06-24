const authService = require('../src/services/auth.service');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const db = require('../src/config/database');

// Mock do módulo de banco de dados
jest.mock('../src/config/database', () => ({
  getConnection: jest.fn().mockResolvedValue({
    execute: jest.fn(),
  }),
}));

// Spies para bcrypt e jwt
const bcryptCompareSpy = jest.spyOn(bcrypt, 'compare');
const jwtSignSpy = jest.spyOn(jwt, 'sign');
// A blacklist é interna do auth.service.js e usada no modo teste.
// Não precisamos mocká-la diretamente aqui, mas sim controlar o NODE_ENV.

describe('Auth Service', () => {
  let mockConnectionExecute;
  let originalNodeEnv;

  beforeEach(() => {
    jest.clearAllMocks();
    mockConnectionExecute = jest.fn();
    db.getConnection.mockResolvedValue({ execute: mockConnectionExecute });
    originalNodeEnv = process.env.NODE_ENV;
    // Limpar spies
    bcryptCompareSpy.mockClear();
    jwtSignSpy.mockClear();
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('Com Mock em Memória (NODE_ENV=test)', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'test';
      // Limpar a blacklist do authService entre os testes de mock para evitar interferência
      // Isso requer acesso à blacklist ou uma função de reset no serviço, o que não temos.
      // Para este exemplo, vamos assumir que a ordem dos testes ou a natureza deles não causa problemas.
      // Ou poderíamos resetar o módulo: jest.resetModules(); authService = require('../src/services/auth.service');
      // No entanto, para o logout/isTokenBlacklisted, o estado da blacklist é crucial.
      // A melhor abordagem seria ter uma função de reset no serviço para testes ou resetar o módulo.
      // Por ora, vamos garantir que os tokens sejam únicos para cada teste de logout/isBlacklisted no mock.
    });

    describe('login (Mock)', () => {
      it('deve retornar um token JWT para usuário e senha válidos (Mock)', async () => {
        const usuario = 'usuario_teste'; // Definido no mockUsuarios do auth.service.js
        const senha = 'senha_teste';     // Senha em texto plano para o mock
        const token = await authService.login(usuario, senha);
        expect(typeof token).toBe('string');
        const decoded = jwt.decode(token);
        expect(decoded).toHaveProperty('usuario', usuario);
        expect(jwtSignSpy).toHaveBeenCalled(); // jwt.sign é chamado no mock também
      });

      it('deve lançar erro para usuário inválido (Mock)', async () => {
        await expect(authService.login('usuario_invalido_mock', 'senha_teste')).rejects.toThrow('Usuário ou senha inválidos');
      });

      it('deve lançar erro para senha inválida (Mock)', async () => {
        await expect(authService.login('usuario_teste', 'senha_errada_mock')).rejects.toThrow('Usuário ou senha inválidos');
      });
    });

    describe('logout (Mock)', () => {
      it('deve adicionar o token à blacklist (Mock)', async () => {
        const tokenMock = jwt.sign({ usuario: 'logout_mock_user' }, 'segredo_teste');
        await authService.logout(tokenMock);
        const isBlacklisted = await authService.isTokenBlacklisted(tokenMock);
        expect(isBlacklisted).toBe(true);
      });
    });

    describe('isTokenBlacklisted (Mock)', () => {
      it('deve retornar true para token na blacklist (Mock)', async () => {
        const tokenNaBlacklist = jwt.sign({ usuario: 'blacklisted_user_mock' }, 'segredo_teste');
        await authService.logout(tokenNaBlacklist); // Adiciona à blacklist
        expect(await authService.isTokenBlacklisted(tokenNaBlacklist)).toBe(true);
      });

      it('deve retornar false para token não bloqueado (Mock)', async () => {
        const tokenNaoBloqueado = jwt.sign({ usuario: 'non_blacklisted_user_mock' }, 'segredo_teste');
        const isBlacklisted = await authService.isTokenBlacklisted(tokenNaoBloqueado);
        expect(isBlacklisted).toBe(false);
      });
    });
  });

  describe('Com Interação de Banco de Dados (NODE_ENV=production)', () => {
    const SECRET_DB = process.env.JWT_SECRET || 'segredo_teste';
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    describe('login (DB)', () => {
      const mockUsuarioDB = { id: 1, usuario: 'db_user', senha: 'hashed_password' };

      it('deve retornar token JWT e atualizar no DB para login bem-sucedido', async () => {
        const senhaLogin = 'senha123';
        const mockGeneratedToken = 'mock_jwt_token_db';

        mockConnectionExecute
          .mockResolvedValueOnce([[mockUsuarioDB]]) // SELECT encontra usuário
          .mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE do token bem-sucedido
        
        bcryptCompareSpy.mockResolvedValueOnce(true); // Senha correta
        jwtSignSpy.mockReturnValueOnce(mockGeneratedToken); // Mocka o token gerado

        const token = await authService.login(mockUsuarioDB.usuario, senhaLogin);

        expect(mockConnectionExecute).toHaveBeenCalledTimes(2);
        expect(mockConnectionExecute).toHaveBeenNthCalledWith(1, 'SELECT * FROM usuarios WHERE usuario = ?', [mockUsuarioDB.usuario]);
        expect(bcryptCompareSpy).toHaveBeenCalledWith(senhaLogin, mockUsuarioDB.senha);
        expect(jwtSignSpy).toHaveBeenCalledWith({ usuario: mockUsuarioDB.usuario, id: mockUsuarioDB.id }, SECRET_DB, { expiresIn: '1h' });
        expect(mockConnectionExecute).toHaveBeenNthCalledWith(2, 'UPDATE usuarios SET token = ? WHERE id = ?', [mockGeneratedToken, mockUsuarioDB.id]);
        expect(token).toBe(mockGeneratedToken);
      });

      it('deve lançar erro se usuário não encontrado no DB', async () => {
        mockConnectionExecute.mockResolvedValueOnce([[]]); // SELECT não encontra usuário
        await expect(authService.login('usuario_nao_existe_db', 'senha123')).rejects.toThrow('Usuário ou senha inválidos');
        expect(bcryptCompareSpy).not.toHaveBeenCalled();
      });

      it('deve lançar erro se a senha estiver incorreta (DB)', async () => {
        mockConnectionExecute.mockResolvedValueOnce([[mockUsuarioDB]]); // SELECT encontra usuário
        bcryptCompareSpy.mockResolvedValueOnce(false); // Senha incorreta

        await expect(authService.login(mockUsuarioDB.usuario, 'senha_errada_db')).rejects.toThrow('Usuário ou senha inválidos');
        expect(bcryptCompareSpy).toHaveBeenCalledWith('senha_errada_db', mockUsuarioDB.senha);
        expect(mockConnectionExecute).toHaveBeenCalledTimes(1); // Apenas o SELECT
      });
    });

    describe('logout (DB)', () => {
      it('deve setar o token do usuário para NULL no DB', async () => {
        const tokenParaLogout = 'token_ativo_no_db';
        mockConnectionExecute.mockResolvedValueOnce([{ affectedRows: 1 }]); // UPDATE bem-sucedido

        const resultado = await authService.logout(tokenParaLogout);

        expect(mockConnectionExecute).toHaveBeenCalledTimes(1);
        expect(mockConnectionExecute).toHaveBeenCalledWith('UPDATE usuarios SET token = NULL WHERE token = ?', [tokenParaLogout]);
        expect(resultado).toBe(true);
      });
    });

    describe('isTokenBlacklisted (DB)', () => {
      it('deve retornar true se o token não for encontrado no DB (implicitamente blacklisted/inválido)', async () => {
        const tokenInvalidoOuExpirado = 'token_que_nao_existe_no_db';
        mockConnectionExecute.mockResolvedValueOnce([[{ count: 0 }]]); // SELECT retorna count 0

        const isBlacklisted = await authService.isTokenBlacklisted(tokenInvalidoOuExpirado);

        expect(mockConnectionExecute).toHaveBeenCalledTimes(1);
        expect(mockConnectionExecute).toHaveBeenCalledWith('SELECT COUNT(*) as count FROM usuarios WHERE token = ?', [tokenInvalidoOuExpirado]);
        expect(isBlacklisted).toBe(true);
      });

      it('deve retornar false se o token for encontrado no DB (ainda ativo)', async () => {
        const tokenAtivo = 'token_valido_e_ativo_db';
        mockConnectionExecute.mockResolvedValueOnce([[{ count: 1 }]]); // SELECT retorna count 1

        const isBlacklisted = await authService.isTokenBlacklisted(tokenAtivo);
        
        expect(mockConnectionExecute).toHaveBeenCalledTimes(1);
        expect(mockConnectionExecute).toHaveBeenCalledWith('SELECT COUNT(*) as count FROM usuarios WHERE token = ?', [tokenAtivo]);
        expect(isBlacklisted).toBe(false);
      });
    });
  });
}); 