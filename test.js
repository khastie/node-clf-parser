var util = require('util');

var tap = require('tap');

var parse = require('./index');

tap.test('Parsing an example apache log line (POST).', function (t) {

	var parsed = parse('23.216.10.46 "True-Client-IP:68.107.113.217" "AppVersion:r20142.5.3-2" - - [16/Feb/2015:00:00:59 -0500] "POST /professional/results.expandedbasicsearchbox.searchform HTTP/1.1" 302 - "http://search.proquest.com/professional/results/14AF63AF7F82E6D949B/1?accountid=143640" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.111 Safari/537.36" 0 27101 "B11C7741AD4D912824D00709D1329159-m8.t1" "-"');

	t.equal(parsed.ip, '23.216.10.46', 'should have an ip address');
	t.equal(parsed.trueIp, '68.107.113.217', 'should have an ip address');
	t.equal(parsed.appVersion, '20142.5.3-2', 'should have an app version');
	//t.equal(parsed.remoteUser, 'frank', 'should have a user');
	t.type(parsed.timeLocal, Date, 'should have a date');
	t.equal(parsed.request, undefined, "should drop request from object");
	t.equal(parsed.method, 'POST', 'should have a method');
	t.equal(parsed.path, '/results.expandedbasicsearchbox.searchform', 'should have a path');
	t.equal(parsed.protocol, 'HTTP/1.1', 'should have a protocol');
	t.equal(parsed.method, 'POST', 'should have an http method');
	t.equal(parsed.status, 302, 'should have a status code');
	t.equal(parsed.bodyBytesSent, null, 'should have nothing for bytes sent');
	t.equal(parsed.referrer, 'http://search.proquest.com/professional/results/14AF63AF7F82E6D949B/1?accountid=143640', 'should have a referer');
	t.equal(parsed.userAgent, 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.111 Safari/537.36', 'should have a user agent');
	t.equal(parsed.duration, 0, 'should have a request served in');
	t.equal(parsed.jsessionid, 'B11C7741AD4D912824D00709D1329159-m8.t1', 'should have a jsessionid');
	t.equal(parsed.accountId, '143640', 'should have an accountid');

	//
	// Check timezone consistency of parser by constructing a line with the current local time so we can predict what ought to happen
	//
	// Note: Sign in standard string representations is REVERSED from sign in JavaScript:
	// http://stackoverflow.com/questions/1091372/getting-the-clients-timezone-in-javascript/1091399#1091399
	//
	var now = new Date(),
		months = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' '),
		sign = now.getTimezoneOffset() > 0 ? '-' : '+',
		abs = Math.abs(now.getTimezoneOffset()),
		line;
	line = util.format(
		'23.216.10.46 "True-Client-IP:68.107.113.217" "AppVersion:r20142.5.3-2" - - [%s/%s/%s:%s:%s:%s %s%s%s] "POST /professional/results.expandedbasicsearchbox.searchform HTTP/1.1" 302 - "http://search.proquest.com/professional/results/14AF63AF7F82E6D949B/1?accountid=143640" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.111 Safari/537.36" 0 27101 "B11C7741AD4D912824D00709D1329159-m8.t1" "-"',
		pad(now.getDate(), 2),
		months[now.getMonth()],
		now.getFullYear(),
		pad(now.getHours(), 2),
		pad(now.getMinutes(), 2),
		pad(now.getSeconds(), 2),
		sign,
		pad(Math.floor(abs / 60), 2),
		pad(abs % 60, 2)
	);
	parsed = parse(line);

	//
	// Milliseconds are not represented in the log format, so round them off
	//

	 t.equal(
		 Math.floor(parsed.timeLocal.getTime() / 1000.0),
		 Math.floor(now.getTime() / 1000.0),
		 'Dates and timezones are parsed correctly!'
	 );

	t.end();
});

tap.test('\nParsing an example apache log line (GET).', function (t) {

	var parsed = parse('209.170.118.196 "True-Client-IP:68.107.113.217" "AppVersion:r20142.5.3-2" - - [16/Feb/2015:00:01:00 -0500] "GET /professional/results/14AF644048532808682/1?accountid=143640 HTTP/1.1" 200 28840 "http://search.proquest.com/professional/results/14AF63AF7F82E6D949B/1?accountid=143640" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.111 Safari/537.36" 5 27466 "B11C7741AD4D912824D00709D1329159-m8.t1" "-"');

	t.type(parsed.timeLocal, Date, 'should have a date');
	t.equal(parsed.method, 'GET', 'should have a method');
	t.equal(parsed.path, '/results/14AF644048532808682/1?accountid=143640', 'should have a path');
	t.equal(parsed.protocol, 'HTTP/1.1', 'should have a protocol');
	t.equal(parsed.method, 'GET', 'should have an http method');
	t.equal(parsed.status, 200, 'should have a status code');
	t.equal(parsed.bodyBytesSent, 28840, 'should have bytes sent');
	t.equal(parsed.duration, 5, 'should have a request served in');

	var now = new Date(),
		months = 'Jan Feb Mar Apr May Jun Jul Aug Sep Oct Nov Dec'.split(' '),
		sign = now.getTimezoneOffset() > 0 ? '-' : '+',
		abs = Math.abs(now.getTimezoneOffset()),
		line;
	line = util.format(
		'23.216.10.46 "True-Client-IP:68.107.113.217" "AppVersion:r20142.5.3-2" - - [%s/%s/%s:%s:%s:%s %s%s%s] "POST /professional/results.expandedbasicsearchbox.searchform HTTP/1.1" 302 - "http://search.proquest.com/professional/results/14AF63AF7F82E6D949B/1?accountid=143640" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.111 Safari/537.36" 0 27101 "B11C7741AD4D912824D00709D1329159-m8.t1" "-"',
		pad(now.getDate(), 2),
		months[now.getMonth()],
		now.getFullYear(),
		pad(now.getHours(), 2),
		pad(now.getMinutes(), 2),
		pad(now.getSeconds(), 2),
		sign,
		pad(Math.floor(abs / 60), 2),
		pad(abs % 60, 2)
	);
	parsed = parse(line);

	//
	// Milliseconds are not represented in the log format, so round them off
	//
	 t.equal(
		 Math.floor(parsed.timeLocal.getTime() / 1000.0),
		 Math.floor(now.getTime() / 1000.0),
		 'Dates and timezones should parse correctly'
	 );

	t.end();
});

tap.test('\nTesting accountId determination', function(t) {

	var parsed = parse('209.170.118.196 "True-Client-IP:68.107.113.217" "AppVersion:r20142.5.3-2" - - [16/Feb/2015:00:01:00 -0500] "GET /professional/results/14AF644048532808682/1?accountid=1234 HTTP/1.1" 200 28840 "http://search.proquest.com/professional/results/14AF63AF7F82E6D949B/1?accountid=9876" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.111 Safari/537.36" 5 27466 "B11C7741AD4D912824D00709D1329159-m8.t1" "-"'	);
	t.equal(parsed.accountId, '1234', 'Account ID should be taken from the request when available, instead of referrer.');

	parsed = parse('209.170.118.196 "True-Client-IP:68.107.113.217" "AppVersion:r20142.5.3-2" - - [16/Feb/2015:00:01:00 -0500] "GET /professional/results/14AF644048532808682/1 HTTP/1.1" 200 28840 "http://search.proquest.com/professional/results/14AF63AF7F82E6D949B/1" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.111 Safari/537.36" 5 27466 "B11C7741AD4D912824D00709D1329159-m8.t1" "-"'	);
	t.equal(parsed.accountId, null, 'Account ID can be null.');

	parsed = parse('209.170.118.196 "True-Client-IP:68.107.113.217" "AppVersion:r20142.5.3-2" - - [16/Feb/2015:00:01:00 -0500] "GET /professional/results/14AF644048532808682/1 HTTP/1.1" 200 28840 "http://search.proquest.com/professional/results/14AF63AF7F82E6D949B/1?accountid=9876" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.111 Safari/537.36" 5 27466 "B11C7741AD4D912824D00709D1329159-m8.t1" "-"'	);
	t.equal(parsed.accountId, '9876', 'Account ID should be taken from the referrer when it is not found on the request.');

	parsed = parse('209.170.118.196 "True-Client-IP:68.107.113.217" "AppVersion:r20142.5.3-2" - - [16/Feb/2015:00:01:00 -0500] "GET /professional/results/14AF644048532808682/1?AccountID=1234 HTTP/1.1" 200 28840 "http://search.proquest.com/professional/results/14AF63AF7F82E6D949B/1" "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_7_5) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/40.0.2214.111 Safari/537.36" 5 27466 "B11C7741AD4D912824D00709D1329159-m8.t1" "-"'	);
	t.equal(parsed.accountId, '1234', 'Account ID should be case insensitive.');

	t.end();
});

function pad(s, n) {
	s = s.toString();
	while (s.length < n) {
		s = '0' + s;
	}
	return s;
}
