const clienteService = require('../../src/services/cliente.service');
const db = require('../../src/config/database');

// Mock do módulo de banco de dados
jest.mock('../../src/config/database', () => ({
  getConnection: jest.fn().mockResolvedValue({
    execute: jest.fn()
  })
}));

describe('Cliente Service', () => {
  let mockConnectionExecute;
  let originalNodeEnv;

  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
    
    // Configura o mock de execute para ser acessível
    mockConnectionExecute = jest.fn();
    db.getConnection.mockResolvedValue({ execute: mockConnectionExecute });

    // Salva o NODE_ENV original
    originalNodeEnv = process.env.NODE_ENV;
  });

  afterEach(() => {
    // Restaura o NODE_ENV original
    process.env.NODE_ENV = originalNodeEnv;
  });

  describe('Com Mock em Memória (NODE_ENV=test)', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'test';
      // Reseta o estado dos mocks em memória do serviço, se necessário.
      // Como o serviço usa um array mockClientes global, precisamos limpá-lo
      // ou re-importar o módulo de uma forma que o isole,
      // mas para este exemplo, vamos assumir que os testes são independentes
      // ou que o reset das funções mock é feito internamente no serviço para 'test' ou manualmente aqui.
      // Para simplificar, os testes atuais já operam sobre um mock global que é persistente entre testes dentro do mesmo arquivo.
      // Para um isolamento real, seria necessário resetar o `mockClientes` e `mockId` de `cliente.service.js` antes de cada teste.
    });

    // Testes existentes que usam as funções ...Mock do serviço
    describe('criarCliente (Mock)', () => {
      it('deve criar um cliente com dados válidos', async () => {
        const novoCliente = {
          nome: 'João',
          sobrenome: 'Silva',
          email: 'joao.mock@email.com', // Email diferente para evitar conflito com testes de DB
          idade: 30
        };
        // Garante que estamos testando o mock
        process.env.NODE_ENV = 'test'; 
        const clienteCriado = await clienteService.criarCliente(novoCliente);
        
        expect(clienteCriado).toHaveProperty('id');
        // IDs podem ser sequenciais no mock, então não comparamos com um ID fixo dos testes de DB
        expect(clienteCriado.nome).toBe(novoCliente.nome);
      });

      it('deve rejeitar cliente com email duplicado (Mock)', async () => {
        process.env.NODE_ENV = 'test';
        const cliente = {
          nome: 'Maria',
          sobrenome: 'Santos',
          email: 'maria.mock@email.com', // Email diferente
          idade: 25
        };
        await clienteService.criarCliente(cliente); // Cria o primeiro
        await expect(clienteService.criarCliente(cliente)) // Tenta criar de novo
          .rejects.toThrow('Email já cadastrado');
      });
    });

    describe('listarClientes (Mock)', () => {
      it('deve listar todos os clientes (Mock)', async () => {
        process.env.NODE_ENV = 'test';
        // Adiciona um cliente para garantir que a lista não esteja vazia
        await clienteService.criarCliente({ nome: 'Setup', sobrenome: 'Mock', email: 'setup.mock@email.com', idade: 99 });
        const clientes = await clienteService.listarClientes();
        expect(Array.isArray(clientes)).toBe(true);
        // Verifica se o cliente adicionado está na lista
        expect(clientes.some(c => c.email === 'setup.mock@email.com')).toBe(true);
      });
    });

    describe('buscarClientePorId (Mock)', () => {
      it('deve retornar um cliente quando ID existe (Mock)', async () => {
        process.env.NODE_ENV = 'test';
        const novoCliente = { nome: 'Pedro Mock', sobrenome: 'Costa', email: 'pedro.mock@email.com', idade: 35 };
        const clienteCriado = await clienteService.criarCliente(novoCliente);
        const clienteEncontrado = await clienteService.buscarClientePorId(clienteCriado.id);
        expect(clienteEncontrado).toMatchObject(novoCliente);
      });

      it('deve retornar null quando ID não existe (Mock)', async () => {
        process.env.NODE_ENV = 'test';
        const clienteEncontrado = await clienteService.buscarClientePorId(9999999); // ID muito alto
        expect(clienteEncontrado).toBeNull();
      });
    });

    describe('atualizarCliente (Mock)', () => {
      it('deve atualizar um cliente existente (Mock)', async () => {
        process.env.NODE_ENV = 'test';
        const clienteOriginal = await clienteService.criarCliente({ nome: 'Ana Mock', sobrenome: 'Lima', email: 'ana.mock@email.com', idade: 28 });
        const dadosAtualizados = { nome: 'Ana Maria Mock', sobrenome: 'Lima Silva', email: 'ana.nova.mock@email.com', idade: 29 };
        const clienteAtualizado = await clienteService.atualizarCliente(clienteOriginal.id, dadosAtualizados);
        expect(clienteAtualizado).toMatchObject(dadosAtualizados);
      });

      it('deve retornar null ao tentar atualizar cliente inexistente (Mock)', async () => {
        process.env.NODE_ENV = 'test';
        const resultado = await clienteService.atualizarCliente(888888, { nome: 'Teste', sobrenome: 'Inexistente', email: 'teste.inex.mock@email.com', idade: 30 });
        expect(resultado).toBeNull();
      });

       it('deve rejeitar atualização com email duplicado (Mock)', async () => {
        process.env.NODE_ENV = 'test';
        const cliente1 = await clienteService.criarCliente({ nome: 'Dup1', sobrenome: 'Test', email: 'dup1.mock@email.com', idade: 30 });
        await clienteService.criarCliente({ nome: 'Dup2', sobrenome: 'Test', email: 'dup2.mock@email.com', idade: 31 });
        
        const dadosAtualizadosComEmailDuplicado = { nome: 'Dup1 Updated', sobrenome: 'Test', email: 'dup2.mock@email.com', idade: 32 };
        
        await expect(clienteService.atualizarCliente(cliente1.id, dadosAtualizadosComEmailDuplicado))
          .rejects.toThrow('Email já cadastrado');
      });
    });

    describe('deletarCliente (Mock)', () => {
      it('deve deletar um cliente existente (Mock)', async () => {
        process.env.NODE_ENV = 'test';
        const cliente = await clienteService.criarCliente({ nome: 'Carlos Mock', sobrenome: 'Oliveira', email: 'carlos.mock@email.com', idade: 40 });
        const resultado = await clienteService.deletarCliente(cliente.id);
        expect(resultado).toBe(true);
        const clienteExcluido = await clienteService.buscarClientePorId(cliente.id);
        expect(clienteExcluido).toBeNull();
      });

      it('deve retornar false ao tentar deletar cliente inexistente (Mock)', async () => {
        process.env.NODE_ENV = 'test';
        const resultado = await clienteService.deletarCliente(777777);
        expect(resultado).toBe(false);
      });
    });
  });

  describe('Com Interação de Banco de Dados (NODE_ENV=production)', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'production'; // Força a branch de DB
    });

    describe('criarCliente (DB)', () => {
      it('deve criar um cliente no DB se o email não existir', async () => {
        const novoCliente = { nome: 'DB User', email: 'db@test.com', idade: 25, sobrenome: 'TestDB' };
        mockConnectionExecute
          .mockResolvedValueOnce([[]]) // SELECT não encontra email
          .mockResolvedValueOnce([{ insertId: 101 }]); // INSERT retorna ID

        const resultado = await clienteService.criarCliente(novoCliente);

        expect(db.getConnection).toHaveBeenCalledTimes(1);
        expect(mockConnectionExecute).toHaveBeenCalledTimes(2);
        expect(mockConnectionExecute).toHaveBeenNthCalledWith(1, 'SELECT id FROM clientes WHERE email = ?', [novoCliente.email]);
        expect(mockConnectionExecute).toHaveBeenNthCalledWith(2, 'INSERT INTO clientes (nome, sobrenome, email, idade) VALUES (?, ?, ?, ?)', [novoCliente.nome, novoCliente.sobrenome, novoCliente.email, novoCliente.idade]);
        expect(resultado).toEqual({ id: 101, ...novoCliente });
      });

      it('deve lançar erro do DB se o email já existir', async () => {
        const novoCliente = { nome: 'DB User Dup', email: 'dup.db@test.com', idade: 26, sobrenome: 'DupDB' };
        mockConnectionExecute.mockResolvedValueOnce([[{ id: 1 }]]); // SELECT encontra email

        await expect(clienteService.criarCliente(novoCliente))
          .rejects.toThrow('Email já cadastrado');
        
        expect(mockConnectionExecute).toHaveBeenCalledTimes(1);
        expect(mockConnectionExecute).toHaveBeenCalledWith('SELECT id FROM clientes WHERE email = ?', [novoCliente.email]);
      });
    });

    describe('listarClientes (DB)', () => {
      it('deve listar todos os clientes do DB', async () => {
        const mockClientesDB = [
          { id: 1, nome: 'Cliente DB 1', sobrenome: 'SDB1', email: 'c1.db@email.com', idade: 30 },
          { id: 2, nome: 'Cliente DB 2', sobrenome: 'SDB2', email: 'c2.db@email.com', idade: 40 }
        ];
        mockConnectionExecute.mockResolvedValueOnce([mockClientesDB]);

        const clientes = await clienteService.listarClientes();

        expect(db.getConnection).toHaveBeenCalledTimes(1);
        expect(mockConnectionExecute).toHaveBeenCalledTimes(1);
        expect(mockConnectionExecute).toHaveBeenCalledWith('SELECT id, nome, sobrenome, email, idade FROM clientes');
        expect(clientes).toEqual(mockClientesDB);
      });
    });

    describe('buscarClientePorId (DB)', () => {
      it('deve retornar um cliente do DB quando ID existe', async () => {
        const clienteId = 10;
        const mockClienteDB = { id: clienteId, nome: 'Pedro DB', sobrenome: 'CostaDB', email: 'pedro.db@email.com', idade: 35 };
        mockConnectionExecute.mockResolvedValueOnce([[mockClienteDB]]); // SELECT encontra cliente

        const clienteEncontrado = await clienteService.buscarClientePorId(clienteId);

        expect(db.getConnection).toHaveBeenCalledTimes(1);
        expect(mockConnectionExecute).toHaveBeenCalledTimes(1);
        expect(mockConnectionExecute).toHaveBeenCalledWith('SELECT id, nome, sobrenome, email, idade FROM clientes WHERE id = ?', [clienteId]);
        expect(clienteEncontrado).toEqual(mockClienteDB);
      });

      it('deve retornar null do DB quando ID não existe', async () => {
        const clienteId = 999;
        mockConnectionExecute.mockResolvedValueOnce([[]]); // SELECT não encontra cliente

        const clienteEncontrado = await clienteService.buscarClientePorId(clienteId);
        
        expect(mockConnectionExecute).toHaveBeenCalledWith('SELECT id, nome, sobrenome, email, idade FROM clientes WHERE id = ?', [clienteId]);
        expect(clienteEncontrado).toBeNull();
      });
    });

    describe('atualizarCliente (DB)', () => {
      const clienteId = 20;
      const dadosClienteOriginal = { id: clienteId, nome: 'Ana DB', sobrenome: 'LimaDB', email: 'ana.db@email.com', idade: 28 };
      const dadosAtualizacao = { nome: 'Ana Maria DB', sobrenome: 'Lima Silva DB', email: 'ana.nova.db@email.com', idade: 29 };

      it('deve atualizar um cliente existente no DB', async () => {
        // Mock para buscarClientePorId (chamado internamente)
        mockConnectionExecute.mockResolvedValueOnce([[dadosClienteOriginal]]); // Encontra o cliente a ser atualizado
        // Mock para SELECT de verificação de email duplicado (assumindo que o novo email não está duplicado)
        mockConnectionExecute.mockResolvedValueOnce([[]]); 
        // Mock para UPDATE
        mockConnectionExecute.mockResolvedValueOnce([{ affectedRows: 1 }]); // Simula sucesso no update

        const resultado = await clienteService.atualizarCliente(clienteId, dadosAtualizacao);

        expect(mockConnectionExecute).toHaveBeenCalledTimes(3); // buscarPorId + SELECT email + UPDATE
        expect(mockConnectionExecute).toHaveBeenNthCalledWith(1, 'SELECT id, nome, sobrenome, email, idade FROM clientes WHERE id = ?', [clienteId]);
        expect(mockConnectionExecute).toHaveBeenNthCalledWith(2, 'SELECT id FROM clientes WHERE email = ? AND id != ?', [dadosAtualizacao.email, clienteId]);
        expect(mockConnectionExecute).toHaveBeenNthCalledWith(3, 'UPDATE clientes SET nome = ?, sobrenome = ?, email = ?, idade = ? WHERE id = ?', [dadosAtualizacao.nome, dadosAtualizacao.sobrenome, dadosAtualizacao.email, dadosAtualizacao.idade, clienteId]);
        expect(resultado).toEqual({ id: clienteId, ...dadosAtualizacao });
      });
      
      it('deve lançar erro do DB se tentar atualizar para um email já existente', async () => {
        const emailDuplicado = 'email.existente.db@email.com';
        const dadosAtualizacaoComEmailDup = { ...dadosAtualizacao, email: emailDuplicado };

        mockConnectionExecute.mockResolvedValueOnce([[dadosClienteOriginal]]); // Encontra cliente original
        mockConnectionExecute.mockResolvedValueOnce([[{ id: 21 }]]); // SELECT encontra email duplicado

        await expect(clienteService.atualizarCliente(clienteId, dadosAtualizacaoComEmailDup))
          .rejects.toThrow('Email já cadastrado');
        
        expect(mockConnectionExecute).toHaveBeenCalledTimes(2); // buscarPorId + SELECT email
         expect(mockConnectionExecute).toHaveBeenNthCalledWith(2, 'SELECT id FROM clientes WHERE email = ? AND id != ?', [emailDuplicado, clienteId]);
      });
      
      it('deve retornar null do DB ao tentar atualizar cliente inexistente', async () => {
        const idInexistente = 888;
        mockConnectionExecute.mockResolvedValueOnce([[]]); // buscarClientePorId não encontra cliente

        const resultado = await clienteService.atualizarCliente(idInexistente, dadosAtualizacao);
        
        expect(mockConnectionExecute).toHaveBeenCalledTimes(1); // Apenas o buscarPorId
        expect(resultado).toBeNull();
      });
    });

    describe('deletarCliente (DB)', () => {
      it('deve deletar um cliente existente no DB', async () => {
        const clienteId = 30;
        mockConnectionExecute.mockResolvedValueOnce([{ affectedRows: 1 }]); // DELETE com sucesso

        const resultado = await clienteService.deletarCliente(clienteId);

        expect(mockConnectionExecute).toHaveBeenCalledTimes(1);
        expect(mockConnectionExecute).toHaveBeenCalledWith('DELETE FROM clientes WHERE id = ?', [clienteId]);
        expect(resultado).toBe(true);
      });

      it('deve retornar false do DB ao tentar deletar cliente inexistente', async () => {
        const clienteId = 777;
        mockConnectionExecute.mockResolvedValueOnce([{ affectedRows: 0 }]); // DELETE não afeta linhas

        const resultado = await clienteService.deletarCliente(clienteId);
        
        expect(mockConnectionExecute).toHaveBeenCalledTimes(1);
        expect(resultado).toBe(false);
      });
    });
  });
}); 