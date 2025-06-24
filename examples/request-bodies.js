// Exemplos de Bodies para Requisições API
// Organizados por controller com casos válidos e inválidos

const requestBodies = {
  // ==============================================
  // AUTH CONTROLLER
  // ==============================================
  auth: {
    login: {
      validos: [
        {
          descricao: "Login básico válido",
          body: {
            usuario: "admin",
            senha: "123456"
          }
        },
        {
          descricao: "Login com usuário longo",
          body: {
            usuario: "usuario_muito_longo_mas_valido",
            senha: "senhaSegura123"
          }
        }
      ],
      invalidos: [
        {
          descricao: "Sem usuário",
          body: {
            senha: "123456"
          },
          erroEsperado: "Usuário e senha são obrigatórios"
        },
        {
          descricao: "Sem senha",
          body: {
            usuario: "admin"
          },
          erroEsperado: "Usuário e senha são obrigatórios"
        },
        {
          descricao: "Usuário vazio",
          body: {
            usuario: "",
            senha: "123456"
          },
          erroEsperado: "Usuário e senha são obrigatórios"
        },
        {
          descricao: "Senha vazia",
          body: {
            usuario: "admin",
            senha: ""
          },
          erroEsperado: "Usuário e senha são obrigatórios"
        },
        {
          descricao: "Body vazio",
          body: {},
          erroEsperado: "Usuário e senha são obrigatórios"
        }
      ]
    }
  },

  // ==============================================
  // PRODUTO CONTROLLER
  // ==============================================
  produto: {
    criar: {
      validos: [
        {
          descricao: "Produto básico válido",
          body: {
            nome: "Notebook Dell",
            descricao: "Notebook Dell Inspiron 15 com processador Intel i5",
            preco: 2500.99,
            categoria: "Eletrônicos"
          }
        },
        {
          descricao: "Produto sem categoria (opcional)",
          body: {
            nome: "Mouse Gamer",
            descricao: "Mouse óptico para jogos com RGB",
            preco: 150.00
          }
        },
        {
          descricao: "Produto com categoria vazia",
          body: {
            nome: "Teclado Mecânico",
            descricao: "Teclado mecânico switch azul",
            preco: 299.90,
            categoria: ""
          }
        },
        {
          descricao: "Produto com preço inteiro",
          body: {
            nome: "Cabo HDMI",
            descricao: "Cabo HDMI 2.0 - 2 metros",
            preco: 25,
            categoria: "Cabos"
          }
        }
      ],
      invalidos: [
        {
          descricao: "Nome vazio",
          body: {
            nome: "",
            descricao: "Descrição válida",
            preco: 100.00
          },
          erroEsperado: "Nome é obrigatório"
        },
        {
          descricao: "Nome apenas espaços",
          body: {
            nome: "   ",
            descricao: "Descrição válida",
            preco: 100.00
          },
          erroEsperado: "Nome é obrigatório"
        },
        {
          descricao: "Sem nome",
          body: {
            descricao: "Descrição válida",
            preco: 100.00
          },
          erroEsperado: "Nome é obrigatório"
        },
        {
          descricao: "Descrição vazia",
          body: {
            nome: "Produto Teste",
            descricao: "",
            preco: 100.00
          },
          erroEsperado: "Descrição é obrigatória"
        },
        {
          descricao: "Descrição apenas espaços",
          body: {
            nome: "Produto Teste",
            descricao: "   ",
            preco: 100.00
          },
          erroEsperado: "Descrição é obrigatória"
        },
        {
          descricao: "Sem descrição",
          body: {
            nome: "Produto Teste",
            preco: 100.00
          },
          erroEsperado: "Descrição é obrigatória"
        },
        {
          descricao: "Preço zero",
          body: {
            nome: "Produto Teste",
            descricao: "Descrição válida",
            preco: 0
          },
          erroEsperado: "Preço deve ser um número positivo"
        },
        {
          descricao: "Preço negativo",
          body: {
            nome: "Produto Teste",
            descricao: "Descrição válida",
            preco: -10.50
          },
          erroEsperado: "Preço deve ser um número positivo"
        },
        {
          descricao: "Preço como string",
          body: {
            nome: "Produto Teste",
            descricao: "Descrição válida",
            preco: "100.00"
          },
          erroEsperado: "Preço deve ser um número positivo"
        },
        {
          descricao: "Sem preço",
          body: {
            nome: "Produto Teste",
            descricao: "Descrição válida"
          },
          erroEsperado: "Preço deve ser um número positivo"
        }
      ]
    },
    atualizar: {
      validos: [
        {
          descricao: "Atualização completa",
          body: {
            nome: "Notebook Dell Atualizado",
            descricao: "Notebook Dell Inspiron 15 com processador Intel i7",
            preco: 3000.99,
            categoria: "Eletrônicos Premium"
          }
        },
        {
          descricao: "Atualização sem categoria",
          body: {
            nome: "Mouse Gamer Pro",
            descricao: "Mouse óptico profissional para jogos",
            preco: 200.00
          }
        }
      ],
      invalidos: [
        // Mesmas validações do criar
        {
          descricao: "Nome vazio na atualização",
          body: {
            nome: "",
            descricao: "Nova descrição",
            preco: 150.00
          },
          erroEsperado: "Nome é obrigatório"
        },
        {
          descricao: "Descrição vazia na atualização",
          body: {
            nome: "Novo Nome",
            descricao: "",
            preco: 150.00
          },
          erroEsperado: "Descrição é obrigatória"
        },
        {
          descricao: "Preço inválido na atualização",
          body: {
            nome: "Novo Nome",
            descricao: "Nova descrição",
            preco: -50
          },
          erroEsperado: "Preço deve ser um número positivo"
        }
      ]
    }
  },

  // ==============================================
  // CLIENTE CONTROLLER
  // ==============================================
  cliente: {
    criar: {
      validos: [
        {
          descricao: "Cliente completo",
          body: {
            nome: "João",
            sobrenome: "Silva",
            email: "joao.silva@email.com",
            idade: 30
          }
        },
        {
          descricao: "Cliente jovem",
          body: {
            nome: "Maria",
            sobrenome: "Santos",
            email: "maria@teste.com",
            idade: 18
          }
        },
        {
          descricao: "Cliente idoso",
          body: {
            nome: "Pedro",
            sobrenome: "Oliveira",
            email: "pedro@exemplo.org",
            idade: 85
          }
        },
        {
          descricao: "Cliente com idade zero",
          body: {
            nome: "Ana",
            sobrenome: "Costa",
            email: "ana@test.com",
            idade: 0
          }
        }
      ],
      invalidos: [
        {
          descricao: "Nome vazio",
          body: {
            nome: "",
            sobrenome: "Silva",
            email: "teste@email.com",
            idade: 25
          },
          erroEsperado: "Nome é obrigatório"
        },
        {
          descricao: "Nome apenas espaços",
          body: {
            nome: "   ",
            sobrenome: "Silva",
            email: "teste@email.com",
            idade: 25
          },
          erroEsperado: "Nome é obrigatório"
        },
        {
          descricao: "Sem nome",
          body: {
            sobrenome: "Silva",
            email: "teste@email.com",
            idade: 25
          },
          erroEsperado: "Nome é obrigatório"
        },
        {
          descricao: "Email sem @",
          body: {
            nome: "João",
            sobrenome: "Silva",
            email: "emailinvalido.com",
            idade: 25
          },
          erroEsperado: "Email inválido"
        },
        {
          descricao: "Email vazio",
          body: {
            nome: "João",
            sobrenome: "Silva",
            email: "",
            idade: 25
          },
          erroEsperado: "Email inválido"
        },
        {
          descricao: "Sem email",
          body: {
            nome: "João",
            sobrenome: "Silva",
            idade: 25
          },
          erroEsperado: "Email inválido"
        },
        {
          descricao: "Idade negativa",
          body: {
            nome: "João",
            sobrenome: "Silva",
            email: "joao@email.com",
            idade: -5
          },
          erroEsperado: "Idade deve ser um número positivo"
        },
        {
          descricao: "Idade muito alta",
          body: {
            nome: "João",
            sobrenome: "Silva",
            email: "joao@email.com",
            idade: 120
          },
          erroEsperado: "Idade deve ser menor que 120"
        },
        {
          descricao: "Idade como string",
          body: {
            nome: "João",
            sobrenome: "Silva",
            email: "joao@email.com",
            idade: "25"
          },
          erroEsperado: "Idade deve ser um número positivo"
        },
        {
          descricao: "Sem idade",
          body: {
            nome: "João",
            sobrenome: "Silva",
            email: "joao@email.com"
          },
          erroEsperado: "Idade deve ser um número positivo"
        }
      ]
    },
    atualizar: {
      validos: [
        {
          descricao: "Atualização completa",
          body: {
            nome: "João Carlos",
            sobrenome: "Silva Santos",
            email: "joao.carlos@newemail.com",
            idade: 31
          }
        },
        {
          descricao: "Atualização parcial válida",
          body: {
            nome: "Maria José",
            sobrenome: "Santos",
            email: "maria.jose@email.com",
            idade: 45
          }
        }
      ],
      invalidos: [
        // Mesmas validações do criar
        {
          descricao: "Nome vazio na atualização",
          body: {
            nome: "",
            sobrenome: "Novo Sobrenome",
            email: "novo@email.com",
            idade: 30
          },
          erroEsperado: "Nome é obrigatório"
        },
        {
          descricao: "Email inválido na atualização",
          body: {
            nome: "Novo Nome",
            sobrenome: "Novo Sobrenome",
            email: "emailsemarroba",
            idade: 30
          },
          erroEsperado: "Email inválido"
        },
        {
          descricao: "Idade inválida na atualização",
          body: {
            nome: "Novo Nome",
            sobrenome: "Novo Sobrenome",
            email: "novo@email.com",
            idade: 150
          },
          erroEsperado: "Idade deve ser menor que 120"
        }
      ]
    }
  },

  // ==============================================
  // USUARIO CONTROLLER
  // ==============================================
  usuario: {
    criar: {
      validos: [
        {
          descricao: "Usuário básico válido",
          body: {
            usuario: "admin",
            senha: "123456"
          }
        },
        {
          descricao: "Usuário com dados longos",
          body: {
            usuario: "usuario_longo_valido",
            senha: "senha_muito_segura_123"
          }
        },
        {
          descricao: "Usuário mínimo válido",
          body: {
            usuario: "usr",
            senha: "123456"
          }
        }
      ],
      invalidos: [
        {
          descricao: "Usuário muito curto",
          body: {
            usuario: "ab",
            senha: "123456"
          },
          erroEsperado: "Usuário deve ter no mínimo 3 caracteres e senha no mínimo 6 caracteres"
        },
        {
          descricao: "Senha muito curta",
          body: {
            usuario: "admin",
            senha: "12345"
          },
          erroEsperado: "Usuário deve ter no mínimo 3 caracteres e senha no mínimo 6 caracteres"
        },
        {
          descricao: "Usuário e senha muito curtos",
          body: {
            usuario: "ab",
            senha: "123"
          },
          erroEsperado: "Usuário deve ter no mínimo 3 caracteres e senha no mínimo 6 caracteres"
        },
        {
          descricao: "Sem usuário",
          body: {
            senha: "123456"
          },
          erroEsperado: "Usuário deve ter no mínimo 3 caracteres e senha no mínimo 6 caracteres"
        },
        {
          descricao: "Sem senha",
          body: {
            usuario: "admin"
          },
          erroEsperado: "Usuário deve ter no mínimo 3 caracteres e senha no mínimo 6 caracteres"
        },
        {
          descricao: "Usuário vazio",
          body: {
            usuario: "",
            senha: "123456"
          },
          erroEsperado: "Usuário deve ter no mínimo 3 caracteres e senha no mínimo 6 caracteres"
        },
        {
          descricao: "Senha vazia",
          body: {
            usuario: "admin",
            senha: ""
          },
          erroEsperado: "Usuário deve ter no mínimo 3 caracteres e senha no mínimo 6 caracteres"
        }
      ]
    }
    // Nota: usuario.controller.js não possui função de atualizar
  }
};

// ==============================================
// EXEMPLOS DE USO COM FETCH
// ==============================================
const exemploUsage = {
  // Exemplo de como usar os bodies em requisições fetch
  exemplo_fetch_produto_criar: `
    // Produto válido
    fetch('/api/produtos', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
      },
      body: JSON.stringify(requestBodies.produto.criar.validos[0].body)
    })
  `,
  
  exemplo_fetch_cliente_atualizar: `
    // Cliente atualização
    fetch('/api/clientes/1', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_TOKEN'
      },
      body: JSON.stringify(requestBodies.cliente.atualizar.validos[0].body)
    })
  `,

  exemplo_fetch_auth_login: `
    // Login
    fetch('/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(requestBodies.auth.login.validos[0].body)
    })
  `
};

module.exports = { requestBodies, exemploUsage }; 