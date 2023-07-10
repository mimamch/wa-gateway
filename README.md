# Headless Multi Session Whatsapp Gateway NodeJS

Easy Setup Headless multi session Whatsapp Gateway with NodeJS

- Support multi device
- Support multi session / multi phone number
- Anti delay message
- Bulk Message

#### Based on [wa-multi-session](https://github.com/mimamch/wa-multi-session)

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

```
// .env

PORT=5001 // which port to running on your machine
KEY=mysupersecretkey # For Securing Some Data
```

## Install and Running

Clone the project

```bash
  git clone https://github.com/mimamch/wa_gateway.git
```

Go to the project directory

```bash
  cd wa_gateway
```

Install dependencies

```bash
  npm install
```

Start the server

```bash
  npm run start
```

Open On Browser & Start New Session

```bash
  http://localhost:5000/start-session?session=mysession&scan=true
```

## API Reference

#### Add new session

```
  GET /start-session?session=NEW_SESSION_NAME&scan=true
```

| Parameter | Type      | Description                            |
| :-------- | :-------- | :------------------------------------- |
| `session` | `string`  | **Required**. Create Your Session Name |
| `scan`    | `boolean` | Print QR at Browser                    |

#### Send Text Message

```
  POST /send-message
```

| Body      | Type     | Description                                                              |
| :-------- | :------- | :----------------------------------------------------------------------- |
| `session` | `string` | **Required**. Session Name You Have Created                              |
| `to`      | `string` | **Required**. Receiver Phone Number with Country Code (e.g: 62812345678) |
| `text`    | `string` | **Required**. Text Message                                               |

#### Send Bulk Message

```
  POST /send-bulk-message
```

| Body      | Type     | Description                                         |
| :-------- | :------- | :-------------------------------------------------- |
| `session` | `string` | **Required**. Session Name You Have Created         |
| `data`    | `array`  | **Required**. Array Of Object Message Data          |
| `delay`   | `number` | Delay Per-message in Miliseconds, Default to 5000ms |

#### Delete session

```
  GET /delete-session?session=SESSION_NAME
```

| Parameter | Type     | Description                            |
| :-------- | :------- | :------------------------------------- |
| `session` | `string` | **Required**. Create Your Session Name |

#### Get All Session ID

```
  GET /sessions?key=mysupersecretkey
```

| Parameter | Type     | Description                      |
| :-------- | :------- | :------------------------------- |
| `key`     | `string` | **Required**. Key on ".env" file |

## Changelog

V3.2.0

- Add Get All Session ID
- Add Key for secret data
- Update README.md

## Documentation

For detailed documentation, including guides and API references, please visit the [official documentation](https://github.com/mimamch/wa-gateway).

## Contributing

Contributions are welcome! Please follow the guidelines outlined in the [CONTRIBUTING.md](https://github.com/mimamch/wa-gateway/blob/main/CONTRIBUTING.md) file.

## License

This library is licensed under the [MIT License](https://github.com/mimamch/wa-gateway/blob/main/LICENSE).
