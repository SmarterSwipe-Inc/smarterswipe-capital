/**
 * Seed script to create initial admin accounts.
 * Run once: node server/seed-admins.mjs
 *
 * This creates accounts for the three whitelisted admins with a default password.
 * Admins should change their password after first login.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import mysql from "mysql2/promise";

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error("DATABASE_URL is required");
  process.exit(1);
}

const admins = [
  { email: "jonah@smarterswipe.com", name: "Jonah" },
  { email: "eric@smarterswipe.com", name: "Eric" },
  { email: "billy@smarterswipe.com", name: "Billy" },
];

// Default password — each admin should change this after first login
const DEFAULT_PASSWORD = "SmarterSwipe2024!";

async function seed() {
  const connection = await mysql.createConnection(DATABASE_URL);
  const passwordHash = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  for (const admin of admins) {
    try {
      await connection.execute(
        `INSERT INTO admin_credentials (email, passwordHash, name, createdAt, updatedAt)
         VALUES (?, ?, ?, NOW(), NOW())
         ON DUPLICATE KEY UPDATE passwordHash = VALUES(passwordHash), name = VALUES(name)`,
        [admin.email, passwordHash, admin.name]
      );
      console.log(`✓ Seeded admin: ${admin.email}`);
    } catch (err) {
      console.error(`✗ Failed to seed ${admin.email}:`, err.message);
    }
  }

  await connection.end();
  console.log(`\nDefault password: ${DEFAULT_PASSWORD}`);
  console.log("Please change passwords after first login.");
  process.exit(0);
}

seed().catch(console.error);
