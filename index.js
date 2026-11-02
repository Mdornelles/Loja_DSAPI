const express = require('express')
const mysql = require('mysql2/promise')
require('dotenv').config();

const app = express();
app.use(express.json());

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectioLimit: 10,
    queueLimit: 0
})

app.get('/', (req,res) => {
    res.status(200).json({mensagem: 'API Rodando'})
})

app.get('/teste-banco', async (req,res) => {
    try{
        const [rows] = await pool.query('SELECT "Conexão com o MySQL sucedida" AS status')
        res.status(200).json({
            sucesso: true,
            mensagem: rows[0].status
        })
    } catch (erro) {
        console.error('Erro no banco:', erro)
        res.status(500).json({
            sucesso: false,
            erro: 'Falha ao conectar ao banco',
            detalhes: erro.message
        })
    }
})

app.post('/produtos', async (req, res) =>{
    try{
        const { nome, preco, quantidade, categoria_id, } = req.body;

        if(!nome || !preco){
            return res.status(400),json({ erro: 'O nome e o preço são obrigatórios.'})
        }
        const query = 'INSERT INTO produtos (nome, preco, quantidade, categoria_id) VALUES(?, ?, ?, ?)'
        const [resultado] = await pool.query(query, [nome, preco, quantidade, categoria_id])

        res.status(201).json({
            mensagem: 'Produto cadastrado com sucesso!',
            id_gerado: resultado.insertID
        })
    } catch (erro){
        console.error(erro)
        res.status(500).json({ erro: 'Erro interno ao cadastrar produto.', detalhes: erro.message})
    }
})
app.get('/produtos', async(req, res) =>{
    try{
        const [produtos] = await pool.query('SELECT * FROM produtos')
        res.status(200).json(produtos)
    } catch (erro){
        console.error(erro)
        res.status(500).json({erro: 'Erro interno ao buscar produtos'})
    }
})

//ROTAS DE CLIENTES

//Cadastrar novo cliente

app.post('/clientes', async (req,res) => {
    try{
        const{nome, altura, nascimento, cidade_id} = req.body

        //se nome ou cidade_id não existir...
        if (!nome || !cidade_id){
            return res.status(400).json({erro: 'O nome e o ID da cidade são obrigatórios.'})
        }

        const query = 'INSERT INTO clientes (nome, altura, nascimento, cidade_id) VALUES (?, ?, ?, ?)' //os '?, ?, ?, ?' serve como parametro anti sql injection
        const [resultado] = await pool.query(query, [nome, altura, nascimento, cidade_id]) //aguarde para fazer uma

        res.status(201).json({
            mensagem: 'Cliente registrado com sucesso!',
            id_gerado: resultado.insertId
        })
    } catch (erro){
        console.error(erro)
        res.status(500).json({erro: 'Erro interno ao registrar cliente.', detalhes: erro.message})
    }
})

//Pedidos Rotas

app.post('/pedidos', async (req,res) =>{
    const connection = await pool.getConnection()

    try{
        const{cliente_id, endereco, itens} = req.body
        if(!cliente_id || !endereco || !itens || !itens.length === 0){
            return res.status(400).json({erro: 'Dados incompletos para finalizar o pedido.'})
        }

        await connection.beginTransaction();

        const queryPedido = 'INSERT INTO pedidos (horario, endereco, cliente_id) VALUES (NOW(), ?, ?)'
        const [resultadoPedido] = await connection.query(queryPedido, [endereco, cliente_id])

        const pedidoId = resultadoPedido.insertId

        const queryItem = 'INSERT INTO pedidos_produtos (pedido_id, produto_id, preco, quantidade) VALUES (?, ?, ?, ?)'

        for(let item of itens){
            await connection.query(queryItem, [pedidoId, item.produto_id, item.preco, item.quantidade])
        }
        await connection.commit()
        res.status(201).json({
            mensagem: 'Pedido realizado com sucesso!',
            numero_do_pedido: pedidoId
        })
    } catch (erro){
        //rollback (desfazer tudo o que foi gravado para não gerar pedido fantasma, ou seja pedido sem itens)
        await connection.rollback();
        console.error(erro)
        res.status(500).json({erro: 'Erro interno ao processar o pedido.', detalhes: erro.message})
    } finally{
        //liberando o pool
        connection.release()
    }
})

//Listar todos os pedidos realizados
app.get('/pedidos', async (req,res) => {
    try {
        //busca na tabela
        const [pedidos] = await pool.query('SELECT * FROM pedidos')
        res.status(200).json(pedidos)
    } catch(erro){
        console.error(erro)
        res.status(500).json({erro: 'Erro interno ao listar os pedidos'})
    }
})

const PORT = process.env.PORT || 3000
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`)
})