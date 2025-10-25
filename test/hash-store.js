import assert from 'node:assert/strict';
import path from 'node:path';
import { before, describe, it } from 'node:test';
import hashStore from '../lib/hash-store.js';

// $ sha256sum test/fixtures*

// 6b86b273ff34fce19d6b804eff5a3f5747ada4eaa22f1d49c01e52B5S3beHW0s  fixtures/a.css
// d4735e3a265e16eee03f59718b9b5d03019c07d8b6c51f90da3a66jpmbuwTqzU  fixtures/texts/b.txt
// 4e07408562bedb8b60ce05c1decfe3ad16b72230967de01f640b7eZAtRym0n84  fixtures/texts/c.json

describe('hash store', () => {
  const root = path.resolve(import.meta.dirname, 'fixtures');
  let store;

  before(async () => {
    store = await hashStore(root, /\.json$|\.css$/, (_, h) => h);
  });

  it('finds all matching files', () => {
    assert.equal(store.getHash('/texts/c.json'), 'ZAtRym0n84');
    assert.equal(store.getHash('/a.css'), 'B5S3beHW0s');
  });
  it('finds all matching files', () => {
    assert.equal(store.getHash('/texts/c.json', true).integrity, 'sha256-TgdAhWK+24tgzgXB3s/jrRa3IjCWfeAfZAt+Rym0n84=');
    assert.equal(store.getHash('/a.css', true).integrity, 'sha256-a4ayc/80/OGda4BO/1o/V0etpOqiLx1JwB5S3beHW0s=');
  });

  it('ignores unmatched files', () => {
    assert.ok(!store.getHash('/texts/b.txt'));
  });

  it('ignores nonexistent files', () => {
    assert.ok(!store.getHash('/no/such/file'));
  });

  it('returns paths for valid hashes', () => {
    assert.equal(store.getPath('ZAtRym0n84'), '/texts/c.json');
    assert.equal(store.getPath('B5S3beHW0s'), '/a.css');
  });

  it('returns empty for invalid hashes', () => {
    assert.equal(store.getPath('89cc14862c'), undefined);
    assert.equal(store.getPath('qqqq'), undefined);
    assert.equal(store.getPath(), undefined);
  });

  describe('filter', () => {
    it('should match existing files', () => {
      const files = store.filter(f => f.endsWith('.css'));
      assert.ok(files);
      assert.equal(files.length, 1);
      assert.equal(files[0], 'B5S3beHW0s');
    });

    it('should return empty array if nothing found', () => {
      const files = store.filter(/\.xyz$/);
      assert.ok(files);
      assert.equal(files.length, 0);
    });

    it('should match all files', () => {
      const files = store.filter();
      assert.ok(files);
      assert.deepEqual(files.sort(), ['B5S3beHW0s', 'ZAtRym0n84']);
    });
  });

  it('finds all matching files', () => {
    assert.equal(store.getHash('/texts/c.json', true).integrity, 'sha256-TgdAhWK+24tgzgXB3s/jrRa3IjCWfeAfZAt+Rym0n84=');
    assert.equal(store.getHash('/a.css', true).integrity, 'sha256-a4ayc/80/OGda4BO/1o/V0etpOqiLx1JwB5S3beHW0s=');
  });

  it('ignores unmatched files', () => {
    assert.ok(!store.getHash('/texts/b.txt'));
  });

  it('ignores nonexistent files', () => {
    assert.ok(!store.getHash('/no/such/file'));
  });

  it('returns paths for valid hashes', () => {
    assert.equal(store.getPath('ZAtRym0n84'), '/texts/c.json');
    assert.equal(store.getPath('B5S3beHW0s'), '/a.css');
  });

  it('returns empty for invalid hashes', () => {
    assert.equal(store.getPath('89cc14862c'), undefined);
    assert.equal(store.getPath('qqqq'), undefined);
    assert.equal(store.getPath(), undefined);
  });

  describe('filter', () => {
    it('should match existing files', () => {
      const files = store.filter(f => f.endsWith('.css'));
      assert.ok(files);
      assert.deepEqual(files, ['B5S3beHW0s']);
    });

    it('should return empty array if nothing found', () => {
      const files = store.filter(/\.xyz$/);
      assert.ok(files);
      assert.equal(files.length, 0);
    });

    it('should match all files', () => {
      const files = store.filter();
      assert.ok(files);
      assert.deepEqual(files.sort(), ['B5S3beHW0s', 'ZAtRym0n84']);
    });
  });
});
