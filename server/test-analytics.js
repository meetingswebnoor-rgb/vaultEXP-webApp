const http = require('http');

async function login() {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ email: 'superadmin@vaultexp.com', password: 'Password123!' });
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: '/api/auth/login',
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Content-Length': data.length }
    };
    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        const parsed = JSON.parse(body);
        if (parsed.success) resolve(parsed.data.accessToken);
        else reject(new Error('Login failed'));
      });
    });
    req.write(data);
    req.end();
  });
}

function testEndpoint(path, token) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 5000,
      path: path,
      method: 'GET',
      headers: { 'Authorization': `Bearer ${token}` }
    };

    const req = http.request(options, (res) => {
      let body = '';
      res.on('data', chunk => body += chunk);
      res.on('end', () => {
        console.log(`\n[${path}] Status: ${res.statusCode}`);
        if (res.statusCode === 200) {
          console.log(`[${path}] SUCCESS! First 100 chars of data:`);
          console.log(body.substring(0, 100) + '...');
        } else {
          console.error(`[${path}] FAILED: ${body}`);
        }
        resolve();
      });
    });

    req.on('error', (e) => {
      console.error(`[${path}] Request failed: ${e.message}`);
      resolve();
    });
    req.end();
  });
}

async function run() {
  try {
    const token = await login();
    await testEndpoint('/api/admin/ai/metrics', token);
  } catch (err) {
    console.error(err);
  }
}

run();
