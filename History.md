
1.5.1 / 2017-02-18
==================

 * transfer repo to pirxpilot

1.5.0 / 2017-01-30
==================

 * add 'immutable' cache directive

1.4.2 / 2016-12-24
==================

 * add .webp to the default list of cachified extentions

1.4.1 / 2016-03-09
==================

 * fix `cachify` result for unknown paths when integrity param set

1.4.0 / 2016-03-05
==================

 * add support for integrity parameter in cachify
 * switch to sha256 algo to generate digest

1.3.0 / 2015-10-29
==================

 * add support for configuring cachified format
 * simplify cachified name resolution

1.2.0 / 2015-09-29
==================

 * update mocha and should
 * add `filter` method

1.1.3 / 2015-03-19
==================

 * add reference to postcss-cachify to Readme

1.1.2 / 2015-03-12
==================

 * fix: works correctly when no options are passed

1.1.1 / 2015-03-12
==================

 * update default list of matched extensions

1.1.0 / 2015-03-09
==================

 * export `init` function

1.0.0 / 2014-10-18
==================

 * update deps: debug (0 -> 2) and should (1 -> 4)
 * stop relying on a 'headers' event from response
 * switch travis to node 0.10
 * shieldify badges in Readme

0.2.0 / 2014-05-12
==================

 * remove direct 'connect' dependency

0.1.1 / 2014-05-10
==================

 * treat res.locals as object
 * typos in Readme

0.1.0 / 2013-09-17 
==================

 * Initial implementation of connect-cachify-simple
