import { scryptSync, timingSafeEqual } from 'node:crypto';

/** Verifies a plaintext password against a `salt:hash` digest from the seed dataset. */
export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(':');
  if (!salt || !hash) return false;

  const hashBuffer = Buffer.from(hash, 'hex');
  const candidateBuffer = scryptSync(password, salt, hashBuffer.length);

  return (
    hashBuffer.length === candidateBuffer.length &&
    timingSafeEqual(hashBuffer, candidateBuffer)
  );
}
