# Status do Projeto — eteg-challenge

> Última atualização: 2026-05-27

## O que está feito

### Infraestrutura
- [x] Monorepo com Turborepo + npm workspaces
- [x] `Dockerfile` único na raiz com multi-stage (dev e prod) para api, web e docs
- [x] `docker-compose.yml` — ambiente de desenvolvimento (hot reload, volumes montados)
- [x] `docker-compose.prod.yml` — ambiente de produção (nginx, builds otimizados)
- [x] PostgreSQL 16 + Redis 7 no docker-compose
- [x] Scripts no `package.json` raiz: `docker:build:*`, `db:migrate`, `db:seed`, `db:setup`, `db:reset`
- [x] `CLAUDE.md` e `CLAUDE.local.md` configurados
- [x] `.env` e `.env.example` com todas as variáveis necessárias

### Banco de dados
- [x] Entidades TypeORM: `Color`, `Customer`, `Admin` em `src/entities/`
- [x] Seed com 7 cores do arco-íris (upsert idempotente) via `npm run db:seed -w api`
- [x] CPF modelado em 3 campos: `cpfStart`, `cpfEnd`, `cpfHash` (HMAC-SHA256)

### Apps
- [x] `apps/api` — NestJS 11 + TypeScript strict + TypeORM
- [x] `apps/web` — React 19 + Vite + TypeScript
- [x] `apps/docs` — React 19 + Vite + TypeScript

## Próximos passos

1. **Rodar migration** — `npm run db:setup` (postgres precisa estar rodando)
2. **Módulo de cadastro na API** — `POST /clientes` com validação e hash do CPF
3. **Módulo de autenticação** — login admin com JWT
4. **Módulo admin na API** — `GET /clientes` e `GET /clientes/:id`
5. **Frontend web** — formulário de cadastro público (`/`)
6. **Frontend admin** — login + master-detail (`/admin`)
7. **Primeiro commit**

## Decisões técnicas tomadas

| Decisão | Escolha | Motivo |
|---------|---------|--------|
| ORM | TypeORM | Compatibilidade nativa com NestJS, sem conflito ESM/CJS |
| CPF | HMAC-SHA256 com salt fixo | Determinístico, permite busca, não expõe dado |
| Cores | Tabela separada | Flexível para adicionar/remover sem alterar schema |
| Auth admin | JWT + tabela Admin no banco | Requisito definido pelo dev |
| Monorepo | Turborepo com `turbo prune` no Docker | Imagens menores, cache eficiente |

## Portas

| Serviço | Dev | Prod |
|---------|-----|------|
| api | 3000 | 3000 |
| web | 5173 | 80 |
| docs | 5174 | 5174 |
| postgres | 5432 | 5432 |
| redis | 6379 | 6379 |
