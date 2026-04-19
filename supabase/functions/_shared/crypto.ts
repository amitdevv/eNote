// AES-256-GCM helpers for encrypting user-supplied API keys at rest.
//
// The server-side key lives in Supabase secrets as `ENCRYPTION_KEY` —
// 32 bytes, base64-encoded. Generate with:
//   openssl rand -base64 32
//
// Output of encrypt() is base64(iv || ciphertext || authTag), single column.

const ALG = 'AES-GCM';
const IV_LEN = 12;

function b64encode(bytes: Uint8Array): string {
  let s = '';
  for (const b of bytes) s += String.fromCharCode(b);
  return btoa(s);
}

function b64decode(s: string): Uint8Array {
  const bin = atob(s);
  const out = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) out[i] = bin.charCodeAt(i);
  return out;
}

async function getKey(): Promise<CryptoKey> {
  const raw = Deno.env.get('ENCRYPTION_KEY');
  if (!raw) throw new Error('ENCRYPTION_KEY not set');
  const keyBytes = b64decode(raw);
  if (keyBytes.length !== 32) {
    throw new Error(`ENCRYPTION_KEY must decode to 32 bytes, got ${keyBytes.length}`);
  }
  return crypto.subtle.importKey('raw', keyBytes, ALG, false, ['encrypt', 'decrypt']);
}

export async function encrypt(plain: string): Promise<string> {
  const key = await getKey();
  const iv = crypto.getRandomValues(new Uint8Array(IV_LEN));
  const data = new TextEncoder().encode(plain);
  const ct = new Uint8Array(
    await crypto.subtle.encrypt({ name: ALG, iv }, key, data)
  );
  const combined = new Uint8Array(iv.length + ct.length);
  combined.set(iv, 0);
  combined.set(ct, iv.length);
  return b64encode(combined);
}

export async function decrypt(ciphertext: string): Promise<string> {
  const key = await getKey();
  const combined = b64decode(ciphertext);
  const iv = combined.slice(0, IV_LEN);
  const ct = combined.slice(IV_LEN);
  const pt = await crypto.subtle.decrypt({ name: ALG, iv }, key, ct);
  return new TextDecoder().decode(pt);
}
