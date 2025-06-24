const fastify = require('fastify');
const { setupRoutes } = require('../../src/routes');
const produtoService = require('../../src/services/produto.service');

// Mock do serviço de produto
jest.mock('../../src/services/produto.service');

describe('Produto Controller', () => {
  let app;

  beforeAll(async () => {
    app = fastify();
    setupRoutes(app);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
  });

  describe('POST /produtos', () => {
    it('deve criar um novo produto', async () => {
      const dadosNovoProduto = {
        nome: 'Produto Teste',
        descricao: 'Descrição do produto teste',
        preco: 99.99
      };
      const produtoCriadoMock = {
        id: 1,
        ...dadosNovoProduto,
        data_atualizado: new Date().toISOString()
      };

      produtoService.criarProduto.mockResolvedValue(produtoCriadoMock);

      const response = await app.inject({
        method: 'POST',
        url: '/produtos',
        payload: {
          nome: 'Produto Teste',
          descricao: 'Descrição do produto teste',
          preco: 99.99
        }
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body).toEqual(produtoCriadoMock);
      expect(body.nome).toBe('Produto Teste');
      expect(body.descricao).toBe('Descrição do produto teste');
      expect(body.preco).toBe(99.99);
      expect(body).toHaveProperty('data_atualizado');
      expect(produtoService.criarProduto).toHaveBeenCalledTimes(1);
      expect(produtoService.criarProduto).toHaveBeenCalledWith(dadosNovoProduto);
    });

    it('deve retornar 400 para nome vazio', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/produtos',
        payload: {
          nome: '',
          descricao: 'Descrição válida',
          preco: 10
        }
      });
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.mensagem).toBe('Nome é obrigatório');
      expect(produtoService.criarProduto).not.toHaveBeenCalled();
    });

    it('deve retornar 400 para descrição vazia', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/produtos',
        payload: {
          nome: 'Nome Válido',
          descricao: '',
          preco: 10
        }
      });
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.mensagem).toBe('Descrição é obrigatória');
      expect(produtoService.criarProduto).not.toHaveBeenCalled();
    });

    it('deve retornar 400 para preço inválido (string)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/produtos',
        payload: {
          nome: 'Nome Válido',
          descricao: 'Descrição válida',
          preco: 'abc'
        }
      });
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.mensagem).toBe('Preço deve ser um número positivo');
      expect(produtoService.criarProduto).not.toHaveBeenCalled();
    });

    it('deve retornar 400 para preço inválido (zero)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/produtos',
        payload: {
          nome: 'Nome Válido',
          descricao: 'Descrição válida',
          preco: 0
        }
      });
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.mensagem).toBe('Preço deve ser um número positivo');
      expect(produtoService.criarProduto).not.toHaveBeenCalled();
    });

    it('deve retornar 500 se o serviço falhar ao criar produto', async () => {
      produtoService.criarProduto.mockRejectedValue(new Error('Erro no serviço'));
      const response = await app.inject({
        method: 'POST',
        url: '/produtos',
        payload: {
          nome: 'Produto Teste Erro',
          descricao: 'Descrição do produto teste erro',
          preco: 50
        }
      });
      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.payload);
      expect(body.mensagem).toBe('Erro ao criar produto');
    });

    it('deve retornar 400 para dados inválidos (teste original)', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/produtos',
        payload: {
          nome: '', // vazio
          descricao: '', // vazio
          preco: 'não é número' // tipo inválido
        }
      });

      expect(response.statusCode).toBe(400);
      expect(produtoService.criarProduto).not.toHaveBeenCalled();
    });
  });

  describe('GET /produtos', () => {
    it('deve listar todos os produtos', async () => {
      const mockListaProdutos = [
        { id: 1, nome: 'Produto 1', descricao: 'Desc 1', preco: 10.99, data_atualizado: new Date().toISOString() },
        { id: 2, nome: 'Produto 2', descricao: 'Desc 2', preco: 20.99, data_atualizado: new Date().toISOString() }
      ];
      produtoService.listarProdutos.mockResolvedValue(mockListaProdutos);

      const response = await app.inject({
        method: 'GET',
        url: '/produtos'
      });

      expect(response.statusCode).toBe(200);
      const produtos = JSON.parse(response.payload);
      expect(Array.isArray(produtos)).toBe(true);
      expect(produtos).toEqual(mockListaProdutos);
      expect(produtoService.listarProdutos).toHaveBeenCalledTimes(1);
    });

    it('deve retornar 500 se o serviço falhar ao listar produtos', async () => {
      produtoService.listarProdutos.mockRejectedValue(new Error('Erro no serviço'));
      const response = await app.inject({
        method: 'GET',
        url: '/produtos'
      });
      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.payload);
      expect(body.mensagem).toBe('Erro ao listar produtos');
    });
  });

  describe('GET /produtos/:id', () => {
    it('deve retornar um produto específico', async () => {
      const produtoId = 1;
      const mockProduto = {
        id: produtoId,
        nome: 'Produto Busca',
        descricao: 'Descrição do produto busca',
        preco: 149.99,
        data_atualizado: new Date().toISOString()
      };
      produtoService.buscarProdutoPorId.mockResolvedValue(mockProduto);

      const response = await app.inject({
        method: 'GET',
        url: `/produtos/${produtoId}`
      });

      expect(response.statusCode).toBe(200);
      const produto = JSON.parse(response.payload);
      expect(produto).toEqual(mockProduto);
      expect(produtoService.buscarProdutoPorId).toHaveBeenCalledWith(produtoId);
    });

    it('deve retornar 500 se o serviço falhar ao buscar produto por id', async () => {
      const produtoId = 1;
      produtoService.buscarProdutoPorId.mockRejectedValue(new Error('Erro no serviço'));
      const response = await app.inject({
        method: 'GET',
        url: `/produtos/${produtoId}`
      });
      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.payload);
      expect(body.mensagem).toBe('Erro ao buscar produto');
    });
  });

  describe('PUT /produtos/:id', () => {
    it('deve atualizar um produto existente', async () => {
      const produtoId = 1;
      const dadosAtualizacao = {
        nome: 'Produto Atualizado',
        descricao: 'Descrição atualizada',
        preco: 299.99
      };
      const produtoAtualizadoMock = {
        id: produtoId,
        ...dadosAtualizacao,
        data_atualizado: new Date().toISOString()
      };
      produtoService.atualizarProduto.mockResolvedValue(produtoAtualizadoMock);

      const response = await app.inject({
        method: 'PUT',
        url: `/produtos/${produtoId}`,
        payload: dadosAtualizacao
      });

      expect(response.statusCode).toBe(200);
      const produtoAtualizado = JSON.parse(response.payload);
      expect(produtoAtualizado).toEqual(produtoAtualizadoMock);
      expect(new Date(produtoAtualizado.data_atualizado)).toBeInstanceOf(Date);
      expect(isNaN(new Date(produtoAtualizado.data_atualizado).getTime())).toBe(false);
      expect(produtoService.atualizarProduto).toHaveBeenCalledWith(produtoId, dadosAtualizacao);
    });

    it('deve retornar 400 para nome vazio ao atualizar', async () => {
      const produtoId = 1;
      const response = await app.inject({
        method: 'PUT',
        url: `/produtos/${produtoId}`,
        payload: {
          nome: '',
          descricao: 'Descrição válida',
          preco: 10
        }
      });
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.mensagem).toBe('Nome é obrigatório');
      expect(produtoService.atualizarProduto).not.toHaveBeenCalled();
    });

    it('deve retornar 400 para descrição vazia ao atualizar', async () => {
      const produtoId = 1;
      const response = await app.inject({
        method: 'PUT',
        url: `/produtos/${produtoId}`,
        payload: {
          nome: 'Nome Válido',
          descricao: '',
          preco: 10
        }
      });
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.mensagem).toBe('Descrição é obrigatória');
      expect(produtoService.atualizarProduto).not.toHaveBeenCalled();
    });

    it('deve retornar 400 para preço inválido (string) ao atualizar', async () => {
      const produtoId = 1;
      const response = await app.inject({
        method: 'PUT',
        url: `/produtos/${produtoId}`,
        payload: {
          nome: 'Nome Válido',
          descricao: 'Descrição válida',
          preco: 'abc'
        }
      });
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.mensagem).toBe('Preço deve ser um número positivo');
      expect(produtoService.atualizarProduto).not.toHaveBeenCalled();
    });

    it('deve retornar 400 para preço inválido (zero) ao atualizar', async () => {
      const produtoId = 1;
      const response = await app.inject({
        method: 'PUT',
        url: `/produtos/${produtoId}`,
        payload: {
          nome: 'Nome Válido',
          descricao: 'Descrição válida',
          preco: 0
        }
      });
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.mensagem).toBe('Preço deve ser um número positivo');
      expect(produtoService.atualizarProduto).not.toHaveBeenCalled();
    });

    it('deve retornar 500 se o serviço falhar ao atualizar produto', async () => {
      const produtoId = 1;
      const dadosAtualizacao = {
        nome: 'Produto Atualizado Erro',
        descricao: 'Descrição atualizada erro',
        preco: 150
      };
      produtoService.atualizarProduto.mockRejectedValue(new Error('Erro no serviço'));
      const response = await app.inject({
        method: 'PUT',
        url: `/produtos/${produtoId}`,
        payload: dadosAtualizacao
      });
      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.payload);
      expect(body.mensagem).toBe('Erro ao atualizar produto');
    });

    it('deve retornar 404 para produto não encontrado', async () => {
      const produtoIdInexistente = 99999;
      produtoService.atualizarProduto.mockResolvedValue(null);

      const response = await app.inject({
        method: 'PUT',
        url: `/produtos/${produtoIdInexistente}`,
        payload: {
          nome: 'Produto Inexistente',
          descricao: 'Descrição teste',
          preco: 99.99
        }
      });

      expect(response.statusCode).toBe(404);
      expect(produtoService.atualizarProduto).toHaveBeenCalledWith(produtoIdInexistente, {
        nome: 'Produto Inexistente',
        descricao: 'Descrição teste',
        preco: 99.99
      });
    });
  });

  describe('DELETE /produtos/:id', () => {
    it('deve deletar um produto existente', async () => {
      const produtoId = 1;
      produtoService.deletarProduto.mockResolvedValue(true);

      const response = await app.inject({
        method: 'DELETE',
        url: `/produtos/${produtoId}`
      });

      expect(response.statusCode).toBe(204);
      expect(produtoService.deletarProduto).toHaveBeenCalledWith(produtoId);
    });

    it('deve retornar 500 se o serviço falhar ao deletar produto', async () => {
      const produtoId = 1;
      produtoService.deletarProduto.mockRejectedValue(new Error('Erro no serviço'));
      const response = await app.inject({
        method: 'DELETE',
        url: `/produtos/${produtoId}`
      });
      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.payload);
      expect(body.mensagem).toBe('Erro ao deletar produto');
    });

    it('deve retornar 404 para produto não encontrado', async () => {
      const produtoIdInexistente = 99999;
      produtoService.deletarProduto.mockResolvedValue(false);

      const response = await app.inject({
        method: 'DELETE',
        url: `/produtos/${produtoIdInexistente}`
      });

      expect(response.statusCode).toBe(404);
      expect(produtoService.deletarProduto).toHaveBeenCalledWith(produtoIdInexistente);
    });
  });
}); 