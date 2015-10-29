var debug = require('debug')('connect:cachify-static');
var fs = require('fs');
var find = require('find');
var crypto = require('crypto');
var minimatch = require('minimatch');


module.exports = function hashStore(root, match, formatPathFn) {
  var my = {
    hashes2paths: Object.create(null),
    paths2hashes: Object.create(null)
  };

  // using last 10 characters of MD5 hash is arbitrary - any pseudo uniqe number would do
  function calculate(file) {
    var md5 = crypto.createHash('md5');
    var data = fs.readFileSync(file);
    md5.update(data);
    return md5.digest('hex').slice(-10);
  }

  function getPath(hash) {
    return hash && my.hashes2paths[hash];
  }

  function getHash(path) {
    return my.paths2hashes[path];
  }

  function cachify(path) {
    var hash = getHash(path);
    if (!hash) {
      debug('cachify called for unknown path %s', path);
      return path;
    }
    return hash;
  }

  function filter(pattern) {
    return Object.keys(my.paths2hashes)
      .filter(minimatch.filter(pattern))
      .map(function(path) {
        return my.paths2hashes[path];
      });
  }

  debug('Calculating hashes for files in %s.', root);
  find.fileSync(match, root).forEach(function(file) {
    var
      path = file.slice(root.length),
      hash = formatPathFn(path, calculate(file));
    my.hashes2paths[hash] = path;
    my.paths2hashes[path] = hash;
  });
  debug('Calculating hashes for %d files', Object.keys(my.paths2hashes).length);
  debug('Calculated %j', my);

  return {
    getPath: getPath,
    getHash: getHash,
    cachify: cachify,
    filter: filter
  };
};
