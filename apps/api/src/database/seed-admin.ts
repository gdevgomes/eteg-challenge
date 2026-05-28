import 'dotenv/config';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { Admin } from '../entities/admin.entity';

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Admin],
  synchronize: false,
});

async function main() {
  await dataSource.initialize();
  const repo = dataSource.getRepository(Admin);
  const exists = await repo.findOne({ where: { username: 'admin' } });
  if (!exists) {
    const passwordHash = await bcrypt.hash('admin', 10);
    await repo.save(repo.create({ username: 'admin', passwordHash }));
    console.log('Seed: admin user created (username: admin, password: admin).');
  } else {
    console.log('Seed: admin user already exists, skipped.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => dataSource.destroy());
