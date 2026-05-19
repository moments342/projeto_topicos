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
