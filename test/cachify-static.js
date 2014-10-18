var cachifyStatic = require('..');

var connect = require('connect');
var serveStatic = require('serve-static');
var fixtures = __dirname + '/fixtures';
var request = require('./support/http');

var app = connect();

/* global describe, it */


app.use(cachifyStatic(fixtures, {
  match: /\.css$|\.txt$/,
  control_headers: true
}));
app.use(serveStatic(fixtures));

app.use(function(req, res){
  res.statusCode = 404;
  res.end('sorry!');
});

describe('cachifyStatic', function(){
  it('should serve static files', function(done){
    var url = cachifyStatic.cachify('/a.css');

    url.should.be.eql('/9a6f75849b/a.css');

    request(app)
    .get(url)
    .expect('1', done);
  });

  it('should set cache headers', function(done){
    request(app)
    .get(cachifyStatic.cachify('/a.css'))
    .expect('Cache-Control', 'public, max-age=31536000', done);
  });

  it('should strip other headers', function(done){
    request(app)
    .get(cachifyStatic.cachify('/a.css'))
    .end(function(res) {
      res.headers.should.not.have.property('etag');
      done();
    });
  });

  it('should not mess not cachified files', function(done){
    request(app)
    .get('/texts/b.txt')
    .expect('2', done);
  });

  it('should ignore wrong hashes', function(done){
    request(app)
    .set('Accept-Encoding', 'gzip')
    .post('/0123456789/a.css')
    .expect(404, done);
  });
});
