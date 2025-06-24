const fs = require('fs').promises;
const path = require('path');
const db = require('../config/database');

async function executeMigrations() {
  try {
    const conn = await db.getConnection();
    
    // Caminho para o arquivo SQL de setup
    const sqlFilePath = path.join(__dirname, '../../sql/001-create-tables.sql');
    
    const sql = await fs.readFile(sqlFilePath, 'utf8');
    
    // Divide o script em comandos individuais, pois alguns drivers não suportam múltiplos comandos de uma vez
    const commands = sql.split(';').filter(command => command.trim() !== '');
    
    console.log(`Executando setup do banco de dados: ${sqlFilePath}`);
    for (const command of commands) {
      await conn.execute(command + ';'); // Adiciona ';' de volta se necessário
    }
    
    console.log('Setup do banco de dados concluído com sucesso!');
  } catch (error) {
    console.error('Erro ao executar setup do banco de dados:', error);
    throw error;
  }
}

module.exports = { executeMigrations }; 