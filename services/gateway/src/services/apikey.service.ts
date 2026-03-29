import crypto from 'crypto';
import { PrismaClient } from '../generated/prisma/client';
import { config } from '../config';
import { logger } from '../utils/logger';
import { AppError } from './auth.service';

const prisma = new PrismaClient();

// Raw API key format: "ds_<prefix8chars>_<random32chars>"
const KEY_PREFIX = 'ds_';
const PREFIX_LENGTH = 8;
const KEY_LENGTH = 32;

export interface ApiKeyWithRaw {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  isActive: boolean;
  expiresAt: Date | null;
  createdAt: Date;
  rawKey: string; // Only returned once on creation
}

export interface SafeApiKey {
  id: string;
  name: string;
  prefix: string;
  scopes: string[];
  isActive: boolean;
  lastUsedAt: Date | null;
  expiresAt: Date | null;
  createdAt: Date;
}

export class ApiKeyService {
  /**
   * Generate a new API key for a user.
   * Returns the raw key once — it cannot be retrieved again.
   */
  async generateApiKey(
    userId: string,
    name: string,
    scopes: string[],
    expiresInDays?: number
  ): Promise<ApiKeyWithRaw> {
    // Generate the raw key
    const randomPart = crypto.randomBytes(KEY_LENGTH).toString('hex').slice(0, KEY_LENGTH);
    const prefix = randomPart.slice(0, PREFIX_LENGTH);
    const rawKey = `${KEY_PREFIX}${randomPart}`;

    // Hash the key for storage (SHA-256 — fast for lookup, not bcrypt)
    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    // Compute expiry
    const expiresAt = expiresInDays
      ? new Date(Date.now() + expiresInDays * 24 * 60 * 60 * 1000)
      : null;

    const apiKey = await prisma.apiKey.create({
      data: {
        name,
        keyHash,
        prefix,
        userId,
        scopes,
        expiresAt,
      },
    });

    logger.info('API key generated', { userId, keyId: apiKey.id, name });

    return {
      id: apiKey.id,
      name: apiKey.name,
      prefix: apiKey.prefix,
      scopes: apiKey.scopes,
      isActive: apiKey.isActive,
      expiresAt: apiKey.expiresAt,
      createdAt: apiKey.createdAt,
      rawKey,
    };
  }

  /**
   * Validate raw API key from X-Api-Key header.
   * Returns userId + scopes if valid.
   */
  async validateApiKey(rawKey: string): Promise<{ userId: string; scopes: string[] }> {
    if (!rawKey.startsWith(KEY_PREFIX)) {
      throw new AppError('Invalid API key format', 401);
    }

    const keyHash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const apiKey = await prisma.apiKey.findUnique({ where: { keyHash } });

    if (!apiKey) {
      throw new AppError('Invalid API key', 401);
    }

    if (!apiKey.isActive) {
      throw new AppError('API key has been revoked', 401);
    }

    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      throw new AppError('API key has expired', 401);
    }

    // Update last-used timestamp (fire-and-forget)
    prisma.apiKey
      .update({ where: { id: apiKey.id }, data: { lastUsedAt: new Date() } })
      .catch((err) => logger.warn('Failed to update API key lastUsedAt', { err }));

    return { userId: apiKey.userId, scopes: apiKey.scopes };
  }

  /**
   * List all API keys for a user (never returns the raw key).
   */
  async listApiKeys(userId: string): Promise<SafeApiKey[]> {
    const keys = await prisma.apiKey.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
    });

    return keys.map((k) => ({
      id: k.id,
      name: k.name,
      prefix: k.prefix,
      scopes: k.scopes,
      isActive: k.isActive,
      lastUsedAt: k.lastUsedAt,
      expiresAt: k.expiresAt,
      createdAt: k.createdAt,
    }));
  }

  /**
   * Revoke (soft-delete) an API key. Only the owner can revoke.
   */
  async revokeApiKey(keyId: string, userId: string): Promise<void> {
    const apiKey = await prisma.apiKey.findUnique({ where: { id: keyId } });

    if (!apiKey) {
      throw new AppError('API key not found', 404);
    }

    if (apiKey.userId !== userId) {
      throw new AppError('Not authorized to revoke this key', 403);
    }

    await prisma.apiKey.update({
      where: { id: keyId },
      data: { isActive: false },
    });

    logger.info('API key revoked', { keyId, userId });
  }
}
