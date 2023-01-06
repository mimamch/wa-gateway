
## API Reference

#### Add new session

```http
  GET /start-session?session=NEW_SESSION_NAME&scan=true
```

| Parameter | Type      | Description                        |
| :-------- | :-------  | :-------------------------         |
| `session` | `string`  | **Required**. Create Your Session Name    |
| `scan`    | `boolean` | **Optional**. Print QR at Browser  |

#### Send Text Message

```http
  POST /send-message
```

| Body | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `session`      | `string` | **Required**. Session Name You Have Created |
| `to`      | `string` | **Required**. Receiver Phone Number |
| `text`      | `string` | **Required**. Text Message |


#### Send Bulk Message

```http
  POST /send-bulk-message
```

| Body | Type     | Description                       |
| :-------- | :------- | :-------------------------------- |
| `session`      | `string` | **Required**. Session Name You Have Created |
| `data`      | `array` | **Required**. Array Of Object Message Data |
| `delay`      | `number` | **Optional**. Delay Per-message in Miliseconds, Default to 5000ms |


#### Delete session

```http
  GET /delete-session?session=SESSION_NAME
```

| Parameter | Type      | Description                        |
| :-------- | :-------  | :-------------------------         |
| `session` | `string`  | **Required**. Create Your Session Name    |
