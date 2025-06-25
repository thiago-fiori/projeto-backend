const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { getConnection } = require('../config/database');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET || 'segredo_teste';

const blacklist = new Set();

// Mock apenas para testes
const mockUsuarios = [
  { 
    usuario: 'usuario_teste', 
    // senha_teste
    senha: '$2b$10$abcdefghijklmnopqrstuvwxyz123456'
  },
];

async function login(usuario, senha) {
  if (process.env.NODE_ENV === 'test') {
    return loginMock(usuario, senha);
  }
  
  const conn = await getConnection();
  const [rows] = await conn.execute(
    'SELECT * FROM usuarios WHERE usuario = ?',
    [usuario]
  );

  const user = rows[0];


  if (!user || !(await bcrypt.compare(senha, user.senha))) {
    throw new Error('Usuário ou senha inválidos');
  }

  const token = jwt.sign({ usuario: user.usuario, id: user.id }, SECRET, { expiresIn: '1h' });
  
  // Atualiza o token no banco
  await conn.execute(
    'UPDATE usuarios SET token = ? WHERE id = ?',
    [token, user.id]
  );

  return token;
}

async function loginMock(usuario, senha) {
  const user = mockUsuarios.find(u => u.usuario === usuario);
  // Para testes, aceita a senha em texto plano para o usuário de teste
  if (!user || senha !== 'senha_teste') {
    throw new Error('Usuário ou senha inválidos');
  }
  return jwt.sign({ usuario: user.usuario }, SECRET, { expiresIn: '1h' });
}

async function logout(token) {
  if (process.env.NODE_ENV === 'test') {
    blacklist.add(token);
    return true;
  }

  const conn = await getConnection();
  await conn.execute(
    'UPDATE usuarios SET token = NULL WHERE token = ?',
    [token]
  );
  return true;
}

async function isTokenBlacklisted(token) {
  if (process.env.NODE_ENV === 'test') {
    return blacklist.has(token);
  }

  const conn = await getConnection();
  const [rows] = await conn.execute(
    'SELECT COUNT(*) as count FROM usuarios WHERE token = ?',
    [token]
  );

  return rows[0].count === 0;
}

module.exports = { login, logout, isTokenBlacklisted }; 