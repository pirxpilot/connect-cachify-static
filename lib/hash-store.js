const readdir = require('@folder/readdir');
const debug = require('debug')('connect:cachify-static');
const calculateHash = require('./hash');

module.exports = hashStore;

async function hashStore(root, match, formatPathFn) {
  async function format(path, file) {
    const hash = await calculateHash(file);

    return {
      path: formatPathFn(path, hash.value),
      integrity: hash.integrity
    };
  }

  const my = {
    hashes2paths: Object.create(null),
    paths2hashes: Object.create(null)
  };

  debug('Calculating hashes for files in %s.', root);
  const files = await readdir(root, {
    absolute: true,
    recursive: true,
    filter: match
  });
  const tasks = files.map(async file => {
    const path = file.slice(root.length);
    const hash = await format(path, file);
    my.hashes2paths[hash.path] = path;
    my.paths2hashes[path] = hash;
  });
  await Promise.all(tasks);
  debug('Calculating hashes for %d files', Object.keys(my.paths2hashes).length);
  debug('Calculated %j', my);

  return {
    getPath,
    getHash,
    cachify,
    filter
  };

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

  function filter(match, integrity) {
    const is = makeFilter(match);
    return Object.keys(my.paths2hashes)
      .filter(is)
      .map(path => getHash(path, integrity));
  }
}

function makeFilter(value = true) {
  if (Array.isArray(value)) {
    const filters = value.map(makeFilter);
    return file => filters.some(filter => filter(file));
  }

  if (typeof value === 'function') {
    return file => value(file);
  }

  if (typeof value === 'string') {
    return file => file === value;
  }

  if (value instanceof RegExp) {
    return file => value.test(file);
  }

  if (typeof value === 'boolean') {
    return () => value;
  }
}
