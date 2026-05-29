import 'dotenv/config';
import { createHmac } from 'crypto';
import { DataSource } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { Admin } from '../entities/admin.entity';
import { Color } from '../entities/color.entity';
import { Customer } from '../entities/customer.entity';

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Admin, Color, Customer],
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

  const colorRepo = dataSource.getRepository(Color);
  if ((await colorRepo.count()) === 0) {
    for (const color of colors) await colorRepo.save(colorRepo.create(color));
    console.log('Seed: 7 rainbow colors inserted.');
  } else {
    console.log('Seed: colors already exist, skipped.');
  }

  const adminRepo = dataSource.getRepository(Admin);
  if (!(await adminRepo.findOne({ where: { username: 'admin' } }))) {
    const passwordHash = await bcrypt.hash('admin', 10);
    await adminRepo.save(adminRepo.create({ username: 'admin', passwordHash }));
    console.log('Seed: admin user created (username: admin, password: admin).');
  } else {
    console.log('Seed: admin already exists, skipped.');
  }

  const customerRepo = dataSource.getRepository(Customer);
  if (process.env.NODE_ENV === 'production') {
    console.log('Seed: customers seed runs only in development, skipping.');
  } else if ((await customerRepo.count()) === 0) {
    const allColors = await colorRepo.find();
    const secret = process.env.CPF_HASH_SECRET ?? 'seed-secret';
    const usedCpfs = new Set<string>();
    const usedEmails = new Set<string>();
    let inserted = 0;

    while (inserted < 77) {
      const digits = faker.string.numeric(9);
      if (usedCpfs.has(digits)) continue;
      usedCpfs.add(digits);

      const email = faker.internet.email();
      if (usedEmails.has(email)) continue;
      usedEmails.add(email);

      const cpfHash = createHmac('sha256', secret).update(digits).digest('hex');
      const color = allColors[Math.floor(Math.random() * allColors.length)];

      await customerRepo.save(
        customerRepo.create({
          fullName: faker.person.fullName(),
          cpfStart: digits.slice(0, 3),
          cpfEnd: digits.slice(-2),
          cpfHash,
          email,
          notes: Math.random() < 0.3 ? faker.lorem.sentence() : null,
          color,
        }),
      );
      inserted++;
    }
    console.log(`Seed: ${inserted} customers inserted.`);
  } else {
    console.log('Seed: customers already exist, skipped.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => dataSource.destroy());
