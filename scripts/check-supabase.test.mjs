import { test } from 'node:test';
import assert from 'node:assert/strict';
import { checkSupabase } from './check-supabase.mjs';

const env = { SUPABASE_URL: 'https://example.supabase.co', SUPABASE_ANON_KEY: 'sb_publishable_test' };
test('queries the database without requesting rows or changing data', async () => {
  await checkSupabase(env, async (url, options) => {
    assert.equal(url.pathname, '/rest/v1/notes');
    assert.equal(url.searchParams.get('limit'), '0');
    assert.equal(options.method ?? 'GET', 'GET');
    assert.equal(options.redirect, 'error');
    assert.equal(options.headers.apikey, env.SUPABASE_ANON_KEY);
    return Response.json([]);
  });
});
test('rejects missing configuration, admin keys, and unsafe origins before sending requests', async () => {
  const request = () => { throw new Error('Unexpected network request'); };
  await assert.rejects(checkSupabase({}, request), /Configure/);
  await assert.rejects(checkSupabase({ ...env, SUPABASE_ANON_KEY: 'sb_secret_test' }, request), /public anon/);
  const adminJwt = `header.${Buffer.from(JSON.stringify({ role: 'service_role' })).toString('base64url')}.signature`;
  await assert.rejects(checkSupabase({ ...env, SUPABASE_ANON_KEY: adminJwt }, request), /public anon/);
  await assert.rejects(checkSupabase({ ...env, SUPABASE_URL: 'http://example.com' }, request), /HTTPS/);
});
test('fails for paused/unavailable projects, access errors, and invalid responses', async () => {
  for (const status of [401, 403, 404, 503, 540]) {
    await assert.rejects(checkSupabase(env, async () => new Response(null, { status })), new RegExp(`HTTP ${status}`));
  }
  await assert.rejects(checkSupabase(env, async () => Response.json({ error: 'unexpected' })), /unexpected response/);
});
