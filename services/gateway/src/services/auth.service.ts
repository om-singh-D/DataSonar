import { PrismaClient, User, Role } from '../generated/prisma/client';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { config } from '../config';
import { logger } from '../utils/logger';
import { RegisterInput, LoginInput } from '../schemas/auth.schema';

const prisma = new PrismaClient();

export interface JwtPayload {
  userId: string;
  email: string;
  role: Role;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: string;
}

export interface SafeUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  role: Role;
  status: string;
  lastLoginAt: Date | null;
  createdAt: Date;
}

function toSafeUser(user: User): SafeUser {
  return {
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    role: user.role,
    status: user.status,
    lastLoginAt: user.lastLoginAt,
    createdAt: user.createdAt,
  };
}

export class AuthService {
  async register(input: RegisterInput): Promise<{ user: SafeUser; tokens: AuthTokens }> {
    // Check if user already exists
    const existing = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (existing) {
      throw new AppError('Email already registered', 409);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(input.password, config.bcrypt.saltRounds);

    // Create user
    const user = await prisma.user.create({
      data: {
        email: input.email,
        passwordHash,
        firstName: input.firstName,
        lastName: input.lastName,
        role: Role.VIEWER, // Default role
      },
    });

    // Generate tokens
    const tokens = this.generateTokens(user);

    // Audit log
    await this.createAuditLog(user.id, 'LOGIN', 'user', user.id);

    logger.info('User registered successfully', { userId: user.id, email: user.email });

    return { user: toSafeUser(user), tokens };
  }

  async login(input: LoginInput, ipAddress?: string, userAgent?: string): Promise<{ user: SafeUser; tokens: AuthTokens }> {
    // Find user
    const user = await prisma.user.findUnique({
      where: { email: input.email },
    });

    if (!user) {
      throw new AppError('Invalid email or password', 401);
    }

    if (user.status !== 'ACTIVE') {
      throw new AppError('Account is not active. Contact administrator.', 403);
    }

    // Verify password
    const isValidPassword = await bcrypt.compare(input.password, user.passwordHash);

    if (!isValidPassword) {
      throw new AppError('Invalid email or password', 401);
    }

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate tokens
    const tokens = this.generateTokens(user);

    // Audit log
    await this.createAuditLog(user.id, 'LOGIN', 'user', user.id, { ipAddress, userAgent });

    logger.info('User logged in', { userId: user.id, email: user.email });

    return { user: toSafeUser(user), tokens };
  }

  async getProfile(userId: string): Promise<SafeUser> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    return toSafeUser(user);
  }

  async updateProfile(userId: string, data: Partial<{ firstName: string; lastName: string; email: string }>): Promise<SafeUser> {
    // If email is being changed, check uniqueness
    if (data.email) {
      const existing = await prisma.user.findUnique({
        where: { email: data.email },
      });
      if (existing && existing.id !== userId) {
        throw new AppError('Email already in use', 409);
      }
    }

    const user = await prisma.user.update({
      where: { id: userId },
      data,
    });

    await this.createAuditLog(userId, 'UPDATE', 'user', userId, { fields: Object.keys(data) });

    return toSafeUser(user);
  }

  async changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404);
    }

    const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
    if (!isValid) {
      throw new AppError('Current password is incorrect', 401);
    }

    const passwordHash = await bcrypt.hash(newPassword, config.bcrypt.saltRounds);

    await prisma.user.update({
      where: { id: userId },
      data: { passwordHash },
    });

    await this.createAuditLog(userId, 'UPDATE', 'user', userId, { field: 'password' });

    logger.info('Password changed', { userId });
  }

  generateTokens(user: User): AuthTokens {
    const payload: JwtPayload = {
      userId: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = jwt.sign(payload, config.jwt.secret, {
      expiresIn: config.jwt.expiresIn,
    } as jwt.SignOptions);

    const refreshToken = jwt.sign(
      { userId: user.id, type: 'refresh' },
      config.jwt.secret,
      { expiresIn: config.jwt.refreshExpiresIn } as jwt.SignOptions
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: config.jwt.expiresIn,
    };
  }

  verifyToken(token: string): JwtPayload {
    try {
      return jwt.verify(token, config.jwt.secret) as JwtPayload;
    } catch {
      throw new AppError('Invalid or expired token', 401);
    }
  }

  private async createAuditLog(
    userId: string,
    action: 'LOGIN' | 'LOGOUT' | 'CREATE' | 'UPDATE' | 'DELETE' | 'API_CALL',
    resource: string,
    resourceId?: string,
    details?: Record<string, unknown>,
    ipAddress?: string,
    userAgent?: string
  ): Promise<void> {
    try {
      await prisma.auditLog.create({
        data: {
          userId,
          action,
          resource,
          resourceId,
          details: details ? (details as any) : undefined,
          ipAddress,
          userAgent,
        },
      });
    } catch (error) {
      logger.warn('Failed to create audit log', { error, userId, action });
    }
  }
}

// Custom error class
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number
  ) {
    super(message);
    this.name = 'AppError';
  }
}