const express = require('express');
const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const pool = require('../config/db');
const authMiddleware = require('../middleware/auth');

const router = express.Router();

// Helper function to generate API key
function generateApiKey() {
  return uuidv4().replace(/-/g, '') + uuidv4().replace(/-/g, '');
}

// Helper function to get session status from wa-gateway
async function getSessionStatus(sessionName) {
  try {
    const response = await axios.get(`${process.env.WA_GATEWAY_URL}/session`);
    const sessions = response.data;
    const session = sessions.find(s => s.sessionName === sessionName);
    return session ? session.status : 'offline';
  } catch (error) {
    console.error('Error fetching session status:', error.message);
    return 'offline';
  }
}

// Get all sessions
router.get('/', authMiddleware, async (req, res) => {
  try {
    const result = await pool.query(
      'SELECT * FROM sessions ORDER BY created_at DESC'
    );
    
    res.json({
      success: true,
      sessions: result.rows
    });
  } catch (error) {
    console.error('Get sessions error:', error);
    res.status(500).json({ error: 'Failed to fetch sessions' });
  }
});

// Get session by ID
router.get('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM sessions WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    res.json({
      success: true,
      session: result.rows[0]
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({ error: 'Failed to fetch session' });
  }
});

// Get session status (real-time from wa-gateway)
router.get('/:id/status', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT session_name FROM sessions WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const sessionName = result.rows[0].session_name;
    const status = await getSessionStatus(sessionName);
    
    res.json({
      success: true,
      status
    });
  } catch (error) {
    console.error('Get session status error:', error);
    res.status(500).json({ error: 'Failed to fetch session status' });
  }
});

// Get QR code for session
router.get('/:id/qr', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT session_name FROM sessions WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const sessionName = result.rows[0].session_name;
    
    // Get QR code from wa-gateway
    const response = await axios.get(
      `${process.env.WA_GATEWAY_URL}/session/start?session=${sessionName}`
    );
    
    res.json({
      success: true,
      qr: response.data.qr || null,
      status: response.data.status
    });
  } catch (error) {
    console.error('Get QR code error:', error);
    res.status(500).json({ error: 'Failed to fetch QR code' });
  }
});

// Create new session
router.post('/', authMiddleware, async (req, res) => {
  try {
    const { session_name } = req.body;
    
    if (!session_name) {
      return res.status(400).json({ error: 'Session name is required' });
    }
    
    // Check if session already exists
    const existingSession = await pool.query(
      'SELECT * FROM sessions WHERE session_name = $1',
      [session_name]
    );
    
    if (existingSession.rows.length > 0) {
      return res.status(400).json({ error: 'Session name already exists' });
    }
    
    // Generate API key
    const apiKey = generateApiKey();
    
    // Insert into database
    const result = await pool.query(
      'INSERT INTO sessions (session_name, api_key) VALUES ($1, $2) RETURNING *',
      [session_name, apiKey]
    );
    
    // Log activity
    await pool.query(
      'INSERT INTO session_logs (session_id, action, details) VALUES ($1, $2, $3)',
      [result.rows[0].id, 'CREATE', `Session ${session_name} created`]
    );
    
    // Start session on wa-gateway
    try {
      await axios.get(
        `${process.env.WA_GATEWAY_URL}/session/start?session=${session_name}`
      );
    } catch (error) {
      console.error('Failed to start session on wa-gateway:', error.message);
    }
    
    res.json({
      success: true,
      session: result.rows[0]
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({ error: 'Failed to create session' });
  }
});

// Update webhook configuration
router.put('/:id/webhook', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { webhook_url, webhook_events } = req.body;
    
    const result = await pool.query(
      'UPDATE sessions SET webhook_url = $1, webhook_events = $2, updated_at = CURRENT_TIMESTAMP WHERE id = $3 RETURNING *',
      [webhook_url, JSON.stringify(webhook_events), id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Log activity
    await pool.query(
      'INSERT INTO session_logs (session_id, action, details) VALUES ($1, $2, $3)',
      [id, 'UPDATE_WEBHOOK', `Webhook configuration updated`]
    );
    
    res.json({
      success: true,
      session: result.rows[0]
    });
  } catch (error) {
    console.error('Update webhook error:', error);
    res.status(500).json({ error: 'Failed to update webhook' });
  }
});

// Regenerate API key
router.post('/:id/regenerate-key', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const newApiKey = generateApiKey();
    
    const result = await pool.query(
      'UPDATE sessions SET api_key = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING *',
      [newApiKey, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    // Log activity
    await pool.query(
      'INSERT INTO session_logs (session_id, action, details) VALUES ($1, $2, $3)',
      [id, 'REGENERATE_KEY', `API key regenerated`]
    );
    
    res.json({
      success: true,
      api_key: newApiKey
    });
  } catch (error) {
    console.error('Regenerate key error:', error);
    res.status(500).json({ error: 'Failed to regenerate API key' });
  }
});

// Test send message
router.post('/:id/test-message', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    const { phone_number, message } = req.body;
    
    if (!phone_number || !message) {
      return res.status(400).json({ error: 'Phone number and message are required' });
    }
    
    const result = await pool.query(
      'SELECT session_name FROM sessions WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const sessionName = result.rows[0].session_name;
    
    // Send message via wa-gateway
    const response = await axios.post(
      `${process.env.WA_GATEWAY_URL}/message/send-text`,
      {
        session: sessionName,
        to: phone_number,
        text: message
      }
    );
    
    // Log activity
    await pool.query(
      'INSERT INTO session_logs (session_id, action, details) VALUES ($1, $2, $3)',
      [id, 'TEST_MESSAGE', `Test message sent to ${phone_number}`]
    );
    
    res.json({
      success: true,
      message: 'Message sent successfully',
      response: response.data
    });
  } catch (error) {
    console.error('Test message error:', error);
    res.status(500).json({ error: 'Failed to send test message' });
  }
});

// Delete session
router.delete('/:id', authMiddleware, async (req, res) => {
  try {
    const { id } = req.params;
    
    const session = await pool.query(
      'SELECT session_name FROM sessions WHERE id = $1',
      [id]
    );
    
    if (session.rows.length === 0) {
      return res.status(404).json({ error: 'Session not found' });
    }
    
    const sessionName = session.rows[0].session_name;
    
    // Delete from wa-gateway
    try {
      await axios.get(
        `${process.env.WA_GATEWAY_URL}/session/logout?session=${sessionName}`
      );
    } catch (error) {
      console.error('Failed to logout session on wa-gateway:', error.message);
    }
    
    // Delete from database
    await pool.query('DELETE FROM sessions WHERE id = $1', [id]);
    
    res.json({
      success: true,
      message: 'Session deleted successfully'
    });
  } catch (error) {
    console.error('Delete session error:', error);
    res.status(500).json({ error: 'Failed to delete session' });
  }
});

module.exports = router;
