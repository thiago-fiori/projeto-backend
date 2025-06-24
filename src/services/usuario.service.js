const bcrypt = require('bcrypt');
const { getConnection } = require('../config/database');

const SALT_ROUNDS = 10;

// Mock para testes
const mockUsuarios = [];
let mockId = 1;

async function criarUsuario({ usuario, senha }) {
  if (process.env.NODE_ENV === 'test') {
    return criarUsuarioMock({ usuario, senha });
  }

  const conn = await getConnection();
  
  // Verifica se usuário já existe
  const [existente] = await conn.execute(
    'SELECT id FROM usuarios WHERE usuario = ?',
    [usuario]
  );

  if (existente.length > 0) {
    throw new Error('Usuário já existe');
  }

  // Hash da senha
  const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);

  // Insere novo usuário
  const [result] = await conn.execute(
    'INSERT INTO usuarios (usuario, senha) VALUES (?, ?)',
    [usuario, senhaHash]
  );

  return {
    id: result.insertId,
    usuario,
    senha: senhaHash
  };
}

async function listarUsuarios() {
  if (process.env.NODE_ENV === 'test') {
    return listarUsuariosMock();
  }

  const conn = await getConnection();
  const [usuarios] = await conn.execute(
    'SELECT id, usuario FROM usuarios'
  );

  return usuarios;
}

async function buscarUsuarioPorId(id) {
  if (process.env.NODE_ENV === 'test') {
    return buscarUsuarioPorIdMock(id);
  }

  const conn = await getConnection();
  const [rows] = await conn.execute(
    'SELECT id, usuario FROM usuarios WHERE id = ?',
    [id]
  );

  if (rows.length === 0) {
    return null; // Ou lançar um erro se preferir
  }

  return rows[0];
}

// Funções mock para testes
async function criarUsuarioMock({ usuario, senha }) {
  // Verifica se usuário já existe
  if (mockUsuarios.some(u => u.usuario === usuario)) {
    throw new Error('Usuário já existe');
  }

  const senhaHash = await bcrypt.hash(senha, SALT_ROUNDS);
  const novoUsuario = {
    id: mockId++,
    usuario,
    senha: senhaHash
  };

  mockUsuarios.push(novoUsuario);
  return novoUsuario;
}

function listarUsuariosMock() {
  return mockUsuarios.map(({ id, usuario }) => ({ id, usuario }));
}

function buscarUsuarioPorIdMock(id) {
  // eslint-disable-next-line eqeqeq
  const usuario = mockUsuarios.find(u => u.id == id);
  if (!usuario) {
    return null;
  }
  // Retorna uma cópia para evitar mutações inesperadas no mock
  const { senha, ...usuarioSemSenha } = usuario;
  return usuarioSemSenha;
}

module.exports = {
  criarUsuario,
  listarUsuarios,
  buscarUsuarioPorId
}; 