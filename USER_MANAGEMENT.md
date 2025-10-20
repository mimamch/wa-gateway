# User Management System

This WhatsApp Gateway now includes a complete user management system with authentication and session isolation.

## Features

- **Multi-user Support**: Multiple users can use the gateway with their own sessions
- **Basic Authentication**: All endpoints require HTTP Basic Authentication
- **SQLite Database**: User credentials stored securely with bcrypt hashing
- **Admin Panel**: Web UI for managing users
- **User Dashboard**: Web UI for users to manage their sessions and generate QR codes
- **Session Isolation**: Users can only access their own sessions (prefixed with username)

## Environment Variables

Add these to your `.env` file:

```env
ADMIN_USER=admin
ADMIN_PASSWORD=admin
```

The admin user will be automatically created on first startup with these credentials.

## Getting Started

### 1. Install Dependencies

```bash
npm install
```

### 2. Configure Environment

Create a `.env` file with your admin credentials:

```env
PORT=5001
ADMIN_USER=admin
ADMIN_PASSWORD=your_secure_password
```

### 3. Start the Server

```bash
npm run start
```

### 4. Access the Gateway

- **Welcome Page**: http://localhost:5001/
- **User Dashboard**: http://localhost:5001/dashboard
- **Admin Panel**: http://localhost:5001/admin

## Usage

### Admin Panel

The admin can:
- Create new users
- Delete users
- Change user passwords
- View all users

Access: http://localhost:5001/admin (requires admin credentials)

### User Dashboard

Regular users can:
- Create new WhatsApp sessions
- Generate QR codes for authentication
- View their active sessions
- Disconnect sessions

Access: http://localhost:5001/dashboard (requires user credentials)

### API Usage

All API endpoints now require HTTP Basic Authentication.

#### Example: Create a Session

```bash
curl -u username:password -X POST http://localhost:5001/session/start \
  -H "Content-Type: application/json" \
  -d '{"session": "mysession"}'
```

For regular users, the session name will be automatically prefixed with their username (e.g., `username_mysession`).

#### Example: Send a Message

```bash
curl -u username:password -X POST http://localhost:5001/message/send-text \
  -H "Content-Type: application/json" \
  -d '{
    "session": "username_mysession",
    "to": "628123456789",
    "text": "Hello World"
  }'
```

## Session Naming

- **Admin users**: Can create sessions with any name
- **Regular users**: Session names are automatically prefixed with `username_`
  - If user `john` creates session `main`, it becomes `john_main`
  - This ensures session isolation between users

## Admin API Endpoints

### Create User
```
POST /admin/users
Authorization: Basic admin:password
Content-Type: application/json

{
  "username": "newuser",
  "password": "securepass"
}
```

### List Users
```
GET /admin/users
Authorization: Basic admin:password
```

### Update User Password
```
PUT /admin/users/:id/password
Authorization: Basic admin:password
Content-Type: application/json

{
  "password": "newpassword"
}
```

### Delete User
```
DELETE /admin/users/:id
Authorization: Basic admin:password
```

## Security Notes

- All passwords are hashed using bcrypt before storage
- The admin user cannot be deleted through the API
- The admin password can only be changed via environment variables
- Regular users can only access their own sessions
- Session isolation is enforced at the API level

## Database

The system uses SQLite with the database file `wa_gateway.db` stored in the project root. The database contains:

- **users table**: Stores user credentials and admin status

The database is automatically created on first startup.
