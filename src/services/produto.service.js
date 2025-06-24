const db = require('../config/database');

async function criarProduto({ nome, descricao, preco }) {
  try {
    
    const conn = await db.getConnection();
    
    const [result] = await conn.execute(
      'INSERT INTO produtos (nome, descricao, preco, data_atualizado) VALUES (?, ?, ?, NOW())',
      [nome, descricao || '', preco]
    );
    
    const [produto] = await conn.execute(
      'SELECT * FROM produtos WHERE id = ?',
      [result.insertId]
    );
    
    
    return produto[0];
  } catch (error) {
    throw error;
  }
}

async function listarProdutos() {
  try {
    const conn = await db.getConnection();
    const [produtos] = await conn.execute('SELECT * FROM produtos ORDER BY id DESC');
    return produtos;
  } catch (error) {
    
    throw error;
  }
}

async function buscarProdutoPorId(id) {
  try {
    const conn = await db.getConnection();
    const [produtos] = await conn.execute(
      'SELECT * FROM produtos WHERE id = ?',
      [id]
    );
    return produtos[0];
  } catch (error) {
    throw error;
  }
}

async function atualizarProduto(id, { nome, descricao, preco }) {
  try {
    const conn = await db.getConnection();
    const [result] = await conn.execute(
      'UPDATE produtos SET nome = ?, descricao = ?, preco = ?, data_atualizado = NOW() WHERE id = ?',
      [nome, descricao || '', preco, id]
    );
    
    if (result.affectedRows === 0) {
      return null;
    }
    
    return buscarProdutoPorId(id);
  } catch (error) {
    throw error;
  }
}

async function deletarProduto(id) {
  try {
    const conn = await db.getConnection();
    const [result] = await conn.execute(
      'DELETE FROM produtos WHERE id = ?',
      [id]
    );
    return result.affectedRows > 0;
  } catch (error) {
    
    throw error;
  }
}

module.exports = {
  criarProduto,
  listarProdutos,
  buscarProdutoPorId,
  atualizarProduto,
  deletarProduto
}; 