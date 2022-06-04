[![NPM version][npm-image]][npm-url]
[![Build Status][build-image]][build-url]
[![Dependency Status][deps-image]][deps-url]

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

`cachify` function is injected in res.locals and thus can be accessed from the template code.
`cachify` and `filter` can be also retrieved by calling `await helpers()` on the initialized middleware instance

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

### `filter(patter)`

returns an array of cachified paths matching pattern


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

[npm-image]: https://img.shields.io/npm/v/connect-cachify-static
[npm-url]: https://npmjs.org/package/connect-cachify-static

[build-url]: https://github.com/pirxpilot/connect-cachify-static/actions/workflows/check.yaml
[build-image]: https://img.shields.io/github/workflow/status/pirxpilot/connect-cachify-static/check
 
[deps-image]: https://img.shields.io/librariesio/release/npm/connect-cachify-static
[deps-url]: https://libraries.io/npm/connect-cachify-static
