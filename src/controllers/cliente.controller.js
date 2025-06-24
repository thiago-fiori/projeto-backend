const clienteService = require('../services/cliente.service');
const NodeCache = require('node-cache');

// Configuração do cache com TTL de 30 segundos
const cache = new NodeCache({ stdTTL: 30 });
const CACHE_KEY_CLIENTES = 'clientes_list';

// Função helper para invalidar o cache
function invalidarCache() {
  cache.del(CACHE_KEY_CLIENTES);
  console.log('💾 Cache invalidado - dados atualizados');
}

async function criarCliente(req, reply) {
  try {
    const { nome, sobrenome, email, idade } = req.body;

    // Validações
    if (!nome || nome.trim().length === 0) {
      return reply.status(400).send({
        mensagem: 'Nome é obrigatório'
      });
    }

    if (!email || !email.includes('@')) {
      return reply.status(400).send({
        mensagem: 'Email inválido'
      });
    }

    if (typeof idade !== 'number' || idade < 0) {
      return reply.status(400).send({
        mensagem: 'Idade deve ser um número positivo'
      });
    }

    if (idade >= 120) {
      return reply.status(400).send({
        mensagem: 'Idade deve ser menor que 120'
      });
    }

    const clienteCriado = await clienteService.criarCliente({
      nome,
      sobrenome,
      email,
      idade
    });

    // Invalidar cache após criar cliente
    invalidarCache();

    return reply.status(201).send(clienteCriado);
  } catch (error) {
    if (error.message === 'Email já cadastrado') {
      return reply.status(409).send({
        mensagem: 'Email já cadastrado'
      });
    }
    
    return reply.status(500).send({
      mensagem: 'Erro ao criar cliente'
    });
  }
}

async function listarClientes(req, reply) {
  try {
    // Verificar se os dados estão no cache
    const clientesEmCache = cache.get(CACHE_KEY_CLIENTES);
    
    if (clientesEmCache) {
      console.log('⚡ Resposta servida do CACHE');
      return reply.send(clientesEmCache);
    }

    // Se não estiver no cache, buscar do banco de dados
    console.log('🗄️  Resposta servida do BANCO DE DADOS');
    const clientes = await clienteService.listarClientes();
    
    // Armazenar no cache
    cache.set(CACHE_KEY_CLIENTES, clientes);
    console.log('💾 Dados armazenados no cache');
    
    return reply.send(clientes);
  } catch (error) {
    return reply.status(500).send({
      mensagem: 'Erro ao listar clientes'
    });
  }
}

async function buscarClientePorId(req, reply) {
  try {
    const { id } = req.params;
    const cliente = await clienteService.buscarClientePorId(Number(id));

    if (!cliente) {
      return reply.status(404).send({
        mensagem: 'Cliente não encontrado'
      });
    }

    return reply.send(cliente);
  } catch (error) {
    return reply.status(500).send({
      mensagem: 'Erro ao buscar cliente'
    });
  }
}

async function atualizarCliente(req, reply) {
  try {
    const { id } = req.params;
    const { nome, sobrenome, email, idade } = req.body;

    // Validações
    if (!nome || nome.trim().length === 0) {
      return reply.status(400).send({
        mensagem: 'Nome é obrigatório'
      });
    }

    if (!email || !email.includes('@')) {
      return reply.status(400).send({
        mensagem: 'Email inválido'
      });
    }

    if (typeof idade !== 'number' || idade < 0) {
      return reply.status(400).send({
        mensagem: 'Idade deve ser um número positivo'
      });
    }

    if (idade >= 120) {
      return reply.status(400).send({
        mensagem: 'Idade deve ser menor que 120'
      });
    }

    const clienteAtualizado = await clienteService.atualizarCliente(Number(id), {
      nome,
      sobrenome,
      email,
      idade
    });

    if (!clienteAtualizado) {
      return reply.status(404).send({
        mensagem: 'Cliente não encontrado'
      });
    }

    // Invalidar cache após atualizar cliente
    invalidarCache();

    return reply.send(clienteAtualizado);
  } catch (error) {
    if (error.message === 'Email já cadastrado') {
      return reply.status(409).send({
        mensagem: 'Email já cadastrado'
      });
    }

    return reply.status(500).send({
      mensagem: 'Erro ao atualizar cliente'
    });
  }
}

async function deletarCliente(req, reply) {
  try {
    const { id } = req.params;
    const deletado = await clienteService.deletarCliente(Number(id));

    if (!deletado) {
      return reply.status(404).send({
        mensagem: 'Cliente não encontrado'
      });
    }

    // Invalidar cache após deletar cliente
    invalidarCache();

    return reply.status(204).send();
  } catch (error) {
    return reply.status(500).send({
      mensagem: 'Erro ao deletar cliente'
    });
  }
}

module.exports = {
  criarCliente,
  listarClientes,
  buscarClientePorId,
  atualizarCliente,
  deletarCliente
}; 