import 'dotenv/config';
import { createHmac } from 'crypto';
import { DataSource } from 'typeorm';
import { faker } from '@faker-js/faker/locale/pt_BR';
import { Color } from '../entities/color.entity';
import { Customer } from '../entities/customer.entity';

const dataSource = new DataSource({
  type: 'postgres',
  url: process.env.DATABASE_URL,
  entities: [Color, Customer],
  synchronize: false,
});

async function main() {
  await dataSource.initialize();

  const colorRepo = dataSource.getRepository(Color);
  const allColors = await colorRepo.find();
  if (allColors.length === 0) {
    console.error('Seed: no colors found — run db:seed:colors first.');
    process.exit(1);
  }

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
