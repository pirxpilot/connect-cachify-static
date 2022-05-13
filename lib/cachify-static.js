const debug = require('debug')('connect:cachify-static');
const parseUrl = require('parseurl');
const onHeaders = require('on-headers');
const url = require('url');
const hashStore = require('./hash-store');

let store;

const format = {
  path(path, hash) {
    return '/' + hash + path;
  },
  name(path, hash) {
    const index = path.lastIndexOf('/') + 1;
    return path.slice(0, index) + hash + '-' + path.slice(index);
  }
};

function cachify(path, integrity) {
  return store.cachify(path, integrity);
}

function filter(pattern) {
  return store.filter(pattern);
}

function init(root, opts = {}) {
  opts.match = opts.match || /\.(js|css|svg|eot|woff2?|ttf|cur|png|gif|jpg|webp)$/;

  if (typeof opts.format === 'string') {
    opts.format = format[opts.format];
  }
  if (typeof opts.format !== 'function') {
    opts.format = format.path;
  }

  store = hashStore(root, opts.match, opts.format);
}

exports = module.exports = function (root, opts = {}) {
  init(root, opts);

  return function cachifyStatic(req, res, next) {
    const parsedUrl = parseUrl(req);
    const path = store.getPath(parsedUrl.pathname);

    if (res.locals) {
      res.locals.cachify = cachify;
    }

    if (!path) {
      return next();
    }
    // this is where magic happens
    res.setHeader('Cache-Control', 'public, max-age=31536000, immutable');
    parsedUrl.pathname = path;
    req.url = url.format(parsedUrl);
    debug('Updated URL: %s', req.url);

    if (opts.control_headers) {
      // strip cache related headers
      onHeaders(res, function () {
        ['ETag', 'Last-Modified'].forEach(res.removeHeader, res);
      });
    }
    next();
  };
};

exports.cachify = cachify;
exports.filter = filter;
exports.init = init;
