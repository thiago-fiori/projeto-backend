-- =================================================================
-- Script de Inicialização do Sistema Backend
-- Cria bancos, tabelas e dados iniciais para desenvolvimento e teste
-- =================================================================

-- Criar banco de produção
CREATE DATABASE IF NOT EXISTS backend_prod;

-- Criar banco de testes  
CREATE DATABASE IF NOT EXISTS backend_test;

-- =================================================================
-- CONFIGURAÇÃO DO BANCO DE PRODUÇÃO
-- =================================================================
USE backend_prod;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    sobrenome VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    idade INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao VARCHAR(1000) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    data_atualizado DATETIME NOT NULL
);

-- Inserir dados iniciais no banco de produção
-- Usuários (senhas serão criptografadas pela aplicação)
INSERT IGNORE INTO usuarios (usuario, senha) VALUES
('admin', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'), -- password
('joao.silva', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('maria.santos', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('pedro.costa', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi'),
('ana.oliveira', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Clientes
INSERT IGNORE INTO clientes (nome, sobrenome, email, idade) VALUES
('Carlos', 'Alberto', 'carlos.alberto@example.com', 30),
('Fernanda', 'Lima', 'fernanda.lima@example.com', 25),
('Ricardo', 'Gomes', 'ricardo.gomes@example.com', 42),
('Juliana', 'Pereira', 'juliana.pereira@example.com', 35),
('Lucas', 'Martins', 'lucas.martins@example.com', 28);

-- Produtos
INSERT IGNORE INTO produtos (nome, descricao, preco, data_atualizado) VALUES
('Smartphone X', 'Smartphone de última geração com câmera de 108MP', 2999.90, NOW()),
('Notebook Pro', 'Notebook potente para trabalho e jogos', 7500.00, NOW()),
('Smart TV 4K', 'TV com resolução 4K e HDR', 3200.50, NOW()),
('Fone de Ouvido Bluetooth', 'Fone sem fio com cancelamento de ruído', 499.00, NOW()),
('Mouse Gamer', 'Mouse com alta precisão para gamers', 250.75, NOW()),
('Teclado Mecânico', 'Teclado com switches mecânicos para melhor digitação', 350.00, NOW()),
('Monitor Ultrawide', 'Monitor com tela curva e proporção 21:9', 1800.00, NOW()),
('Cadeira Gamer Ergonômica', 'Cadeira confortável para longas sessões de jogos', 1200.99, NOW()),
('SSD 1TB NVMe', 'Unidade de estado sólido de alta velocidade', 800.00, NOW()),
('Placa de Vídeo RTX 4090', 'Placa de vídeo de alta performance para gráficos exigentes', 9500.00, NOW());

-- =================================================================
-- CONFIGURAÇÃO DO BANCO DE TESTE
-- =================================================================
USE backend_test;

-- Tabela de usuários
CREATE TABLE IF NOT EXISTS usuarios (
    id INT AUTO_INCREMENT PRIMARY KEY,
    usuario VARCHAR(255) NOT NULL UNIQUE,
    senha VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de clientes
CREATE TABLE IF NOT EXISTS clientes (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    sobrenome VARCHAR(255),
    email VARCHAR(255) NOT NULL UNIQUE,
    idade INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Tabela de produtos
CREATE TABLE IF NOT EXISTS produtos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    nome VARCHAR(255) NOT NULL,
    descricao VARCHAR(1000) NOT NULL,
    preco DECIMAL(10,2) NOT NULL,
    data_atualizado DATETIME NOT NULL
);

-- Inserir dados de teste
-- Usuário específico para testes (senha: senha_teste)
INSERT IGNORE INTO usuarios (usuario, senha) VALUES
('usuario_teste', '$2b$10$abcdefghijklmnopqrstuvwxyz123456'),
('admin_teste', '$2b$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi');

-- Clientes de teste
INSERT IGNORE INTO clientes (nome, sobrenome, email, idade) VALUES
('João', 'Teste', 'joao.teste@example.com', 25),
('Maria', 'Exemplo', 'maria.exemplo@example.com', 30);

-- Produtos de teste
INSERT IGNORE INTO produtos (nome, descricao, preco, data_atualizado) VALUES
('Produto Teste 1', 'Descrição do produto de teste 1', 100.00, '2024-01-01 10:00:00'),
('Produto Teste 2', 'Descrição do produto de teste 2', 200.50, '2024-01-02 11:00:00');

-- =================================================================
-- CONFIGURAÇÃO DE PRIVILÉGIOS
-- =================================================================

-- Garantir privilégios para o usuário da aplicação
GRANT ALL PRIVILEGES ON backend_prod.* TO 'app_user'@'%';
GRANT ALL PRIVILEGES ON backend_test.* TO 'app_user'@'%';
FLUSH PRIVILEGES;

-- =================================================================
-- INFORMAÇÕES IMPORTANTES
-- =================================================================
/*
CREDENCIAIS PADRÃO:
- Usuário banco: app_user / app_password
- Usuário teste aplicação: usuario_teste / senha_teste  
- Usuário admin aplicação: admin / password

BANCOS CRIADOS:
- backend_prod: Banco de produção/desenvolvimento
- backend_test: Banco para execução de testes

TABELAS CRIADAS:
- usuarios: Sistema de autenticação
- clientes: Cadastro de clientes
- produtos: Catálogo de produtos

Para executar este script:
mysql -u root -p < scripts/init.sql
*/ 