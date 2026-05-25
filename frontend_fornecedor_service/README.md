# Frontend Fornecedor Service

Ambiente inicial em React com Tailwind CSS para o microservico de fornecedores.

## O que foi preparado

- Aplicacao React com Vite
- Tailwind CSS integrado ao Vite
- Dockerfile para desenvolvimento
- docker-compose para subir o frontend em container
- Variavel `VITE_API_URL` apontando para o `fornecedor_service`

## Como executar

Na pasta `frontend_fornecedor_service`, rode:

```bash
docker compose up --build
```

Depois acesse:

```text
http://localhost:5174
```

## API esperada

O frontend foi preparado para integrar com:

```text
http://localhost:3002
```