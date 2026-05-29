import 'dotenv/config';
import { DataSource } from 'typeorm';
import { Color } from '../entities/color.entity';
import { Customer } from '../entities/customer.entity';

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  // Customer é necessário porque Color tem relação OneToMany com Customer —
  // sem ela o TypeORM não resolve a metadata de Color#customers.
  entities: [Color, Customer],
  synchronize: false,
});

const colors = [
  { name: 'Red', hex: '#FF0000' },
  { name: 'Orange', hex: '#FF7F00' },
  { name: 'Yellow', hex: '#FFFF00' },
  { name: 'Green', hex: '#008000' },
  { name: 'Light Blue', hex: '#00BFFF' },
  { name: 'Dark Blue', hex: '#00008B' },
  { name: 'Violet', hex: '#EE82EE' },
];

async function main() {
  await dataSource.initialize();
  const repo = dataSource.getRepository(Color);
  if ((await repo.count()) === 0) {
    for (const color of colors) await repo.save(repo.create(color));
    console.log('Seed: 7 rainbow colors inserted.');
  } else {
    console.log('Seed: colors already exist, skipped.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => dataSource.destroy());
