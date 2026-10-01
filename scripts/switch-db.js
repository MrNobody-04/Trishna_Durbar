const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

const mode = process.argv[2] || "sqlite";

const root = path.resolve(__dirname, "..");
const schemaPath = path.join(root, "prisma", "schema.prisma");
const postgresSchema = path.join(root, "prisma", "schema.postgresql.prisma");
const sqliteSchema = path.join(root, "prisma", "schema.sqlite.prisma");
const envPath = path.join(root, ".env");

if (mode === "sqlite") {
  console.log("Setting up SQLite local zero-config database...");
  if (fs.existsSync(sqliteSchema)) {
    fs.copyFileSync(sqliteSchema, schemaPath);
  }
  let envContent = `DATABASE_URL="file:./dev.db"\nAUTH_SECRET="trishna-durbar-regal-jwt-secret-key-32-chars-safe"\nNEXT_PUBLIC_APP_URL="http://localhost:3000"\n`;
  fs.writeFileSync(envPath, envContent);

  console.log("Generating Prisma client for SQLite...");
  execSync("npx prisma generate", { stdio: "inherit", cwd: root });
  console.log("Pushing schema to dev.db...");
  execSync("npx prisma db push", { stdio: "inherit", cwd: root });
  console.log("Seeding database with 9 tables, owner/manager accounts and full menu...");
  execSync("npx tsx prisma/seed.ts", { stdio: "inherit", cwd: root });
  console.log("Done! Local Trishna Durbar database is ready.");
} else {
  console.error("Unknown mode:", mode, "- currently 'sqlite' is default");
}
