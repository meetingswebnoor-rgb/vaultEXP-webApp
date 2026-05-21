/* eslint-disable */
'use strict';

process.env.NODE_ENV = 'test';
process.env.JWT_SECRET = 'test_secret_key';
process.env.PORT = '5000';

const fs = require('fs');
const results = [];

function check(label, fn) {
  try { fn(); results.push({ label, ok: true }); }
  catch(e) { results.push({ label, ok: false, err: e.message }); }
}

// 1 — app.js loads
let app;
check('app.js loads without error', () => { app = require('./src/app'); });

// 2 — only ONE app.use(cors()) in app.js
check('CORS: single app.use(cors()) call', () => {
  const src = fs.readFileSync('./src/app.js', 'utf8');
  const n = (src.match(/app\.use\(cors/g) || []).length;
  if (n !== 1) throw new Error('Expected 1 app.use(cors()), found ' + n);
});

// 3 — no wildcard origin
check('CORS: no wildcard origin *', () => {
  const src = fs.readFileSync('./src/app.js', 'utf8');
  if (/origin:\s*['"]\*['"]/.test(src)) throw new Error('Wildcard origin found!');
});

// 4 — express.json present
check('Body: express.json() present', () => {
  const src = fs.readFileSync('./src/app.js', 'utf8');
  if (!src.includes('express.json(')) throw new Error('Missing express.json()');
});

// 5 — body parsing before routes
check('Body: express.json() before /api/auth', () => {
  const src = fs.readFileSync('./src/app.js', 'utf8');
  const jsonPos  = src.indexOf('express.json(');
  const routePos = src.indexOf('/api/auth');
  if (jsonPos > routePos) throw new Error('express.json() AFTER /api/auth!');
});

// 6 — global error handler with 4 params
check('Error handler: 4 params (err, req, res, next)', () => {
  const src = fs.readFileSync('./src/app.js', 'utf8');
  if (!src.includes('(err, req, res, next)')) throw new Error('Missing 4-param error handler');
});

// 7 — GLOBAL ERROR log
check('Error handler: console.error GLOBAL ERROR', () => {
  const src = fs.readFileSync('./src/app.js', 'utf8');
  if (!src.includes('GLOBAL ERROR')) throw new Error('Missing GLOBAL ERROR log');
});

// 8 — app exports
check('app.js: module.exports = app', () => {
  const src = fs.readFileSync('./src/app.js', 'utf8');
  if (!src.includes('module.exports = app')) throw new Error('app not exported');
});

// 9 — auth routes
check('auth.routes.js: loads and exports router', () => {
  const r = require('./src/modules/auth/auth.routes');
  if (typeof r !== 'function' && typeof r.handle !== 'function') throw new Error('Not a router');
});

// 10 — auth controller exports
check('auth.controller: signup/login/logout/me', () => {
  const c = require('./src/modules/auth/auth.controller');
  ['signup','login','logout','me'].forEach(k => {
    if (typeof c[k] !== 'function') throw new Error(k + ' not a function');
  });
});

// 11 — auth service exports
check('auth.service: signup/login/getMe', () => {
  const s = require('./src/modules/auth/auth.service');
  ['signup','login','getMe'].forEach(k => {
    if (typeof s[k] !== 'function') throw new Error(k + ' not a function');
  });
});

// 12 — server.js binds to 0.0.0.0
check('server.js: HOST = 0.0.0.0', () => {
  const src = fs.readFileSync('./server.js', 'utf8');
  if (!src.includes('0.0.0.0')) throw new Error('Missing 0.0.0.0 binding');
});

// 13 — server.js imports ./src/app
check('server.js: imports ./src/app', () => {
  const src = fs.readFileSync('./server.js', 'utf8');
  if (!src.includes('./src/app')) throw new Error('Not importing ./src/app');
});

// 14 — login returns top-level token
check('auth.controller login: top-level token', () => {
  const src = fs.readFileSync('./src/modules/auth/auth.controller.js', 'utf8');
  if (!src.includes('token:   accessToken')) throw new Error('login missing token: accessToken');
});

// 15 — seed.js exists
check('prisma/seed.js exists', () => {
  fs.accessSync('./prisma/seed.js');
});

// 16 — no localhost in CORS config
check('CORS: no localhost-only origins as default', () => {
  const src = fs.readFileSync('./src/app.js', 'utf8');
  if (src.includes("origin: 'http://localhost") && !src.includes('vault-exp-web-app')) {
    throw new Error('CORS only has localhost — Vercel URL missing');
  }
});

// Print summary
console.log('');
console.log('='.repeat(60));
const pass = results.filter(r => r.ok).length;
const fail = results.filter(r => !r.ok).length;
results.forEach(r => {
  const icon = r.ok ? 'PASS' : 'FAIL';
  console.log('  [' + icon + '] ' + r.label + (r.err ? '  =>  ' + r.err : ''));
});
console.log('='.repeat(60));
console.log('  ' + pass + ' passed  ' + fail + ' failed');
console.log('');
setTimeout(() => process.exit(fail > 0 ? 1 : 0), 200);
