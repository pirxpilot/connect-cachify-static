var cachifyStatic = require('..');

var connect = require('connect');
var serveStatic = require('serve-static');
var fixtures = __dirname + '/fixtures';
var request = require('./support/http');


/* global describe, it, before */


describe('cachifyStatic custom config', function(){
  before(function() {
    var app = connect();

    app.use(cachifyStatic(fixtures, {
      match: /\.css$|\.txt$/,
      control_headers: true
    }));
    app.use(serveStatic(fixtures));

    app.use(function(req, res){
      res.statusCode = 404;
      res.end('sorry!');
    });

    this.app = app;
  });

  it('should serve static files', function(done){
    var url = cachifyStatic.cachify('/a.css');

    url.should.be.eql('/9a6f75849b/a.css');

    request(this.app)
    .get(url)
    .expect('1', done);
  });

  it('should set cache headers', function(done){
    request(this.app)
    .get(cachifyStatic.cachify('/a.css'))
    .expect('Cache-Control', 'public, max-age=31536000', done);
  });

  it('should strip other headers', function(done){
    request(this.app)
    .get(cachifyStatic.cachify('/a.css'))
    .end(function(res) {
      res.headers.should.not.have.property('etag');
      done();
    });
  });

  it('should not mess not cachified files', function(done){
    request(this.app)
    .get('/texts/b.txt')
    .expect('2', done);
  });

  it('should ignore wrong hashes', function(done){
    request(this.app)
    .set('Accept-Encoding', 'gzip')
    .post('/0123456789/a.css')
    .expect(404, done);
  });
});

describe('cachifyStatic default config', function(){
  before(function() {
    var app = connect();

    app.use(cachifyStatic(fixtures));
    app.use(serveStatic(fixtures));

    app.use(function(req, res){
      res.statusCode = 404;
      res.end('sorry!');
    });

    this.app = app;
  });

  it('should serve static files', function(done){
    var url = cachifyStatic.cachify('/a.css');

    url.should.be.eql('/9a6f75849b/a.css');

    request(this.app)
    .get(url)
    .expect('1', done);
  });

  it('should set cache headers', function(done){
    request(this.app)
    .get(cachifyStatic.cachify('/a.css'))
    .expect('Cache-Control', 'public, max-age=31536000', done);
  });

  it('should not strip other headers', function(done){
    request(this.app)
    .get(cachifyStatic.cachify('/a.css'))
    .end(function(res) {
      res.headers.should.have.property('etag');
      done();
    });
  });

});