const net = require('net');
const requestHandler = require("./req.js");
const messageHandler = require("./messageHandler.js");
 
function handlePeer(peers, torrent) {
    
        peers.map(peer=> {
            download(peer, torrent);
        })
}

function download(peer,torrent) {
    console.log(peer);
    const client = new net.Socket();
    client.connect(peer.port, peer.ip, () => {
            console.log("Connected");
          //validating peer_id
          client.write(requestHandler.bulidHandShake(torrent));
    });

        client.on("error", (err) => {
        console.log(err);
          
        return;
       });
       bitfield = [];
      //Check if it is handShake 
     messageHandler.onWholeMsg(client, msg => messageHandler.msghandler(msg, client, torrent, bitfield));

      client.on('end', () => {
        console.log('disconnected from server');
      });
      
    
}

 
exports.handlePeer = handlePeer;