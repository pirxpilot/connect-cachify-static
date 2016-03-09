var debug = require('debug')('connect:cachify-static');
var find = require('find');
var minimatch = require('minimatch');
var calculateHash = require('./hash');

// switch off  'Do not use String as a constructor'
/* jshint -W053 */

module.exports = function hashStore(root, match, formatPathFn) {
  var my = {
    hashes2paths: Object.create(null),
    paths2hashes: Object.create(null)
  };

  function format(path, file) {
    var hash = calculateHash(file);

    return {
      path: formatPathFn(path, hash.value),
      integrity: hash.integrity
    };
  }

  function getPath(hash) {
    return hash && my.hashes2paths[hash];
  }

  function getHash(path, integrity) {
    var v = my.paths2hashes[path];
    if (v) {
      return integrity ? v : v.path;
    }
  }

  function cachify(path, integrity) {
    var hash = getHash(path, integrity);
    if (!hash) {
      debug('cachify called for unknown path %s', path);
      return integrity ? { path: path } : path;
    }
    return hash;
  }

  function filter(pattern, integrity) {
    return Object.keys(my.paths2hashes)
      .filter(minimatch.filter(pattern))
      .map(function(path) {
        return getHash(path, integrity);
      });
  }

  debug('Calculating hashes for files in %s.', root);
  find.fileSync(match, root).forEach(function(file) {
    var
      path = file.slice(root.length),
      hash = format(path, file);
    my.hashes2paths[hash.path] = path;
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
