import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "./generated/client"; // 👈 Import from the local generated path instead!

// 1. Establish a standard, production-ready PostgreSQL connection pool
const pool = new pg.Pool({ 
  connectionString: process.env.DATABASE_URL 
});

// 2. Wrap it with Prisma 7's lightweight JavaScript adapter layer
const adapter = new PrismaPg(pool);

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

// 3. Construct the client safely using the modern adapter parameter setup
export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter, // 🛡️ Bypasses engine file system problems in monorepos entirely
    log: process.env.NODE_ENV === "development" ? ["query", "error", "warn"] : ["error"],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

// Export all the compiled model types dynamically so apps/web can read them safely
export * from "./generated/client";
