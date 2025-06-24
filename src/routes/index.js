const { login, logout } = require('../controllers/auth.controller');
const { criarUsuario, listarUsuarios } = require('../controllers/usuario.controller');
const { authMiddleware } = require('../middlewares/auth.middleware');
const clienteController = require('../controllers/cliente.controller');
const produtoController = require('../controllers/produto.controller');
const fs = require('fs');
const path = require('path');

function setupRoutes(app) {
  // Rotas de autenticação
  app.post('/login', login);
  app.post('/logout', {
    preHandler: authMiddleware,
    handler: logout
  });

  // Rotas de usuários
  app.post('/usuarios', {
    preHandler: authMiddleware,
    handler: criarUsuario
  });
  app.get('/usuarios', {
    preHandler: authMiddleware,
    handler: listarUsuarios
  });

  // Rotas de clientes (protegidas por autenticação)
  app.post('/clientes', {
    preHandler: authMiddleware,
    handler: clienteController.criarCliente
  });
  
  app.get('/clientes', {
    preHandler: authMiddleware,
    handler: clienteController.listarClientes
  });
  
  app.get('/clientes/:id', {
    preHandler: authMiddleware,
    handler: clienteController.buscarClientePorId
  });
  
  app.put('/clientes/:id', {
    preHandler: authMiddleware,
    handler: clienteController.atualizarCliente
  });
  
  app.delete('/clientes/:id', {
    preHandler: authMiddleware,
    handler: clienteController.deletarCliente
  });

  // Rotas de produtos (sem autenticação)
  app.post('/produtos', {
    handler: produtoController.criarProduto
  });
  
  app.get('/produtos', {
    handler: produtoController.listarProdutos
  });
  
  app.get('/produtos/:id', {
    handler: produtoController.buscarProdutoPorId
  });
  
  app.put('/produtos/:id', {
    handler: produtoController.atualizarProduto
  });
  
  app.delete('/produtos/:id', {
    handler: produtoController.deletarProduto
  });


  // Rota para servir a nova página frontend única
  app.get('/frontend', async (request, reply) => {
    try {
      const htmlPath = path.join(__dirname, '../frontend/app.html');
      const html = fs.readFileSync(htmlPath, 'utf8');
      return reply.type('text/html').send(html);
    } catch (error) {
      return reply.code(404).send({ error: 'Página não encontrada' });
    }
  });
}

module.exports = { setupRoutes }; 