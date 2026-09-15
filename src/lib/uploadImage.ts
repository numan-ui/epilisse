/** Uploads a File to Supabase Storage via /api/upload-image and returns its public URL. Throws with a user-facing German message on failure. */
export async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append('file', file);
  const res = await fetch('/api/upload-image', { method: 'POST', body });
  const data = await res.json().catch(() => null);
  if (!res.ok || !data?.url) {
    throw new Error(data?.error ?? 'Upload fehlgeschlagen.');
  }
  return data.url as string;
}
