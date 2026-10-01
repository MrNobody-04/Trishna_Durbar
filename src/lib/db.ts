import { PrismaClient } from "@prisma/client";

declare global {
  // eslint-disable-next-line no-var
  var cachedPrisma: PrismaClient | undefined;
}

// Ensure single shared Prisma instance across serverless lambda executions
const prisma =
  global.cachedPrisma ||
  new PrismaClient({
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });

global.cachedPrisma = prisma;

export default prisma;
