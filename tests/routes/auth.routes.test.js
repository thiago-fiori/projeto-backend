const fastify = require('fastify');
const { setupRoutes } = require('../../src/routes');

describe('Auth Routes', () => {
  let app;

  beforeAll(async () => {
    app = fastify();
    setupRoutes(app);
    await app.ready();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /login', () => {
    it('deve retornar token com credenciais válidas', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/login',
        payload: {
          usuario: 'usuario_teste',
          senha: 'senha_teste'
        }
      });

      expect(response.statusCode).toBe(200);
      const token = response.payload.replace(/"/g, '');
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
    });

    it('deve retornar 401 com credenciais inválidas', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/login',
        payload: {
          usuario: 'usuario_invalido',
          senha: 'senha_errada'
        }
      });

      expect(response.statusCode).toBe(401);
    });
  });

  describe('POST /logout', () => {
    it('deve fazer logout com token válido', async () => {
      const loginResponse = await app.inject({
        method: 'POST',
        url: '/login',
        payload: {
          usuario: 'usuario_teste',
          senha: 'senha_teste'
        }
      });

      const token = loginResponse.payload.replace(/"/g, '');

      const response = await app.inject({
        method: 'POST',
        url: '/logout',
        headers: {
          authorization: `Bearer ${token}`
        }
      });

      expect(response.statusCode).toBe(200);
    });

    it('deve retornar 401 sem token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/logout'
      });

      expect(response.statusCode).toBe(401);
    });
  });
}); 