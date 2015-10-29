var debug = require('debug')('connect:cachify-static');
var parseUrl = require('parseurl');
var onHeaders = require('on-headers');
var url = require('url');
var hashStore = require('./hash-store');

var store;

function formatPath(path, hash) {
  return '/' + hash + path;
}

function cachify(path) {
  return store.cachify(path);
}

function filter(pattern) {
  return store.filter(pattern);
}

function init(root, opts) {
  opts = opts || {};
  opts.match = opts.match || /\.(js|css|svg|eot|woff|ttf|cur|png|gif|jpg)$/;

  store = hashStore(root, opts.match, formatPath);
}

exports = module.exports = function(root, opts) {
  opts = opts || {};
  init(root, opts);

  return function cachifyStatic(req, res, next) {
    var parsedUrl = parseUrl(req);
    var path = store.getPath(parsedUrl.pathname);

    if (res.locals) {
      res.locals.cachify = cachify;
    }

    if (!path) {
      return next();
    }
    // this is where magic happens
    res.setHeader('Cache-Control', 'public, max-age=31536000');
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
