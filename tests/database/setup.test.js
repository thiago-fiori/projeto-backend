const fs = require('fs').promises;
const path = require('path');
const db = require('../../src/config/database');
const { executeMigrations } = require('../../src/database/setup');

// Mockar fs.promises
jest.mock('fs', () => ({
  ...jest.requireActual('fs'), // Mantém outras funções do fs se necessário
  promises: {
    readFile: jest.fn(),
  },
}));

// Mockar o módulo de banco de dados
jest.mock('../../src/config/database', () => ({
  getConnection: jest.fn().mockResolvedValue({
    execute: jest.fn().mockResolvedValue([[], []]), // Mock de retorno padrão para execute
  }),
}));

describe('Database Setup - executeMigrations', () => {
  let mockConnectionExecute;
  let consoleLogSpy;
  let consoleErrorSpy;

  beforeEach(() => {
    jest.clearAllMocks();

    // Configurar mock de execute para ser acessível e customizável por teste
    mockConnectionExecute = jest.fn().mockResolvedValue([[], []]);
    db.getConnection.mockResolvedValue({ execute: mockConnectionExecute });

    // Espionar console
    consoleLogSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
    consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    // Restaurar spies
    consoleLogSpy.mockRestore();
    consoleErrorSpy.mockRestore();
  });

  it('deve executar migrações com sucesso a partir de um arquivo SQL', async () => {
    const mockSqlContent = 'CREATE TABLE users (id INT);\nUPDATE settings SET active = true;  -- Comentario\n  \nSELECT * FROM products;';
    const expectedCommands = [
      'CREATE TABLE users (id INT);',
      '\nUPDATE settings SET active = true;',
      '  -- Comentario\n  \nSELECT * FROM products;'
    ];
    const sqlFilePath = path.join(__dirname, '../../sql/001-create-tables.sql');

    fs.readFile.mockResolvedValue(mockSqlContent);

    await executeMigrations();

    expect(db.getConnection).toHaveBeenCalledTimes(1);
    expect(fs.readFile).toHaveBeenCalledTimes(1);
    expect(fs.readFile).toHaveBeenCalledWith(sqlFilePath, 'utf8');
    
    expect(mockConnectionExecute).toHaveBeenCalledTimes(expectedCommands.length);
    for (let i = 0; i < expectedCommands.length; i++) {
      expect(mockConnectionExecute).toHaveBeenNthCalledWith(i + 1, expectedCommands[i]);
    }

    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Executando setup do banco de dados'));
    expect(consoleLogSpy).toHaveBeenCalledWith('Setup do banco de dados concluído com sucesso!');
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('deve lidar com script SQL vazio ou apenas com comentários/espaços', async () => {
    const mockSqlContent = ';   ;\n;; \t '; // Apenas ponto-e-vírgulas e espaços/newlines
    fs.readFile.mockResolvedValue(mockSqlContent);

    await executeMigrations();

    expect(db.getConnection).toHaveBeenCalledTimes(1);
    expect(fs.readFile).toHaveBeenCalledTimes(1);
    expect(mockConnectionExecute).not.toHaveBeenCalled(); // Nenhum comando válido para executar
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Executando setup do banco de dados'));
    expect(consoleLogSpy).toHaveBeenCalledWith('Setup do banco de dados concluído com sucesso!');
    expect(consoleErrorSpy).not.toHaveBeenCalled();
  });

  it('deve lançar erro e logar se fs.readFile falhar', async () => {
    const readFileError = new Error('Erro ao ler arquivo SQL');
    fs.readFile.mockRejectedValue(readFileError);

    await expect(executeMigrations()).rejects.toThrow(readFileError);

    expect(db.getConnection).toHaveBeenCalledTimes(1); // Tenta obter conexão antes de ler o arquivo na implementação atual
    expect(fs.readFile).toHaveBeenCalledTimes(1);
    expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao executar setup do banco de dados:', readFileError);
    expect(consoleLogSpy).not.toHaveBeenCalledWith('Setup do banco de dados concluído com sucesso!');
  });

  it('deve lançar erro e logar se conn.execute falhar para um comando', async () => {
    const mockSqlContent = 'COMMAND1;COMMAND2_QUE_FALHA;COMMAND3';
    const executeError = new Error('Erro ao executar SQL COMMAND2');
    
    fs.readFile.mockResolvedValue(mockSqlContent);
    mockConnectionExecute
      .mockResolvedValueOnce([[],[]]) // COMMAND1 sucesso
      .mockRejectedValueOnce(executeError) // COMMAND2_QUE_FALHA falha
      .mockResolvedValueOnce([[],[]]); // COMMAND3 não deve ser alcançado se o loop parar no erro, ou pode ser chamado dependendo da lógica exata de tratamento de erro do loop

    await expect(executeMigrations()).rejects.toThrow(executeError);

    expect(db.getConnection).toHaveBeenCalledTimes(1);
    expect(fs.readFile).toHaveBeenCalledTimes(1);
    expect(mockConnectionExecute).toHaveBeenCalledTimes(2); // Chamado para COMMAND1 e COMMAND2_QUE_FALHA
    expect(mockConnectionExecute).toHaveBeenNthCalledWith(1, 'COMMAND1;');
    expect(mockConnectionExecute).toHaveBeenNthCalledWith(2, 'COMMAND2_QUE_FALHA;');
    
    expect(consoleErrorSpy).toHaveBeenCalledWith('Erro ao executar setup do banco de dados:', executeError);
    expect(consoleLogSpy).toHaveBeenCalledWith(expect.stringContaining('Executando setup do banco de dados'));
    expect(consoleLogSpy).not.toHaveBeenCalledWith('Setup do banco de dados concluído com sucesso!');
  });

  // Testes de falha abaixo
}); 