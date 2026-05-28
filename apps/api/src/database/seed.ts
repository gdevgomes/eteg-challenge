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
  for (const color of colors) {
    const exists = await colorRepo.findOne({ where: { name: color.name } });
    if (!exists) await colorRepo.save(colorRepo.create(color));
  }
  console.log('Seed: 7 rainbow colors inserted.');

  const adminRepo = dataSource.getRepository(Admin);
  const adminExists = await adminRepo.findOne({ where: { username: 'admin' } });
  if (!adminExists) {
    const passwordHash = await bcrypt.hash('admin', 10);
    await adminRepo.save(adminRepo.create({ username: 'admin', passwordHash }));
  }
  console.log('Seed: admin user created (username: admin, password: admin).');

  const allColors = await colorRepo.find();
  const customerRepo = dataSource.getRepository(Customer);
  const secret = process.env.CPF_HASH_SECRET ?? 'seed-secret';

  let inserted = 0;
  const usedCpfs = new Set<string>();
  const usedEmails = new Set<string>();

  while (inserted < 77) {
    const digits = faker.string.numeric(9);
    if (usedCpfs.has(digits)) continue;
    usedCpfs.add(digits);

    const cpfHash = createHmac('sha256', secret).update(digits).digest('hex');
    const exists = await customerRepo.findOne({ where: { cpfHash } });
    if (exists) continue;

    const email = faker.internet.email();
    if (usedEmails.has(email)) continue;
    usedEmails.add(email);

    const emailExists = await customerRepo.findOne({ where: { email } });
    if (emailExists) continue;

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
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => dataSource.destroy());
