var crypto = require('crypto');
var fs = require('fs');

module.exports = hash;

var algo = 'sha256';

function hash(file) {
  var data = fs.readFileSync(file);
  var digest = crypto.createHash(algo).update(data).digest('base64');

  return {
    value: digest.replace(/[\W]/gm, '').slice(-10),
    integrity: algo + '-' + digest
  };
}

