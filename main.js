const { app, BrowserWindow } = require('electron');
const path = require('path');
const http = require('http');
const https = require('https');
const fs = require('fs');
const { spawn } = require('child_process');

function createWindow() {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  mainWindow.loadURL('http://localhost:34501/');
}

const MIME_TYPES = {
  '.html': 'text/html',
  '.js': 'application/javascript',
  '.css': 'text/css',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.json': 'application/json'
};

const server = http.createServer((req, res) => {
res.setHeader('Access-Control-Allow-Origin', 'http://ml.samuelcheston.com');
res.setHeader('Access-Control-Allow-Credentials', 'true');
res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');

  if (req.method === 'OPTIONS') {
    res.writeHead(200);
    res.end();
    return;
  }

  const url = new URL(req.url, `http://${req.headers.host}`);

  if (url.pathname === '/api/jfs/' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const filePath = data.file;

        if (!filePath) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'File path is required' }));
          return;
        }

        const content = data.content !== undefined ? data.content : data;
        const jsonContent = typeof content === 'string' ? content : JSON.stringify(content, null, 2);

        fs.writeFile(filePath, jsonContent, 'utf8', (err) => {
          if (err) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
            return;
          }
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, message: 'File written successfully', path: filePath }));
        });
      } catch (parseError) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON body' }));
      }
    });
  } else if (url.pathname === '/api/jfs/' && req.method === 'GET') {
    const filePath = url.searchParams.get('file');

    if (!filePath) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'File path is required' }));
      return;
    }

    fs.readFile(filePath, 'utf8', (err, data) => {
      if (err) {
        res.writeHead(404, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
        return;
      }

      try {
        const jsonData = JSON.parse(data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, data: jsonData, path: filePath }));
      } catch (parseError) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON in file' }));
      }
    });
  } else if (url.pathname === '/api/jfs/' && req.method === 'DELETE') {
    const filePath = url.searchParams.get('file');

    if (!filePath) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'File path is required' }));
      return;
    }

    fs.unlink(filePath, (err) => {
      if (err) {
        res.writeHead(500, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: err.message }));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: true, message: 'File deleted successfully', path: filePath }));
    });
  } else if (url.pathname === '/api/jfs/' && req.method === 'PATCH') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const filePath = data.file;
        const modifications = data.modify;

        if (!filePath) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'File path is required' }));
          return;
        }

        if (!modifications || typeof modifications !== 'object') {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Modify object is required' }));
          return;
        }

        fs.readFile(filePath, 'utf8', (err, fileData) => {
          if (err) {
            res.writeHead(404, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: err.message }));
            return;
          }

          try {
            const jsonData = JSON.parse(fileData);
            const updatedData = { ...jsonData, ...modifications };

            fs.writeFile(filePath, JSON.stringify(updatedData, null, 2), 'utf8', (writeErr) => {
              if (writeErr) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: writeErr.message }));
                return;
              }
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, message: 'File modified successfully', path: filePath, data: updatedData }));
            });
          } catch (parseError) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Invalid JSON in file' }));
          }
        });
      } catch (parseError) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON body' }));
      }
    });
  } else if (url.pathname.startsWith('/api/fs/')) {
    const fsPath = url.pathname.slice('/api/fs/'.length);
    
    if (req.method === 'POST') {
      let body = '';
      req.on('data', chunk => {
        body += chunk.toString();
      });
      req.on('end', () => {
        try {
          const data = JSON.parse(body);
          const filePath = data.path || fsPath;
          const content = data.content || '';
          const action = data.action || 'create';

          if (!filePath) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'File path is required' }));
            return;
          }

          if (action === 'create') {
            fs.writeFile(filePath, content, 'utf8', (err) => {
              if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
                return;
              }
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, message: 'File created successfully', path: filePath }));
            });
          } else if (action === 'content-add') {
            fs.appendFile(filePath, content, 'utf8', (err) => {
              if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
                return;
              }
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, message: 'Content added successfully', path: filePath }));
            });
          } else if (action === 'content-replace') {
            const search = data.search;
            const replaceWith = data.replaceWith;
            
            if (search === undefined) {
              res.writeHead(400, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, error: 'Search string is required for replace' }));
              return;
            }

            fs.readFile(filePath, 'utf8', (readErr, fileData) => {
              if (readErr) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: readErr.message }));
                return;
              }
              const updatedContent = fileData.replace(new RegExp(search, 'g'), replaceWith || '');
              fs.writeFile(filePath, updatedContent, 'utf8', (writeErr) => {
                if (writeErr) {
                  res.writeHead(500, { 'Content-Type': 'application/json' });
                  res.end(JSON.stringify({ success: false, error: writeErr.message }));
                  return;
                }
                res.writeHead(200, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: true, message: 'Content replaced successfully', path: filePath }));
              });
            });
          } else if (action === 'content-rewrite') {
            fs.writeFile(filePath, content, 'utf8', (err) => {
              if (err) {
                res.writeHead(500, { 'Content-Type': 'application/json' });
                res.end(JSON.stringify({ success: false, error: err.message }));
                return;
              }
              res.writeHead(200, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: true, message: 'Content rewritten successfully', path: filePath }));
            });
          } else {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ success: false, error: 'Invalid action. Use: create, content-add, content-replace, content-rewrite' }));
          }
        } catch (parseError) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'Invalid JSON body' }));
        }
      });
    } else if (req.method === 'GET') {
      const filePath = url.searchParams.get('path') || fsPath;

      if (!filePath) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'File path is required' }));
        return;
      }

      fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
          res.writeHead(404, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: err.message }));
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, content: data, path: filePath }));
      });
    } else if (req.method === 'DELETE') {
      const filePath = url.searchParams.get('path') || fsPath;

      if (!filePath) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'File path is required' }));
        return;
      }

      fs.unlink(filePath, (err) => {
        if (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: err.message }));
          return;
        }
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, message: 'File deleted successfully', path: filePath }));
      });
    } else {
      res.writeHead(405, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Method not allowed' }));
    }
  } else if (url.pathname === '/api/execute' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const command = data.command;

        const child = spawn(command, [], { shell: true });
        let stdout = '';
        let stderr = '';
        let error = null;

        child.stdout.on('data', (data) => {
          stdout += data.toString();
        });

        child.stderr.on('data', (data) => {
          stderr += data.toString();
        });

        child.on('error', (err) => {
          error = err.message;
        });

        child.on('close', (code) => {
          const result = {
            success: code === 0 && !error,
            stdout: stdout,
            stderr: stderr,
            error: error
          };
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(result));
        });
      } catch (parseError) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON body' }));
      }
    });
  } else if (url.pathname === '/api/relay') {
    let body = '';
    req.on('data', chunk => {
      body += chunk.toString();
    });

    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        const targetUrl = data.url;

        if (!targetUrl) {
          res.writeHead(400, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: 'URL is required' }));
          return;
        }

        const target = new URL(targetUrl);
        const isHttps = target.protocol === 'https:';
        const client = isHttps ? https : http;

        const relayOptions = {
          hostname: target.hostname,
          port: target.port || (isHttps ? 443 : 80),
          path: target.pathname + target.search,
          method: req.method,
          headers: {
            ...req.headers,
            host: target.hostname
          }
        };

        const relayReq = client.request(relayOptions, (relayRes) => {
          let relayBody = '';
          relayRes.on('data', (chunk) => {
            relayBody += chunk.toString();
          });

          relayRes.on('end', () => {
            res.writeHead(relayRes.statusCode, { 
              'Content-Type': relayRes.headers['content-type'] || 'application/json',
              'Access-Control-Allow-Origin': 'http://ml.samuelcheston.com',
              'Access-Control-Allow-Credentials': 'true'
            });
            res.end(relayBody);
          });
        });

        relayReq.on('error', (err) => {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        });

        relayReq.write(body);
        relayReq.end();
      } catch (parseError) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: false, error: 'Invalid JSON body' }));
      }
    });
  } else if (url.pathname === '/' || url.pathname === '/index.html') {
    const filePath = path.join(__dirname, 'src', 'index.html');
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else if (url.pathname.startsWith('/assets/')) {
    const filePath = path.join(__dirname, 'src', url.pathname);
    const ext = path.extname(filePath);
    const mimeType = MIME_TYPES[ext] || 'application/octet-stream';
    
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': mimeType });
      res.end(data);
    });
  } else if (url.pathname.endsWith('.html')) {
    const filePath = path.join(__dirname, 'src', url.pathname);
    fs.readFile(filePath, (err, data) => {
      if (err) {
        res.writeHead(404);
        res.end('Not found');
        return;
      }
      res.writeHead(200, { 'Content-Type': 'text/html' });
      res.end(data);
    });
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Endpoint not found' }));
  }
});

app.whenReady().then(() => {
  server.listen(34501, () => {
    console.log('API server running on http://localhost:34501');
    createWindow();
  });
});

app.on('window-all-closed', () => {
  server.close();
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});