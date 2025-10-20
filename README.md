# Headless Multi Session Whatsapp Gateway NodeJS

Easy Setup Headless multi session Whatsapp Gateway with NodeJS

## 🆕 New Features

- **Multi-user Support**: Multiple users with individual authentication
- **User Management**: Admin panel for creating and managing users
- **Session Isolation**: Each user has their own isolated sessions
- **SQLite Database**: Secure credential storage with bcrypt hashing
- **Web Dashboard**: User-friendly UI for session management and QR code generation

## Core Features

- Support Multi device
- Support Multi Session / Multi Phone Number
- Send Text Message
- Send Image
- Send Document

#### Read also [wa-multi-session](https://github.com/mimamch/wa-multi-session)

### ⚠️ This application need to running in NodeJS v18 or later. ⚠️

#### Please Read [How to install NodeJS](https://nodejs.org/en/download/package-manager)

## Install and Running

#### 1. Clone the project

```bash
  git clone https://github.com/mimamch/wa_gateway.git
```

#### 2. Go to the project directory

```bash
  cd wa_gateway
```

#### 3. Install dependencies

```bash
  npm install
```

#### 4. Configure Environment (Optional)

Create a `.env` file to set admin credentials:

```env
PORT=5001
ADMIN_USER=admin
ADMIN_PASSWORD=your_secure_password
```

Default credentials are `admin`/`admin` if not configured.

#### 5. Start the server

```bash
  npm run start
```

#### 6. Access the Application

```
http://localhost:5001/
```

You'll be greeted with a welcome page with links to:
- **Dashboard**: Manage your sessions and generate QR codes
- **Admin Panel**: Create and manage users (admin only)

#### 7. Using the Dashboard

Login with your credentials and create a new session. The system will:
1. Generate a QR code
2. Display it in the browser
3. Wait for you to scan it with WhatsApp
4. Automatically connect once scanned

## 🔐 Authentication

All endpoints now require HTTP Basic Authentication. See [USER_MANAGEMENT.md](./USER_MANAGEMENT.md) for detailed documentation.

### Quick Start with Authentication

```bash
# Create a session (as admin)
curl -u admin:admin -X POST http://localhost:5001/session/start \
  -H "Content-Type: application/json" \
  -d '{"session": "mysession"}'

# Send a message
curl -u admin:admin -X POST http://localhost:5001/message/send-text \
  -H "Content-Type: application/json" \
  -d '{
    "session": "mysession",
    "to": "628123456789",
    "text": "Hello World"
  }'
```

## API Reference

**Note**: All API endpoints require HTTP Basic Authentication.

#### Authentication

All requests must include HTTP Basic Auth credentials:

```bash
curl -u username:password http://localhost:5001/endpoint
```

Or using Authorization header:

```bash
curl -H "Authorization: Basic base64(username:password)" http://localhost:5001/endpoint
```

#### Add new session

```
  GET /session/start?session=NEW_SESSION_NAME
  or
  POST /session/start
```

| Parameter | Type     | Description                            |
| :-------- | :------- | :------------------------------------- |
| `session` | `string` | **Required**. Create Your Session Name |

#### Send Text Message

```
  POST /message/send-text
```

| Body       | Type      | Description                                                              |
| :--------- | :-------- | :----------------------------------------------------------------------- |
| `session`  | `string`  | **Required**. Session Name You Have Created                              |
| `to`       | `string`  | **Required**. Receiver Phone Number with Country Code (e.g: 62812345678) |
| `text`     | `string`  | **Required**. Text Message                                               |
| `is_group` | `boolean` | **Optional**. True if "to" field is group ids                            |

#### Send Image

```
  POST /message/send-image
```

| Body        | Type      | Description                                                              |
| :---------- | :-------- | :----------------------------------------------------------------------- |
| `session`   | `string`  | **Required**. Session Name You Have Created                              |
| `to`        | `string`  | **Required**. Receiver Phone Number with Country Code (e.g: 62812345678) |
| `text`      | `string`  | **Required**. Caption Massage                                            |
| `image_url` | `string`  | **Required**. URL Image                                                  |
| `is_group`  | `boolean` | **Optional**. True if "to" field is group ids                            |

#### Send Document

```
  POST /message/send-document
```

| Body            | Type      | Description                                                              |
| :-------------- | :-------- | :----------------------------------------------------------------------- |
| `session`       | `string`  | **Required**. Session Name You Have Created                              |
| `to`            | `string`  | **Required**. Receiver Phone Number with Country Code (e.g: 62812345678) |
| `text`          | `string`  | **Required**. Caption Massage                                            |
| `document_url`  | `string`  | **Required**. Document URL                                               |
| `document_name` | `string`  | **Required**. Document Name                                              |
| `is_group`      | `boolean` | **Optional**. True if "to" field is group ids                            |

#### Delete session

```
  GET /session/logout?session=SESSION_NAME
```

| Parameter | Type     | Description                            |
| :-------- | :------- | :------------------------------------- |
| `session` | `string` | **Required**. Create Your Session Name |

#### Get All Session ID

```
  GET /session
```

## Examples

### Using Axios

```js
// Configure axios with authentication
const axios = require('axios');

const api = axios.create({
  baseURL: 'http://localhost:5001',
  auth: {
    username: 'yourusername',
    password: 'yourpassword'
  }
});

// send text
api.post("/message/send-text", {
  session: "yourusername_mysession",  // Note: prefixed with username for regular users
  to: "62812345678",
  text: "hello world",
});

// send image
api.post("/message/send-image", {
  session: "yourusername_mysession",
  to: "62812345678",
  text: "hello world",
  image_url: "https://placehold.co/600x400",
});
```

## Webhook Guide

Set your webhook URL in the environment variable `WEBHOOK_BASE_URL` or in the `.env` file.
The request method will be `POST` and the body will be in JSON format.

```
WEBHOOK_BASE_URL="http://yourdomain.com/webhook"
```

### 🪝 Session Webhook

Request path:

```
POST http://yourdomain.com/webhook/session
```

Example body:

```js
{
  "session": "mysession",
  "status": "connected" //  "disconnected" | "connecting"
}
```

### 🪝 Message Webhook

Request path:

```
POST http://yourdomain.com/webhook/message
```

Example body:

```js
{
  "session": "mysession",
  "from": "xxx@s.whatsapp.net",
  "message": "Hello World",
  "media": {
    "image": "3A5089C2F2652D46EBC5.jpg",
    "video": null,
    "document": null,
    "audio": null
  }
}
```

You can get the media file by using the `media` object in the webhook message. The media file will be saved in the `./media` directory with the name specified in the `media` object.
You can access media files using the following URL format:

```
http://localhost:5001/media/3A5089C2F2652D46EBC5.jpg
```

## Upgrading

```
npm install wa-multi-session@latest
```

## Documentation

For detailed documentation, including guides and API references, please visit the [official documentation](https://github.com/mimamch/wa-gateway).

## Contributing

Contributions are welcome! Please follow the guidelines outlined in the [CONTRIBUTING.md](https://github.com/mimamch/wa-gateway/blob/main/CONTRIBUTING.md) file.

## License

This library is licensed under the [MIT License](https://github.com/mimamch/wa-gateway/blob/main/LICENSE).
