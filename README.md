# PROJETO TÓPICOS
## 2 microserviço e um app


# Microserviço valida_cpf

## Executar com Docker

```bash
docker-compose up --build
```

## Endpoint

### Validar CPF

GET `/validar/:cpf`

Exemplo:
```bash
curl http://localhost:3001/validar/12345678909
```

# Microserviço cliente_service

## Dependência

O serviço `valida_cpf` deve estar executando na porta `3001`.

## Executar

```bash
docker-compose up --build
```

## Endpoints

### Listar clientes
GET `/clientes`

### Buscar cliente
GET `/clientes/:id`

### Criar cliente
POST `/clientes`

Exemplo:
```json
{
  "nome": "João Silva",
  "cpf": "12345678909",
  "data_nascimento": "1990-01-01",
  "endereco": "Rua A",
  "cidade": 1
}
```

### Atualizar cliente
PUT `/clientes/:id`

### Remover cliente
DELETE `/clientes/:id`


# Frontend Cliente Service com Docker

Frontend HTML puro utilizando Material Design e JavaScript.

## Executar com Docker

### Requisitos

- Docker
- Docker Compose

## Subir aplicação

Na pasta do projeto execute:

```bash
docker compose up --build
```

ou:

```bash
docker-compose up --build
```

## Acessar

Abra no navegador:

```text
http://localhost:8080
```

## Backend

O backend deve estar executando em:

```text
http://localhost:3000
```

## Funcionalidades

- Cadastro de clientes
- Edição
- Exclusão
- Listagem
- Material Design
- Requisições Fetch API

## Estrutura

- index.html
- styles.css
- app.js
- Dockerfile
- docker-compose.yml
- nginx.conf



