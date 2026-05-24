# File Stream API Documentation

## Overview

The File Stream API is an HTTP endpoint that allows file system operations on the system. It's built into the Electron application using Node.js `fs` module.

## Base URL

```
http://localhost:34501
```

## Endpoints

### File Operations

Performs file system operations on files and directories.

- **URL**: `/api/files`
- **Method**: `POST`
- **Content-Type**: `application/json`

#### Request Body

```json
{
  "operation": "string",
  "path": "string",
  "content": "string"
}
```

| Field     | Type   | Required | Description                                  |
|-----------|--------|----------|----------------------------------------------|
| operation | string | Yes      | The operation to perform (see operations)    |
| path      | string | Yes      | Path to the file or directory                |
| content   | string | No       | Content for write/create/modify operations   |

#### Operations

| Operation | Description                                  |
|-----------|----------------------------------------------|
| read      | Read the content of a file                   |
| write     | Write content to a file (creates if needed)  |
| create    | Create a new file (alias for write)          |
| modify    | Modify an existing file (alias for write)    |
| delete    | Delete a file                                |
| exists    | Check if a file/directory exists             |
| list      | List contents of a directory                 |

#### Response

```json
{
  "success": boolean,
  "content": "string (only for read)",
  "exists": boolean (only for exists),
  "files": [
    {
      "name": "string",
      "isDirectory": boolean,
      "isFile": boolean
    }
  ] (only for list),
  "error": "string | null"
}
```

#### Status Codes

- `200`: Operation completed successfully
- `400`: Invalid JSON body or missing fields
- `500`: File system error occurred

## Examples

### cURL

**Read a file**
```bash
curl -X POST http://localhost:34501/api/files \
  -H "Content-Type: application/json" \
  -d '{"operation": "read", "path": "/path/to/file.txt"}'
```

**Write to a file**
```bash
curl -X POST http://localhost:34501/api/files \
  -H "Content-Type: application/json" \
  -d '{"operation": "write", "path": "/path/to/file.txt", "content": "Hello world!"}'
```

**Check if file exists**
```bash
curl -X POST http://localhost:34501/api/files \
  -H "Content-Type: application/json" \
  -d '{"operation": "exists", "path": "/path/to/file.txt"}'
```

**List directory contents**
```bash
curl -X POST http://localhost:34501/api/files \
  -H "Content-Type: application/json" \
  -d '{"operation": "list", "path": "/path/to/directory"}'
```

**Delete a file**
```bash
curl -X POST http://localhost:34501/api/files \
  -H "Content-Type: application/json" \
  -d '{"operation": "delete", "path": "/path/to/file.txt"}'
```

### JavaScript (fetch)

**Read a file**
```javascript
const response = await fetch('http://localhost:34501/api/files', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ operation: 'read', path: '/path/to/file.txt' })
});
const result = await response.json();
console.log(result.content);
```

**Write to a file**
```javascript
await fetch('http://localhost:34501/api/files', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    operation: 'write',
    path: '/path/to/file.txt',
    content: 'Hello world!'
  })
});
```

### Python (requests)

**Read a file**
```python
import requests
response = requests.post(
    'http://localhost:34501/api/files',
    json={'operation': 'read', 'path': '/path/to/file.txt'}
)
result = response.json()
print(result['content'])
```

**Write to a file**
```python
import requests
requests.post(
    'http://localhost:34501/api/files',
    json={'operation': 'write', 'path': '/path/to/file.txt', 'content': 'Hello world!'}
)
```

## Implementation Details

The API uses Node.js `fs` module to perform file system operations:

```javascript
const fs = require('fs');
```

## Security Considerations

⚠️ **Warning**: This API allows full access to the file system of the host machine. Ensure appropriate security measures are in place when exposing this API.

## File Structure

The File Stream API is implemented in the main Electron process:
- **File**: `main.js`
- **Port**: `34501`

## CORS

The API allows cross-origin requests from any origin (`Access-Control-Allow-Origin: *`).
