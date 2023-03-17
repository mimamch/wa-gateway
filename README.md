# Multi Session Whatsapp Gateway NodeJS

A multi session Whatsapp gateway with NodeJS

- Support multi device
- Support multi session / multi phone number
- Anti delay message

[VIEW DEMO](http://54.254.34.10/)

Based on [Baileys Typescript/Javascript WhatsApp Web API](https://github.com/adiwajshing/Baileys)

## Environment Variables

To run this project, you will need to add the following environment variables to your .env file

`PORT` // which port to running on your machine

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

## API Reference

#### Add new session

```
  GET /start-session?session=NEW_SESSION_NAME&scan=true
```

| Parameter | Type      | Description                            |
| :-------- | :-------- | :------------------------------------- |
| `session` | `string`  | **Required**. Create Your Session Name |
| `scan`    | `boolean` | **Optional**. Print QR at Browser      |

#### Send Text Message

```
  POST /send-message
```

| Body      | Type     | Description                                 |
| :-------- | :------- | :------------------------------------------ |
| `session` | `string` | **Required**. Session Name You Have Created |
| `to`      | `string` | **Required**. Receiver Phone Number         |
| `text`    | `string` | **Required**. Text Message                  |

#### Send Bulk Message

```
  POST /send-bulk-message
```

| Body      | Type     | Description                                                       |
| :-------- | :------- | :---------------------------------------------------------------- |
| `session` | `string` | **Required**. Session Name You Have Created                       |
| `data`    | `array`  | **Required**. Array Of Object Message Data                        |
| `delay`   | `number` | **Optional**. Delay Per-message in Miliseconds, Default to 5000ms |

#### Delete session

```
  GET /delete-session?session=SESSION_NAME
```

| Parameter | Type     | Description                            |
| :-------- | :------- | :------------------------------------- |
| `session` | `string` | **Required**. Create Your Session Name |
