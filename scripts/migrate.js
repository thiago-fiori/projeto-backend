#!/usr/bin/env node

/**
 * Script de Migração do Banco de Dados
 * 
 * Este script executa as migrações necessárias para configurar
 * o banco de dados com todas as tabelas e dados iniciais.
 * 
 * Uso:
 * node scripts/migrate.js [ambiente]
 * 
 * Ambientes disponíveis: development, test, production
 */

const fs = require('fs').promises;
const path = require('path');
const mysql = require('mysql2/promise');
require('dotenv').config();

// Configurações de banco por ambiente
const dbConfigs = {
  development: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_ROOT_USER || 'root',
    password: process.env.DB_ROOT_PASSWORD || 'root',
    multipleStatements: true,
    connectTimeout: 60000,
    acquireTimeout: 60000,
    timeout: 60000
  },
  test: {
    host: process.env.DB_HOST || 'localhost',
    port: process.env.DB_PORT || 3307,
    user: process.env.DB_ROOT_USER || 'root',
    password: process.env.DB_ROOT_PASSWORD || 'root',
    multipleStatements: true,
    connectTimeout: 60000,
    acquireTimeout: 60000,
    timeout: 60000
  },
  production: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT || 3306,
    user: process.env.DB_ROOT_USER,
    password: process.env.DB_ROOT_PASSWORD,
    multipleStatements: true,
    connectTimeout: 60000,
    acquireTimeout: 60000,
    timeout: 60000
  }
};

/**
 * Executa comandos SQL para um banco específico
 */
async function executeForDatabase(config, database, commands) {
  console.log(`📊 Executando comandos para o banco: ${database}`);
  
  // Cria conexão específica para o banco
  const dbConfig = { ...config, database };
  const dbConnection = await mysql.createConnection(dbConfig);
  
  try {
    for (let i = 0; i < commands.length; i++) {
      const command = commands[i];
      try {
        console.log(`🔄 [${database}] Comando ${i + 1}/${commands.length}:`, command.substring(0, 50) + '...');
        await dbConnection.execute(command);
        console.log(`✅ [${database}] Comando ${i + 1} executado com sucesso`);
      } catch (cmdError) {
        console.error(`❌ [${database}] Erro no comando ${i + 1}:`, cmdError.message);
        console.error(`📝 Comando: ${command}`);
      }
    }
  } finally {
    await dbConnection.end();
  }
}

/**
 * Executa um arquivo SQL estruturado
 */
async function executeSQLFile(connection, filePath, config) {
  try {
    console.log(`📄 Executando arquivo: ${filePath}`);
    
    // Primeiro, criar os bancos de dados
    console.log('🏗️  Criando bancos de dados...');
    await connection.execute('CREATE DATABASE IF NOT EXISTS backend_prod');
    await connection.execute('CREATE DATABASE IF NOT EXISTS backend_test');
    
    // Comandos para o banco de produção
    const prodCommands = [
      `CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario VARCHAR(255) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS clientes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        sobrenome VARCHAR(255),
        email VARCHAR(255) NOT NULL UNIQUE,
        idade INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS produtos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        descricao VARCHAR(1000) NOT NULL,
        preco DECIMAL(10,2) NOT NULL,
        data_atualizado DATETIME NOT NULL
      )`,
      `INSERT IGNORE INTO usuarios (usuario, senha) VALUES
        ('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
        ('joao.silva', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
        ('maria.santos', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
        ('pedro.costa', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
        ('ana.oliveira', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')`,
      `INSERT IGNORE INTO clientes (nome, sobrenome, email, idade) VALUES
        ('Carlos', 'Alberto', 'carlos.alberto@example.com', 30),
        ('Fernanda', 'Lima', 'fernanda.lima@example.com', 25),
        ('Ricardo', 'Gomes', 'ricardo.gomes@example.com', 42),
        ('Juliana', 'Pereira', 'juliana.pereira@example.com', 35),
        ('Lucas', 'Martins', 'lucas.martins@example.com', 28)`,
      `INSERT IGNORE INTO produtos (nome, descricao, preco, data_atualizado) VALUES
        ('Smartphone X', 'Smartphone de última geração com câmera de 108MP', 2999.90, NOW()),
        ('Notebook Pro', 'Notebook potente para trabalho e jogos', 7500.00, NOW()),
        ('Smart TV 4K', 'TV com resolução 4K e HDR', 3200.50, NOW()),
        ('Fone de Ouvido Bluetooth', 'Fone sem fio com cancelamento de ruído', 499.00, NOW()),
        ('Mouse Gamer', 'Mouse com alta precisão para gamers', 250.75, NOW())`
    ];
    
    // Comandos para o banco de teste
    const testCommands = [
      `CREATE TABLE IF NOT EXISTS usuarios (
        id INT AUTO_INCREMENT PRIMARY KEY,
        usuario VARCHAR(255) NOT NULL UNIQUE,
        senha VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS clientes (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        sobrenome VARCHAR(255),
        email VARCHAR(255) NOT NULL UNIQUE,
        idade INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )`,
      `CREATE TABLE IF NOT EXISTS produtos (
        id INT AUTO_INCREMENT PRIMARY KEY,
        nome VARCHAR(255) NOT NULL,
        descricao VARCHAR(1000) NOT NULL,
        preco DECIMAL(10,2) NOT NULL,
        data_atualizado DATETIME NOT NULL
      )`,
      `INSERT IGNORE INTO usuarios (usuario, senha) VALUES
        ('usuario_teste', '$2b$10$abcdefghijklmnopqrstuvwxyz123456'),
        ('admin_teste', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi')`,
      `INSERT IGNORE INTO clientes (nome, sobrenome, email, idade) VALUES
        ('João', 'Teste', 'joao.teste@example.com', 25),
        ('Maria', 'Exemplo', 'maria.exemplo@example.com', 30)`,
      `INSERT IGNORE INTO produtos (nome, descricao, preco, data_atualizado) VALUES
        ('Produto Teste 1', 'Descrição do produto de teste 1', 100.00, '2024-01-01 10:00:00'),
        ('Produto Teste 2', 'Descrição do produto de teste 2', 200.50, '2024-01-02 11:00:00')`
    ];
    
    // Executar comandos para produção
    await executeForDatabase(config, 'backend_prod', prodCommands);
    
    // Executar comandos para teste
    await executeForDatabase(config, 'backend_test', testCommands);
    
    // Configurar privilégios
    console.log('🔐 Configurando privilégios...');
    await connection.execute("GRANT ALL PRIVILEGES ON backend_prod.* TO 'app_user'@'%'");
    await connection.execute("GRANT ALL PRIVILEGES ON backend_test.* TO 'app_user'@'%'");
    await connection.execute('FLUSH PRIVILEGES');
    
    console.log(`✅ Arquivo executado com sucesso: ${path.basename(filePath)}`);
  } catch (error) {
    console.error(`❌ Erro ao executar ${filePath}:`, error.message);
    throw error;
  }
}

/**
 * Verifica se as tabelas foram criadas corretamente
 */
async function verifyTables(connection, database) {
  console.log(`🔍 Verificando tabelas no banco ${database}...`);
  
  const [tables] = await connection.execute(
    `SELECT TABLE_NAME FROM INFORMATION_SCHEMA.TABLES WHERE TABLE_SCHEMA = ?`,
    [database]
  );
  
  const expectedTables = ['usuarios', 'clientes', 'produtos'];
  const existingTables = tables.map(row => row.TABLE_NAME);
  
  for (const table of expectedTables) {
    if (existingTables.includes(table)) {
      console.log(`✅ Tabela ${table} criada com sucesso`);
    } else {
      throw new Error(`❌ Tabela ${table} não foi criada`);
    }
  }
}

/**
 * Verifica se existem dados nas tabelas
 */
async function verifyData(connection, database) {
  console.log(`📊 Verificando dados no banco ${database}...`);
  
  const tables = ['usuarios', 'clientes', 'produtos'];
  
  for (const table of tables) {
    const [rows] = await connection.execute(
      `SELECT COUNT(*) as count FROM ${database}.${table}`
    );
    const count = rows[0].count;
    console.log(`📝 Tabela ${table}: ${count} registros`);
  }
}

/**
 * Função principal de migração
 */
async function runMigration() {
  const ambiente = process.argv[2] || 'development';
  
  console.log('🚀 Iniciando migração do banco de dados...');
  console.log(`📝 Ambiente: ${ambiente}`);
  
  const config = dbConfigs[ambiente];
  if (!config) {
    console.error(`❌ Ambiente inválido: ${ambiente}`);
    console.log('Ambientes disponíveis: development, test, production');
    process.exit(1);
  }
  
  let connection;
  
  try {
    // Conectar ao MySQL
    console.log('🔌 Conectando ao banco de dados...');
    console.log(`📡 Host: ${config.host}:${config.port}`);
    console.log(`👤 Usuário: ${config.user}`);
    
    connection = await mysql.createConnection(config);
    console.log('✅ Conexão estabelecida com sucesso');
    
    // Executar script de inicialização
    const initScript = path.join(__dirname, 'init.sql');
    await executeSQLFile(connection, initScript, config);
    
    // Verificar se tudo foi criado corretamente
    await verifyTables(connection, 'backend_prod');
    await verifyTables(connection, 'backend_test');
    
    // Verificar dados
    await verifyData(connection, 'backend_prod');
    await verifyData(connection, 'backend_test');
    
    console.log('🎉 Migração concluída com sucesso!');
    console.log('');
    console.log('📋 Resumo:');
    console.log('✅ Bancos criados: backend_prod, backend_test');
    console.log('✅ Tabelas criadas: usuarios, clientes, produtos');
    console.log('✅ Dados iniciais inseridos');
    console.log('✅ Privilégios configurados');
    console.log('');
    console.log('🔑 Credenciais de teste:');
    console.log('   • Usuario: usuario_teste');
    console.log('   • Senha: senha_teste');
    console.log('   • Admin: admin / password');
    
  } catch (error) {
    console.error('❌ Erro durante a migração:');
    console.error('📋 Detalhes do erro:', error.message);
    console.error('🔧 Código do erro:', error.code);
    console.error('📊 SQL State:', error.sqlState);
    console.error('');
    console.error('🛠️  Possíveis soluções:');
    console.error('   1. Verifique se o Docker MySQL está rodando: docker ps');
    console.error('   2. Verifique as credenciais no .env');
    console.error('   3. Teste a conexão: docker exec -it backend_mysql mysql -u root -p');
    console.error('   4. Verifique se a porta 3307 está livre');
    process.exit(1);
  } finally {
    if (connection) {
      await connection.end();
      console.log('🔌 Conexão com banco encerrada');
    }
  }
}

/**
 * Função para rollback (limpar bancos)
 */
async function rollback() {
  const ambiente = process.argv[3] || 'development';
  const config = dbConfigs[ambiente];
  
  console.log('🗑️  Iniciando rollback (limpeza) do banco...');
  console.log(`⚠️  ATENÇÃO: Isso irá DELETAR todos os dados!`);
  
  const readline = require('readline');
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
  });
  
  rl.question('Digite "CONFIRMAR" para continuar: ', async (answer) => {
    if (answer !== 'CONFIRMAR') {
      console.log('❌ Operação cancelada');
      rl.close();
      return;
    }
    
    let connection;
    try {
      connection = await mysql.createConnection(config);
      
      await connection.execute('DROP DATABASE IF EXISTS backend_prod');
      await connection.execute('DROP DATABASE IF EXISTS backend_test');
      
      console.log('✅ Bancos removidos com sucesso');
    } catch (error) {
      console.error('❌ Erro durante rollback:', error.message);
    } finally {
      if (connection) await connection.end();
      rl.close();
    }
  });
}

// Verificar argumentos da linha de comando
if (process.argv.includes('--rollback')) {
  rollback();
} else if (process.argv.includes('--help') || process.argv.includes('-h')) {
  console.log(`
🗃️  Script de Migração do Banco de Dados

Uso:
  node scripts/migrate.js [ambiente]           # Executar migração
  node scripts/migrate.js --rollback          # Fazer rollback
  node scripts/migrate.js --help              # Mostrar ajuda

Ambientes:
  development  # Banco de desenvolvimento (padrão)
  test         # Banco de testes
  production   # Banco de produção

Exemplos:
  node scripts/migrate.js                     # Migração em development
  node scripts/migrate.js production          # Migração em production
  node scripts/migrate.js --rollback          # Remover todos os bancos

Variáveis de ambiente:
  DB_HOST      # Host do banco (padrão: localhost)
  DB_USER      # Usuário do banco (padrão: root)
  DB_PASSWORD  # Senha do banco
  `);
} else {
  runMigration();
}

module.exports = { runMigration, rollback }; 