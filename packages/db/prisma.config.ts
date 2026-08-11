import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  // Tell Prisma where to find your schema in the monorepo package
  schema: "./prisma/schema.prisma",
  
  // Set your migration file path outputs
  migrations: {
    path: "./prisma/migrations",
  },
  
  // Define the transactional connection URL for migrations and CLI tasks
  datasource: {
    url: process.env.DATABASE_URL!,
  },
});
