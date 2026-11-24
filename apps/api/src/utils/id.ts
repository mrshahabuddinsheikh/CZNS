import crypto from 'crypto';

export function nanoid(length = 8): string {
  return crypto.randomBytes(Math.ceil(length)).toString('hex').slice(0, length);
}
