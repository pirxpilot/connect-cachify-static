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
		return ['/', h, p].join('');
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

	it('properly determines if hash is valid', function() {
		store.isHash('d9f2a7baf3').should.be.eql(true);
		store.isHash('9a6f75849b').should.be.eql(true);

		should.not.exist(store.isHash('89cc14862c'));
		should.not.exist(store.isHash('qqqq'));
		should.not.exist(store.isHash());
	});

	describe('filter', function() {
		it('should match existing files', function() {
			var files = store.filter('/*.css');
			should.exist(files);
			files.should.have.length(1);
			files[0].should.be.eql('/9a6f75849b/a.css');
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
			files[0].should.be.eql('/9a6f75849b/a.css');
			files[1].should.be.eql('/d9f2a7baf3/texts/c.json');
		});

	});
});