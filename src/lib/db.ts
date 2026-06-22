import { PrismaClient } from '@prisma/client';

// Turso adapter for production (cloud SQLite)
let _db: PrismaClient | null = null;

export async function getDb(): Promise<PrismaClient> {
  if (!_db) {
    const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';

    if (dbUrl.startsWith('libsql://')) {
      try {
        const { PrismaLibSQL } = await import('@prisma/adapter-libsql');
        const { createClient } = await import('@libsql/client');

        const libsql = createClient({
          url: dbUrl,
          authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
        });

        const adapter = new PrismaLibSQL(libsql);
        _db = new PrismaClient({ adapter } as any);
        console.log('[DB] Connected to Turso successfully');
      } catch (err) {
        console.error('[DB] Failed to connect to Turso:', err);
        throw err;
      }
    } else {
      _db = new PrismaClient();
      console.log('[DB] Connected to local SQLite');
    }
  }
  return _db;
}

// Synchronous fallback for local dev (NOT used in production with Turso)
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

const dbUrl = process.env.DATABASE_URL || 'file:./dev.db';
export const db = dbUrl.startsWith('libsql://')
  ? null as unknown as PrismaClient
  : (globalForPrisma.prisma ?? new PrismaClient());

if (!dbUrl.startsWith('libsql://') && process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = db;
}
