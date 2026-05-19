const express = require('express');
const cors = require('cors');
const axios = require('axios');
const db = require('./db');

const app = express();

app.use(cors());
app.use(express.json());

const CPF_SERVICE_URL = process.env.CPF_SERVICE_URL ;

app.get('/health', (req, res) => {
  res.json({ status: 'UP' });
});

app.get('/clientes', async (req, res) => {
  try {
    const result = await db.query(`
      SELECT c.serial,
             c.nome,
             c.cpf,
             c.data_nascimento,
             c.endereco,
             ci.nome AS cidade,
             ci.uf
      FROM cliente c
      LEFT JOIN cidade ci ON ci.serial = c.cidade
      ORDER BY c.serial
    `);

    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

app.get('/clientes/:id', async (req, res) => {
  try {
    const result = await db.query(
      'SELECT * FROM cliente WHERE serial = $1',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

app.post('/clientes', async (req, res) => {
  try {
    const { nome, cpf, data_nascimento, endereco, cidade } = req.body;

    const response = await axios.get(`${CPF_SERVICE_URL}/validar/${cpf}`);

    if (!response.data.valido || !response.data.ativo) {
      return res.status(400).json({
        erro: 'CPF inválido ou inativo'
      });
    }

    const result = await db.query(
      `INSERT INTO cliente
      (nome, cpf, data_nascimento, endereco, cidade)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
      [nome, cpf, data_nascimento, endereco, cidade]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    if (error.response) {
      return res.status(400).json(error.response.data);
    }

    res.status(500).json({ erro: error.message });
  }
});

app.put('/clientes/:id', async (req, res) => {
  try {
    const { nome, cpf, data_nascimento, endereco, cidade } = req.body;

    const response = await axios.get(`${CPF_SERVICE_URL}/validar/${cpf}`);

    if (!response.data.valido || !response.data.ativo) {
      return res.status(400).json({
        erro: 'CPF inválido ou inativo'
      });
    }

    const result = await db.query(
      `UPDATE cliente
       SET nome = $1,
           cpf = $2,
           data_nascimento = $3,
           endereco = $4,
           cidade = $5
       WHERE serial = $6
       RETURNING *`,
      [nome, cpf, data_nascimento, endereco, cidade, req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    if (error.response) {
      return res.status(400).json(error.response.data);
    }

    res.status(500).json({ erro: error.message });
  }
});

app.delete('/clientes/:id', async (req, res) => {
  try {
    const result = await db.query(
      'DELETE FROM cliente WHERE serial = $1 RETURNING *',
      [req.params.id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ erro: 'Cliente não encontrado' });
    }

    res.json({
      mensagem: 'Cliente removido com sucesso'
    });
  } catch (error) {
    res.status(500).json({ erro: error.message });
  }
});

const PORT = 3000;

app.listen(PORT, () => {
  console.log(`Servidor cliente_service executando na porta ${PORT}`);
});
