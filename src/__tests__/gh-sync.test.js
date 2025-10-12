import { afterEach, beforeEach, describe, it } from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { createApp } from '../../server/app.js';

const ORIGINAL_SYNC_TOKEN = process.env.SYNC_TOKEN;

async function withServer(app, handler) {
  const server = http.createServer(app);
  await new Promise((resolve) => server.listen(0, '127.0.0.1', resolve));
  const { port } = server.address();
  const baseUrl = `http://127.0.0.1:${port}`;

  try {
    await handler(baseUrl);
  } finally {
    await new Promise((resolve) => server.close(resolve));
  }
}

describe('Express /gh-sync API', () => {
  let execFileMock;

  beforeEach(() => {
    execFileMock = (...args) => {
      execFileMock.calls.push(args);
    };
    execFileMock.calls = [];
    process.env.SYNC_TOKEN = 'test-token';
  });

  afterEach(() => {
    process.env.SYNC_TOKEN = ORIGINAL_SYNC_TOKEN;
  });

  it('responds with ok:true for GET /health', async () => {
    const app = createApp({ execFile: execFileMock });
    await withServer(app, async (baseUrl) => {
      const res = await fetch(`${baseUrl}/health`);
      assert.equal(res.status, 200);
      const body = await res.json();
      assert.deepEqual(body, { ok: true });
    });
  });

  it('rejects requests without a valid bearer token', async () => {
    const app = createApp({ execFile: execFileMock });
    await withServer(app, async (baseUrl) => {
      const res = await fetch(`${baseUrl}/gh-sync`, {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ ref: 'main' }),
      });
      assert.equal(res.status, 401);
      const body = await res.json();
      assert.equal(body.ok, false);
      assert.equal(execFileMock.calls.length, 0);
    });
  });

  it('invokes the sync script when authorized', async () => {
    execFileMock = (...args) => {
      execFileMock.calls.push(args);
      const callback = args[2];
      callback(null, 'sync-complete', '');
    };
    execFileMock.calls = [];

    const app = createApp({ execFile: execFileMock });
    await withServer(app, async (baseUrl) => {
      const res = await fetch(`${baseUrl}/gh-sync`, {
        method: 'POST',
        headers: {
          authorization: 'Bearer test-token',
          'content-type': 'application/json',
        },
        body: JSON.stringify({ ref: 'feature-branch' }),
      });

      assert.equal(execFileMock.calls.length, 1);
      assert.equal(execFileMock.calls[0][0], 'bash');
      assert.deepEqual(execFileMock.calls[0][1], ['scripts/sync.sh', 'feature-branch']);

      assert.equal(res.status, 200);
      const body = await res.json();
      assert.deepEqual(body, { ok: true, ref: 'feature-branch', output: 'sync-complete' });
    });
  });

  it('defaults to main ref when payload is missing and propagates script errors', async () => {
    execFileMock = (...args) => {
      execFileMock.calls.push(args);
      const callback = args[2];
      callback(new Error('boom'), '', 'script exploded');
    };
    execFileMock.calls = [];

    const app = createApp({ execFile: execFileMock });
    await withServer(app, async (baseUrl) => {
      const res = await fetch(`${baseUrl}/gh-sync`, {
        method: 'POST',
        headers: {
          authorization: 'Bearer test-token',
          'content-type': 'application/json',
        },
        body: JSON.stringify({}),
      });

      assert.equal(execFileMock.calls.length, 1);
      assert.equal(execFileMock.calls[0][0], 'bash');
      assert.deepEqual(execFileMock.calls[0][1], ['scripts/sync.sh', 'main']);

      assert.equal(res.status, 500);
      const body = await res.json();
      assert.equal(body.ok, false);
      assert.match(body.error, /script exploded/);
    });
  });
});
