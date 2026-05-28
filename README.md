# eteg-challenge

Formulário de cadastro de clientes com painel administrativo — monorepo TypeScript full stack.

**Stack:** React 19 + Vite · NestJS 11 · PostgreSQL 16 · Redis 7 · Docker

---

## Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) 20+
- [Docker Compose](https://docs.docker.com/compose/) v2

---

## Rodando do zero

### 1. Clone o repositório

```bash
git clone <url-do-repositorio>
cd eteg-challenge
```

### 2. Configure as variáveis de ambiente

```bash
cp .env.example .env
```

Edite o `.env` se necessário — os valores padrão já funcionam para desenvolvimento local.

### 3. Suba o ambiente

```bash
docker compose up --build
```

Na primeira execução o build leva alguns minutos. Nas próximas, use sem `--build`:

```bash
docker compose up
```

### 4. Acesse

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:3000 |

---

## Ambiente de produção

**Local** (inclui banco e Redis):

```bash
docker compose -f docker-compose.prod.local.yml up --build
```

**Servidor** (banco e Redis externos, configurados no `.env`):

```bash
docker compose -f docker-compose.prod.yml up --build
```

| Serviço | URL |
|---------|-----|
| Frontend (Nginx) | http://localhost:80 |
| API | http://localhost:3000 |

---

## Comandos úteis

```bash
# Rebuild (obrigatório ao alterar package.json)
docker compose up --build

# Derrubar containers e limpar volumes
docker compose down -v

# Reset completo do banco (derruba, sobe, migra e faz seed)
npm run db:reset

# Seed manual do banco
npm run db:seed -w api

# Logs de um serviço específico
docker compose logs -f api
docker compose logs -f web
```
