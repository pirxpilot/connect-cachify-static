import assert from 'node:assert/strict';
import { test } from 'node:test';
import connect from '@pirxpilot/connect';
import serveStatic from 'serve-static';
import cachifyStatic from '../lib/cachify-static.js';
import request from './support/http.js';

const fixtures = `${import.meta.dirname}/fixtures`;

test('cachifyStatic custom config', async t => {
  let app;
  let helpers;

  t.before(async () => {
    app = connect();
    const middleware = cachifyStatic(fixtures, {
      match: /\.css$|\.txt$/,
      control_headers: true,
      format: 'name'
    });

    app.use(middleware);
    app.use(serveStatic(fixtures));

    app.use((_req, res) => {
      res.statusCode = 404;
      res.end('sorry!');
    });

    helpers = await middleware.helpers();
  });

  t.afterEach((t, fn) => {
    t.request.close(fn);
  });

  await t.test('should serve static files', (t, done) => {
    const url = helpers.cachify('/a.css');

    assert.equal(url, '/B5S3beHW0s-a.css');

    t.request = request(app).get(url).expect('1', done);
  });

  await t.test('should serve static files from directories', (t, done) => {
    const url = helpers.cachify('/texts/b.txt');

    assert.equal(url, '/texts/jpmbuwTqzU-b.txt');

    t.request = request(app).get(url).expect('2', done);
  });

  await t.test('should support integrity if needed', (t, done) => {
    const url = helpers.cachify('/texts/b.txt', true);

    assert.equal(url.path, '/texts/jpmbuwTqzU-b.txt');
    assert.equal(url.integrity, 'sha256-1HNeOiZeFu7gP1lxi5tdAwGcB9i2xR+Q2jpmbuwTqzU=');

    t.request = request(app).get(url.path).expect('2', done);
  });

  await t.test('should set cache headers', (t, done) => {
    t.request = request(app)
      .get(helpers.cachify('/a.css'))
      .expect('Cache-Control', 'public, max-age=31536000, immutable', done);
  });

  await t.test('should strip other headers', (t, done) => {
    t.request = request(app)
      .get(helpers.cachify('/a.css'))
      .end(res => {
        assert.ok(!('etag' in res.headers));
        done();
      });
  });

  await t.test('should not mess not cachified files', (t, done) => {
    t.request = request(app).get('/texts/b.txt').expect('2', done);
  });

  await t.test('should ignore wrong hashes', (t, done) => {
    t.request = request(app).set('Accept-Encoding', 'gzip').post('/0123456789/a.css').expect(404, done);
  });
});

test('cachifyStatic default config', async t => {
  let app;
  let helpers;

  t.before(async () => {
    app = connect();
    const middleware = cachifyStatic(fixtures);

    app.use(middleware);
    app.use(serveStatic(fixtures));

    app.use((_req, res) => {
      res.statusCode = 404;
      res.end('sorry!');
    });

    helpers = await middleware.helpers();
  });

  t.afterEach((t, fn) => {
    t.request.close(fn);
  });

  await t.test('should serve static files', (t, done) => {
    const url = helpers.cachify('/a.css');

    assert.equal(url, '/B5S3beHW0s/a.css');

    t.request = request(app).get(url).expect('1', done);
  });

  await t.test('should set cache headers', (t, done) => {
    t.request = request(app)
      .get(helpers.cachify('/a.css'))
      .expect('Cache-Control', 'public, max-age=31536000, immutable', done);
  });

  await t.test('should not strip other headers', (t, done) => {
    t.request = request(app)
      .get(helpers.cachify('/a.css'))
      .end(res => {
        assert.ok('etag' in res.headers);
        done();
      });
  });
});
