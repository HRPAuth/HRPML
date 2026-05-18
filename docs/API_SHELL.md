# HRPML Shell Executor API

## Overview

The Shell Executor is a feature in the HRPML Neutralinojs application that allows users to execute shell commands through a web interface.

## Endpoint

### Shell Execution

**URL:** `/shell.html`

**Method:** `POST` (via form submission)

**Description:** Executes a shell command and returns the output.

---

## Client API

### `Neutralino.os.exec(command)`

Executes a shell command on the host system.

**Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `command` | `string` | The shell command to execute |

**Returns:** `Promise<ExecResult>`

**ExecResult Object:**

| Property | Type | Description |
|----------|------|-------------|
| `stdout` | `string` | Standard output from the command |
| `stderr` | `string` | Standard error output from the command |
| `exitCode` | `number` | The exit code returned by the command |

**Example Usage:**

```javascript
const result = await Neutralino.os.exec('ls -la');
console.log(result.stdout);   // Command output
console.log(result.stderr);   // Error output (if any)
console.log(result.exitCode); // Exit code (0 for success)
```

---

## Usage

### Form Input

1. Navigate to `/shell.html`
2. Enter a shell command in the text input
3. Click "Execute" or press Enter
4. View the output below

### Example Commands

```bash
# List files
ls -la

# Show current directory
pwd

# Display system info
uname -a

# Show date
date
```

---

## Security Configuration

The shell execution feature uses Neutralinojs's native API. The following permissions are configured in `neutralino.config.json`:

```json
"nativeAllowList": [
    "app.*",
    "os.*",
    "debug.log"
]
```

The `os.*` allowlist pattern permits all `os` module functions, including `os.exec`.

---

## Error Handling

| Error | Description |
|-------|-------------|
| Empty command | Returns "Error: No command entered" |
| Execution failure | Displays error message in output area |
| Permission denied | Returns stderr with permission error |

---

## Architecture

```
shell.html          - Shell executor UI page
    └── js/shell.js - Client-side execution handler
            └── Neutralino.os.exec() - Native API call
                    └── OS shell execution
```