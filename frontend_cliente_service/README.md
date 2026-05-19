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