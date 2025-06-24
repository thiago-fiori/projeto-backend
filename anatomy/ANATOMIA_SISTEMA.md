# 🏗️ Anatomia do Sistema Backend

## 📋 Índice

- [Visão Geral](#visão-geral)
- [Arquitetura](#arquitetura)
- [Estrutura de Pastas](#estrutura-de-pastas)
- [Entidades do Sistema](#entidades-do-sistema)
- [Rotas da API](#rotas-da-api)
- [Serviços](#serviços)
- [Middlewares](#middlewares)
- [Banco de Dados](#banco-de-dados)
- [Fluxo de Dados](#fluxo-de-dados)
- [Autenticação e Autorização](#autenticação-e-autorização)
- [Migrações do Banco](#migrações-do-banco)

---

## 🎯 Visão Geral

Este é um sistema backend construído com **Fastify** (Node.js), seguindo uma arquitetura em camadas bem definida para gerenciamento de **usuários**, **clientes** e **produtos**. O sistema utiliza **MySQL** como banco de dados e implementa autenticação baseada em **JWT**.

### Tecnologias Principais

- **Runtime**: Node.js
- **Framework**: Fastify
- **Banco de Dados**: MySQL
- **Validação**: Zod
- **Autenticação**: JWT
- **Testes**: Jest + Supertest

---

## 🏛️ Arquitetura

O sistema segue o padrão **MVC (Model-View-Controller)** adaptado para APIs, com a seguinte estrutura em camadas:

```
┌─────────────────────────────────────────────┐
│                  CLIENTE                    │
│            (Aplicação Frontend)             │
└─────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│                ROTAS (Routes)               │
│           Definição de Endpoints            │
└─────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│             MIDDLEWARES                     │
│        Autenticação e Validações           │
└─────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│            CONTROLLERS                      │
│        Lógica de Controle da API           │
└─────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│              SERVICES                       │
│           Regras de Negócio                 │
└─────────────────────────────────────────────┘
                       │
                       ▼
┌─────────────────────────────────────────────┐
│            BANCO DE DADOS                   │
│             MySQL Database                  │
└─────────────────────────────────────────────┘
```

---

## 📁 Estrutura de Pastas

```
src/
├── 📄 index.js                 # Ponto de entrada da aplicação
├── 📂 controllers/             # Controladores da aplicação
│   ├── 📄 auth.controller.js   # Autenticação (login/logout)
│   ├── 📄 usuario.controller.js# Gestão de usuários
│   ├── 📄 cliente.controller.js# Gestão de clientes
│   └── 📄 produto.controller.js# Gestão de produtos
├── 📂 services/                # Lógica de negócio
│   ├── 📄 auth.service.js      # Serviços de autenticação
│   ├── 📄 usuario.service.js   # Serviços de usuário
│   ├── 📄 cliente.service.js   # Serviços de cliente
│   └── 📄 produto.service.js   # Serviços de produto
├── 📂 routes/                  # Definição de rotas
│   └── 📄 index.js             # Configuração de todas as rotas
├── 📂 middlewares/             # Middlewares customizados
│   └── 📄 auth.middleware.js   # Middleware de autenticação JWT
├── 📂 config/                  # Configurações
│   └── 📄 database.js          # Configuração do banco de dados
├── 📂 database/                # Scripts de banco de dados
│   └── 📄 setup.js             # Setup e migrações
└── 📂 schemas/                 # Schemas de validação Zod
    ├── 📄 auth.schema.ts       # Validações de autenticação
    ├── 📄 usuario.schema.ts    # Validações de usuário
    ├── 📄 client.schema.ts     # Validações de cliente
    └── 📄 produto.schema.ts    # Validações de produto
```

---

## 🗃️ Entidades do Sistema

### 👤 Usuário

**Responsabilidade**: Representa os usuários do sistema que podem fazer login

| Campo        | Tipo         | Descrição                | Validação               |
| ------------ | ------------ | ------------------------ | ----------------------- |
| `id`         | INT          | Identificador único (PK) | Auto incremento         |
| `usuario`    | VARCHAR(255) | Nome de usuário único    | 3-255 caracteres, único |
| `senha`      | VARCHAR(255) | Senha criptografada      | Mínimo 6 caracteres     |
| `created_at` | TIMESTAMP    | Data de criação          | Automático              |
| `updated_at` | TIMESTAMP    | Data de atualização      | Automático              |

### 👥 Cliente

**Responsabilidade**: Representa os clientes da empresa/negócio

| Campo        | Tipo         | Descrição                | Validação           |
| ------------ | ------------ | ------------------------ | ------------------- |
| `id`         | INT          | Identificador único (PK) | Auto incremento     |
| `nome`       | VARCHAR(255) | Nome do cliente          | 3-255 caracteres    |
| `sobrenome`  | VARCHAR(255) | Sobrenome do cliente     | 3-255 caracteres    |
| `email`      | VARCHAR(255) | Email único do cliente   | Email válido, único |
| `idade`      | INT          | Idade do cliente         | 1-119 anos          |
| `created_at` | TIMESTAMP    | Data de criação          | Automático          |
| `updated_at` | TIMESTAMP    | Data de atualização      | Automático          |

### 📦 Produto

**Responsabilidade**: Representa os produtos do catálogo

| Campo             | Tipo          | Descrição                  | Validação        |
| ----------------- | ------------- | -------------------------- | ---------------- |
| `id`              | INT           | Identificador único (PK)   | Auto incremento  |
| `nome`            | VARCHAR(255)  | Nome do produto            | 3-255 caracteres |
| `descricao`       | VARCHAR(1000) | Descrição detalhada        | 3-255 caracteres |
| `preco`           | DECIMAL(10,2) | Preço do produto           | Valor positivo   |
| `data_atualizado` | DATETIME      | Data da última atualização | Entre 2000-2025  |

---

## 🛣️ Rotas da API

### 🔐 Autenticação

| Método | Endpoint  | Descrição              | Autenticação | Body               |
| ------ | --------- | ---------------------- | ------------ | ------------------ |
| `POST` | `/login`  | Fazer login no sistema | ❌ Não       | `{usuario, senha}` |
| `POST` | `/logout` | Fazer logout           | ✅ JWT       | -                  |

### 👤 Usuários

| Método | Endpoint    | Descrição                | Autenticação | Body               |
| ------ | ----------- | ------------------------ | ------------ | ------------------ |
| `POST` | `/usuarios` | Criar novo usuário       | ❌ Não       | `{usuario, senha}` |
| `GET`  | `/usuarios` | Listar todos os usuários | ❌ Não       | -                  |

### 👥 Clientes

| Método   | Endpoint        | Descrição                | Autenticação | Body                              |
| -------- | --------------- | ------------------------ | ------------ | --------------------------------- |
| `POST`   | `/clientes`     | Criar novo cliente       | ✅ JWT       | `{nome, sobrenome, email, idade}` |
| `GET`    | `/clientes`     | Listar todos os clientes | ✅ JWT       | -                                 |
| `GET`    | `/clientes/:id` | Buscar cliente por ID    | ✅ JWT       | -                                 |
| `PUT`    | `/clientes/:id` | Atualizar cliente        | ✅ JWT       | `{nome, sobrenome, email, idade}` |
| `DELETE` | `/clientes/:id` | Deletar cliente          | ✅ JWT       | -                                 |

### 📦 Produtos

| Método   | Endpoint        | Descrição                | Autenticação | Body                                        |
| -------- | --------------- | ------------------------ | ------------ | ------------------------------------------- |
| `POST`   | `/produtos`     | Criar novo produto       | ✅ JWT       | `{nome, descricao, preco, data_atualizado}` |
| `GET`    | `/produtos`     | Listar todos os produtos | ✅ JWT       | -                                           |
| `GET`    | `/produtos/:id` | Buscar produto por ID    | ✅ JWT       | -                                           |
| `PUT`    | `/produtos/:id` | Atualizar produto        | ✅ JWT       | `{nome, descricao, preco, data_atualizado}` |
| `DELETE` | `/produtos/:id` | Deletar produto          | ✅ JWT       | -                                           |

---

## ⚙️ Serviços

### 🔐 AuthService (`auth.service.js`)

**Responsabilidades**:

- Validar credenciais de login
- Gerar tokens JWT
- Verificar e decodificar tokens
- Gerenciar logout de usuários

**Métodos principais**:

- `login(usuario, senha)`: Autentica usuário e retorna token JWT
- `logout(token)`: Invalida token (implementação básica)

### 👤 UsuarioService (`usuario.service.js`)

**Responsabilidades**:

- CRUD completo de usuários
- Criptografia de senhas
- Validação de dados de usuário

**Métodos principais**:

- `criarUsuario(dados)`: Cria novo usuário com senha criptografada
- `listarUsuarios()`: Lista todos os usuários do sistema
- `buscarPorUsuario(usuario)`: Busca usuário específico

### 👥 ClienteService (`cliente.service.js`)

**Responsabilidades**:

- CRUD completo de clientes
- Validação de unicidade de email
- Gestão de relacionamentos

**Métodos principais**:

- `criarCliente(dados)`: Cria novo cliente
- `listarClientes()`: Lista todos os clientes
- `buscarClientePorId(id)`: Busca cliente específico
- `atualizarCliente(id, dados)`: Atualiza cliente
- `deletarCliente(id)`: Remove cliente

### 📦 ProdutoService (`produto.service.js`)

**Responsabilidades**:

- CRUD completo de produtos
- Validação de preços e datas
- Gestão de catálogo

**Métodos principais**:

- `criarProduto(dados)`: Cria novo produto
- `listarProdutos()`: Lista todos os produtos
- `buscarProdutoPorId(id)`: Busca produto específico
- `atualizarProduto(id, dados)`: Atualiza produto
- `deletarProduto(id)`: Remove produto

---

## 🛡️ Middlewares

### 🔐 AuthMiddleware (`auth.middleware.js`)

**Responsabilidade**: Verificar autenticação JWT em rotas protegidas

**Funcionamento**:

1. Extrai token do header `Authorization: Bearer <token>`
2. Verifica validade do token JWT
3. Decodifica e anexa dados do usuário à requisição
4. Permite ou bloqueia acesso baseado na validade

**Aplicação**: Todas as rotas de clientes e produtos requerem este middleware

---

## 🗄️ Banco de Dados

### Configuração

- **SGBD**: MySQL
- **Conexão**: Pool de conexões com mysql2/promise
- **Ambientes**: test, development, production
- **Migrações**: Scripts SQL automáticos

### Estrutura de Conexão

```javascript
// Ambientes suportados
{
  test: { host: 'localhost', database: 'backend_test' },
  development: { host: 'localhost', database: 'backend_prod' },
  production: { host: ENV.DB_HOST, database: ENV.DB_NAME }
}
```

### Scripts de Setup

- **Localização**: `scripts/init.sql` (script completo de inicialização)
- **Migração programática**: `scripts/migrate.js`
- **Execução**: Via npm scripts ou diretamente
- **Comandos**: CREATE DATABASE, CREATE TABLE, INSERT para dados iniciais

---

## 🔄 Fluxo de Dados

### 1. Fluxo de Autenticação

```
Cliente → POST /login → AuthController → AuthService → Database
                                      ↓
Cliente ← JWT Token ← Response ← Validation ← User Check
```

### 2. Fluxo de Operação Protegida (ex: Criar Cliente)

```
Cliente → POST /clientes → AuthMiddleware → ClienteController
                               ↓               ↓
                          Token Check → ClienteService
                               ↓               ↓
                          Authorization → Database
                               ↓               ↓
Cliente ← Response ← Success/Error ← Validation ← Insert
```

### 3. Fluxo de Listagem

```
Cliente → GET /clientes → AuthMiddleware → ClienteController
                              ↓               ↓
                         Token Valid → ClienteService
                              ↓               ↓
Cliente ← JSON Array ← Response ← Database ← Query
```

---

## 🔐 Autenticação e Autorização

### Sistema de Autenticação

- **Tipo**: JWT (JSON Web Token)
- **Algoritmo**: HS256 (padrão)
- **Storage**: Header Authorization Bearer
- **Expiração**: Configurável (padrão sem expiração)

### Fluxo de Autenticação

1. **Login**: Usuario/senha → JWT token
2. **Autorização**: Token em header → Validação → Acesso
3. **Logout**: Token invalidado (lista negra básica)

### Proteção de Rotas

- **Rotas Públicas**: `/login`, `/usuarios` (criação e listagem)
- **Rotas Protegidas**: Todas as operações de `/clientes` e `/produtos`

### Validação de Token

```javascript
// Header esperado
Authorization: Bearer <
  jwt_token >
  // Verificação no middleware
  jwt.verify(token, SECRET_KEY, callback);
```

---

## 🗃️ Migrações do Banco

### Sistema de Migrações

O sistema possui um mecanismo robusto de migrações para configurar o banco de dados de forma consistente entre diferentes ambientes.

### Estrutura de Arquivos

```
scripts/
├── 📄 init.sql         # Script SQL completo de inicialização
└── 📄 migrate.js       # Script Node.js para execução programática
```

### Arquivos de Migração

#### `scripts/init.sql`

**Responsabilidade**: Script SQL completo que configura todo o sistema de banco

- ✅ Cria bancos de desenvolvimento e teste
- ✅ Cria todas as tabelas (usuarios, clientes, produtos)
- ✅ Insere dados iniciais para desenvolvimento
- ✅ Insere dados de teste específicos
- ✅ Configura privilégios de usuário

#### `scripts/migrate.js`

**Responsabilidade**: Script Node.js para execução e validação de migrações

- ✅ Conexão automática com MySQL
- ✅ Execução segura de comandos SQL
- ✅ Validação de estrutura das tabelas
- ✅ Verificação de dados inseridos
- ✅ Suporte a rollback (limpeza)
- ✅ Relatórios detalhados de execução

### Comandos de Migração

```bash
# Migração padrão (development)
npm run migrate

# Migrações por ambiente
npm run migrate:dev      # Desenvolvimento
npm run migrate:test     # Testes
npm run migrate:prod     # Produção

# Rollback (CUIDADO: Remove TODOS os dados)
npm run migrate:rollback

# Alternativa via setup antigo
npm run db:setup
```

### Dados Criados

#### Banco de Produção (`backend_prod`)

- **5 usuários**: admin, joao.silva, maria.santos, pedro.costa, ana.oliveira
- **5 clientes**: Carlos Alberto, Fernanda Lima, Ricardo Gomes, Juliana Pereira, Lucas Martins
- **10 produtos**: Smartphone, Notebook, TV, Fone, Mouse, etc.

#### Banco de Teste (`backend_test`)

- **2 usuários**: usuario_teste, admin_teste
- **2 clientes**: João Teste, Maria Exemplo
- **2 produtos**: Produto Teste 1, Produto Teste 2

### Credenciais Padrão

```javascript
// Usuários de teste
{
  usuario: 'usuario_teste',
  senha: 'senha_teste'
}

// Admin padrão
{
  usuario: 'admin',
  senha: 'password'
}
```

### Validações Automáticas

O script de migração inclui verificações automáticas:

- ✅ Conexão com banco de dados
- ✅ Criação de bancos e tabelas
- ✅ Inserção de dados iniciais
- ✅ Contagem de registros por tabela
- ✅ Relatório final com status

---

## 🧪 Testes

### Estrutura de Testes

- **Framework**: Jest + Supertest
- **Localização**: `tests/`
- **Cobertura**: Controllers principais
- **Tipo**: Testes de integração HTTP

### Exemplos de Teste

- Autenticação com credenciais válidas/inválidas
- CRUD completo para todas as entidades
- Validação de middlewares
- Casos de erro e sucesso

---

## 🚀 Inicialização do Sistema

### Ordem de Inicialização

1. **Carregamento de variáveis**: dotenv config
2. **Configuração Fastify**: Logger habilitado
3. **Setup de rotas**: Registro de todos os endpoints
4. **Inicialização do servidor**: Porta 3000 (ou ENV.PORT)
5. **Conexão com banco**: Pool de conexões ativo

### Comandos de Desenvolvimento

```bash
# Iniciar servidor
npm start

# Modo desenvolvimento
npm run dev

# Executar testes
npm test

# Migrações do banco de dados
npm run migrate              # Migração padrão (development)
npm run migrate:dev          # Migração desenvolvimento
npm run migrate:test         # Migração para testes
npm run migrate:prod         # Migração produção
npm run migrate:rollback     # Limpar bancos (CUIDADO!)

# Setup alternativo
npm run db:setup
```

---

## 📈 Extensibilidade

### Pontos de Extensão

1. **Novos módulos**: Adicionar controller + service + routes
2. **Middlewares**: Validações customizadas, logging, rate limiting
3. **Schemas**: Novas validações Zod para entidades
4. **Banco de dados**: Novas tabelas e relacionamentos
5. **Autenticação**: Roles, permissões, refresh tokens

### Padrões a Seguir

- Separação clara de responsabilidades
- Validação consistente com Zod
- Tratamento de erros padronizado
- Estrutura RESTful para novas APIs
- Testes para novas funcionalidades

---

_Documentação gerada em: $(new Date().toLocaleDateString('pt-BR'))_
