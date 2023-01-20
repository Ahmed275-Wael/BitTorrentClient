var net = require('net');

var client = new net.Socket();
// 103.59.74.180 37345
client.connect(54321, '127.0.0.1', function(err) {
	console.log(err);
	console.log('Connected');
	  client.write('Hello, server! Love, Client.');
});
 
 
client.on('data', function(data) {
	console.log('Received: ' + data);
	client.destroy(); // kill client after server's response
});
client.on('error', function(err) {
	console.log(err);
	console.log("I will reject this error");
 
      return;
	 
});
client.on('close', function() {
	console.log('Connection closed');
});