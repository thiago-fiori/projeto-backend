const fastify = require('fastify');
const jwt = require('jsonwebtoken');
const { setupRoutes } = require('../../src/routes');
const clienteService = require('../../src/services/cliente.service');

const SECRET = process.env.JWT_SECRET || 'segredo_teste';

// Mock do node-cache
jest.mock('node-cache', () => {
  const mockCache = {
    get: jest.fn(),
    set: jest.fn(),
    del: jest.fn()
  };
  return jest.fn().mockImplementation(() => mockCache);
});

// Mock do serviço de cliente
jest.mock('../../src/services/cliente.service');

describe('Cliente Controller', () => {
  let app;
  let token;
  let mockCache;

  beforeAll(async () => {
    app = fastify();
    setupRoutes(app);
    await app.ready();

    // Cria um token válido para os testes
    token = jwt.sign({ id: 1, usuario: 'teste' }, SECRET);
    
    // Acessa o mock do cache
    const NodeCache = require('node-cache');
    mockCache = new NodeCache();
  });

  afterAll(async () => {
    await app.close();
  });

  beforeEach(() => {
    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
    mockCache.get.mockClear();
    mockCache.set.mockClear();
    mockCache.del.mockClear();
  });

  describe('POST /clientes', () => {
    it('deve criar um novo cliente', async () => {
      const dadosNovoCliente = {
        nome: 'João',
        sobrenome: 'Silva',
        email: 'joao@email.com',
        idade: 30
      };
      const clienteCriadoMock = { id: 1, ...dadosNovoCliente };
      clienteService.criarCliente.mockResolvedValue(clienteCriadoMock);

      const response = await app.inject({
        method: 'POST',
        url: '/clientes',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: dadosNovoCliente
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body).toEqual(clienteCriadoMock);
      expect(clienteService.criarCliente).toHaveBeenCalledWith(dadosNovoCliente);
      expect(mockCache.del).toHaveBeenCalledWith('clientes_list');
    });

    it('deve retornar 400 para nome vazio', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/clientes',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: {
          nome: '',
          sobrenome: 'Silva',
          email: 'teste@email.com',
          idade: 30
        }
      });
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.mensagem).toBe('Nome é obrigatório');
      expect(clienteService.criarCliente).not.toHaveBeenCalled();
    });

    it('deve retornar 400 para email sem @', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/clientes',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: {
          nome: 'Nome Valido',
          sobrenome: 'Sobrenome',
          email: 'emailinvalido.com',
          idade: 30
        }
      });
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.mensagem).toBe('Email inválido');
      expect(clienteService.criarCliente).not.toHaveBeenCalled();
    });
    
    it('deve retornar 400 para email vazio', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/clientes',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: {
          nome: 'Nome Valido',
          sobrenome: 'Sobrenome',
          email: '',
          idade: 30
        }
      });
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.mensagem).toBe('Email inválido');
      expect(clienteService.criarCliente).not.toHaveBeenCalled();
    });

    it('deve retornar 400 para idade negativa', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/clientes',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: {
          nome: 'Nome Valido',
          sobrenome: 'Sobrenome',
          email: 'email@valido.com',
          idade: -1
        }
      });
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.mensagem).toBe('Idade deve ser um número positivo');
      expect(clienteService.criarCliente).not.toHaveBeenCalled();
    });

    it('deve retornar 400 para idade não numérica', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/clientes',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: {
          nome: 'Nome Valido',
          sobrenome: 'Sobrenome',
          email: 'email@valido.com',
          idade: 'abc'
        }
      });
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.mensagem).toBe('Idade deve ser um número positivo');
      expect(clienteService.criarCliente).not.toHaveBeenCalled();
    });

    it('deve retornar 400 para idade maior que 120', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/clientes',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: {
          nome: 'Nome Valido',
          sobrenome: 'Sobrenome',
          email: 'email@valido.com',
          idade: 150
        }
      });
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.mensagem).toBe('Idade deve ser menor que 120');
      expect(clienteService.criarCliente).not.toHaveBeenCalled();
    });

    it('deve retornar 409 para email duplicado', async () => {
      const clientePayload = {
        nome: 'Maria',
        sobrenome: 'Santos',
        email: 'maria@email.com',
        idade: 25
      };
      clienteService.criarCliente.mockRejectedValue(new Error('Email já cadastrado'));

      const response = await app.inject({
        method: 'POST',
        url: '/clientes',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: clientePayload
      });

      expect(response.statusCode).toBe(409);
      const body = JSON.parse(response.payload);
      expect(body.mensagem).toBe('Email já cadastrado');
      expect(clienteService.criarCliente).toHaveBeenCalledWith(clientePayload);
    });

    it('deve retornar 500 se o serviço falhar ao criar cliente (erro genérico)', async () => {
      const clientePayload = {
        nome: 'Erro',
        sobrenome: 'Teste',
        email: 'erro@email.com',
        idade: 50
      };
      clienteService.criarCliente.mockRejectedValue(new Error('Erro genérico no serviço'));
      
      const response = await app.inject({
        method: 'POST',
        url: '/clientes',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: clientePayload
      });

      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.payload);
      expect(body.mensagem).toBe('Erro ao criar cliente');
      expect(clienteService.criarCliente).toHaveBeenCalledWith(clientePayload);
    });
  });

  describe('GET /clientes', () => {
    it('deve listar todos os clientes (primeira chamada - banco de dados)', async () => {
      const mockClientes = [
        { id: 1, nome: 'Cliente 1', email: 'c1@email.com', idade: 30 },
        { id: 2, nome: 'Cliente 2', email: 'c2@email.com', idade: 40 }
      ];
      
      // Simula cache vazio (primeira chamada)
      mockCache.get.mockReturnValue(undefined);
      clienteService.listarClientes.mockResolvedValue(mockClientes);

      const response = await app.inject({
        method: 'GET',
        url: '/clientes',
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
      const clientes = JSON.parse(response.payload);
      expect(Array.isArray(clientes)).toBe(true);
      expect(clientes).toEqual(mockClientes);
      expect(clienteService.listarClientes).toHaveBeenCalledTimes(1);
      expect(mockCache.get).toHaveBeenCalledWith('clientes_list');
      expect(mockCache.set).toHaveBeenCalledWith('clientes_list', mockClientes);
    });

    it('deve retornar dados do cache (segunda chamada)', async () => {
      const mockClientes = [
        { id: 1, nome: 'Cliente Cached', email: 'cached@email.com', idade: 25 }
      ];
      
      // Simula dados no cache
      mockCache.get.mockReturnValue(mockClientes);

      const response = await app.inject({
        method: 'GET',
        url: '/clientes',
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
      const clientes = JSON.parse(response.payload);
      expect(clientes).toEqual(mockClientes);
      expect(mockCache.get).toHaveBeenCalledWith('clientes_list');
      expect(clienteService.listarClientes).not.toHaveBeenCalled();
      expect(mockCache.set).not.toHaveBeenCalled();
    });

    it('deve retornar 500 se o serviço falhar ao listar clientes', async () => {
      mockCache.get.mockReturnValue(undefined);
      clienteService.listarClientes.mockRejectedValue(new Error('Erro no serviço'));
      
      const response = await app.inject({
        method: 'GET',
        url: '/clientes',
        headers: {
          authorization: `Bearer ${token}`
        }
      });
      
      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.payload);
      expect(body.mensagem).toBe('Erro ao listar clientes');
    });
  });

  describe('GET /clientes/:id', () => {
    it('deve retornar um cliente específico', async () => {
      const clienteId = 1;
      const mockCliente = { id: clienteId, nome: 'Pedro', email: 'pedro@email.com', idade: 35 };
      clienteService.buscarClientePorId.mockResolvedValue(mockCliente);

      const response = await app.inject({
        method: 'GET',
        url: `/clientes/${clienteId}`,
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
      const cliente = JSON.parse(response.payload);
      expect(cliente).toEqual(mockCliente);
      expect(clienteService.buscarClientePorId).toHaveBeenCalledWith(clienteId);
    });

    it('deve retornar 404 para cliente não encontrado', async () => {
      const clienteIdInexistente = 99999;
      clienteService.buscarClientePorId.mockResolvedValue(undefined);

      const response = await app.inject({
        method: 'GET',
        url: `/clientes/${clienteIdInexistente}`,
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(404);
      expect(clienteService.buscarClientePorId).toHaveBeenCalledWith(clienteIdInexistente);
    });

    it('deve retornar 500 se o serviço falhar ao buscar cliente por id', async () => {
      const clienteId = 1;
      clienteService.buscarClientePorId.mockRejectedValue(new Error('Erro no serviço'));
      const response = await app.inject({
        method: 'GET',
        url: `/clientes/${clienteId}`,
        headers: {
          authorization: `Bearer ${token}`
        }
      });
      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.payload);
      expect(body.mensagem).toBe('Erro ao buscar cliente');
    });
  });

  describe('PUT /clientes/:id', () => {
    it('deve atualizar um cliente existente', async () => {
      const clienteId = 1;
      const dadosAtualizacao = {
        nome: 'Ana Maria',
        sobrenome: 'Lima Silva',
        email: 'ana.nova@email.com',
        idade: 29
      };
      const clienteAtualizadoMock = { id: clienteId, ...dadosAtualizacao };
      clienteService.atualizarCliente.mockResolvedValue(clienteAtualizadoMock);
      
      const response = await app.inject({
        method: 'PUT',
        url: `/clientes/${clienteId}`,
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: dadosAtualizacao
      });

      expect(response.statusCode).toBe(200);
      const clienteAtualizado = JSON.parse(response.payload);
      expect(clienteAtualizado).toEqual(clienteAtualizadoMock);
      expect(clienteService.atualizarCliente).toHaveBeenCalledWith(clienteId, dadosAtualizacao);
      expect(mockCache.del).toHaveBeenCalledWith('clientes_list');
    });

    it('deve retornar 400 para nome vazio ao atualizar', async () => {
      const clienteId = 1;
      const response = await app.inject({
        method: 'PUT',
        url: `/clientes/${clienteId}`,
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: { nome: '', sobrenome: 'Silva', email: 'teste@email.com', idade: 30 }
      });
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.mensagem).toBe('Nome é obrigatório');
      expect(clienteService.atualizarCliente).not.toHaveBeenCalled();
    });

    it('deve retornar 400 para email sem @ ao atualizar', async () => {
      const clienteId = 1;
      const response = await app.inject({
        method: 'PUT',
        url: `/clientes/${clienteId}`,
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: { nome: 'Nome', sobrenome: 'Silva', email: 'testeemail.com', idade: 30 }
      });
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.mensagem).toBe('Email inválido');
      expect(clienteService.atualizarCliente).not.toHaveBeenCalled();
    });
    
    it('deve retornar 400 para email vazio ao atualizar', async () => {
      const clienteId = 1;
      const response = await app.inject({
        method: 'PUT',
        url: `/clientes/${clienteId}`,
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: { nome: 'Nome', sobrenome: 'Silva', email: '', idade: 30 }
      });
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.mensagem).toBe('Email inválido');
      expect(clienteService.atualizarCliente).not.toHaveBeenCalled();
    });

    it('deve retornar 400 para idade negativa ao atualizar', async () => {
      const clienteId = 1;
      const response = await app.inject({
        method: 'PUT',
        url: `/clientes/${clienteId}`,
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: { nome: 'Nome', sobrenome: 'Silva', email: 'teste@email.com', idade: -5 }
      });
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.mensagem).toBe('Idade deve ser um número positivo');
      expect(clienteService.atualizarCliente).not.toHaveBeenCalled();
    });
    
    it('deve retornar 400 para idade não numérica ao atualizar', async () => {
      const clienteId = 1;
      const response = await app.inject({
        method: 'PUT',
        url: `/clientes/${clienteId}`,
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: { nome: 'Nome', sobrenome: 'Silva', email: 'teste@email.com', idade: 'abc' }
      });
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.mensagem).toBe('Idade deve ser um número positivo');
      expect(clienteService.atualizarCliente).not.toHaveBeenCalled();
    });

    it('deve retornar 400 para idade maior que 120 ao atualizar', async () => {
      const clienteId = 1;
      const response = await app.inject({
        method: 'PUT',
        url: `/clientes/${clienteId}`,
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: { nome: 'Nome', sobrenome: 'Silva', email: 'teste@email.com', idade: 130 }
      });
      expect(response.statusCode).toBe(400);
      const body = JSON.parse(response.payload);
      expect(body.mensagem).toBe('Idade deve ser menor que 120');
      expect(clienteService.atualizarCliente).not.toHaveBeenCalled();
    });

    it('deve retornar 404 para cliente não encontrado ao atualizar', async () => {
      const clienteIdInexistente = 99999;
      const dadosAtualizacao = { nome: 'Teste', sobrenome: 'Inexistente', email: 'teste@email.com', idade: 30 };
      clienteService.atualizarCliente.mockResolvedValue(null);

      const response = await app.inject({
        method: 'PUT',
        url: `/clientes/${clienteIdInexistente}`,
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: dadosAtualizacao
      });

      expect(response.statusCode).toBe(404);
      expect(clienteService.atualizarCliente).toHaveBeenCalledWith(clienteIdInexistente, dadosAtualizacao);
    });

    it('deve retornar 409 para email duplicado ao atualizar', async () => {
      const clienteId = 1;
      const dadosAtualizacao = { nome: 'Ana', sobrenome: 'Lima', email: 'email.duplicado@email.com', idade: 30 };
      clienteService.atualizarCliente.mockRejectedValue(new Error('Email já cadastrado'));

      const response = await app.inject({
        method: 'PUT',
        url: `/clientes/${clienteId}`,
        headers: { authorization: `Bearer ${token}` },
        payload: dadosAtualizacao
      });

      expect(response.statusCode).toBe(409);
      const body = JSON.parse(response.payload);
      expect(body.mensagem).toBe('Email já cadastrado');
      expect(clienteService.atualizarCliente).toHaveBeenCalledWith(clienteId, dadosAtualizacao);
    });

    it('deve retornar 500 se o serviço falhar ao atualizar cliente (erro genérico)', async () => {
      const clienteId = 1;
      const dadosAtualizacao = { nome: 'Erro', sobrenome: 'Update', email: 'erro@update.com', idade: 33 };
      clienteService.atualizarCliente.mockRejectedValue(new Error('Erro genérico no serviço'));

      const response = await app.inject({
        method: 'PUT',
        url: `/clientes/${clienteId}`,
        headers: { authorization: `Bearer ${token}` },
        payload: dadosAtualizacao
      });

      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.payload);
      expect(body.mensagem).toBe('Erro ao atualizar cliente');
      expect(clienteService.atualizarCliente).toHaveBeenCalledWith(clienteId, dadosAtualizacao);
    });
  });

  describe('DELETE /clientes/:id', () => {
    it('deve deletar um cliente existente', async () => {
      const clienteId = 1;
      clienteService.deletarCliente.mockResolvedValue(true);

      const response = await app.inject({
        method: 'DELETE',
        url: `/clientes/${clienteId}`,
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(204);
      expect(clienteService.deletarCliente).toHaveBeenCalledWith(clienteId);
      expect(mockCache.del).toHaveBeenCalledWith('clientes_list');
    });

    it('deve retornar 404 para cliente não encontrado ao deletar', async () => {
      const clienteIdInexistente = 99999;
      clienteService.deletarCliente.mockResolvedValue(false);

      const response = await app.inject({
        method: 'DELETE',
        url: `/clientes/${clienteIdInexistente}`,
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(404);
      expect(clienteService.deletarCliente).toHaveBeenCalledWith(clienteIdInexistente);
    });

    it('deve retornar 500 se o serviço falhar ao deletar cliente', async () => {
      const clienteId = 1;
      clienteService.deletarCliente.mockRejectedValue(new Error('Erro no serviço'));
      const response = await app.inject({
        method: 'DELETE',
        url: `/clientes/${clienteId}`,
        headers: {
          authorization: `Bearer ${token}`
        }
      });
      expect(response.statusCode).toBe(500);
      const body = JSON.parse(response.payload);
      expect(body.mensagem).toBe('Erro ao deletar cliente');
    });
  });
}); 