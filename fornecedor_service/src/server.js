const express = require("express");
const cors = require("cors");
const pool = require("./db");

const app = express();
const PORT = process.env.PORT || 3002;

app.use(cors());
app.use(express.json());

app.get("/fornecedores/cnpj/:cnpj", async (req, res) => {
    try {
        const { cnpj } = req.params;
        const result = await pool.query("SELECT * FROM fornecedores WHERE cnpj = $1", [cnpj]);

        if (result.rows.length === 0) {
            return res.status(404).json({ erro: "Fornecedor não encontrado" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar fornecedor por CNPJ" });
    }
});

app.get("/fornecedores/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("SELECT * FROM fornecedores WHERE id = $1", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ erro: "Fornecedor não encontrado" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao buscar fornecedor" });
    }
});

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

app.put("/fornecedores/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const { razao_social, cnpj, inscricao_estadual, contatos, financeiro } = req.body;

        const result = await pool.query(
            `UPDATE fornecedores 
            SET razao_social = $1, cnpj = $2, inscricao_estadual = $3, contatos = $4, financeiro = $5
            WHERE id = $6
            RETURNING *`,
            [razao_social, cnpj, inscricao_estadual, contatos, financeiro, id]
        );

        if (result.rows.length === 0) {
            return res.status(404).json({ erro: "Fornecedor não encontrado" });
        }

        res.json(result.rows[0]);
    } catch (error) {
        res.status(500).json({ erro: "Erro ao atualizar fornecedor" });
    }
});

app.delete("/fornecedores/:id", async (req, res) => {
    try {
        const { id } = req.params;
        const result = await pool.query("DELETE FROM fornecedores WHERE id = $1", [id]);

        if (result.rowCount === 0) {
            return res.status(404).json({ erro: "Fornecedor não encontrado" });
        }

        res.json({ message: "Fornecedor deletado com sucesso" });
    } catch (error) {
        res.status(500).json({ erro: "Erro ao deletar fornecedor" });
    }
});

app.listen(PORT, () => {
    console.log(`Fornecedor Service rodando na porta ${PORT}`);
});