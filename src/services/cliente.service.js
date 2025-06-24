const { getConnection } = require('../config/database');

// Mock para testes
const mockClientes = [];
let mockId = 1;

async function criarCliente({ nome, sobrenome, email, idade }) {
  if (process.env.NODE_ENV === 'test') {
    return criarClienteMock({ nome, sobrenome, email, idade });
  }

  const conn = await getConnection();
  
  // Verifica se email já existe
  const [existente] = await conn.execute(
    'SELECT id FROM clientes WHERE email = ?',
    [email]
  );

  if (existente.length > 0) {
    throw new Error('Email já cadastrado');
  }

  // Insere novo cliente
  const [result] = await conn.execute(
    'INSERT INTO clientes (nome, sobrenome, email, idade) VALUES (?, ?, ?, ?)',
    [nome, sobrenome, email, idade]
  );

  return {
    id: result.insertId,
    nome,
    sobrenome,
    email,
    idade
  };
}

async function listarClientes() {
  if (process.env.NODE_ENV === 'test') {
    return listarClientesMock();
  }

  const conn = await getConnection();
  const [clientes] = await conn.execute(
    'SELECT id, nome, sobrenome, email, idade FROM clientes'
  );

  return clientes;
}

async function buscarClientePorId(id) {
  if (process.env.NODE_ENV === 'test') {
    return buscarClientePorIdMock(id);
  }

  const conn = await getConnection();
  const [clientes] = await conn.execute(
    'SELECT id, nome, sobrenome, email, idade FROM clientes WHERE id = ?',
    [id]
  );

  return clientes.length > 0 ? clientes[0] : null;
}

async function atualizarCliente(id, { nome, sobrenome, email, idade }) {
  if (process.env.NODE_ENV === 'test') {
    return atualizarClienteMock(id, { nome, sobrenome, email, idade });
  }

  const conn = await getConnection();

  // Verifica se cliente existe
  const cliente = await buscarClientePorId(id);
  if (!cliente) {
    return null;
  }

  // Verifica se novo email já existe (se for diferente do email atual)
  if (email !== cliente.email) {
    const [existente] = await conn.execute(
      'SELECT id FROM clientes WHERE email = ? AND id != ?',
      [email, id]
    );

    if (existente.length > 0) {
      throw new Error('Email já cadastrado');
    }
  }

  // Atualiza cliente
  await conn.execute(
    'UPDATE clientes SET nome = ?, sobrenome = ?, email = ?, idade = ? WHERE id = ?',
    [nome, sobrenome, email, idade, id]
  );

  return {
    id,
    nome,
    sobrenome,
    email,
    idade
  };
}

async function deletarCliente(id) {
  if (process.env.NODE_ENV === 'test') {
    return deletarClienteMock(id);
  }

  const conn = await getConnection();

  const [result] = await conn.execute(
    'DELETE FROM clientes WHERE id = ?',
    [id]
  );

  return result.affectedRows > 0;
}

// Funções mock para testes
async function criarClienteMock({ nome, sobrenome, email, idade }) {
  if (mockClientes.some(c => c.email === email)) {
    throw new Error('Email já cadastrado');
  }

  const novoCliente = {
    id: mockId++,
    nome,
    sobrenome,
    email,
    idade
  };

  mockClientes.push(novoCliente);
  return novoCliente;
}

function listarClientesMock() {
  return [...mockClientes];
}

function buscarClientePorIdMock(id) {
  return mockClientes.find(c => c.id === id) || null;
}

function atualizarClienteMock(id, { nome, sobrenome, email, idade }) {
  const index = mockClientes.findIndex(c => c.id === id);
  if (index === -1) return null;

  // Verifica email duplicado
  const emailDuplicado = mockClientes.some(c => c.email === email && c.id !== id);
  if (emailDuplicado) {
    throw new Error('Email já cadastrado');
  }

  mockClientes[index] = {
    id,
    nome,
    sobrenome,
    email,
    idade
  };

  return mockClientes[index];
}

function deletarClienteMock(id) {
  const index = mockClientes.findIndex(c => c.id === id);
  if (index === -1) return false;

  mockClientes.splice(index, 1);
  return true;
}

module.exports = {
  criarCliente,
  listarClientes,
  buscarClientePorId,
  atualizarCliente,
  deletarCliente
}; 