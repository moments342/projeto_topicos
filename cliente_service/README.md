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
