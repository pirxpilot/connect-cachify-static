import crypto from 'node:crypto';
import { readFile } from 'node:fs/promises';

const algo = 'sha256';

export default async function hash(file) {
  const data = await readFile(file);
  const digest = crypto.createHash(algo).update(data).digest('base64');

  return {
    value: digest.replace(/[\W]/gm, '').slice(-10),
    integrity: `${algo}-${digest}`
  };
}
