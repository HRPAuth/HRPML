# Shell API Documentation

## Overview

The Shell API is an HTTP endpoint that allows execution of shell commands and file operations on the system. It's built into the Electron application using Node.js `child_process` and `fs` modules.

## Base URL

```
http://localhost:34501/
```

## Endpoints

### Execute Command

Executes a shell command and returns the result.

- **URL**: `/api/execute`
- **Method**: `POST`
- **Content-Type**: `application/json`

#### Request Body

```json
{
  "command": "string"
}
```

| Field    | Type   | Required | Description                |
|----------|--------|----------|----------------------------|
| command  | string | Yes      | The shell command to execute |

#### Response

```json
{
  "success": boolean,
  "stdout": "string",
  "stderr": "string",
  "error": "string | null"
}
```

| Field   | Type   | Description                                      |
|---------|--------|--------------------------------------------------|
| success | boolean| `true` if exit code is 0 and no error occurred  |
| stdout  | string | Standard output from the executed command       |
| stderr  | string | Standard error output from the executed command |
| error   | string | Error message if an error occurred, otherwise `null` |

#### Status Codes

- `200`: Command executed successfully (may still have non-zero exit code)
- `400`: Invalid JSON body provided

---

### JSON File Stream API (JFS)

Manages JSON files with create, read, modify, and delete operations.

- **URL**: `/api/jfs/`
- **Methods**: `GET`, `POST`, `PATCH`, `DELETE`
- **Content-Type**: `application/json` (for POST and PATCH)

#### GET - Read JSON File

Retrieves the contents of a JSON file.

- **Method**: `GET`
- **URL**: `/api/jfs/?file=/path/to/file.json`

##### Response

```json
{
  "success": boolean,
  "data": object | array,
  "path": "string"
}
```

| Field   | Type         | Description                           |
|---------|--------------|---------------------------------------|
| success | boolean      | `true` if file was read successfully |
| data    | object/array | The parsed JSON content               |
| path    | string       | The file path that was read           |

##### Status Codes

- `200`: File read successfully
- `400`: File path not provided
- `404`: File not found
- `400`: Invalid JSON in file

---

#### POST - Create JSON File

Creates a new JSON file or overwrites an existing one.

- **Method**: `POST`
- **URL**: `/api/jfs/`

##### Request Body

```json
{
  "file": "/path/to/file.json",
  "content": { "key": "value" }
}
```

| Field   | Type   | Required | Description                          |
|---------|--------|----------|--------------------------------------|
| file    | string | Yes      | The path where the file will be created |
| content | object | Yes      | The JSON content to write to the file |

##### Response

```json
{
  "success": boolean,
  "message": "string",
  "path": "string"
}
```

##### Status Codes

- `200`: File written successfully
- `400`: Invalid JSON body or file path not provided

---

#### PATCH - Modify JSON Keys

Modifies specific keys in an existing JSON file. Adds new keys or updates existing ones.

- **Method**: `PATCH`
- **URL**: `/api/jfs/`

##### Request Body

```json
{
  "file": "/path/to/file.json",
  "modify": { "existingKey": "newValue", "newKey": "addedValue" }
}
```

| Field    | Type   | Required | Description                              |
|----------|--------|----------|------------------------------------------|
| file     | string | Yes      | The path to the JSON file to modify      |
| modify   | object | Yes      | The key-value pairs to modify/add        |

##### Response

```json
{
  "success": boolean,
  "message": "string",
  "path": "string",
  "data": object | array
}
```

| Field   | Type         | Description                              |
|---------|--------------|------------------------------------------|
| success | boolean      | `true` if file was modified successfully |
| message | string       | Success message                          |
| path    | string       | The file path that was modified          |
| data    | object/array | The modified JSON content                |

##### Status Codes

- `200`: File modified successfully
- `400`: Invalid JSON body, file path not provided, or modify object invalid
- `404`: File not found
- `400`: Invalid JSON in file

---

#### DELETE - Delete JSON File

Deletes a JSON file from the filesystem.

- **Method**: `DELETE`
- **URL**: `/api/jfs/?file=/path/to/file.json`

##### Response

```json
{
  "success": boolean,
  "message": "string",
  "path": "string"
}
```

| Field   | Type   | Description                           |
|---------|--------|---------------------------------------|
| success | boolean| `true` if file was deleted successfully |
| message | string | Success message                       |
| path    | string | The file path that was deleted        |

##### Status Codes

- `200`: File deleted successfully
- `400`: File path not provided
- `500`: Error deleting file

---

### File Stream API (FS)

Manages text files with create, read, append, replace, rewrite, and delete operations.

- **URL**: `/api/fs/`
- **Methods**: `GET`, `POST`, `DELETE`
- **Content-Type**: `application/json` (for POST)

#### GET - Read File

Retrieves the contents of a text file.

- **Method**: `GET`
- **URL**: `/api/fs/?path=/path/to/file.txt`

##### Response

```json
{
  "success": boolean,
  "content": "string",
  "path": "string"
}
```

| Field   | Type   | Description                           |
|---------|--------|---------------------------------------|
| success | boolean| `true` if file was read successfully |
| content | string | The file content                      |
| path    | string | The file path that was read           |

##### Status Codes

- `200`: File read successfully
- `400`: File path not provided
- `404`: File not found

---

#### POST - File Operations

Performs various file operations: create, content-add, content-replace, content-rewrite.

- **Method**: `POST`
- **URL**: `/api/fs/`

##### Request Body

```json
{
  "path": "/path/to/file.txt",
  "content": "string",
  "action": "create | content-add | content-replace | content-rewrite",
  "search": "string",
  "replaceWith": "string"
}
```

| Field       | Type   | Required | Description                              |
|-------------|--------|----------|------------------------------------------|
| path        | string | Yes      | The path to the file                     |
| content     | string | Yes*     | The content to write (required for create, content-add, content-rewrite) |
| action      | string | Yes      | The operation to perform: `create`, `content-add`, `content-replace`, `content-rewrite` |
| search      | string | Yes*     | Search string for replace operation      |
| replaceWith | string | No       | Replacement string (defaults to empty)   |

##### Actions

| Action           | Description                                  |
|------------------|----------------------------------------------|
| create           | Creates a new file (overwrites if exists)    |
| content-add      | Appends content to existing file             |
| content-replace  | Replaces all occurrences of search string    |
| content-rewrite  | Overwrites entire file with new content      |

##### Response

```json
{
  "success": boolean,
  "message": "string",
  "path": "string"
}
```

##### Status Codes

- `200`: Operation completed successfully
- `400`: Invalid JSON body, missing required fields, or invalid action
- `500`: Error performing operation

---

#### DELETE - Delete File

Deletes a file from the filesystem.

- **Method**: `DELETE`
- **URL**: `/api/fs/?path=/path/to/file.txt`

##### Response

```json
{
  "success": boolean,
  "message": "string",
  "path": "string"
}
```

| Field   | Type   | Description                           |
|---------|--------|---------------------------------------|
| success | boolean| `true` if file was deleted successfully |
| message | string | Success message                       |
| path    | string | The file path that was deleted        |

##### Status Codes

- `200`: File deleted successfully
- `400`: File path not provided
- `500`: Error deleting file

---

### Relay API

Relays HTTP/HTTPS requests to a target URL. Useful for bypassing CORS restrictions or routing requests through the server.

- **URL**: `/api/relay`
- **Methods**: `GET`, `POST`
- **Content-Type**: `application/json`

#### Request Body

```json
{
  "url": "string"
}
```

| Field | Type   | Required | Description                              |
|-------|--------|----------|------------------------------------------|
| url   | string | Yes      | The target URL to forward the request to |

#### Response

Returns the response from the target URL directly. The response body and status code will match what the target URL returns.

##### Status Codes

- `200`: Request relayed successfully (actual status depends on target)
- `400`: Invalid JSON body or URL not provided
- `500`: Error relaying request to target URL

#### Examples

**Forward a GET request:**
```bash
curl -X GET http://localhost:34501/api/relay \
  -H "Content-Type: application/json" \
  -d '{"url": "https://api.example.com/data?id=123"}'
```

**Forward a POST request:**
```bash
curl -X POST http://localhost:34501/api/relay \
  -H "Content-Type: application/json" \
  -d '{"url": "https://api.example.com/submit", "data": {"key": "value"}}'
```