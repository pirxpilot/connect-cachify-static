const should = require('should');
const path = require('path');
const hashStore = require('../lib/hash-store');

/*global describe, it, before */

// $ sha256sum test/fixtures*

// 6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52B5S3beHW0s  fixtures/a.css
// d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a66jpmbuwTqzU  fixtures/texts/b.txt
// 4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7eZAtRym0n84  fixtures/texts/c.json


describe('hash store', function () {
  const root = path.resolve(__dirname, 'fixtures');

  before(async function() {
    this.store = await hashStore(root, /\.json$|\.css$/, function (p, h) {
      return h;
    });
  });

  it('finds all matching files', function () {
    this.store.getHash('/texts/c.json').should.eql('ZAtRym0n84');
    this.store.getHash('/a.css').should.eql('B5S3beHW0s');
  });

  it('finds all matching files', function () {
    this.store.getHash('/texts/c.json', true).should.have
      .property('integrity', 'sha256-TgdAhWK+24tgzgXB3s/jrRa3IjCWfeAfZAt+Rym0n84=');
    this.store.getHash('/a.css', true).should.have
      .property('integrity', 'sha256-a4ayc/80/OGda4BO/1o/V0etpOqiLx1JwB5S3beHW0s=');
  });

  it('ignores unmatched files', function () {
    should.not.exist(this.store.getHash('/texts/b.txt'));
  });

  it('ignores nonexistent files', function () {
    should.not.exist(this.store.getHash('/no/such/file'));
  });

  it('returns paths for valid hashes', function () {
    this.store.getPath('ZAtRym0n84').should.be.eql('/texts/c.json');
    this.store.getPath('B5S3beHW0s').should.be.eql('/a.css');
  });

  it('returns empty for invalid hashes', function () {
    should.not.exist(this.store.getPath('89cc14862c'));
    should.not.exist(this.store.getPath('qqqq'));
    should.not.exist(this.store.getPath());
  });

  describe('filter', function () {
    it('should match existing files', function () {
      const files = this.store.filter(f => f.endsWith('.css'));
      should.exist(files);
      files.should.have.length(1);
      files[0].should.be.eql('B5S3beHW0s');
    });

    it('should return empty array if nothing found', function () {
      const files = this.store.filter(/\.xyz$/);
      should.exist(files);
      files.should.have.length(0);
    });

    it('** should match all files', function () {
      const files = this.store.filter();
      should.exist(files);
      files.should.have.length(2);
      files[0].should.be.eql('B5S3beHW0s');
      files[1].should.be.eql('ZAtRym0n84');
    });

  });
});
