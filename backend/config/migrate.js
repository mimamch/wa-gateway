const pool = require('./db');
const bcrypt = require('bcryptjs');

async function migrate() {
  const client = await pool.connect();
  
  try {
    console.log('🔄 Starting database migration...');
    
    // Create config table
    await client.query(`
      CREATE TABLE IF NOT EXISTS config (
        id SERIAL PRIMARY KEY,
        username VARCHAR(255) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table "config" created');
    
    // Create sessions table
    await client.query(`
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
      )
    `);
    console.log('✅ Table "sessions" created');
    
    // Create session_logs table
    await client.query(`
      CREATE TABLE IF NOT EXISTS session_logs (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES sessions(id) ON DELETE CASCADE,
        action VARCHAR(100) NOT NULL,
        details TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('✅ Table "session_logs" created');
    
    // Insert default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);
    await client.query(`
      INSERT INTO config (username, password)
      VALUES ($1, $2)
      ON CONFLICT (username) DO NOTHING
    `, ['admin', hashedPassword]);
    console.log('✅ Default admin user created (username: admin, password: admin123)');
    
    console.log('✅ Migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration error:', error);
    throw error;
  } finally {
    client.release();
  }
}

if (require.main === module) {
  migrate()
    .then(() => process.exit(0))
    .catch(() => process.exit(1));
}

module.exports = migrate;
