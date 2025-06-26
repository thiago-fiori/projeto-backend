## 📝 Pré-requisitos

Antes de começar, certifique-se de ter os seguintes softwares instalados em sua máquina:

* **[Docker Desktop](https://www.docker.com/products/docker-desktop/)**: Essencial para a criação e gerenciamento dos contêineres da aplicação.
* **[WSL (Subsistema do Windows para Linux)](https://docs.microsoft.com/pt-br/windows/wsl/install)**: Necessário para garantir a compatibilidade e o ambiente de execução no Windows.
* **[Postman](https://www.postman.com/downloads/)**: Ferramenta utilizada para realizar as requisições à API.

---

## ⚙️ Configuração do Ambiente

Siga os passos abaixo para configurar o projeto localmente.

**1. Clonar o Repositório**

Primeiro, clone este repositório para a sua máquina local.:

**2. Acessar a Pasta do Projeto**

**3. Importar a Coleção do Postman**

O arquivo da coleção do Postman, chamado `Trabalho Backend.postman_collection.json`, se encontra na raiz do repositório. Abra seu aplicativo Postman e importe este arquivo para ter acesso a todas as requisições da API já configuradas.

---

## ▶️ Executando a Aplicação

Com os pré-requisitos instalados e o ambiente configurado, o próximo passo é iniciar a aplicação.

**1. Iniciar os Contêineres Docker**

Abra um terminal na pasta raiz do projeto e execute o seguinte comando:

```bash
docker-compose up
```

Este comando irá baixar as imagens necessárias, construir os contêineres (banco de dados, backend, etc.) e iniciá-los. O terminal ficará bloqueado, exibindo os logs da aplicação em tempo real.

> **Dica:** Para rodar os contêineres em segundo plano (modo "detached"), você pode usar a flag `-d`:
>
> ```bash
> docker-compose up -d
> ```

**2. Iniciar o Servidor de Desenvolvimento**

Após os contêineres estarem em execução, execute o comando abaixo para iniciar o servidor de desenvolvimento (geralmente com *hot-reload*):

```bash
npm run dev
```

Pronto! A aplicação estará rodando e pronta para receber requisições.

---

## 🧪 Executando os Testes

O projeto conta com uma suíte de testes automatizados. Para executá-los, utilize os seguintes comandos em um novo terminal, na raiz do projeto.

### Testes com Relatório de Cobertura

Este comando executa todos os testes e, ao final, gera um relatório detalhado mostrando a porcentagem de cobertura de código.

```bash
npm run test:coverage
```

### Testes Detalhados (Verbose)

Este comando executa os testes de forma "verbosa", exibindo logs detalhados sobre cada teste, o que está sendo verificado e qual o resultado esperado. É ideal para depuração.

```bash
npm run test:verbose
```

> **Observação:** A execução completa deste comando pode ser longa. No vídeo de apresentação do projeto, a execução foi abreviada para economizar tempo.

---

## 💻 Uso e Endpoints

Com a aplicação em execução, você pode interagir com ela de duas formas:

### 1. API (Backend)

Utilize o **Postman** e a coleção importada anteriormente para enviar requisições para os diferentes *endpoints* da API. Todas as rotas disponíveis já estão documentadas na coleção.

### 2. Interface (Frontend)

Para acessar a interface visual do projeto, abra seu navegador e acesse o seguinte link:

**[http://localhost:3000/frontend](http://localhost:3000/frontend)**
