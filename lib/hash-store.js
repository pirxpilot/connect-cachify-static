var debug = require('debug')('connect:cachify-static');
var fs = require('fs');
var find = require('find');
var crypto = require('crypto');

module.exports = function hashStore(root, match) {
  var my = {
    hashes: Object.create(null),
    paths2hashes: Object.create(null)
  };

  // using last 10 characters of MD5 hash is arbitrary - any pseudo uniqe number would do
  function calculate(path) {
    var md5 = crypto.createHash('md5');
    var data = fs.readFileSync(path);
    md5.update(data);
    return md5.digest('hex').slice(-10);
  }

  function isHash(hash) {
    return hash && my.hashes[hash];
  }

  function getHash(path) {
    path = path.slice(1); // strip leading '/'
    return my.paths2hashes[path];
  }

  debug('Calculating hashes for files in %s.', root);
  find.fileSync(match, root).forEach(function(file) {
    var hash = calculate(file);
    my.hashes[hash] = true;
    my.paths2hashes[file.slice(root.length + 1)] = hash;
  });
  debug('Calculating hashes for %d files', Object.keys(my.paths2hashes).length);

  return {
    isHash: isHash,
    getHash: getHash
  };
};
