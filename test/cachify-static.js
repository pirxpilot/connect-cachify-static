var cachifyStatic = require('..');

var connect = require('connect');
var fixtures = __dirname + '/fixtures';
var app = connect();

/* global describe, it */


app.use(cachifyStatic(fixtures, {
  match: /\.css$|\.txt$/,
  control_headers: true
}));
app.use(connect.static(fixtures));

app.use(function(req, res){
  res.statusCode = 404;
  res.end('sorry!');
});

describe('cachifyStatic', function(){
  it('should serve static files', function(done){
    var url = cachifyStatic.cachify('/a.css');

    url.should.be.eql('/9a6f75849b/a.css');

    app.request()
    .get(url)
    .expect('1', done);
  });

  it('should set cache headers', function(done){
    app.request()
    .get(cachifyStatic.cachify('/a.css'))
    .expect('Cache-Control', 'public, max-age=31536000', done);
  });

  it('should strip other headers', function(done){
    app.request()
    .get(cachifyStatic.cachify('/a.css'))
    .end(function(res) {
      res.headers.should.not.have.property('etag');
      done();
    });
  });

  it('should not mess not cachified files', function(done){
    app.request()
    .get('/texts/b.txt')
    .expect('2', done);
  });

  it('should ignore wrong hashes', function(done){
    app.request()
    .set('Accept-Encoding', 'gzip')
    .post('/0123456789/a.css')
    .expect(404, done);
  });
});
