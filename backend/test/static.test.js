import assert from 'node:assert/strict';
import { mkdtemp, mkdir, writeFile, unlink, rmdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { test } from 'node:test';
import { createApp } from '../src/app.js';

test('Express serves only the frontend build while API errors remain JSON', async () => {
  const directory = await mkdtemp(join(tmpdir(), 'globecopy-static-'));
  await mkdir(join(directory, 'assets'));
  await writeFile(join(directory, 'index.html'), '<!doctype html><div id="root">build fixture</div>');
  await writeFile(join(directory, 'assets', 'app.js'), 'console.log("build fixture");');
  const server = createApp({
    frontendDist: directory,
    localize: async () => { assert.fail('Static requests must not call the model'); },
  }).listen(0, '127.0.0.1');
  await new Promise(resolve => server.once('listening', resolve));
  const base = `http://127.0.0.1:${server.address().port}`;
  try {
    const page = await fetch(base);
    assert.equal(page.status, 200);
    assert.match(page.headers.get('content-type'), /text\/html/);
    assert.match(await page.text(), /build fixture/);
    assert.equal((await fetch(`${base}/assets/app.js`)).status, 200);
    assert.equal((await fetch(`${base}/api/health`)).status, 200);
    for (const path of ['/api/missing', '/src/server.js', '/.env', '/assets/missing.js']) {
      const response = await fetch(base + path);
      assert.equal(response.status, 404);
      assert.equal((await response.json()).error.code, 'NOT_FOUND');
    }
  } finally {
    server.closeAllConnections();
    await new Promise(resolve => server.close(resolve));
    await unlink(join(directory, 'assets', 'app.js'));
    await unlink(join(directory, 'index.html'));
    await rmdir(join(directory, 'assets'));
    await rmdir(directory);
  }
});
