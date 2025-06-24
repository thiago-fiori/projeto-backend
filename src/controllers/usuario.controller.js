const usuarioService = require('../services/usuario.service');

async function criarUsuario(req, reply) {
  try {
    const { usuario, senha } = req.body;

    // Validação básica
    if (!usuario || usuario.length < 3 || !senha || senha.length < 6) {
      return reply.status(400).send({
        mensagem: 'Usuário deve ter no mínimo 3 caracteres e senha no mínimo 6 caracteres'
      });
    }

    const usuarioCriado = await usuarioService.criarUsuario({ usuario, senha });
    
    // Retorna apenas os dados públicos
    return reply.status(201).send({
      id: usuarioCriado.id,
      usuario: usuarioCriado.usuario
    });
  } catch (error) {
    if (error.message === 'Usuário já existe') {
      return reply.status(409).send({
        mensagem: 'Usuário já existe'
      });
    }
    
    return reply.status(500).send({
      mensagem: 'Erro ao criar usuário'
    });
  }
}

async function listarUsuarios(req, reply) {
  try {
    const usuarios = await usuarioService.listarUsuarios();
    return reply.send(usuarios);
  } catch (error) {
    return reply.status(500).send({
      mensagem: 'Erro ao listar usuários'
    });
  }
}

module.exports = {
  criarUsuario,
  listarUsuarios
}; 