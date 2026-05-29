# Status do Projeto — eteg-challenge

> Última atualização: 2026-05-28

## O que está feito

### Infraestrutura
- [x] Monorepo com Turborepo + npm workspaces
- [x] `Dockerfile` único na raiz com multi-stage (dev e prod) para api e web
- [x] `docker-compose.yml` — dev: sobe apenas PostgreSQL 16 + Redis 7 (apps rodam no host via `npm run dev`)
- [x] `docker-compose.prod.local.yml` — produção local com banco e redis embutidos
- [x] `docker-compose.prod.yml` — produção (nginx, builds otimizados, banco e redis externos)
- [x] Scripts no `package.json` raiz: `dev:up`, `db:seed`, `db:seed:colors`, `db:seed:admin`, `db:seed:customers`, `db:reset`
- [x] `CLAUDE.md` e `CLAUDE.local.md` configurados
- [x] `.env` e `.env.example` com todas as variáveis necessárias

### Banco de dados
- [x] Entidades TypeORM: `Color`, `Customer`, `Admin` em `src/entities/`
- [x] Seed via `npm run db:seed` (idempotente — só insere se não existir): 7 cores, admin e 77 clientes fake. Clientes **só em dev** (guard de `NODE_ENV` + faker é devDependency). Seeds individuais: `db:seed:colors`, `db:seed:admin`, `db:seed:customers`
- [x] CPF modelado em 3 campos: `cpfStart`, `cpfEnd`, `cpfHash` (HMAC-SHA256)
- [x] Migrations (TypeORM): DataSource em `src/database/data-source.ts`, migration inicial em `src/database/migrations/`. Em prod o `api-prod` roda `migration:run` no boot (dev usa `synchronize`)

### Apps
- [x] `apps/api` — NestJS 11 + TypeScript strict + TypeORM
- [x] `apps/web` — React 19 + Vite + TypeScript

## Próximos passos

1. **Frontend web** — formulário de cadastro público (`/`)
2. **Frontend admin** — login + master-detail (`/admin`)
3. **Avaliar admin em produção** — hoje o `api-prod` semeia só cores; admin via `node dist/database/seed-admin` sob demanda

## Decisões técnicas tomadas

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| ORM | TypeORM | Compatibilidade nativa com NestJS, sem conflito ESM/CJS |
| CPF | HMAC-SHA256 com salt fixo | Determinístico, permite busca, não expõe dado |
| Cores | Tabela separada | Flexível para adicionar/remover sem alterar schema |
| Auth admin | JWT + tabela Admin no banco | Requisito definido pelo dev |
| Monorepo | Turborepo com `turbo prune` no Docker | Imagens menores, cache eficiente |
| Base Docker | `node:24-slim` (glibc) | Evita falha do binding nativo do vite 8/rolldown no Alpine (musl) |
| Schema em prod | Migrations TypeORM no boot | `synchronize` off em prod; migration cria as tabelas |

## Portas

| Serviço | Dev | Prod |
|---------|-----|------|
| api | 3000 | 3000 |
| web | 5173 | 80 (8080 no prod local) |
| postgres | 5432 | interno |
| redis | 6379 | interno |
