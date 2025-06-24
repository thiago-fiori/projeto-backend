const produtoService = require('../services/produto.service');

async function criarProduto(req, reply) {
  try {
    const { nome, descricao, preco } = req.body;

    // Validações
    if (!nome || nome.trim().length === 0) {
      return reply.status(400).send({
        mensagem: 'Nome é obrigatório'
      });
    }

    if (!descricao || descricao.trim().length === 0) {
      return reply.status(400).send({
        mensagem: 'Descrição é obrigatória'
      });
    }

    if (typeof preco !== 'number' || preco <= 0) {
      return reply.status(400).send({
        mensagem: 'Preço deve ser um número positivo'
      });
    }

    const produtoCriado = await produtoService.criarProduto({
      nome: nome.trim(),
      descricao: descricao ? descricao.trim() : '',
      preco: parseFloat(preco)
    });

    
    return reply.status(201).send(produtoCriado);
  } catch (error) {
    return reply.status(500).send({
      mensagem: 'Erro ao criar produto',
      erro: error.message
    });
  }
}

async function listarProdutos(req, reply) {
  try {
    
    const produtos = await produtoService.listarProdutos();
    
    return reply.send(produtos);
  } catch (error) {
    return reply.status(500).send({
      mensagem: 'Erro ao listar produtos',
      erro: error.message
    });
  }
}

async function buscarProdutoPorId(req, reply) {
  try {
    const { id } = req.params;
    
    const produto = await produtoService.buscarProdutoPorId(Number(id));

    if (!produto) {
      return reply.status(404).send({
        mensagem: 'Produto não encontrado'
      });
    }

    return reply.send(produto);
  } catch (error) {
      return reply.status(500).send({
      mensagem: 'Erro ao buscar produto',
      erro: error.message
    });
  }
}

async function atualizarProduto(req, reply) {
  try {
    const { id } = req.params;
    const { nome, descricao, preco } = req.body;

    // Validações
    if (!nome || nome.trim().length === 0) {
      return reply.status(400).send({
        mensagem: 'Nome é obrigatório'
      });
    }

    if (!descricao || descricao.trim().length === 0) {
      return reply.status(400).send({
        mensagem: 'Descrição é obrigatória'
      });
    }

    if (typeof preco !== 'number' || preco <= 0) {
      return reply.status(400).send({
        mensagem: 'Preço deve ser um número positivo'
      });
    }

    const produtoAtualizado = await produtoService.atualizarProduto(Number(id), {
      nome: nome.trim(),
      descricao: descricao ? descricao.trim() : '',
      preco: parseFloat(preco)
    });

    if (!produtoAtualizado) {
      return reply.status(404).send({
        mensagem: 'Produto não encontrado'
      });
    }

    return reply.send(produtoAtualizado);
  } catch (error) {
    return reply.status(500).send({
      mensagem: 'Erro ao atualizar produto',
      erro: error.message
    });
  }
}

async function deletarProduto(req, reply) {
  try {
    const { id } = req.params;
    
    const deletado = await produtoService.deletarProduto(Number(id));

    if (!deletado) {
      return reply.status(404).send({
        mensagem: 'Produto não encontrado'
      });
    }

    return reply.status(204).send();
  } catch (error) {
    return reply.status(500).send({
      mensagem: 'Erro ao deletar produto',
      erro: error.message
    });
  }
}

module.exports = {
  criarProduto,
  listarProdutos,
  buscarProdutoPorId,
  atualizarProduto,
  deletarProduto
}; 