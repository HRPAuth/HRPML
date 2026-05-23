# Shell API Documentation

## Overview

The Shell API is an HTTP endpoint that allows execution of shell commands on the system. It's built into the Electron application using Node.js `child_process` module.

## Base URL

```
http://localhost:34501
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

## Examples

### cURL

```bash
curl -X POST http://localhost:34501/api/execute \
  -H "Content-Type: application/json" \
  -d '{"command": "ls -la"}'
```

### JavaScript (fetch)

```javascript
const response = await fetch('http://localhost:34501/api/execute', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ command: 'ls -la' })
});

const result = await response.json();
console.log(result.stdout);
```

### Python (requests)

```python
import requests

response = requests.post(
    'http://localhost:34501/api/execute',
    json={'command': 'ls -la'}
)

result = response.json()
print(result['stdout'])
```

## Implementation Details

The API uses Node.js `child_process.spawn` with the `shell: true` option:

```javascript
const { spawn } = require('child_process');

const child = spawn(command, [], { shell: true });
child.stdout.on('data', (data) => { /* collect stdout */ });
child.stderr.on('data', (data) => { /* collect stderr */ });
child.on('close', (code) => { /* return result */ });
```

## Security Considerations

⚠️ **Warning**: This API executes commands directly on the system with elevated privileges. It uses `shell: true` which allows arbitrary shell command execution. Ensure appropriate security measures are in place when exposing this API.

## File Structure

The Shell API is implemented in the main Electron process:
- **File**: `main.js`
- **Port**: `34501`

## CORS

The API allows cross-origin requests from any origin (`Access-Control-Allow-Origin: *`).
