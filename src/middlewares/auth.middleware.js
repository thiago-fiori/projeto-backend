const jwt = require('jsonwebtoken');
const authService = require('../services/auth.service');
require('dotenv').config();

const SECRET = process.env.JWT_SECRET || 'segredo_teste';
console.log('SECRET:', SECRET);

async function authMiddleware(req, reply, done) {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return reply.status(401).send({
        mensagem: 'Token não fornecido'
      });
    }

    const token = authHeader.split(' ')[1];
    
    // Verifica se o token está na blacklist
    if (await authService.isTokenBlacklisted(token)) {
      return reply.status(401).send({
        mensagem: 'Token inválido ou expirado'
      });
    }

    try {
      const decoded = jwt.verify(token, SECRET);
      req.user = decoded;
      done();
    } catch (err) {
      return reply.status(401).send({
        mensagem: 'Token inválido'
      });
    }
  } catch (error) {
    return reply.status(500).send({
      mensagem: 'Erro interno do servidor'
    });
  }
}

module.exports = { authMiddleware }; 