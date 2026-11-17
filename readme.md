
# Loja_DSAPI — API REST para E-commerce

## Sobre o Projeto

### O que é?

A **Loja_DSAPI** é uma API RESTful desenvolvida em **Node.js** com o framework **Express** e integrada a um banco de dados relacional **MySQL**. O sistema foi construído como projeto acadêmico para aplicar na prática conceitos de arquitetura cliente-servidor, operações CRUD, modelagem relacional e transações seguras em banco de dados.

### Para que serve?

Esta API atua como o **back-end** de uma loja virtual, sendo responsável por toda a lógica de negócios, validação de dados e persistência das informações. Na prática, ela permite que interfaces web, aplicativos mobile ou clientes HTTP (como Thunder Client, Postman ou Insomnia) possam:

* **Gerenciar o catálogo da loja:** Cadastrar, consultar, atualizar e remover produtos vinculados às suas respectivas categorias.
* **Controlar a base de clientes:** Registrar clientes associando-os às suas cidades de origem.
* **Processar vendas com integridade:** Registrar pedidos de compra vinculando múltiplos produtos a um cliente por meio de transações SQL (`COMMIT` e `ROLLBACK`), garantindo que nenhum pedido seja salvo pela metade em caso de erro.

---

## Tecnologias Utilizadas

* **Node.js & Express** — Servidor HTTP, roteamento e tratamento de requisições/respostas em JSON
* **MySQL (`mysql2/promise`)** — Banco de dados relacional com pool de conexões e suporte a `async/await`
* **Dotenv** — Gerenciamento e isolamento de credenciais via variáveis de ambiente
* **Nodemon** — Reinicialização automática do servidor em ambiente de desenvolvimento

---

## Estrutura do Banco de Dados (`bd_dsapi`)

O banco relacional segue a modelagem entidade-relacionamento composta pelas seguintes tabelas (disponíveis no arquivo `schema.sql`):

* `cidades` e `categorias` — Tabelas independentes de domínio
* `clientes` — Dados cadastrais vinculados a `cidades`
* `produtos` — Catálogo de itens vinculado a `categorias`
* `pedidos` — Cabeçalho das compras vinculado a `clientes`
* `pedidos_produtos` — Tabela associativa (N:N) que registra os itens, quantidades e valores de cada pedido

---

## Como Executar o Projeto

1. **Clone o repositório e acesse a pasta:**

   ```bash
   git clone [https://github.com/Mdornelles/Loja_DSAPI.git](https://github.com/Mdornelles/Loja_DSAPI.git)
   cd Loja_DSAPI
   ```
2. **Instale as dependências:**

   ```bash
   npm install
   ```
3. **Configure o banco de dados:**

   * Execute o script SQL (`schema.sql`) no seu servidor MySQL local para criar o banco `bd_dsapi` e suas tabelas.
4. **Configure as variáveis de ambiente:**

   * Crie um arquivo `.env` na raiz do projeto com as suas credenciais locais:

   ```env
   PORT=3000
   DB_HOST=localhost
   DB_USER=root
   DB_PASSWORD=sua_senha
   DB_NAME=bd_dsapi
   ```
5. **Inicie o servidor:**

   ```bash
   npm run dev
   ```

   A API estará disponível em `http://localhost:3000`.

---

## Documentação dos Endpoints

### Produtos

| Método    | Rota              | Descrição                                                     |
| :--------- | :---------------- | :-------------------------------------------------------------- |
| `GET`    | `/produtos`     | Lista todos os produtos cadastrados                             |
| `GET`    | `/produtos/:id` | Busca um produto específico pelo ID                            |
| `POST`   | `/produtos`     | Cadastra um novo produto                                        |
| `PUT`    | `/produtos/:id` | Atualiza os dados de um produto existente                       |
| `DELETE` | `/produtos/:id` | Remove um produto (desde que não esteja vinculado a um pedido) |

**Exemplo de Body (`POST` / `PUT` `/produtos`):**

```json
{
  "nome": "Nike Air Force 1",
  "preco": 750.00,
  "quantidade": 15,
  "categoria_id": 1
}
```

### Clientes

| Método  | Rota          | Descrição              |
| :------- | :------------ | :----------------------- |
| `POST` | `/clientes` | Registra um novo cliente |

**Exemplo de Body (`POST` `/clientes`):**

```json
{
  "nome": "João Silva",
  "altura": 1.75,
  "nascimento": "1995-08-20",
  "cidade_id": 1
}
```

### Pedidos

| Método  | Rota         | Descrição                                                   |
| :------- | :----------- | :------------------------------------------------------------ |
| `GET`  | `/pedidos` | Lista todos os pedidos realizados                             |
| `POST` | `/pedidos` | Cria um novo pedido e registra seus itens via transação SQL |

**Exemplo de Body (`POST` `/pedidos`):**

```json
{
  "cliente_id": 1,
  "endereco": "Rua das Flores, 123",
  "itens": [
    {
      "produto_id": 1,
      "preco": 750.00,
      "quantidade": 1
    }
  ]
}
```

---

## Códigos de Status HTTP Utilizados

* `200 OK` — Requisição concluída com sucesso (`GET`, `PUT`, `DELETE`)
* `201 Created` — Recurso criado com sucesso no banco de dados (`POST`)
* `400 Bad Request` — Dados obrigatórios ausentes ou inválidos no corpo da requisição
* `404 Not Found` — Registro não encontrado para o ID informado
* `500 Internal Server Error` — Falha interna no servidor ou violação de integridade no banco de dados
