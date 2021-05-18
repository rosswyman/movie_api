const http = require('http'),
	url = require('url'),
	fs = require('fs');

http
	.createServer((request, response) => {
		let addr = request.url,
			q = url.parse(addr, true),
			filePath = '';

		fs.appendFile(
			'log.txt',
			'URL: ' + addr + '\nTimestamp: ' + new Date() + '\n\n',
			(err) => {
				if (err) {
					console.log(err);
				} else {
					console.log('Added to log.');
				}
			}
		);

		if (q.pathname.includes('documentation')) {
			filePath = __dirname + '/public/documentation.html';
			console.log('URL has documentation in name.');
			console.log(filePath);
		} else {
			filePath = 'index.html';
			console.log('URL does not have documentation in name.');
			console.log(filePath);
		}

		fs.readFile(filePath, (err, data) => {
			if (err) {
				throw err;
			}

			response.writeHead(200, { 'Content-Type': 'text/plain' });
			response.write(data);
			response.end();
		});
	})
	.listen(8080);

console.log('My first Node test server is running on Port 8080.');
