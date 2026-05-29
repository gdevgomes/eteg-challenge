import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CacheModule } from '@nestjs/cache-manager';
import { redisStore } from 'cache-manager-ioredis-yet';
import { AppController } from './app.controller';
import { ColorsModule } from './colors/colors.module';
import { AuthModule } from './modules/auth/auth.module';
import { validateEnv } from './config/env';
import { Env } from './config/env';
import { Admin } from './entities/admin.entity';
import { Color } from './entities/color.entity';
import { Customer } from './entities/customer.entity';
import { CustomersModule } from './modules/customers/customers.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService<Env, true>) => ({
        type: 'postgres',
        url: config.get('DATABASE_URL'),
        entities: [Admin, Color, Customer],
        synchronize: config.get('NODE_ENV') !== 'production',
      }),
    }),
    CacheModule.registerAsync({
      isGlobal: true,
      inject: [ConfigService],
      useFactory: async (config: ConfigService<Env, true>) => {
        // ioredis não reconhece a chave `url` em options — é preciso passar
        // host/port. Parseamos o REDIS_URL para funcionar tanto no host (dev,
        // localhost) quanto entre containers (prod, hostname `redis`).
        const redisUrl = new URL(config.get('REDIS_URL'));
        return {
          store: await redisStore({
            host: redisUrl.hostname,
            port: Number(redisUrl.port) || 6379,
            ...(redisUrl.password ? { password: redisUrl.password } : {}),
          }),
          ttl: 300,
        };
      },
    }),
    ColorsModule,
    AuthModule,
    CustomersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
