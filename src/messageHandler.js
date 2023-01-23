const torrentParser = require("./torrentParser");
const Pieces = require('./pieceArray');
const requestHandler = require("./req.js");
let connected = 0;
function onWholeMsg(socket, callback) {
    console.log("I Recieved a message")
    let savedBuf = Buffer.alloc(0);
    let handshake = true; 
    socket.on('data', recvBuf => {
      // msgLen calculates the length of a whole message
      const msgLen = () => handshake ? savedBuf.readUInt8(0) + 49 : savedBuf.readInt32BE(0) + 4;
      savedBuf = Buffer.concat([savedBuf, recvBuf]);
  
      while (savedBuf.length >= 4 && savedBuf.length >= msgLen()) {
        callback(savedBuf.slice(0, msgLen()));
        savedBuf = savedBuf.slice(msgLen());
        handshake = false;
      }
    });
  }
  function msghandler(msg, socket, torrent, infoPeer, queue, pieces){
      if (isHandshake(msg)){
       let isValid =  handShakeHandler(msg,socket,torrent);
       if (isValid) {
        socket.write(requestHandler.buildInterested());
       }
      }
      else if (connected) {
    
        const parsedMsg = parse(msg);
       
     console.log("messageId : "+ parsedMsg.id );
        switch(parsedMsg.id){
          case 0 : chokeHandler(infoPeer);
          break;
          case 1: unchokeHandler(socket,infoPeer ,queue, pieces);
          break;
          case 2: interestedHandler(infoPeer);
          break;
          case 3: notIntersetedHandler(infoPeer);
          break;
          case 4 : haveHandler(socket,parsedMsg.payload, queue, infoPeer, pieces);
          break;
          case 5 :  bitfieldHandler(parsedMsg.payload, queue, socket, torrent, infoPeer, pieces);
          break;
        
        }
      }
  }
  
  function bitfieldHandler(payload , queue, socket, torrent, infoPeer, pieces) {
    const queueEmpty = queue.length === 0;
    payload.forEach((byte, i) => {
      for (let j = 0; j < 8; j++) {
        if (byte % 2) {
          queue.queue(i * 8 + 7 - j);
          // bitfield[i * 8 + 7 - j] = true;
        } // i*8 for specifying the byte index and 7-j for specifying the bit index in the byte in BigIndean 
        byte = Math.floor(byte / 2); //dividing by two to get to the next bit in the byte
      }
      //also byte %2 is testing the value of the current bit
    });
    if (queueEmpty) requestPiece(socket, pieces, queue, infoPeer);
    
  }
  function haveHandler(socket, payload, queue, infoPeer, pieces) {
    console.log("payload " + payload);
 
    const pieceIndex = payload.readUInt32BE(0);
    const queueEmpty = queue.length === 0;
    queue.queue(pieceIndex);
    if (queueEmpty) requestPiece(socket, pieces, queue, infoPeer);
  }
  function chokeHandler(infoPeer) {
    infoPeer.setChocked();
 
  }
  function unchokeHandler(socket,infoPeer ,queue, pieces) {
    infoPeer.setUnChoked();
      requestPiece(socket, pieces, queue, infoPeer);
  }
  function interestedHandler(infoPeer) {
        infoPeer.setInterested();
  }
  function notIntersetedHandler(infoPeer) {
    infoPeer.setNotInterested();
}
  function handShakeHandler(msg, socket, torrent) {
    if (Buffer.compare(torrentParser.infoHash(torrent), msg.slice(28,47))) {
         console.log("I recieved a valid handshake");
         return 1;
        //Send Bit field if there is
    } else {
        //If not handshake close connection (According to bit torrent protcol)
        socket.destroy();
        return 0;
    }
  }

function isHandshake(msg) {
    //console.log("im the msg");
    //console.log(msg);
    connected = 1;
  
    return msg.length === msg.readUInt8(0) + 49 &&
           msg.toString('utf8', 1, 20) === 'BitTorrent protocol' 
         ;
          
  }
  function parse (msg) {
    const id = msg.length > 4 ? msg.readInt8(4) : null;
    let payload = msg.length > 5 ? msg.slice(5) : null;
    if (id === 6 || id === 7 || id === 8) {
      const rest = payload.slice(8);
      payload = {
        index: payload.readInt32BE(0),
        begin: payload.readInt32BE(4)
      };
      payload[id === 7 ? 'block' : 'length'] = rest;
    }
  
    return {
      size : msg.readInt32BE(0),
      id : id,
      payload : payload
    }
  };

  function requestPiece(socket, pieces, queue, infoPeer) {
    console.log("i will request pieces....");
    if (infoPeer.isChoked()) return null;
  
    while (queue.length()) {
      const pieceBlock = queue.deque();
      if (pieces.needed(pieceBlock)) {
        socket.write(requestHandler.buildRequest(pieceBlock));
        pieces.addRequested(pieceBlock);
        break;
      }
    }
  }

  module.exports = {
    onWholeMsg,
    handShakeHandler,
    bitfieldHandler,
    msghandler
  }