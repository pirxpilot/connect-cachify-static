[![Build Status](https://img.shields.io/travis/code42day/connect-cachify-static.svg)](http://travis-ci.org/code42day/connect-cachify-static)
[![Dependency Status](https://img.shields.io/gemnasium/code42day/connect-cachify-static.svg)](https://gemnasium.com/code42day/connect-cachify-static)
[![NPM version](https://img.shields.io/npm/v/connect-cachify-static.svg)](http://badge.fury.io/js/connect-cachify-static)

# connect-cachify-static

static (simpler and faster) variant of [connect-cachify][] middleware

Adds `Cache-Control: max-age=31536000` header to all requests with 'cachified' prefix. Prefix is
based on the file content and calculated for all files during application startup (which means that
it won't handle dynamically generated files).


## Installation

    $ npm install connect-cachify-static

## Options

- `match` - regular expression that determines which files in `root` will be cachified, if omitted
  the usual suspects are included `.js`, `.css`, `.png`, `.jpg`, and `.gif`
- `control_headers` - if truthy, the middleware will strip `ETag` and `Last-Modified` headers from the
  response

## API

### `cachify(path)`

`path` URL of the resource to be cachified

It should be called when generating HTML, CSS etc., in order to create a 'cachified' URL for the
resource. `cachify` will replace `/path/to/the/file` with `/{prefix}/path/to/the/file` where `{prefix}`
is a reasonably unique identifier generated based on the file content.

Since using `cachify` will make the browsers to cache the resource for approximately 1 year we need
to bust the cache whenever the resource content changes.

```jade
head
  //- styles
  link(rel="stylesheet", href=cachify('/css/style.css'), media="screen")
  link(rel="stylesheet", href=cachify('/css/print.css'), media="print")
body
  // can be used to pass cachified URLs to client scripts
  #info(data-icon=cachify('/img/icon.png'))
  //- scripts
  script(src=cachify('/script/main.js'), defer)
```

If you use cachify with [express][] the `cachify` method is added to `res.locals` and thus available
directly in the views.

## Usage

```javascript
var connect = require('connect');
var cachifyStatic = require('connect-cachify-static');

connect()
  .use(cachifyStatic(__dirname + '/public'), {
    match: /\.js$/ // only javascript files
  })
// need static to actually serve the file
connect()
  .use(connect.static(__dirname + '/public'))
```

# License

MIT

[connect]: http://www.senchalabs.org/connect
[connect-cachify]: https://npmjs.org/package/connect-cachify
[express]: http://expressjs.com
