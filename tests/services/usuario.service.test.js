const bcrypt = require('bcrypt');
const usuarioService = require('../../src/services/usuario.service');
const db = require('../../src/config/database');

// Mock do módulo de banco de dados
jest.mock('../../src/config/database', () => ({
  getConnection: jest.fn().mockResolvedValue({
    execute: jest.fn()
  })
}));

// Mock parcial do bcrypt para espiar o hash sem quebrar sua funcionalidade
const bcryptHashSpy = jest.spyOn(bcrypt, 'hash');

describe('Usuario Service', () => {
  let mockConnectionExecute;
  let originalNodeEnv;

  beforeEach(() => {
    jest.clearAllMocks();
    mockConnectionExecute = jest.fn();
    db.getConnection.mockResolvedValue({ execute: mockConnectionExecute });
    originalNodeEnv = process.env.NODE_ENV;
    bcryptHashSpy.mockClear(); // Limpa o spy do bcrypt
  });

  afterEach(() => {
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('Com Mock em Memória (NODE_ENV=test)', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'test';
      // Para isolamento completo dos testes de mock, seria ideal resetar
      // o array mockUsuarios e mockId do usuario.service.js aqui.
      // Por simplicidade, assumimos que os testes não interferem drasticamente ou são escritos para serem independentes.
    });

    describe('criarUsuario (Mock)', () => {
      it('deve criar um usuário com senha criptografada (Mock)', async () => {
        const novoUsuario = {
          usuario: 'novo_usuario_mock',
          senha: 'senha123'
        };
        const usuarioCriado = await usuarioService.criarUsuario(novoUsuario);
        expect(usuarioCriado).toHaveProperty('id');
        expect(usuarioCriado.usuario).toBe(novoUsuario.usuario);
        expect(usuarioCriado.senha).not.toBe(novoUsuario.senha);
        expect(bcryptHashSpy).toHaveBeenCalledWith(novoUsuario.senha, 10); 
        expect(usuarioCriado.senha).toMatch(/^\$2b\$\d+\$/);
      });

      it('deve rejeitar usuário com nome duplicado (Mock)', async () => {
        const usuario = {
          usuario: 'usuario_duplicado_mock',
          senha: 'senha123'
        };
        await usuarioService.criarUsuario(usuario); // Cria primeiro
        await expect(usuarioService.criarUsuario(usuario)) // Tenta criar de novo
          .rejects.toThrow('Usuário já existe');
      });
    });

    describe('listarUsuarios (Mock)', () => {
      it('deve listar todos os usuários sem expor as senhas (Mock)', async () => {
        await usuarioService.criarUsuario({ usuario: 'mock_user1', senha: 's1' });
        await usuarioService.criarUsuario({ usuario: 'mock_user2', senha: 's2' });
        const usuarios = await usuarioService.listarUsuarios();
        expect(usuarios.length).toBeGreaterThanOrEqual(2);
        usuarios.forEach(u => {
          expect(u).toHaveProperty('id');
          expect(u).toHaveProperty('usuario');
          expect(u).not.toHaveProperty('senha');
        });
      });
    });
  });

  describe('Com Interação de Banco de Dados (NODE_ENV=production)', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production';
    });

    describe('criarUsuario (DB)', () => {
      it('deve criar um usuário no DB com senha hasheada se o usuário não existir', async () => {
        const dadosNovoUsuario = { usuario: 'usuario_db_test', senha: 'senhaDB123' };
        const mockSenhaHash = 'hashed_password_from_db_test';
        
        mockConnectionExecute
          .mockResolvedValueOnce([[]]) // Simula que SELECT não encontrou o usuário
          .mockResolvedValueOnce([{ insertId: 101 }]); // Simula insert bem-sucedido
        
        bcryptHashSpy.mockResolvedValueOnce(mockSenhaHash); // Mocka o resultado do bcrypt.hash

        const resultado = await usuarioService.criarUsuario(dadosNovoUsuario);

        expect(db.getConnection).toHaveBeenCalledTimes(1);
        expect(mockConnectionExecute).toHaveBeenCalledTimes(2);
        expect(mockConnectionExecute).toHaveBeenNthCalledWith(1, 'SELECT id FROM usuarios WHERE usuario = ?', [dadosNovoUsuario.usuario]);
        expect(bcryptHashSpy).toHaveBeenCalledWith(dadosNovoUsuario.senha, 10);
        expect(mockConnectionExecute).toHaveBeenNthCalledWith(2, 'INSERT INTO usuarios (usuario, senha) VALUES (?, ?)', [dadosNovoUsuario.usuario, mockSenhaHash]);
        expect(resultado).toEqual({
          id: 101,
          usuario: dadosNovoUsuario.usuario,
          senha: mockSenhaHash
        });
      });

      it('deve lançar erro do DB se o usuário já existir', async () => {
        const dadosUsuarioExistente = { usuario: 'usuario_db_existente', senha: 'outraSenha' };
        mockConnectionExecute.mockResolvedValueOnce([[{ id: 50 }]]); // Simula que SELECT encontrou o usuário

        await expect(usuarioService.criarUsuario(dadosUsuarioExistente))
          .rejects.toThrow('Usuário já existe');
        
        expect(mockConnectionExecute).toHaveBeenCalledTimes(1);
        expect(mockConnectionExecute).toHaveBeenCalledWith('SELECT id FROM usuarios WHERE usuario = ?', [dadosUsuarioExistente.usuario]);
        expect(bcryptHashSpy).not.toHaveBeenCalled(); // Não deve tentar hashear a senha se o usuário já existe
      });
    });

    describe('listarUsuarios (DB)', () => {
      it('deve listar todos os usuários do DB sem senhas', async () => {
        const mockUsuariosDB = [
          { id: 1, usuario: 'db_user_1' },
          { id: 2, usuario: 'db_user_2' }
        ];
        mockConnectionExecute.mockResolvedValueOnce([mockUsuariosDB]);

        const usuarios = await usuarioService.listarUsuarios();

        expect(db.getConnection).toHaveBeenCalledTimes(1);
        expect(mockConnectionExecute).toHaveBeenCalledTimes(1);
        expect(mockConnectionExecute).toHaveBeenCalledWith('SELECT id, usuario FROM usuarios');
        expect(usuarios).toEqual(mockUsuariosDB);
        usuarios.forEach(u => {
            expect(u).not.toHaveProperty('senha');
        });
      });
    });
  });
}); 