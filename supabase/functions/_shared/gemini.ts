// Thin Gemini client — only what we use (embeddings for now).
// https://ai.google.dev/gemini-api/docs/embeddings

const BASE = 'https://generativelanguage.googleapis.com/v1beta';
// gemini-embedding-001 is the stable production embedding model on v1beta.
// It supports outputDimensionality up to 3072; we request 768 to match the
// vector(768) column on notes. If we ever bump, change both sides together.
export const EMBED_MODEL = 'gemini-embedding-001';
export const EMBED_DIM = 768;

// Task-type hints tell Gemini how the embedding will be used. Passing the
// right one dramatically improves retrieval quality — asymmetric search (a
// short query against long documents) expects RETRIEVAL_QUERY for the query
// side and RETRIEVAL_DOCUMENT for the corpus side. Skipping them lumps
// everything into a general-purpose space where related and unrelated
// documents score within ~5pts of each other.
export type EmbedTaskType =
  | 'RETRIEVAL_QUERY'
  | 'RETRIEVAL_DOCUMENT'
  | 'SEMANTIC_SIMILARITY';

export class GeminiError extends Error {
  constructor(public status: number, message: string) {
    super(message);
  }
}

export async function embedText(
  apiKey: string,
  text: string,
  taskType?: EmbedTaskType,
): Promise<number[]> {
  // Gemini has an 8k-token limit for embeddings. Truncate on character count
  // as a rough proxy (1 token ≈ 4 chars). Over-truncation is harmless here —
  // we're embedding gist, not full content.
  const trimmed = text.length > 30_000 ? text.slice(0, 30_000) : text;

  const body: Record<string, unknown> = {
    model: `models/${EMBED_MODEL}`,
    content: { parts: [{ text: trimmed }] },
    outputDimensionality: EMBED_DIM,
  };
  if (taskType) body.taskType = taskType;

  const res = await fetch(
    `${BASE}/models/${EMBED_MODEL}:embedContent?key=${encodeURIComponent(apiKey)}`,
    {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify(body),
    }
  );

  if (!res.ok) {
    const body = await res.text().catch(() => '');
    throw new GeminiError(res.status, `Gemini embed failed (${res.status}): ${body.slice(0, 200)}`);
  }

  const data = await res.json();
  const values = data?.embedding?.values;
  if (!Array.isArray(values) || values.length !== EMBED_DIM) {
    throw new GeminiError(
      500,
      `Unexpected embedding response shape (got ${Array.isArray(values) ? values.length : typeof values} dims)`
    );
  }
  return values;
}

export async function validateKey(apiKey: string): Promise<boolean> {
  // Validate by making a tiny embed call. Cheaper than a generate call.
  try {
    await embedText(apiKey, 'ping');
    return true;
  } catch (e) {
    if (e instanceof GeminiError) {
      // 400/401/403 = Google rejected the key itself.
      if (e.status === 400 || e.status === 401 || e.status === 403) return false;
      // 429 = rate-limited or quota exhausted. The key is still VALID —
      // Google just won't serve us right now. Accepting it lets the user
      // connect and come back tomorrow instead of being stuck.
      if (e.status === 429) return true;
    }
    throw e;
  }
}
