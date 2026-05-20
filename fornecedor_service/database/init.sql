CREATE TABLE IF NOT EXISTS fornecedores (
  id SERIAL PRIMARY KEY,
  razao_social VARCHAR(255) NOT NULL,
  cnpj VARCHAR(20) NOT NULL,
  inscricao_estadual VARCHAR(50),
  contatos TEXT,
  financeiro TEXT
);