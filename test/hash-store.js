var should = require('should');
var path = require('path');
var hashStore = require('../lib/hash-store');

/*global describe, it */

// 6d7fce9fee471194aa8b5b d9f2a7baf3  fixtures/texts/c.json
// b026324c6904b2a9cb4b88 9a6f75849b  fixtures/a.css

// 26ab0db90d72e28ad0ba1e 89cc14862c  fixtures/texts/b.txt

describe('hash store', function() {
	var root = path.join(__dirname, 'fixtures');
	var store = hashStore(root, /\.json$|\.css$/, function(p, h) {
		return h;
	});

	it('finds all matching files', function() {
		store.getHash('/texts/c.json').should.eql('d9f2a7baf3');
		store.getHash('/a.css').should.eql('9a6f75849b');
	});

	it('ignores unmatched files', function() {
		should.not.exist(store.getHash('/texts/b.txt'));
	});

	it('ignores nonexistent files', function() {
		should.not.exist(store.getHash('/no/such/file'));
	});

	it('returns paths for valid hashes', function() {
		store.getPath('d9f2a7baf3').should.be.eql('/texts/c.json');
		store.getPath('9a6f75849b').should.be.eql('/a.css');
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
			files[0].should.be.eql('9a6f75849b');
		});

		it('should return empty array if nothing found', function() {
			var files = store.filter('*.xyz');
			should.exist(files);
			files.should.have.length(0);
		});

		it('**/* should match all files', function() {
			var files = store.filter('**/*');
			should.exist(files);
			files.should.have.length(2);
			files[0].should.be.eql('9a6f75849b');
			files[1].should.be.eql('d9f2a7baf3');
		});

	});
});