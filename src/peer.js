const net = require('net');
const requestHandler = require("./req.js");
const messageHandler = require("./messageHandler.js");
const InfoPeer = require("./infoPeer");
const Queue = require('./BlockQueue');
function handlePeer(peers, torrent) {
        let infoPeers = [];
        peers.map(peer=> {
            const infoPeer = new InfoPeer(torrent,peer.ip,peer.port);
   
            
            infoPeers.push(infoPeer);
            download(peer, torrent, infoPeer);
        })
}

function download(peer,torrent,infoPeer) {
  const queue = new Queue(torrent);
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
      //This would be replaced by infoPeer (where we push the port and ip of that peer)
      //Check if it is handShake 
     messageHandler.onWholeMsg(client, msg => messageHandler.msghandler(msg, client, torrent, infoPeer, queue));

      client.on('end', () => {
        console.log('disconnected from server');
      });
      
    
}

 
exports.handlePeer = handlePeer;