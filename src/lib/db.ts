import { PrismaClient } from '@prisma/client';

// Turso adapter for production (cloud SQLite)
async function createPrismaClient() {
  const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';

  // If using Turso (libsql://), use the adapter
  if (dbUrl.startsWith('libsql://')) {
    const { PrismaLibSQL } = await import('@prisma/adapter-libsql');
    const { createClient } = await import('@libsql/client');

    const libsql = createClient({
      url: dbUrl,
      authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
    });

    const adapter = new PrismaLibSQL(libsql);
    return new PrismaClient({ adapter } as any);
  }

  return new PrismaClient();
}

// Lazy singleton — initialized on first use
let _db: PrismaClient | null = null;

export async function getDb(): Promise<PrismaClient> {
  if (!_db) {
    _db = await createPrismaClient();
  }
  return _db;
}

// Synchronous fallback for non-Turso (local dev with SQLite)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
export const db = dbUrl.startsWith('libsql://')
  ? null as unknown as PrismaClient // placeholder, use getDb() for Turso
  : (globalForPrisma.prisma ?? new PrismaClient());

if (!dbUrl.startsWith('libsql://') && process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
