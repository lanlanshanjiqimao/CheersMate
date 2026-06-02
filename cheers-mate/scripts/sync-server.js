const http = require('http');
const fs = require('fs');
const path = require('path');
const os = require('os');

const DATA_DIR = path.join(__dirname, '../data');
const PORT = 3456;

const FILES = {
  auth: path.join(DATA_DIR, 'auth.local.json'),
  credentials: path.join(DATA_DIR, 'credentials.local.json'),
  users: path.join(DATA_DIR, 'users.local.json'),
  activities: path.join(DATA_DIR, 'activities.local.json'),
  chat: path.join(DATA_DIR, 'chat.local.json'),
};

function resolveFilePath(key) {
  if (FILES[key]) return FILES[key];
  // Allow dynamic keys like chat_u_mumu, chat_all
  if (/^[a-z_]+$/.test(key)) {
    return path.join(DATA_DIR, `${key}.local.json`);
  }
  return null;
}

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
    const filepath = key ? resolveFilePath(key) : null;
    if (!filepath) {
      res.writeHead(400, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ok: false, error: 'Invalid key' }));
      return;
    }
    const data = readJson(filepath);
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
    const filepath = key ? resolveFilePath(key) : null;
    if (!filepath) {
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

server.listen(PORT, '0.0.0.0', () => {
  const nets = os.networkInterfaces();
  const addresses = ['localhost'];
  for (const name of Object.keys(nets)) {
    for (const net of nets[name] ?? []) {
      if (net.family === 'IPv4' && !net.internal) {
        addresses.push(net.address);
      }
    }
  }
  console.log(`Data sync server running on port ${PORT}`);
  for (const addr of addresses) {
    console.log(`  http://${addr}:${PORT}`);
  }
  console.log(`  GET  /data?key=<auth|credentials|users|activities|chat>`);
  console.log(`  GET  /all`);
  console.log(`  POST /data?key=<auth|credentials|users|activities|chat>`);
  console.log(`Data dir: ${DATA_DIR}`);
});
