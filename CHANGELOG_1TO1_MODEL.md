# Changelog - 1:1 User-Session Model Implementation

## Overview
Implemented a 1:1 user-session model with per-user callback endpoints as requested in PR feedback.

## Breaking Changes

### Session Model
- **Before**: Users could create multiple sessions (e.g., `username_session1`, `username_session2`)
- **After**: Each user has exactly ONE session (stored in `session_name` field)

### Webhook System
- **Before**: Global `WEBHOOK_BASE_URL` for all webhooks
- **After**: Per-user callback URLs, each user configures their own endpoint

## New Features

### 1. 1:1 User-Session Relationship
- Each user has a dedicated session name (stored in database)
- Session name defaults to username if not configured
- Admin can customize session names per user

### 2. Per-User Callback URLs
- Each user can configure their own webhook endpoint
- Webhooks sent to: `{callback_url}/message` and `{callback_url}/session`
- Graceful handling when callback URL is not configured

### 3. Enhanced Admin Panel
- View session name and callback URL for each user
- Configure session and callback when creating users
- Update session configuration for existing users
- New table columns: "Session Name" and "Callback URL"

### 4. Simplified User Dashboard
- Shows single session status
- QR code generation for WhatsApp connection
- Callback URL configuration interface
- Real-time connection status
- Connect/Disconnect controls

## Database Changes

### Schema Updates
```sql
ALTER TABLE users ADD COLUMN session_name TEXT;
ALTER TABLE users ADD COLUMN callback_url TEXT;
```

### New Methods
- `updateUserSessionName(userId, sessionName)` - Update user's session name
- `updateUserCallbackUrl(userId, callbackUrl)` - Update user's callback URL
- `getUserBySessionName(sessionName)` - Get user by their session name

## API Changes

### New Endpoints

#### Admin Endpoints
```
PUT /admin/users/:id/session-config
Body: {
  "session_name": "string (optional)",
  "callback_url": "string | null (optional)"
}
```

#### Dashboard Endpoints
```
GET  /dashboard/session-info        - Get user's session status
POST /dashboard/start-session        - Start session and get QR code
POST /dashboard/disconnect-session   - Disconnect user's session
PUT  /dashboard/callback             - Update callback URL
```

### Modified Behavior

#### Session Endpoints
- `POST /session/start` - Now uses user's configured session_name
- `GET /session/start` - Now uses user's configured session_name
- `GET /session` - Returns single session for regular users

#### Message Endpoints
- All endpoints now validate against user's single session
- Error messages updated to show expected session name

## Migration Guide

### For Administrators

1. **Update User Sessions**
   ```bash
   # Configure session name for existing users
   curl -u admin:admin -X PUT http://localhost:5001/admin/users/2/session-config \
     -H "Content-Type: application/json" \
     -d '{"session_name": "user-whatsapp"}'
   ```

2. **Configure Callback URLs**
   ```bash
   # Set webhook endpoint for user
   curl -u admin:admin -X PUT http://localhost:5001/admin/users/2/session-config \
     -H "Content-Type: application/json" \
     -d '{"callback_url": "https://api.example.com/webhook"}'
   ```

### For Users

1. **Access Dashboard**
   - Navigate to `/dashboard`
   - Login with your credentials
   - View your single session status

2. **Configure Callback**
   - Enter your webhook URL in the callback configuration section
   - Click "Update Callback URL"
   - Webhooks will be sent to your endpoint

3. **Connect WhatsApp**
   - Click "Connect Session"
   - Scan QR code with WhatsApp app
   - Wait for "Connected" status

## Webhook Payload Examples

### Message Webhook
Sent to: `{callback_url}/message`
```json
{
  "session": "user-session-name",
  "from": "1234567890@s.whatsapp.net",
  "message": "Hello World",
  "media": {
    "image": null,
    "video": null,
    "document": null,
    "audio": null
  }
}
```

### Session Webhook
Sent to: `{callback_url}/session`
```json
{
  "session": "user-session-name",
  "status": "connected"
}
```

Status values: `connected`, `connecting`, `disconnected`

## Testing

### Test User Creation with Configuration
```bash
# Create user
curl -u admin:admin -X POST http://localhost:5001/admin/users \
  -H "Content-Type: application/json" \
  -d '{"username": "testuser", "password": "test123"}'

# Configure session
curl -u admin:admin -X PUT http://localhost:5001/admin/users/2/session-config \
  -H "Content-Type: application/json" \
  -d '{
    "session_name": "testuser-whatsapp",
    "callback_url": "https://webhook.site/unique-id"
  }'
```

### Test Session Management
```bash
# Get session info
curl -u testuser:test123 http://localhost:5001/dashboard/session-info

# Start session (returns QR code)
curl -u testuser:test123 -X POST http://localhost:5001/dashboard/start-session

# Disconnect session
curl -u testuser:test123 -X POST http://localhost:5001/dashboard/disconnect-session
```

### Test Callback Configuration
```bash
# Update callback URL
curl -u testuser:test123 -X PUT http://localhost:5001/dashboard/callback \
  -H "Content-Type: application/json" \
  -d '{"callback_url": "https://api.example.com/webhook"}'
```

## Files Modified

### Core Files
- `src/database/db.ts` - Database schema and methods
- `src/index.ts` - Webhook system rewrite
- `src/controllers/dashboard.ts` - Complete rewrite for 1:1 model
- `src/controllers/admin.ts` - Added session configuration
- `src/controllers/session.ts` - Updated for single session
- `src/controllers/message.ts` - Updated validation
- `src/controllers/profile.ts` - Updated validation

### View Files
- `src/views/admin.html` - Added session/callback columns
- `src/views/dashboard.html` - New simplified dashboard

## Known Limitations

1. **Existing Sessions**: Users with multiple existing sessions will need to disconnect extra sessions manually
2. **Session Migration**: Existing session names will need to be configured in the database
3. **Webhook Testing**: Callback URLs should be tested before production use

## Rollback Instructions

If you need to rollback to the previous multi-session model:

```bash
git revert 7b6e39d
npm install
npm run start
```

Note: This will lose session_name and callback_url configurations.

## Support

For issues or questions:
1. Check the database schema has session_name and callback_url columns
2. Verify callback URLs are valid and accessible
3. Check server logs for webhook delivery errors
4. Test with webhook.site for debugging

## Future Enhancements

Potential improvements for future versions:
- Session activity logs
- Webhook retry mechanism
- Webhook signature verification
- Multiple callback URLs per user
- Session backup/restore functionality
