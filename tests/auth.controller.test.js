const fastify = require('fastify');
const jwt = require('jsonwebtoken');
const { setupRoutes } = require('../src/routes');

const SECRET = process.env.JWT_SECRET || 'segredo_teste';

describe('Auth Controller', () => {
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
    it('deve retornar 200 e um token JWT com credenciais válidas', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/login',
        payload: {
          usuario: 'usuario_teste',
          senha: 'senha_teste'
        }
      });
      
      expect(response.statusCode).toBe(200);
      // O serviço retorna o token diretamente como string
      const token = response.payload.replace(/"/g, ''); // Remove aspas
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
      
      // Verifica se é um JWT válido
      expect(() => jwt.verify(token, SECRET)).not.toThrow();
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
      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty('mensagem');
    });
  });

  describe('POST /logout', () => {
    it('deve retornar 200 ao fazer logout com token válido', async () => {
      // Primeiro, faz login para obter um token válido
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
      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty('mensagem');
    });

    it('deve retornar 401 ao fazer logout sem token', async () => {
      const response = await app.inject({
        method: 'POST',
        url: '/logout'
      });
      
      expect(response.statusCode).toBe(401);
      const body = JSON.parse(response.payload);
      expect(body).toHaveProperty('mensagem');
    });
  });
}); 