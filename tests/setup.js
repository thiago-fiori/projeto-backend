const { closeConnection } = require('../src/config/database');

// Limpar conexões após todos os testes
afterAll(async () => {
  await closeConnection();
});

// Configurar timeout global para testes
jest.setTimeout(10000); 