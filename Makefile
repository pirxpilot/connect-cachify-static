check: lint test

lint:
	./node_modules/.bin/jshint *.js lib bin/* test

test:
	./node_modules/.bin/mocha --exit --recursive

.PHONY: check lint test
