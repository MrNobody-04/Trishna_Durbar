const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const mode = (process.argv[2] || "sqlite").toLowerCase();

const root = path.resolve(__dirname, "..");
const schemaPath = path.join(root, "prisma", "schema.prisma");
const postgresSchema = path.join(root, "prisma", "schema.postgresql.prisma");
const sqliteSchema = path.join(root, "prisma", "schema.sqlite.prisma");
const envPath = path.join(root, ".env");

if (mode === "sqlite") {
  console.log("--> Switching Prisma schema to SQLite (Local Development)...");
  if (fs.existsSync(sqliteSchema)) {
    fs.copyFileSync(sqliteSchema, schemaPath);
  }
  let envContent = `DATABASE_URL="file:./dev.db"\nAUTH_SECRET="trishna-durbar-regal-jwt-secret-key-32-chars-safe"\nNEXT_PUBLIC_APP_URL="http://localhost:3000"\n`;
  if (!fs.existsSync(envPath) || fs.readFileSync(envPath, "utf-8").includes("file:./dev.db")) {
    fs.writeFileSync(envPath, envContent);
  }

  console.log("Generating Prisma client for SQLite...");
  execSync("npx prisma generate", { stdio: "inherit", cwd: root });
  console.log("Pushing schema to dev.db...");
  execSync("npx prisma db push", { stdio: "inherit", cwd: root });
  console.log("Seeding database...");
  execSync("npx tsx prisma/seed.ts", { stdio: "inherit", cwd: root });
  console.log("Done! Local SQLite database is configured and ready.");
} else if (mode === "postgres" || mode === "postgresql" || mode === "supabase") {
  console.log("--> Switching Prisma schema to PostgreSQL (Supabase / Production)...");
  if (fs.existsSync(postgresSchema)) {
    fs.copyFileSync(postgresSchema, schemaPath);
  } else {
    console.error("Error: prisma/schema.postgresql.prisma not found.");
    process.exit(1);
  }

  console.log("Generating Prisma client for PostgreSQL...");
  execSync("npx prisma generate", { stdio: "inherit", cwd: root });
  console.log("Prisma client regenerated for PostgreSQL!");
  console.log("\nNext steps for Supabase:");
  console.log("1. Ensure your .env has valid DATABASE_URL and DIRECT_URL from Supabase.");
  console.log("2. Run 'npm run prisma:push' to sync tables to Supabase.");
  console.log("3. Run 'npm run prisma:seed' to seed initial data.");
} else {
  console.error("Unknown mode:", mode, "- use 'sqlite' or 'postgres'");
  process.exit(1);
}
