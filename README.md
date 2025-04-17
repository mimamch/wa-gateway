# Headless Multi Session Whatsapp Gateway NodeJS

Easy Setup Headless multi session Whatsapp Gateway with NodeJS

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

#### 4. Start the server

```bash
  npm run start
```

#### 5. Open On Browser & Start Scan QR

```
http://localhost:5001/session/start?session=mysession
```

#### 6. Sending first message

```
http://localhost:5001/message/send-text?session=mysession&to=628123456789&text=Hello
```

## API Reference

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

| Body      | Type     | Description                                                              |
| :-------- | :------- | :----------------------------------------------------------------------- |
| `session` | `string` | **Required**. Session Name You Have Created                              |
| `to`      | `string` | **Required**. Receiver Phone Number with Country Code (e.g: 62812345678) |
| `text`    | `string` | **Required**. Text Message                                               |

#### Send Image

```
  POST /message/send-image
```

| Body        | Type     | Description                                                              |
| :---------- | :------- | :----------------------------------------------------------------------- |
| `session`   | `string` | **Required**. Session Name You Have Created                              |
| `to`        | `string` | **Required**. Receiver Phone Number with Country Code (e.g: 62812345678) |
| `text`      | `string` | **Required**. Caption Massage                                            |
| `image_url` | `string` | **Required**. URL Image                                                  |

#### Send Document

```
  POST /message/send-document
```

| Body            | Type     | Description                                                              |
| :-------------- | :------- | :----------------------------------------------------------------------- |
| `session`       | `string` | **Required**. Session Name You Have Created                              |
| `to`            | `string` | **Required**. Receiver Phone Number with Country Code (e.g: 62812345678) |
| `text`          | `string` | **Required**. Caption Massage                                            |
| `document_url`  | `string` | **Required**. Document URL                                               |
| `document_name` | `string` | **Required**. Document Name                                              |

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
// send text
axios.post("http://localhost:5001/message/send-text", {
  session: "mysession",
  to: "62812345678",
  text: "hello world",
});

// send image
axios.post("http://localhost:5001/message/send-image", {
  session: "mysession",
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

```json
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

```json
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
