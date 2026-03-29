import { PrismaClient } from '../generated/prisma/client';
import { logger } from '../utils/logger';

let prisma: PrismaClient;

export function getPrisma(): PrismaClient {
  if (!prisma) {
    prisma = new PrismaClient({
      log: [
        { emit: 'event', level: 'error' },
      ],
    });
    prisma.$on('error' as never, (e: any) => {
      logger.error('Prisma error', { error: e });
    });
  }
  return prisma;
}

export async function disconnectPrisma(): Promise<void> {
  if (prisma) {
    await prisma.$disconnect();
    logger.info('Prisma disconnected');
  }
}
