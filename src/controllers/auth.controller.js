// Controller de Autenticação

const authService = require('../services/auth.service');

async function login(req, reply) {
  try {
    const { email, senha, usuario } = req.body || {};
    
    // Aceitar tanto email quanto usuario como login
    const loginField = email || usuario;
    
    if (!loginField || !senha) {
      return reply.status(400).send({ 
        mensagem: 'Email/usuário e senha são obrigatórios' 
      });
    }

    const result = await authService.login(loginField, senha);
    return reply.send(result);
  } catch (error) {
    return reply.status(401).send({ 
      mensagem: 'Email/usuário ou senha inválidos' 
    });
  }
}

async function logout(req, reply) {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return reply.status(401).send({ 
        mensagem: 'Token não fornecido' 
      });
    }

    const token = authHeader.split(' ')[1];
    await authService.logout(token);
    return reply.send({ 
      mensagem: 'Logout realizado com sucesso' 
    });
  } catch (error) {
    return reply.status(401).send({ 
      mensagem: 'Token inválido' 
    });
  }
}

module.exports = { login, logout }; 