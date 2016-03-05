var debug = require('debug')('connect:cachify-static');
var find = require('find');
var minimatch = require('minimatch');
var calculateHash = require('./hash');


module.exports = function hashStore(root, match, formatPathFn) {
  var my = {
    hashes2paths: Object.create(null),
    paths2hashes: Object.create(null)
  };

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
      hash = formatPathFn(path, calculateHash(file));
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
