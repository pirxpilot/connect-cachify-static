const { test } = require('node:test');
const assert = require('node:assert/strict');

const cachifyStatic = require('..');

const connect = require('@pirxpilot/connect');
const serveStatic = require('serve-static');
const fixtures = __dirname + '/fixtures';
const request = require('./support/http');

test('cachifyStatic custom config', async function (t) {
  let app;
  let helpers;

  t.before(async function () {
    app = connect();
    const middleware = cachifyStatic(fixtures, {
      match: /\.css$|\.txt$/,
      control_headers: true,
      format: 'name'
    });

    app.use(middleware);
    app.use(serveStatic(fixtures));

    app.use(function (req, res) {
      res.statusCode = 404;
      res.end('sorry!');
    });

    helpers = await middleware.helpers();
  });

  t.afterEach(function (t, fn) {
    t.request.close(fn);
  });

  await t.test('should serve static files', function (t, done) {
    const url = helpers.cachify('/a.css');

    assert.equal(url, '/B5S3beHW0s-a.css');

    t.request = request(app).get(url).expect('1', done);
  });

  await t.test('should serve static files from directories', function (t, done) {
    const url = helpers.cachify('/texts/b.txt');

    assert.equal(url, '/texts/jpmbuwTqzU-b.txt');

    t.request = request(app).get(url).expect('2', done);
  });

  await t.test('should support integrity if needed', function (t, done) {
    const url = helpers.cachify('/texts/b.txt', true);

    assert.equal(url.path, '/texts/jpmbuwTqzU-b.txt');
    assert.equal(url.integrity, 'sha256-1HNeOiZeFu7gP1lxi5tdAwGcB9i2xR+Q2jpmbuwTqzU=');

    t.request = request(app).get(url.path).expect('2', done);
  });

  await t.test('should set cache headers', function (t, done) {
    t.request = request(app)
      .get(helpers.cachify('/a.css'))
      .expect('Cache-Control', 'public, max-age=31536000, immutable', done);
  });

  await t.test('should strip other headers', function (t, done) {
    t.request = request(app)
      .get(helpers.cachify('/a.css'))
      .end(function (res) {
        assert.ok(!('etag' in res.headers));
        done();
      });
  });

  await t.test('should not mess not cachified files', function (t, done) {
    t.request = request(app).get('/texts/b.txt').expect('2', done);
  });

  await t.test('should ignore wrong hashes', function (t, done) {
    t.request = request(app).set('Accept-Encoding', 'gzip').post('/0123456789/a.css').expect(404, done);
  });
});

test('cachifyStatic default config', async function (t) {
  let app;
  let helpers;

  t.before(async function () {
    app = connect();
    const middleware = cachifyStatic(fixtures);

    app.use(middleware);
    app.use(serveStatic(fixtures));

    app.use(function (req, res) {
      res.statusCode = 404;
      res.end('sorry!');
    });

    helpers = await middleware.helpers();
  });

  t.afterEach(function (t, fn) {
    t.request.close(fn);
  });

  await t.test('should serve static files', function (t, done) {
    const url = helpers.cachify('/a.css');

    assert.equal(url, '/B5S3beHW0s/a.css');

    t.request = request(app).get(url).expect('1', done);
  });

  await t.test('should set cache headers', function (t, done) {
    t.request = request(app)
      .get(helpers.cachify('/a.css'))
      .expect('Cache-Control', 'public, max-age=31536000, immutable', done);
  });

  await t.test('should not strip other headers', function (t, done) {
    t.request = request(app)
      .get(helpers.cachify('/a.css'))
      .end(function (res) {
        assert.ok('etag' in res.headers);
        done();
      });
  });
});
