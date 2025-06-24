const mysql = require('mysql2/promise');

const config = {
  test: {
    host: 'localhost',
    port: 3307,
    user: 'app_user',
    password: 'app_password',
    database: 'backend_test',
  },
  development: {
    host: 'localhost',
    port: 3307,
    user: 'app_user',
    password: 'app_password',
    database: 'backend_prod',
  },
  production: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_USER || 'app_user',
    password: process.env.DB_PASSWORD || 'app_password',
    database: process.env.DB_NAME || 'backend_prod',
  }
};

let connection = null;

async function getConnection() {
  if (!connection) {
    const env = process.env.NODE_ENV || 'development';
    console.log(`Conectando ao banco MySQL - Ambiente: ${env}, Config:`, config[env]);
    connection = await mysql.createConnection(config[env]);
    console.log('Conectado ao MySQL com sucesso!');
  }
  return connection;
}

async function closeConnection() {
  if (connection) {
    await connection.end();
    connection = null;
  }
}

module.exports = {
  getConnection,
  closeConnection,
  config
}; 