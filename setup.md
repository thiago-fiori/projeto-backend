Plano de Ação – Desafio Final Back-end II
Sumário
Visão Geral
Stack e Bibliotecas
Estrutura de Diretórios
Requisitos Funcionais
Requisitos Não Funcionais
Plano de Desenvolvimento (TDD)
1. Configuração Inicial
2. Modelagem do Banco de Dados
3. Implementação dos Endpoints
4. Autenticação JWT
5. Cache de Clientes
6. Testes Automatizados
7. Documentação e Entrega
Critérios de Aceite
Extras (Pontos Adicionais)
Visão Geral
Desenvolver uma API RESTful em Node.js para gerenciar clientes, produtos e usuários, com autenticação JWT, integração com MySQL, cache para clientes, testes automatizados e versionamento via Git.
Stack e Bibliotecas
Node.js: Ambiente de execução
Fastify: Framework web para APIs rápidas
Zod: Validação de dados
MySQL: Banco de dados relacional
node-cache ou Redis: Cache de dados
bcrypt: Hash de senhas
jsonwebtoken: Geração e validação de JWT
dotenv: Variáveis de ambiente
Jest: Testes unitários e de integração
Supertest: Testes de endpoints HTTP
cross-env: Variáveis de ambiente em scripts npm
Estrutura de Diretórios
Apply to setup.md
Requisitos Funcionais
GET /: Mensagem de boas-vindas
CRUD completo para:
/clientes (protegido, cache)
/produtos (público)
/usuarios (criar e listar)
POST /login: Autenticação, retorna JWT
POST /logout: Invalida token atual
Validações:
Nome, sobrenome, produto, descrição: 3-255 caracteres
Email válido
Idade: 1-119
Preço: positivo
Data atualizado: entre 01/01/2000 e 20/06/2025
Requisitos Não Funcionais
Modularização conforme estrutura proposta
Senhas seguras (bcrypt)
JWT no header Authorization
Cache de 30s para GET /clientes, com logs de cache
Invalidação automática do cache ao criar/editar/deletar clientes
Testes automatizados cobrindo todos os casos (válidos e inválidos)
Documentação clara no README.md
Plano de Desenvolvimento (TDD)
1. Configuração Inicial
[ ] Inicializar projeto Node.js (npm init)
[ ] Instalar dependências principais:
fastify, zod, mysql2, dotenv, bcrypt, jsonwebtoken, node-cache ou redis
[ ] Instalar dependências de desenvolvimento:
jest, supertest, cross-env
[ ] Configurar scripts no package.json para start, test, dev
[ ] Criar .env e .gitignore
[ ] Configurar conexão com MySQL e cache em /configs
[ ] Criar README.md com instruções iniciais
2. Modelagem do Banco de Dados
[ ] Criar scripts SQL para as tabelas:
clientes (id, nome, sobrenome, email, idade)
produtos (id, nome, descricao, preco, data_atualizado)
usuarios (id, usuario, senha, token)
[ ] Popular com dados de exemplo
[ ] Garantir que as constraints e tipos estejam corretos
3. Implementação dos Endpoints
3.1. Endpoint de Status
[ ] GET / – Mensagem de boas-vindas
3.2. CRUD de Clientes (protegido, cache)
[ ] GET /clientes – Listar clientes (com cache)
[ ] POST /clientes – Criar cliente (invalida cache)
[ ] PUT /clientes/:id – Atualizar cliente (invalida cache)
[ ] DELETE /clientes/:id – Remover cliente (invalida cache)
3.3. CRUD de Produtos (público)
[ ] GET /produtos – Listar produtos
[ ] POST /produtos – Criar produto
[ ] PUT /produtos/:id – Atualizar produto
[ ] DELETE /produtos/:id – Remover produto
3.4. CRUD de Usuários
[ ] GET /usuarios – Listar usuários
[ ] POST /usuarios – Criar usuário (hash senha)
3.5. Autenticação
[ ] POST /login – Retorna JWT se sucesso
[ ] POST /logout – Invalida token
4. Autenticação JWT
[ ] Middleware para proteger rotas de clientes
[ ] Validação do token JWT no header Authorization
[ ] Implementar blacklist de tokens para logout (em memória ou cache)
5. Cache de Clientes
[ ] Implementar cache de 30s para GET /clientes
[ ] Invalidação automática ao criar/editar/deletar clientes
[ ] Logs no terminal indicando origem da resposta (cache ou banco)
6. Testes Automatizados
[ ] Configurar Jest e Supertest
[ ] Escrever testes para:
Validações de campos (usando Zod)
Endpoints de usuários (criação e listagem)
Endpoints de clientes (acesso autenticado, cache, CRUD)
Endpoints de produtos (CRUD)
Login/logout (JWT, blacklist)
Casos inválidos (campos, autenticação, etc)
[ ] Garantir cobertura mínima de 80%
7. Documentação e Entrega
[ ] Atualizar README.md com:
Instruções de instalação, configuração e uso
Como rodar os testes
Como popular o banco
Exemplos de requisições
[ ] Garantir que git status esteja limpo
[ ] Gravar vídeo conforme instruções do desafio
Critérios de Aceite
Estrutura modular conforme especificação
Todos os endpoints funcionando conforme requisitos
Autenticação JWT implementada corretamente
Cache de clientes funcional e com logs
Testes automatizados cobrindo todos os casos
Documentação clara e completa
Entrega dentro do prazo
Extras (Pontos Adicionais)
[ ] Implementar interface web (opcional)
Página inicial
Tela de login/logout
Listagem de produtos (público)
Listagem de clientes e usuários (autenticado)
Observação: O desenvolvimento deve seguir TDD: para cada funcionalidade, primeiro escrever os testes (Jest/Supertest), depois implementar o código até passar nos testes.