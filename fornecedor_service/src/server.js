const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.json({ message: "Fornecedor Service funcionando" });
});

app.get("/fornecedores", async (req, res) => {
    try {
        const result = await pool.query("SELECT * FROM fornecedores ORDER BY id");
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao listar fornecedores" });
    }
});

app.post("/fornecedores", async (req, res) => {
    try {
        const {
            razao_social,
            cnpj,
            inscricao_estadual,
            contatos,
            financeiro
        } = req.body;

        if (!razao_social || !cnpj) {
            return res.status(400).json({
                erro: "Razão social e CNPJ são obrigatórios"
            });
        }

        const result = await pool.query(
            `INSERT INTO fornecedores 
      (razao_social, cnpj, inscricao_estadual, contatos, financeiro)
      VALUES ($1, $2, $3, $4, $5)
      RETURNING *`,
            [razao_social, cnpj, inscricao_estadual, contatos, financeiro]
        );

        res.status(201).json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao criar fornecedor" });
    }
});

app.listen(PORT, () => {
    console.log(`Fornecedor Service rodando na porta ${PORT}`);
});