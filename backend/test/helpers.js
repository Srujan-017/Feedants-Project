/**
 * Shared HTTP helpers for Phase 6 test scripts.
 * Uses Node's built-in `http` module — no extra dependencies required.
 */

const http = require('http');

const BASE_URL = process.env.API_BASE_URL || 'http://localhost:5000/api';

function request(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(BASE_URL + path);
    const postData = body ? JSON.stringify(body) : null;

    const options = {
      hostname: url.hostname,
      port: url.port || 80,
      path: url.pathname + url.search,
      method,
      headers: {
        'Content-Type': 'application/json',
        ...(postData ? { 'Content-Length': Buffer.byteLength(postData) } : {}),
      },
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, body: JSON.parse(data) });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);
    if (postData) req.write(postData);
    req.end();
  });
}

const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
};

function pass(label) {
  console.log(`  ✓ PASS  ${label}`);
}

function fail(label, detail = '') {
  console.error(`  ✗ FAIL  ${label}${detail ? ': ' + detail : ''}`);
  process.exitCode = 1;
}

function skip(label) {
  console.log(`  ⚠ SKIP  ${label}`);
}

function section(title) {
  console.log(`\n══ ${title} ══`);
}

function assert(condition, passLabel, failLabel, detail = '') {
  if (condition) pass(passLabel);
  else fail(failLabel, detail);
}

module.exports = { api, pass, fail, skip, section, assert, BASE_URL };
