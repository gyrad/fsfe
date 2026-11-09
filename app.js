const http = require('http');

const PORT = 3000;

http.createServer(function (req, res) {
	res.write('Full stack bwa');
	res.end();
}).listen(PORT);

console.log(`Server started on port ${PORT}`);
