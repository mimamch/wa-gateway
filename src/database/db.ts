import Database from "better-sqlite3";
import path from "path";
import bcrypt from "bcrypt";
import { env } from "../env";

const dbPath = path.join(process.cwd(), "wa_gateway.db");
const db = new Database(dbPath);

// Create tables
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    is_admin INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Initialize admin user if not exists
const initAdmin = () => {
  const adminUser = db
    .prepare("SELECT * FROM users WHERE username = ?")
    .get(env.ADMIN_USER);

  if (!adminUser) {
    const hashedPassword = bcrypt.hashSync(env.ADMIN_PASSWORD, 10);
    db.prepare(
      "INSERT INTO users (username, password, is_admin) VALUES (?, ?, 1)"
    ).run(env.ADMIN_USER, hashedPassword);
    console.log("Admin user created");
  }
};

initAdmin();

export interface User {
  id: number;
  username: string;
  password: string;
  is_admin: number;
  created_at: string;
}

export const userDb = {
  // Get user by username
  getUserByUsername(username: string): User | undefined {
    return db
      .prepare("SELECT * FROM users WHERE username = ?")
      .get(username) as User | undefined;
  },

  // Get user by id
  getUserById(id: number): User | undefined {
    return db.prepare("SELECT * FROM users WHERE id = ?").get(id) as
      | User
      | undefined;
  },

  // Get all users
  getAllUsers(): User[] {
    return db.prepare("SELECT * FROM users").all() as User[];
  },

  // Create a new user
  createUser(username: string, password: string): User {
    const hashedPassword = bcrypt.hashSync(password, 10);
    const result = db
      .prepare("INSERT INTO users (username, password) VALUES (?, ?)")
      .run(username, hashedPassword);

    return this.getUserById(result.lastInsertRowid as number)!;
  },

  // Update user password
  updateUserPassword(userId: number, newPassword: string): void {
    const hashedPassword = bcrypt.hashSync(newPassword, 10);
    db.prepare("UPDATE users SET password = ? WHERE id = ?").run(
      hashedPassword,
      userId
    );
  },

  // Delete user
  deleteUser(userId: number): void {
    db.prepare("DELETE FROM users WHERE id = ?").run(userId);
  },

  // Verify password
  verifyPassword(password: string, hashedPassword: string): boolean {
    return bcrypt.compareSync(password, hashedPassword);
  },
};

export default db;
