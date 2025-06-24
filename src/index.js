const fastify = require('fastify')({ logger: false });
const { setupRoutes } = require('./routes');
const fs = require('fs');
const path = require('path');
require('dotenv').config();

// Registrar plugins, se houver (ex: fastify-cors, fastify-swagger)
// fastify.register(require('@fastify/cors'), { origin: '*' });

// Configurar as rotas da aplicação
setupRoutes(fastify);

const start = async () => {
  try {
    const port = process.env.PORT || 3000;
    await fastify.listen({ port, host: '0.0.0.0' });
    fastify.log.info(`Servidor escutando na porta ${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start(); 