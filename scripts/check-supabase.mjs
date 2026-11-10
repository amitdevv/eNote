// Read-only Data API probe. Requires Node 22+. No database writes or user session.
import { pathToFileURL } from 'node:url';

export async function checkSupabase(env = process.env, request = fetch) {
  const { SUPABASE_URL, SUPABASE_ANON_KEY } = env;
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Configure SUPABASE_URL and SUPABASE_ANON_KEY in repository Actions secrets.');
  }
  const url = new URL(SUPABASE_URL);
  if (url.protocol !== 'https:' || url.username || url.password || url.search || url.hash || url.pathname !== '/') {
    throw new Error('SUPABASE_URL must be an HTTPS project origin.');
  }
  // Accept only a public publishable key or a legacy anon JWT, never an admin key.
  if (!SUPABASE_ANON_KEY.startsWith('sb_publishable_')) {
    let role;
    try {
      role = JSON.parse(Buffer.from(SUPABASE_ANON_KEY.split('.')[1], 'base64url').toString()).role;
    } catch { /* Reject malformed and secret keys below. */ }
    if (role !== 'anon') throw new Error('Use a public anon/publishable key, not a service-role or secret key.');
  }
  // This reaches PostgREST/Postgres, unlike a ping to the static landing page.
  // Read one harmless sentinel; RLS stays enabled and no user tables are queried.
  const endpoint = new URL('/rest/v1/app_health?select=id,status&id=eq.1&limit=1', url);
  const response = await request(endpoint, {
    headers: { apikey: SUPABASE_ANON_KEY },
    redirect: 'error',
    signal: AbortSignal.timeout(20_000),
  });
  if (!response.ok) {
    throw new Error(`Database check failed (HTTP ${response.status}). Check project status, API key, and app_health migration and permissions.`);
  }
  const data = await response.json();
  if (!Array.isArray(data) || data.length !== 1 || data[0]?.id !== 1 || data[0]?.status !== 'ok') {
    throw new Error('Database check did not return the expected app_health sentinel. Apply the migration and check its row/policy.');
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try {
    await checkSupabase();
    console.log('Supabase database check passed. Health sentinel verified; no data changed.');
  } catch (error) {
    // Do not print request headers, URLs, or response bodies.
    console.error(error.message.startsWith('fetch') ? 'Database check could not reach Supabase.' : error.message);
    process.exitCode = 1;
  }
}
