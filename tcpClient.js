var net = require('net');

var port = 80;
var host = '197.120.170.8';

var client = new net.Socket();

client.connect(port, host, () => {
    console.log('Client: Connected to Server');
    client.write("Hello TCP!");
});

client.on('data', (data) =>{
    console.log(`Client: Received ${data}`);
    client.end();
});

client.on('close', () => {
    console.log('Client: Disconnected from Server');
});
//ip.addr == 197.120.170.8