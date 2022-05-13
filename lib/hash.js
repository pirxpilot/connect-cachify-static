const crypto = require('crypto');
const { readFileSync } = require('fs');

module.exports = hash;

const algo = 'sha256';

function hash(file) {
  const data = readFileSync(file);
  const digest = crypto.createHash(algo).update(data).digest('base64');

  return {
    value: digest.replace(/[\W]/gm, '').slice(-10),
    integrity: algo + '-' + digest
  };
}
