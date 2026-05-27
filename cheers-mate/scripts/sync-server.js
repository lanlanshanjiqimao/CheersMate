const http = require('http');
const fs = require('fs');
const path = require('path');

const DATA_DIR = path.join(__dirname, '../data');
const PORT = 3456;

const FILES = {
  auth: path.join(DATA_DIR, 'auth.local.json'),
  credentials: path.join(DATA_DIR, 'credentials.local.json'),
  users: path.join(DATA_DIR, 'users.local.json'),
  activities: path.join(DATA_DIR, 'activities.local.json'),
  chat: path.join(DATA_DIR, 'chat.local.json'),
};

function readJson(filepath) {
  try {
    return JSON.parse(fs.readFileSync(filepath, 'utf8'));
  } catch {
    return null;
  }
}

function writeJson(filepath, data) {
  fs.writeFileSync(filepath, JSON.stringify(data, null, 2) + '\n');
}

// Ensure all data files exist
for (const [key, filepath] of Object.entries(FILES)) {
  if (!fs.existsSync(filepath)) {
    const defaultData = (key === 'activities' || key === 'chat') ? [] : {};
    writeJson(filepath, defaultData);
  }
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  // GET /data?key=activities  — read a data store
  if (req.method === 'GET' && req.url?.startsWith('/data')) {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const key = url.searchParams.get('key');
    if (!key || !FILES[key]) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Invalid key' }));
      return;
    }
    const data = readJson(FILES[key]);
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, data }));
    return;
  }

  // GET /all — read everything
  if (req.method === 'GET' && req.url === '/all') {
    const result = {};
    for (const [key, filepath] of Object.entries(FILES)) {
      result[key] = readJson(filepath);
    }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ok: true, data: result }));
    return;
  }

  // POST /data?key=activities  — write a data store
  if (req.method === 'POST' && req.url?.startsWith('/data')) {
    const url = new URL(req.url, `http://localhost:${PORT}`);
    const key = url.searchParams.get('key');
    if (!key || !FILES[key]) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Invalid key' }));
      return;
    }
    let body = '';
    req.on('data', (chunk) => { body += chunk; });
    req.on('end', () => {
      try {
        const data = JSON.parse(body);
        writeJson(FILES[key], data);
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: true }));
      } catch (e) {
        res.writeHead(400, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ ok: false, error: e.message }));
      }
    });
    return;
  }

  res.writeHead(404);
  res.end('Not found');
});

server.listen(PORT, () => {
  console.log(`Data sync server running on http://localhost:${PORT}`);
  console.log(`  GET  /data?key=<auth|credentials|users|activities|chat>`);
  console.log(`  GET  /all`);
  console.log(`  POST /data?key=<auth|credentials|users|activities|chat>`);
  console.log(`Data dir: ${DATA_DIR}`);
});
