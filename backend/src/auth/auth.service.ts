import { ConflictException, Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Prisma, User } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../prisma/prisma.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { AuthResponse, JwtPayload, SafeUser } from './types/auth.types';

const BCRYPT_SALT_ROUNDS = 10;

const safeUserSelect = {
  id: true,
  email: true,
  fullName: true,
  phone: true,
  role: true,
  loyaltyPoints: true,
  createdAt: true,
} as const;

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
  ) {}

  private toSafeUser(user: User): SafeUser {
    return {
      id: user.id,
      email: user.email,
      fullName: user.fullName,
      phone: user.phone,
      role: user.role,
      loyaltyPoints: user.loyaltyPoints,
      createdAt: user.createdAt,
    };
  }

  private async generateAccessToken(user: SafeUser): Promise<string> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };
    return this.jwtService.signAsync(payload);
  }

  async register(dto: RegisterDto): Promise<AuthResponse> {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const existingUser = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (existingUser) {
      throw new ConflictException('Email đã được sử dụng để đăng ký tài khoản');
    }

    const hashedPassword = await bcrypt.hash(dto.password, BCRYPT_SALT_ROUNDS);

    try {
      const createdUser = await this.prisma.user.create({
        data: {
          email: normalizedEmail,
          password: hashedPassword,
          fullName: dto.fullName.trim(),
          phone: dto.phone?.trim() || null,
        },
        select: safeUserSelect,
      });

      const accessToken = await this.generateAccessToken(createdUser);
      return {
        accessToken,
        user: createdUser,
      };
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        throw new ConflictException('Email đã được sử dụng để đăng ký tài khoản');
      }
      throw error;
    }
  }

  async login(dto: LoginDto): Promise<AuthResponse> {
    const normalizedEmail = dto.email.trim().toLowerCase();
    const user = await this.prisma.user.findUnique({
      where: { email: normalizedEmail },
    });

    if (!user) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Email hoặc mật khẩu không chính xác');
    }

    const safeUser = this.toSafeUser(user);
    const accessToken = await this.generateAccessToken(safeUser);
    return {
      accessToken,
      user: safeUser,
    };
  }

  async getProfile(userId: string): Promise<SafeUser> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: safeUserSelect,
    });

    if (!user) {
      throw new UnauthorizedException('Không tìm thấy thông tin tài khoản');
    }

    return user;
  }
}
