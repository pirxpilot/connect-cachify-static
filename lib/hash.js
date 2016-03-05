var crypto = require('crypto');
var fs = require('fs');

module.exports = hash;

// using last 10 characters of MD5 hash is arbitrary - any pseudo uniqe number would do
function hash(file) {
  var data = fs.readFileSync(file);
  var md5 = crypto.createHash('md5');
  md5.update(data);
  return md5.digest('hex').slice(-10);
}

