import 'dotenv/config';
import { DataSource } from 'typeorm';

/**
 * DataSource usado pelo CLI do TypeORM (migrations).
 * Os globs resolvem para .ts em desenvolvimento (ts-node) e .js em produção
 * (código compilado em dist/), graças ao __dirname.
 */
export default new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [__dirname + '/../entities/*.entity.{ts,js}'],
  migrations: [__dirname + '/migrations/*.{ts,js}'],
  synchronize: false,
});
