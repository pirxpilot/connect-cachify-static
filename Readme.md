[![Build Status](https://img.shields.io/travis/pirxpilot/connect-cachify-static.svg)](http://travis-ci.org/pirxpilot/connect-cachify-static)
[![Dependency Status](https://img.shields.io/gemnasium/pirxpilot/connect-cachify-static.svg)](https://gemnasium.com/pirxpilot/connect-cachify-static)
[![NPM version](https://img.shields.io/npm/v/connect-cachify-static.svg)](http://badge.fury.io/js/connect-cachify-static)

# connect-cachify-static

static (simpler and faster) variant of [connect-cachify][] middleware

Adds `Cache-Control: max-age=31536000` header to all requests with 'cachified' prefix. Prefix is
based on the file content and calculated for all files during application startup (which means that
it won't handle dynamically generated files).

If you reference cachifieable resources from CSS files you probably also want to use [postcss-cachify].

## Installation

    $ npm install connect-cachify-static

## Options

- `match` - regular expression that determines which files in `root` will be cachified, if omitted
  the usual suspects are included `.js`, `.css`, `.png`, `.jpg`, and `.gif`
- `control_headers` - if truthy, the middleware will strip `ETag` and `Last-Modified` headers from the
  response
- `format` - function that creates cachified version of the URL - allowed values are `'path'`, `'name'`,
  or the function that takes `path` and `hash` and creates cachified version of the file URL

## API

### `cachify(path, integrity)`

- `path` - URL of the resource to be cachified
- `integrity` - optional - if truthy cachify will generate a tuple `{ path, integrity }`, which can
be used to format `<script>` and `<link>` elements with [subresource integrity][sri] support

It should be called when generating HTML, CSS etc., in order to create a 'cachified' URL for the
resource. `cachify` will replace `/path/to/the/file` with cachified version incorporating reasonably unique `{prefix}` generated based on the file content.

The specific format of the cachified version depends on the `format` parameter:

- `path` *default*

    `/path/to/the/file` -> `/{prefix}/path/to/the/file`

- `name`

    `/path/to/the/file` -> `/path/to/the/{prefix}- file`

You can also pass a format function:

````javascript
// this is how default format is implemented
function format(path, prefix) {
  return '/' + prefix + path;
}

````


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

  //- scripts with SRI support
  - var c = cachify('/script/main.js', true)
  script(src=c.path, integrity=c.integrity, crossorigin='anonymous', defer)

```
If you use cachify with [express][] the `cachify` method is added to `res.locals` and thus available
directly in the views.

### `filter(wildcard)`

returns an array of cachified paths - uses [minimatch] to check which paths are matching the `wildcard`


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
[connect-cachify]: https://www.npmjs.com/package/connect-cachify
[express]: http://expressjs.com
[postcss-cachify]: https://www.npmjs.com/package/postcss-cachify
[minimatch]: https://www.npmjs.com/package/minimatch
[sri]: https://developer.mozilla.org/en-US/docs/Web/Security/Subresource_Integrity
