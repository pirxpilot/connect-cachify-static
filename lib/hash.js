const crypto = require('node:crypto');
const { readFile } = require('node:fs').promises;

module.exports = hash;

const algo = 'sha256';

async function hash(file) {
  const data = await readFile(file);
  const digest = crypto.createHash(algo).update(data).digest('base64');

  return {
    value: digest.replace(/[\W]/gm, '').slice(-10),
    integrity: algo + '-' + digest
  };
}
