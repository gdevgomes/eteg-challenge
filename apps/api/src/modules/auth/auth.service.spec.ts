import { UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Test, TestingModule } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { Admin } from '../../entities/admin.entity';

describe('AuthService', () => {
  let service: AuthService;
  let adminRepository: jest.Mocked<{ findOne: jest.Mock }>;
  let jwtService: jest.Mocked<JwtService>;

  const mockAdmin: Omit<Admin, 'createdAt' | 'updatedAt'> & {
    passwordHash: string;
  } = {
    id: 'admin-uuid',
    username: 'admin',
    passwordHash: '',
  };

  beforeAll(async () => {
    mockAdmin.passwordHash = await bcrypt.hash('correct-password', 10);
  });

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: getRepositoryToken(Admin),
          useValue: { findOne: jest.fn() },
        },
        {
          provide: JwtService,
          useValue: {
            signAsync: jest.fn().mockResolvedValue('mocked.jwt.token'),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    adminRepository = module.get(getRepositoryToken(Admin));
    jwtService = module.get(JwtService);
  });

  describe('login', () => {
    it('throws UnauthorizedException when username does not exist', async () => {
      adminRepository.findOne.mockResolvedValue(null);

      await expect(
        service.login({ username: 'nobody', password: 'pass' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('throws UnauthorizedException when password is wrong', async () => {
      adminRepository.findOne.mockResolvedValue(mockAdmin);

      await expect(
        service.login({ username: 'admin', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('returns access_token on valid credentials', async () => {
      adminRepository.findOne.mockResolvedValue(mockAdmin);

      const result = await service.login({
        username: 'admin',
        password: 'correct-password',
      });

      expect(result).toHaveProperty('access_token');
      expect(typeof result.access_token).toBe('string');
    });

    it('signs JWT with sub and username from the admin record', async () => {
      adminRepository.findOne.mockResolvedValue(mockAdmin);

      await service.login({ username: 'admin', password: 'correct-password' });

      expect(jwtService.signAsync).toHaveBeenCalledWith({
        sub: mockAdmin.id,
        username: mockAdmin.username,
      });
    });

    it('returns same error for wrong username and wrong password (prevents user enumeration)', async () => {
      adminRepository.findOne.mockResolvedValue(null);
      let wrongUserError: string | undefined;
      try {
        await service.login({ username: 'nobody', password: 'pass' });
      } catch (e) {
        wrongUserError = (e as Error).message;
      }

      adminRepository.findOne.mockResolvedValue(mockAdmin);
      let wrongPassError: string | undefined;
      try {
        await service.login({ username: 'admin', password: 'wrong' });
      } catch (e) {
        wrongPassError = (e as Error).message;
      }

      expect(wrongUserError).toBe(wrongPassError);
    });
  });
});
