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
cp apps/api/.env.example apps/api/.env
```

### 3. Suba a infraestrutura (PostgreSQL + Redis)

```bash
docker compose up -d
```

O `docker-compose.yml` de desenvolvimento sobe apenas o banco e o Redis. Os apps rodam no host com hot reload.

### 4. Instale as dependências e suba os apps

```bash
npm install
npm run dev
```

O `npm run dev` (Turborepo) sobe a API e o frontend em paralelo. Na primeira execução, a API cria as tabelas automaticamente (TypeORM `synchronize`).

### 5. Popule o banco (seed)

Com a API já rodando, em **outro terminal**:

```bash
npm run db:seed
```

Cria as 7 cores, o usuário admin (`admin` / `admin`) e clientes de exemplo. Necessário para o dropdown de cores e o login do painel admin.

### 6. Acesse

| Serviço | URL |
|---------|-----|
| Frontend | http://localhost:5173 |
| API | http://localhost:3000 |

---

## Ambiente de produção

```bash
cp .env.example .env
```

No boot, a API roda as migrations e semeia apenas as cores. Para criar o admin do painel:

```bash
docker compose -f docker-compose.prod.local.yml exec api node dist/database/seed-admin
```

**Local** (inclui banco e Redis):

```bash
docker compose -f docker-compose.prod.local.yml up --build
```

| Serviço | URL |
|---------|-----|
| Frontend (Nginx) | http://localhost:8080 |
| API | http://localhost:3000 |

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
# Derrubar a infra e limpar o volume do banco
docker compose down -v

# Reset do banco (recria o volume; rode o seed depois)
npm run db:reset

# Seed do banco (cores, admin e clientes) — requer a API já rodada uma vez
npm run db:seed

# Logs da infra
docker compose logs -f postgres redis
```
