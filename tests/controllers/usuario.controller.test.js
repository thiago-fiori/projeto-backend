const fastify = require('fastify');
const jwt = require('jsonwebtoken');
const { setupRoutes } = require('../../src/routes');

const SECRET = process.env.JWT_SECRET || 'segredo_teste';

describe('Usuario Controller', () => {
  let app;
  let token;

  beforeAll(async () => {
    app = fastify();
    setupRoutes(app);
    await app.ready();

    // Cria um token válido para os testes
    token = jwt.sign({ id: 1, usuario: 'teste' }, SECRET);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /usuarios', () => {
    it('deve criar um novo usuário', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/usuarios',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: {
          usuario: 'novo_usuario_test',
          senha: 'senha123'
        }
      });

      expect(response.statusCode).toBe(201);
      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty('id');
      expect(body).toHaveProperty('usuario', 'novo_usuario_test');
      expect(body).not.toHaveProperty('senha');
    });

    it('deve retornar 400 para dados inválidos', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/usuarios',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: {
          usuario: 'u', // muito curto
          senha: '123' // muito curta
        }
      });

      expect(response.statusCode).toBe(400);
    });

    it('deve retornar 409 para usuário duplicado', async () => {
      // Primeiro cria um usuário
      await app.inject({
        method: 'POST',
        url: '/usuarios',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: {
          usuario: 'usuario_duplicado_test',
          senha: 'senha123'
        }
      });

      // Tenta criar o mesmo usuário novamente
      const response = await app.inject({
        method: 'POST',
        url: '/usuarios',
        headers: {
          authorization: `Bearer ${token}`
        },
        payload: {
          usuario: 'usuario_duplicado_test',
          senha: 'outra_senha'
        }
      });

      expect(response.statusCode).toBe(409);
    });
  });

  describe('GET /usuarios', () => {
    it('deve listar todos os usuários', async () => {
      const response = await app.inject({
        method: 'GET',
        url: '/usuarios',
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
      const usuarios = JSON.parse(response.payload);
      expect(Array.isArray(usuarios)).toBe(true);
      usuarios.forEach(usuario => {
        expect(usuario).toHaveProperty('id');
        expect(usuario).toHaveProperty('usuario');
        expect(usuario).not.toHaveProperty('senha');
      });
    });
  });
}); 