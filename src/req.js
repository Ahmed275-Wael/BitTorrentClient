const crypto = require("crypto");
const util = require("./util");
const torrentParser = require("./torrentParser");
exports.buildAnnounceReq = function (connId, torrent, port=6881) {
    const buf = Buffer.allocUnsafe(98);
    /*
    Offset  Size    Name    Value
    0       64-bit integer  connection_id
    8       32-bit integer  action          1 // announce
    12      32-bit integer  transaction_id
    16      20-byte string  info_hash
    36      20-byte string  peer_id
    56      64-bit integer  downloaded
    64      64-bit integer  left (how many bits i need which is 100% so i get size of the files)
    72      64-bit integer  uploaded
    80      32-bit integer  event           0 // 0: none; 1: completed; 2: started; 3: stopped
    84      32-bit integer  IP address      0 // default
    88      32-bit integer  key
    92      32-bit integer  num_want        -1 // default
    96      16-bit integer  port
    98
   */
    // connection id
    connId.copy(buf, 0);
    // action
    buf.writeUInt32BE(1, 8);
    // transaction id
    crypto.randomBytes(4).copy(buf, 12);
    // info hash
    torrentParser.infoHash(torrent).copy(buf, 16);
    // peerId
    util.genId().copy(buf, 36);
    // downloaded
    Buffer.alloc(8).copy(buf, 56);
    // left
    const buffer64Bits = Buffer.alloc(8)
    buffer64Bits.writeBigUInt64BE(BigInt(torrentParser.size(torrent)),0);
    buffer64Bits.copy(buf, 64);
   
    // uploaded
    Buffer.alloc(8).copy(buf, 72);
    // event
    buf.writeUInt32BE(0, 80);
    // ip address
    buf.writeUInt32BE(0, 80);
    // key
    crypto.randomBytes(4).copy(buf, 88);
    // num want
    buf.writeInt32BE(-1, 92);
    // port
    buf.writeUInt16BE(port, 96);
  
    return buf;
}

exports.bulidConnectRequest = function () {
    /*
Offset  Size            Name            Value
0       64-bit integer  protocol_id     0x41727101980 // magic constant
8       32-bit integer  action          0 // connect
12      32-bit integer  transaction_id //random one
*/
const protocol_id = Buffer.from("0000041727101980", 'hex');
 const action = Buffer.from("00000000", 'hex');
 const transaction_id = Buffer.from("11111111", 'hex'); 
 const finalData = Buffer.concat([protocol_id, action, transaction_id]);
return finalData;
}

exports.bulidHandShake = function (torrent) {
    //handshake: <pstrlen><pstr><reserved><info_hash><peer_id>
    /*
    pstrlen => 1 byte
    pstr = 19 byte
    reserver => 8 bytes
    */
    const buf = Buffer.alloc(68);

    buf.writeUInt32LE(19,0);
    buf.write('BitTorrent protocol', 1);
    //pstr is 19 byte length
    buf.writeUInt32BE(0, 20); //all zeros 
    buf.writeUInt32BE(0, 24);

    torrentParser.infoHash(torrent).copy(buf, 28);
  
    //infoHash is the hash of the sha hash of the pieces in the metainfo file used to uniquely identify the file
    util.genId().copy(buf, 48); //peerid which is fixed across the client from where it starts ;)
    return buf;
  


}


module.exports.buildKeepAlive = () => Buffer.alloc(4);

module.exports.buildChoke = () => {
  const buf = Buffer.alloc(5);
  // length
  buf.writeUInt32BE(1, 0);
  // id
  buf.writeUInt8(0, 4);
  return buf;
};

module.exports.buildUnchoke = () => {
  const buf = Buffer.alloc(5);
  // length
  buf.writeUInt32BE(1, 0);
  // id
  buf.writeUInt8(1, 4);
  return buf;
};

module.exports.buildInterested = () => {
  const buf = Buffer.alloc(5);
  // length
  buf.writeUInt32BE(1, 0);
  // id
  buf.writeUInt8(2, 4);
  return buf;
};

module.exports.buildUninterested = () => {
  const buf = Buffer.alloc(5);
  // length
  buf.writeUInt32BE(1, 0);
  // id
  buf.writeUInt8(3, 4);
  return buf;
};

module.exports.buildHave = payload => {
  const buf = Buffer.alloc(9);
  // length
  buf.writeUInt32BE(5, 0);
  // id
  buf.writeUInt8(4, 4);
  // piece index
  buf.writeUInt32BE(payload, 5);
  return buf;
};

module.exports.buildBitfield = bitfield => {
  const buf = Buffer.alloc(14);
  // length
  buf.writeUInt32BE(payload.length + 1, 0);
  // id
  buf.writeUInt8(5, 4);
  // bitfield
  bitfield.copy(buf, 5);
  return buf;
};

module.exports.buildRequest = payload => {
  const buf = Buffer.alloc(17);
  // length
  buf.writeUInt32BE(13, 0);
  // id
  buf.writeUInt8(6, 4);
  // piece index
  buf.writeUInt32BE(payload.index, 5);
  // begin
  buf.writeUInt32BE(payload.begin, 9);
  // length
  buf.writeUInt32BE(payload.length, 13);
  return buf;
};

module.exports.buildPiece = payload => {
  const buf = Buffer.alloc(payload.block.length + 13);
  // length
  buf.writeUInt32BE(payload.block.length + 9, 0);
  // id
  buf.writeUInt8(7, 4);
  // piece index
  buf.writeUInt32BE(payload.index, 5);
  // begin
  buf.writeUInt32BE(payload.begin, 9);
  // block
  payload.block.copy(buf, 13);
  return buf;
};

module.exports.buildCancel = payload => {
  const buf = Buffer.alloc(17);
  // length
  buf.writeUInt32BE(13, 0);
  // id
  buf.writeUInt8(8, 4);
  // piece index
  buf.writeUInt32BE(payload.index, 5);
  // begin
  buf.writeUInt32BE(payload.begin, 9);
  // length
  buf.writeUInt32BE(payload.length, 13);
  return buf;
};

module.exports.buildPort = payload => {
  const buf = Buffer.alloc(7);
  // length
  buf.writeUInt32BE(3, 0);
  // id
  buf.writeUInt8(9, 4);
  // listen-port
  buf.writeUInt16BE(payload, 5);
  return buf;
};
