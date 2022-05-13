const debug = require('debug')('connect:cachify-static');
const parseUrl = require('parseurl');
const onHeaders = require('on-headers');
const url = require('url');
const hashStore = require('./hash-store');

/* jshint -W027 */

const format = {
  path(path, hash) {
    return '/' + hash + path;
  },
  name(path, hash) {
    const index = path.lastIndexOf('/') + 1;
    return path.slice(0, index) + hash + '-' + path.slice(index);
  }
};

function init(root, opts = {}) {
  opts.match = opts.match || /\.(js|css|svg|eot|woff2?|ttf|cur|png|gif|jpg|webp)$/;

  if (typeof opts.format === 'string') {
    opts.format = format[opts.format];
  }
  if (typeof opts.format !== 'function') {
    opts.format = format.path;
  }

  return hashStore(root, opts.match, opts.format);
}

exports = module.exports = function (root, opts = {}) {
  const storePromise = init(root, opts);
  let store;

  return Object.assign(cachifyStatic, {
    helpers,
    locals
  });

  async function cachifyStatic(req, res, next) {
    const parsedUrl = parseUrl(req);
    if (!store) {
      store = await storePromise;
    }

    if (res.locals) {
      res.locals.cachify = store.cachify;
    }

    const path = store.getPath(parsedUrl.pathname);
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
  }

  async function locals(req, res, next) {
    if (!store) {
      store = await storePromise;
    }

    if (res.locals) {
      res.locals.cachify = store.cachify;
    }
    next();
  }

  async function helpers() {
    if (!store) {
      store = await storePromise;
    }
    return {
      cachify: store.cachify,
      filter: store.filter
    };
  }
};

exports.init = init;
