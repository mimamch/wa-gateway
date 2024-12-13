# Headless Multi Session Whatsapp Gateway With API Key & Docker Support

Easy Setup Headless multi session Whatsapp Gateway with NodeJS

- Support Multi device
- Support Multi Session / Multi Phone Number
- Requires API Key for every request
- Docker enabled
- Send Text Message
- Send Image
- Send Document


## Install and Running

##### 1. Clone the project

```bash
  git clone https://github.com/mimamch/wa_gateway.git
```

##### 2. Go to the project directory

```bash
  cd wa_gateway
```

Edit `./src/env.ts` and change `your-api-key-here` to your desired API Key

##### 3. Start the docker container

```bash
docker compose up -d
```

##### 4. Open your Browser & Start Scan QR

```
http://localhost:5001/session/start?session=mysession&key=your-api-key-here
```

Note that `mysession` in the example above is your session name, you can change it to anything you want and start as many sessions as you want using different session names.

##### 6. Sending message

call the api endpoint like this
```
http://localhost:5001/message/send-text?session=mysession&key=your-api-key-here&to=628123456789&text=Hello+there
```

### API Reference

##### Add new session

```
  GET /session/start?session=NEW_SESSION_NAME&key=your-api-key-here
  or
  POST /session/start
```


| Parameter | Type     | Description                            |
| :---------- | :--------- | :--------------------------------------- |
| `session` | `string` | **Required**. Create Your Session Name |
| `key`     | `string` | **Required**. Your API Key             |

##### Send Text Message

```
  POST /message/send-text
```


| Body      | Type     | Description                                                              |
| :---------- | :--------- | :------------------------------------------------------------------------- |
| `session` | `string` | **Required**. Session Name You Have Created                              |
| `to`      | `string` | **Required**. Receiver Phone Number with Country Code (e.g: 62812345678) |
| `text`    | `string` | **Required**. Text Message                                               |
| `key`     | `string` | **Required**. Your API Key                                               |

#### Send Image

```
  POST /message/send-image
```


| Body        | Type     | Description                                                              |
| :------------ | :--------- | :------------------------------------------------------------------------- |
| `session`   | `string` | **Required**. Session Name You Have Created                              |
| `to`        | `string` | **Required**. Receiver Phone Number with Country Code (e.g: 62812345678) |
| `text`      | `string` | **Required**. Caption Massage                                            |
| `image_url` | `string` | **Required**. URL Image                                                  |
| `key`       | `string` | **Required**. Your API Key                                               |

#### Send Document

```
  POST /message/send-document
```


| Body            | Type     | Description                                                              |
| :---------------- | :--------- | :------------------------------------------------------------------------- |
| `session`       | `string` | **Required**. Session Name You Have Created                              |
| `to`            | `string` | **Required**. Receiver Phone Number with Country Code (e.g: 62812345678) |
| `text`          | `string` | **Required**. Caption Massage                                            |
| `document_url`  | `string` | **Required**. Document URL                                               |
| `document_name` | `string` | **Required**. Document Name                                              |
| `key`           | `string` | **Required**. Your API Key                                               |

#### Delete session

```
  GET /session/logout?session=SESSION_NAME
```


| Parameter | Type     | Description                            |
| :---------- | :--------- | :--------------------------------------- |
| `session` | `string` | **Required**. Create Your Session Name |
| `key`     | `string` | **Required**. Your API Key             |

#### Get All Session ID

```
  GET /session?key=YOUR_API_KEY
```

## Examples

### Using Axios

```js
// send text
axios.post("http://localhost:5001/message/send-text", {
  session: "mysession",
  to: "62812345678",
  text: "hello world",
  key: "your-api-key-here",
});

// send image
axios.post("http://localhost:5001/message/send-image", {
  session: "mysession",
  to: "62812345678",
  text: "hello world",
  image_url: "https://placehold.co/600x400",
  key: "your-api-key-here",
});
```

## License

This library is licensed under the [MIT License](https://github.com/mimamch/wa-gateway/blob/main/LICENSE).
