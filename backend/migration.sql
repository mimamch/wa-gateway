-- WhatsApp Gateway Dashboard - Database Migration
-- Database: wa_gateway
-- Run this script in DbGate, pgAdmin, or psql

-- Create config table (admin users)
CREATE TABLE IF NOT EXISTS config (
  id SERIAL PRIMARY KEY,
  username VARCHAR(255) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create sessions table
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  session_name VARCHAR(255) UNIQUE NOT NULL,
  api_key VARCHAR(255) UNIQUE NOT NULL,
  webhook_url TEXT,
  webhook_events JSONB DEFAULT '{
    "individual": false,
    "group": false,
    "from_me": false,
    "update_status": false,
    "image": false,
    "video": false,
    "audio": false,
    "sticker": false,
    "document": false
  }'::jsonb,
  profile_name VARCHAR(255),
  wa_number VARCHAR(50),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create session_logs table
CREATE TABLE IF NOT EXISTS session_logs (
  id SERIAL PRIMARY KEY,
  session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
  action VARCHAR(100) NOT NULL,
  details TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insert default admin user
-- Password: admin123 (hashed with bcrypt)
INSERT INTO config (username, password)
VALUES ('admin', '$2a$10$YourBcryptHashHere')
ON CONFLICT (username) DO NOTHING;

-- NOTE: Run the Node.js migration script to generate proper bcrypt hash:
-- cd /app/backend && node config/migrate.js
-- Or manually hash password and update this SQL
