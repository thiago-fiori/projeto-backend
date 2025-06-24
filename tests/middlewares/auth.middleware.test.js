const jwt = require('jsonwebtoken');
const { authMiddleware } = require('../../src/middlewares/auth.middleware');
const authService = require('../../src/services/auth.service');

describe('Auth Middleware', () => {
  let mockReq;
  let mockReply;
  let mockDone;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockReply = {
      status: jest.fn().mockReturnThis(),
      send: jest.fn().mockReturnThis(),
    };
    mockDone = jest.fn();
  });

  it('deve permitir acesso com token válido', async () => {
    const token = jwt.sign({ usuario: 'teste' }, process.env.JWT_SECRET || 'segredo_teste');
    mockReq.headers.authorization = `Bearer ${token}`;
    
    await authMiddleware(mockReq, mockReply, mockDone);
    
    expect(mockDone).toHaveBeenCalled();
    expect(mockReply.status).not.toHaveBeenCalled();
  });

  it('deve negar acesso sem token', async () => {
    await authMiddleware(mockReq, mockReply, mockDone);
    
    expect(mockReply.status).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({
      mensagem: 'Token não fornecido'
    });
    expect(mockDone).not.toHaveBeenCalled();
  });

  it('deve negar acesso com token inválido', async () => {
    mockReq.headers.authorization = 'Bearer token_invalido';
    
    await authMiddleware(mockReq, mockReply, mockDone);
    
    expect(mockReply.status).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({
      mensagem: 'Token inválido'
    });
    expect(mockDone).not.toHaveBeenCalled();
  });

  it('deve negar acesso com token na blacklist', async () => {
    const token = jwt.sign({ usuario: 'teste' }, process.env.JWT_SECRET || 'segredo_teste');
    await authService.logout(token); // Adiciona à blacklist
    mockReq.headers.authorization = `Bearer ${token}`;
    
    await authMiddleware(mockReq, mockReply, mockDone);
    
    expect(mockReply.status).toHaveBeenCalledWith(401);
    expect(mockReply.send).toHaveBeenCalledWith({
      mensagem: 'Token inválido ou expirado'
    });
    expect(mockDone).not.toHaveBeenCalled();
  });
}); 