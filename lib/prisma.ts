import { PrismaClient } from "./generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const globalForPrisma = global as unknown as {
  prisma: PrismaClient;
};

const connectionString = process.env.DATABASE_URL ?? "";
// const sep = rawUrl.includes("?") ? "&" : "?";
// const sslmode =
//   process.env.NODE_ENV === "production" ? "verify-full" : "verify-full";
// const connectionString = `${rawUrl}${sep}sslmode=${sslmode}`;

const adapter = new PrismaPg({
  connectionString,
});

const prisma =
  globalForPrisma.prisma ||
  new PrismaClient({
    adapter,
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export { prisma };
export default prisma;