# Headless Multi Session WhatsApp Gateway

A headless multi-session WhatsApp gateway with multi-device support, easy to set up using Docker.

- Multi-device support
- Multi-session / multiple phone numbers
- Send text messages, images, and documents
- Webhook integration

📌 Also see: [wa-multi-session](https://github.com/mimamch/wa-multi-session)

---

## ⚠️ Prerequisites

- Docker & Docker Compose installed
  👉 [Install Docker](https://docs.docker.com/get-docker/)

---

## Installation & Running

### 1. Create Application Folder

Create a new folder for your application at `~/app/wa-gateway` and navigate into it:

```bash
mkdir -p ~/app/wa-gateway
cd ~/app/wa-gateway
```

### 2. Create `docker-compose.yaml`

Use the `nano` editor to create the file:

```bash
nano docker-compose.yaml
```

Paste the following content into the editor to create `docker-compose.yaml`

```yaml
# docker-compose.yaml
services:
  wa-gateway:
    container_name: "wa-gateway"
    image: mimamch/wa-gateway:latest
    volumes:
      - ./wa_credentials:/app/wa_credentials
    ports:
      - "5001:5001"
    environment:
      - KEY= # make your own api key (optional)
```

### 3. Start the container

Run the following command in the same directory as your `docker-compose.yaml`:

```bash
docker compose up -d
```

### 4. Open Browser & Scan QR Code

Visit this URL to scan the QR code from your WhatsApp device:

```
http://localhost:5001/session/start?session=mysession
```

> Replace `localhost` with your server's IP or domain if not running locally.

> Replace `mysession` with your desired session name.

### 5. Send Your First Message

Example to send a text message:

```
http://localhost:5001/message/send-text?session=mysession&to=628123456789&text=Hello
```



---

## API Reference

All API endpoints remain the same as the NodeJS version. Here's a quick reference:

### Create New Session

```bash
GET /session/start?session=NEW_SESSION_NAME
```

or

```bash
POST /session/start
{
  "session": "NEW_SESSION_NAME"
}
```

### Send Text Message

```bash
POST /message/send-text
```

Body fields:

| Field    | Type    | Required | Description                             |
| -------- | ------- | -------- | --------------------------------------- |
| session  | string  | Yes      | The session name you created            |
| to       | string  | Yes      | Target phone number (e.g. 628123456789) |
| text     | string  | Yes      | The text message                        |
| is_group | boolean | No       | True if target is a group               |

### Send Image

```bash
POST /message/send-image
```

Body includes all of the above plus `image_url`.

### Send Document

```bash
POST /message/send-document
```

Body includes:

- `document_url`
- `document_name`

### Delete Session

```bash
GET /session/logout?session=SESSION_NAME
```

---

## Webhook Setup

To receive real-time events, set your webhook URL using the environment variable:

```env
WEBHOOK_BASE_URL="http://yourdomain.com/webhook"
```

Example webhook endpoints:

- Session: `POST /webhook/session`
- Message: `POST /webhook/message`

---

## Access Media Files

Media files are stored inside the `./media` directory in the container. You can access them via:

```
http://localhost:5001/media/FILE_NAME
```

---


## Upgrading

To update to the latest version:

```bash
cd ~/app/wa-gateway
docker compose pull
docker compose down
docker compose up -d
```

## Documentation

For full documentation, examples, and guides, visit:
👉 [https://github.com/mimamch/wa-gateway](https://github.com/mimamch/wa-gateway)

---

Let me know if you need configuration examples with environment variables (like webhook setup) or a multi-service deployment!
