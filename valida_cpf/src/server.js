const express = require('express');
const cors = require('cors');
const validarCPF = require('./cpfValidator');

const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (req, res) => {
  res.json({ status: 'UP' });
});

app.get('/validar/:cpf', async (req, res) => {
  const { cpf } = req.params;

  const cpfValido = validarCPF(cpf);

  if (!cpfValido) {
    return res.status(400).json({
      cpf,
      valido: false,
      ativo: false,
      mensagem: 'CPF inválido'
    });
  }

  // Simulação de CPF ativo
  const ativo = true;

  return res.json({
    cpf,
    valido: true,
    ativo
  });
});

const PORT = 3001;

app.listen(PORT, () => {
  console.log(`Servidor valida_cpf executando na porta ${PORT}`);
});
