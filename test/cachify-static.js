const cachifyStatic = require('..');

const connect = require('connect');
const serveStatic = require('serve-static');
const fixtures = __dirname + '/fixtures';
const request = require('./support/http');


/* global describe, it, before */


describe('cachifyStatic custom config', function () {
  before(async function () {
    const app = connect();
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

    this.app = app;
    Object.assign(this, await middleware.helpers());
  });

  it('should serve static files', function (done) {
    const url = this.cachify('/a.css');

    url.should.be.eql('/B5S3beHW0s-a.css');

    request(this.app)
      .get(url)
      .expect('1', done);
  });

  it('should serve static files from directories', function (done) {
    const url = this.cachify('/texts/b.txt');

    url.should.be.eql('/texts/jpmbuwTqzU-b.txt');

    request(this.app)
      .get(url)
      .expect('2', done);
  });

  it('should support integrity if needed', function (done) {
    const url = this.cachify('/texts/b.txt', true);

    url.should.have.property('path', '/texts/jpmbuwTqzU-b.txt');
    url.should.have.property('integrity', 'sha256-1HNeOiZeFu7gP1lxi5tdAwGcB9i2xR+Q2jpmbuwTqzU=');

    request(this.app)
      .get(url.path)
      .expect('2', done);
  });

  it('should set cache headers', function (done) {
    request(this.app)
      .get(this.cachify('/a.css'))
      .expect('Cache-Control', 'public, max-age=31536000, immutable', done);
  });

  it('should strip other headers', function (done) {
    request(this.app)
      .get(this.cachify('/a.css'))
      .end(function (res) {
        res.headers.should.not.have.property('etag');
        done();
      });
  });

  it('should not mess not cachified files', function (done) {
    request(this.app)
      .get('/texts/b.txt')
      .expect('2', done);
  });

  it('should ignore wrong hashes', function (done) {
    request(this.app)
      .set('Accept-Encoding', 'gzip')
      .post('/0123456789/a.css')
      .expect(404, done);
  });
});

describe('cachifyStatic default config', function () {
  before(async function () {
    const app = connect();
    const middleware = cachifyStatic(fixtures);

    app.use(middleware);
    app.use(serveStatic(fixtures));

    app.use(function (req, res) {
      res.statusCode = 404;
      res.end('sorry!');
    });

    this.app = app;
    Object.assign(this, await middleware.helpers());
  });

  it('should serve static files', function (done) {
    const url = this.cachify('/a.css');

    url.should.be.eql('/B5S3beHW0s/a.css');

    request(this.app)
      .get(url)
      .expect('1', done);
  });

  it('should set cache headers', function (done) {
    request(this.app)
      .get(this.cachify('/a.css'))
      .expect('Cache-Control', 'public, max-age=31536000, immutable', done);
  });

  it('should not strip other headers', function (done) {
    request(this.app)
      .get(this.cachify('/a.css'))
      .end(function (res) {
        res.headers.should.have.property('etag');
        done();
      });
  });

});
