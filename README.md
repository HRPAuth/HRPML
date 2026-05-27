# Samuel Client (HRPML)

An Electron-based Minecraft Launcher.

## Features



## Getting Started

### Prerequisites

- Node.js
- npm

### Installation

```bash
npm install
```

### Development

```bash
npm run dev
```

### Build

```bash
npm run build        # Build for current platform
npm run build:win    # Build for Windows
npm run build:mac    # Build for macOS
npm run build:linux  # Build for Linux
```

## API Documentation

### Shell API

**Base URL:** `http://localhost:34501/`

**Execute Command**

- **Endpoint:** `/api/execute`
- **Method:** `POST`
- **Content-Type:** `application/json`

```json
{
  "command": "string"
}
```

**Response:**

```json
{
  "success": boolean,
  "stdout": "string",
  "stderr": "string",
  "error": "string | null"
}
```

### File Operations

- **Endpoint:** `/api/jfs/`
- **Method:** `POST`

See `scapi.md` for full API documentation.

## Project Structure

```
├── main.js          # Electron main process
├── src/             # Frontend assets
│   ├── index.html
│   ├── main.html
│   └── assets/
└── package.json
```
