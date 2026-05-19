# Shell API Documentation

## Overview
The Shell API provides shell command execution functionality for HRPML applications using Neutralino.js.

## ShellAPI.execute(command)

Executes a shell command and returns the result.

### Parameters
- `command` (string): The shell command to execute

### Returns
- `Promise<Object>`: Result object with the following properties:
  - `success` (boolean): `true` if exit code is 0, `false` otherwise
  - `stdout` (string): Standard output from the command
  - `stderr` (string): Standard error output from the command
  - `exitCode` (number): Process exit code
  - `error` (string, optional): Error message if execution failed

### Example
```javascript
const result = await ShellAPI.execute('ls -la');

if (result.success) {
    console.log(result.stdout);
} else {
    console.error(result.stderr || result.error);
}
```

### Error Handling
Returns `{ success: false, error: 'Invalid command' }` if the command is empty or not a string.

## HTTP API

You can also execute commands via HTTP GET request:

```
GET /shell.html?cmd=your_command_here
```

Returns a JSON string with the command result.
