var should = require('should');
var path = require('path');
var hashStore = require('../lib/hash-store');

/*global describe, it */

// $ sha256sum test/fixtures*

// 6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52ddb7875b4b  fixtures/a.css
// d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a666eec13ab35  fixtures/texts/b.txt
// 4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7e4729b49fce  fixtures/texts/c.json


describe('hash store', function() {
  var root = path.join(__dirname, 'fixtures');
  var store = hashStore(root, /\.json$|\.css$/, function(p, h) {
    return h;
  });

  it('finds all matching files', function() {
    store.getHash('/texts/c.json').should.eql('4729b49fce');
    store.getHash('/a.css').should.eql('ddb7875b4b');
  });

  it('ignores unmatched files', function() {
    should.not.exist(store.getHash('/texts/b.txt'));
  });

  it('ignores nonexistent files', function() {
    should.not.exist(store.getHash('/no/such/file'));
  });

  it('returns paths for valid hashes', function() {
    store.getPath('4729b49fce').should.be.eql('/texts/c.json');
    store.getPath('ddb7875b4b').should.be.eql('/a.css');
  });

  it('returns empty for invalid hashes', function() {
    should.not.exist(store.getPath('89cc14862c'));
    should.not.exist(store.getPath('qqqq'));
    should.not.exist(store.getPath());
  });

  describe('filter', function() {
    it('should match existing files', function() {
      var files = store.filter('/*.css');
      should.exist(files);
      files.should.have.length(1);
      files[0].should.be.eql('ddb7875b4b');
    });

    it('should return empty array if nothing found', function() {
      var files = store.filter('*.xyz');
      should.exist(files);
      files.should.have.length(0);
    });

    it('** should match all files', function() {
      var files = store.filter('**/*');
      should.exist(files);
      files.should.have.length(2);
      files[0].should.be.eql('ddb7875b4b');
      files[1].should.be.eql('4729b49fce');
    });

  });
});
