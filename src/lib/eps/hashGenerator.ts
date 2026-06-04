import crypto from 'crypto';

export function generateHash(key: string, data: string): string {
  const hmac = crypto.createHmac('sha512', key);
  hmac.update(data, 'utf8');
  return hmac.digest('base64');
}
