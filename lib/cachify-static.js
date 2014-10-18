var debug = require('debug')('connect:cachify-static');
var parseUrl = require('parseurl');
var onHeaders = require('on-headers');
var url = require('url');
var hashStore = require('./hash-store');

var store;

function cachify(path) {
  var hash = store.getHash(path);
  if (!hash) {
    debug('cachify called for unknown path %s', path);
    return path;
  }
  return '/' + hash + path;
}

function toHashAndPath(pathname) {
  var split, hap = {};

  pathname = pathname.slice(1);
  split = pathname.indexOf('/');
  if (split < 1) {
    hap.path = pathname;
  }
  else {
    hap.hash = pathname.slice(0, split);
    hap.path = pathname.slice(split + 1);
  }
  return hap;
}

exports = module.exports = function(root, opts) {

  opts = opts || {};
  opts.match = opts.match || /\.js$|\.css$|\.png$|\.gif$|\.jpg$/;

  store = hashStore(root, opts.match);

  return function cachifyStatic(req, res, next) {
    var parsedUrl = parseUrl(req);
    var hashAndPath = toHashAndPath(parsedUrl.pathname);

    if (res.locals) {
      res.locals.cachify = cachify;
    }

    if (!store.isHash(hashAndPath.hash)) {
      return next();
    }
    // this is where magic happens
    res.setHeader('Cache-Control', 'public, max-age=31536000');
    parsedUrl.pathname = '/' + hashAndPath.path;
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
