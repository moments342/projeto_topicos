FROM php:8.2-cli-alpine

WORKDIR /app

COPY . .

EXPOSE 3001

# Inicia o servidor embutido do PHP apontando para a pasta src na porta 3001
CMD ["php", "-S", "0.0.0.0:3001", "-t", "src/"]