const produtoService = require('../../src/services/produto.service');
const db = require('../../src/config/database');

// Mock do módulo de banco de dados
jest.mock('../../src/config/database', () => ({
  getConnection: jest.fn().mockResolvedValue({
    execute: jest.fn()
  })
}));

describe('Produto Service', () => {
  let mockConnection;

  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
    mockConnection = {
      execute: jest.fn()
    };
    db.getConnection.mockResolvedValue(mockConnection);
  });

  describe('criarProduto', () => {
    it('deve criar um novo produto', async () => {
      const novoProduto = {
        nome: 'Produto Teste',
        descricao: 'Descrição do produto teste',
        preco: 99.99
      };

      const mockInsertResult = {
        insertId: 1
      };

      const mockProdutoCriado = {
        id: 1,
        ...novoProduto,
        data_atualizado: new Date()
      };

      mockConnection.execute
        .mockResolvedValueOnce([mockInsertResult])
        .mockResolvedValueOnce([[mockProdutoCriado]]);

      const resultado = await produtoService.criarProduto(novoProduto);

      expect(resultado).toEqual(mockProdutoCriado);
      expect(mockConnection.execute).toHaveBeenCalledTimes(2);
    });
  });

  describe('listarProdutos', () => {
    it('deve listar todos os produtos', async () => {
      const mockProdutos = [
        { id: 1, nome: 'Produto 1', descricao: 'Desc 1', preco: 10.99, data_atualizado: new Date() },
        { id: 2, nome: 'Produto 2', descricao: 'Desc 2', preco: 20.99, data_atualizado: new Date() }
      ];

      mockConnection.execute.mockResolvedValueOnce([mockProdutos]);

      const produtos = await produtoService.listarProdutos();

      expect(produtos).toEqual(mockProdutos);
      expect(mockConnection.execute).toHaveBeenCalledTimes(1);
      expect(mockConnection.execute).toHaveBeenCalledWith('SELECT * FROM produtos ORDER BY id DESC');
    });
  });

  describe('buscarProdutoPorId', () => {
    it('deve retornar um produto específico', async () => {
      const mockProduto = {
        id: 1,
        nome: 'Produto Teste',
        descricao: 'Descrição teste',
        preco: 99.99,
        data_atualizado: new Date()
      };

      mockConnection.execute.mockResolvedValueOnce([[mockProduto]]);

      const produto = await produtoService.buscarProdutoPorId(1);

      expect(produto).toEqual(mockProduto);
      expect(mockConnection.execute).toHaveBeenCalledWith(
        'SELECT * FROM produtos WHERE id = ?',
        [1]
      );
    });

    it('deve retornar null para produto não encontrado', async () => {
      mockConnection.execute.mockResolvedValueOnce([[]]);

      const produto = await produtoService.buscarProdutoPorId(999);

      expect(produto).toBeUndefined();
      expect(mockConnection.execute).toHaveBeenCalledWith(
        'SELECT * FROM produtos WHERE id = ?',
        [999]
      );
    });
  });

  describe('atualizarProduto', () => {
    it('deve atualizar um produto existente', async () => {
      const dadosAtualizacao = {
        nome: 'Produto Atualizado',
        descricao: 'Descrição atualizada',
        preco: 199.99
      };

      const mockUpdateResult = {
        affectedRows: 1
      };

      const mockProdutoAtualizado = {
        id: 1,
        ...dadosAtualizacao,
        data_atualizado: new Date()
      };

      mockConnection.execute
        .mockResolvedValueOnce([mockUpdateResult])
        .mockResolvedValueOnce([[mockProdutoAtualizado]]);

      const resultado = await produtoService.atualizarProduto(1, dadosAtualizacao);

      expect(resultado).toEqual(mockProdutoAtualizado);
      expect(mockConnection.execute).toHaveBeenCalledTimes(2);
    });

    it('deve retornar null para produto não encontrado', async () => {
      const dadosAtualizacao = {
        nome: 'Produto Inexistente',
        descricao: 'Descrição teste',
        preco: 99.99
      };

      const mockUpdateResult = {
        affectedRows: 0
      };

      mockConnection.execute.mockResolvedValueOnce([mockUpdateResult]);

      const resultado = await produtoService.atualizarProduto(999, dadosAtualizacao);

      expect(resultado).toBeNull();
      expect(mockConnection.execute).toHaveBeenCalledTimes(1);
    });
  });

  describe('deletarProduto', () => {
    it('deve deletar um produto existente', async () => {
      const mockDeleteResult = {
        affectedRows: 1
      };

      mockConnection.execute.mockResolvedValueOnce([mockDeleteResult]);

      const resultado = await produtoService.deletarProduto(1);

      expect(resultado).toBe(true);
      expect(mockConnection.execute).toHaveBeenCalledWith(
        'DELETE FROM produtos WHERE id = ?',
        [1]
      );
    });

    it('deve retornar false para produto não encontrado', async () => {
      const mockDeleteResult = {
        affectedRows: 0
      };

      mockConnection.execute.mockResolvedValueOnce([mockDeleteResult]);

      const resultado = await produtoService.deletarProduto(999);

      expect(resultado).toBe(false);
      expect(mockConnection.execute).toHaveBeenCalledWith(
        'DELETE FROM produtos WHERE id = ?',
        [999]
      );
    });
  });
}); 