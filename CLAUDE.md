# eteg-challenge

Monorepo para o desafio técnico da Eteg — formulário de cadastro de clientes com stack TypeScript full stack.

## Stack

- **Monorepo**: Turborepo com npm workspaces
- **Frontend** (`apps/web`): React 19 + Vite + TypeScript
- **Backend** (`apps/api`): NestJS 11 + TypeScript (strict mode)
- **ORM**: TypeORM com entidades em `apps/api/src/entities/`
- **Banco**: PostgreSQL 16
- **Cache**: Redis 7
- **Infra**: Docker (único `Dockerfile` na raiz com multi-stage)

## Comandos

```bash
docker compose up -d              # dev: sobe apenas postgres + redis
npm run dev                       # dev: sobe api + web no host (hot reload)
docker compose -f docker-compose.prod.local.yml up --build  # prod local (com banco e redis)
docker compose -f docker-compose.prod.yml up --build         # prod (banco e redis externos)
```

## Estrutura

```
apps/
  api/      → NestJS (porta 3000)
  web/      → Vite React (porta 5173)
Dockerfile               → único, com stages: api-dev, api-prod, web-dev, web-prod
docker-compose.yml             → dev (postgres + redis)
docker-compose.prod.local.yml  → produção local (com postgres + redis)
docker-compose.prod.yml        → produção (postgres + redis externos)
```

## Convenções

### Geral

- TypeScript strict em todos os apps
- Nunca commitar `.env` — usar `.env.example` como referência

### API (NestJS)

- Módulos por feature em `apps/api/src/modules/`
- Usar `@nestjs/common` para decorators, nunca importar direto do express
- Validação de entrada com `class-validator` e `class-transformer`
- Entidades em `apps/api/src/entities/` — uma classe por arquivo com decorators TypeORM
- `synchronize: true` apenas em development — em produção o schema vem de **migrations**
- Seed via `npm run db:seed -w api` (usa `ts-node`)

### TypeORM — convenções do projeto

- Repositories customizados em `<module>/`**`<module>.repository.ts`** — queries ao banco
- Services em `<module>/`**`<module>.service.ts`** — lógica de negócio
- Registrar entidade no módulo com `TypeOrmModule.forFeature([Entidade])`
- Cache Redis via `@UseInterceptors(CacheInterceptor)` nas rotas que precisam

### Migrations (produção)

- DataSource do CLI em `apps/api/src/database/data-source.ts`; migrations em `apps/api/src/database/migrations/`
- Comandos (dev): `npm run migration:generate -w api -- src/database/migrations/<Nome>`, `migration:run`, `migration:revert`
- No boot do container `api-prod` roda `migration:run:prod` (sobre o `dist/`) antes do seed de cores e do `main`

### Banco de dados (LGPD)

- CPF deve ser armazenado com hash — nunca em texto puro
- Nunca logar dados pessoais (nome, CPF, e-mail) em texto puro
- Todo model deve ter `createdAt` e `updatedAt`

### Docker

- Build context é sempre a raiz do monorepo
- `turbo prune <workspace> --docker` é usado em cada stage do Dockerfile
- Ao adicionar dependência: rodar `docker compose up --build`

## Variáveis de ambiente

Ver `.env.example` na raiz. Principais:

| Variável             | Descrição                     |
| -------------------- | ----------------------------- |
| `DATABASE_URL`       | PostgreSQL connection string  |
| `REDIS_URL`          | Redis connection string       |
| `PORT`               | Porta da API (padrão: 3000)   |
| `BCRYPT_SALT_ROUNDS` | Rounds do bcrypt (padrão: 10) |
