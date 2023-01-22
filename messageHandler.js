const torrentParser = require("./torrentParser");
const Pieces = require('./pieceArray');
const Queue = require('./BlockQueue');
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
  function msghandler(msg, socket, torrent, bitfield){
      if (isHandshake(msg)){
        handShakeHandler(msg,socket,torrent);
      }
      else if (connected) {
    
        const parsedMsg = parse(msg);
        const queue = new Queue(torrent);
        console.log("messageId : "+ parsedMsg.id +" "+ Buffer.from(parsedMsg.payload, "utf-8"));
        switch(parsedMsg.id){
          
          case 4 : haveHandler(socket,bitfield,parsedMsg.payload);
          case 5 :  bitfieldHandler(parsedMsg.size, parsedMsg.payload, queue, socket, torrent, bitfield);
        
        }
      }
  }
  
  function bitfieldHandler(payload , queue, socket, torrent, bitfield){
    payload.forEach((byte, i) => {
      for (let j = 0; j < 8; j++) {
        if (byte % 2) {
          queue.queue(i * 8 + 7 - j);
          bitfield[i * 8 + 7 - j] = true;
        } // i*8 for specifying the byte index and 7-j for specifying the bit index in the byte in BigIndean 
        byte = Math.floor(byte / 2); //dividing by two to get to the next bit in the byte
      }
      //also byte %2 is testing the value of the current bit
    });
    
    
  }
  function haveHandler(socket, bitfield, payload) {
    const pieceIndex = payload.readUInt32BE(0);
    bitfield[pieceIndex] = true;
///    console.log("New Bitfield : " + bitfield);
  }
  function handShakeHandler(msg, socket, torrent) {
    if (Buffer.compare(torrentParser.infoHash(torrent), msg.slice(28,47))) {
         console.log("I recieved a valid handshake");
        //Send Bit field if there is
    } else {
        //If not handshake close connection (According to bit torrent protcol)
        socket.destroy();
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

 

  module.exports = {
    onWholeMsg,
    handShakeHandler,
    bitfieldHandler,
    msghandler
  }