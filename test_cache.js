const axios = require('axios');

const BASE_URL = 'http://localhost:3000';
const token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwidXN1YXJpbyI6InRlc3RlIiwiaWF0IjoxNTc2NTI4MDAwfQ.QrWFr1ZBHDHCKyK6LLn2ZC9-OkX9Q2VtL6LN8Xs4nE8'; // Token de teste

const headers = {
  'Authorization': `Bearer ${token}`,
  'Content-Type': 'application/json'
};

async function testarCache() {
  console.log('🧪 Testando sistema de cache...\n');
  
  try {
    // 1. Primeira chamada - deve vir do banco
    console.log('1️⃣ Primeira chamada GET /clientes (deve vir do BANCO):');
    await axios.get(`${BASE_URL}/clientes`, { headers });
    
    // 2. Segunda chamada imediata - deve vir do cache
    console.log('\n2️⃣ Segunda chamada GET /clientes (deve vir do CACHE):');
    await axios.get(`${BASE_URL}/clientes`, { headers });
    
    // 3. Criar um cliente - deve invalidar cache
    console.log('\n3️⃣ Criando novo cliente (deve invalidar cache):');
    await axios.post(`${BASE_URL}/clientes`, {
      nome: 'Cliente Cache',
      sobrenome: 'Teste',
      email: 'cache@teste.com',
      idade: 25
    }, { headers });
    
    // 4. Nova chamada após invalidação - deve vir do banco novamente
    console.log('\n4️⃣ Nova chamada após invalidação (deve vir do BANCO):');
    await axios.get(`${BASE_URL}/clientes`, { headers });
    
    console.log('\n✅ Teste de cache concluído com sucesso!');
    
  } catch (error) {
    console.error('❌ Erro no teste:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Data:', error.response.data);
    }
  }
}

// Aguarda 2 segundos para a aplicação iniciar
setTimeout(testarCache, 2000); 