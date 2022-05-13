const debug = require('debug')('connect:cachify-static');
const find = require('find');
const minimatch = require('minimatch');
const calculateHash = require('./hash');

// switch off  'Do not use String as a constructor'
/* jshint -W053 */

module.exports = function hashStore(root, match, formatPathFn) {
  const my = {
    hashes2paths: Object.create(null),
    paths2hashes: Object.create(null)
  };

  function format(path, file) {
    const hash = calculateHash(file);

    return {
      path: formatPathFn(path, hash.value),
      integrity: hash.integrity
    };
  }

  function getPath(hash) {
    return hash && my.hashes2paths[hash];
  }

  function getHash(path, integrity) {
    const v = my.paths2hashes[path];
    if (v) {
      return integrity ? v : v.path;
    }
  }

  function cachify(path, integrity) {
    const hash = getHash(path, integrity);
    if (!hash) {
      debug('cachify called for unknown path %s', path);
      return integrity ? { path } : path;
    }
    return hash;
  }

  function filter(pattern, integrity) {
    return Object.keys(my.paths2hashes)
      .filter(minimatch.filter(pattern))
      .map(function (path) {
        return getHash(path, integrity);
      });
  }

  debug('Calculating hashes for files in %s.', root);
  find.fileSync(match, root).forEach(function (file) {
    const path = file.slice(root.length);
    const hash = format(path, file);
    my.hashes2paths[hash.path] = path;
    my.paths2hashes[path] = hash;
  });
  debug('Calculating hashes for %d files', Object.keys(my.paths2hashes).length);
  debug('Calculated %j', my);

  return {
    getPath,
    getHash,
    cachify,
    filter
  };
};
