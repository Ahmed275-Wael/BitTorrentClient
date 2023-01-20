/*
This Files Used To Extract Data From Torrent File
*/
 

const fs = require("fs");
const bencode = require('bencode');
const file = fs.readFileSync("KELLYTV-MOCKINGBIRDBYEMINEM234_archive.torrent"); 
const torrent = bencode.decode(file);
const crypto = require('crypto');
exports.getTrackerUrl = function () {
    return torrent.announce.toString('utf8');
}

exports.infoHash = function (torrent) {
    const info = bencode.encode(torrent.info);
    return crypto.createHash('sha1').update(info).digest();
  
}
console.log(this.infoHash(torrent))
exports.size = function (torrent) {
    const size = torrent.info.files ?
    torrent.info.files.map(file => file.length).reduce((a, b) => a + b) :
    torrent.info.length;

    return size;
}


exports.piecesLen = (torrent, pieceIndex) => {
    const totalLength = bignum.fromBuffer(this.size(torrent)).toNumber();
    const pieceLength = torrent.info['piece length'];
  
    const lastPieceLength = totalLength % pieceLength;
    const lastPieceIndex = Math.floor(totalLength / pieceLength);
  
    return lastPieceIndex === pieceIndex ? lastPieceLength : pieceLength;
  };
  
exports.blocksPerPiece = (torrent, pieceIndex) => {
    const pieceLength = this.pieceLen(torrent, pieceIndex);
    return Math.ceil(pieceLength / this.BLOCK_LEN);
  };
  
exports.blockLen = (torrent, pieceIndex, blockIndex) => {
    const pieceLength = this.pieceLen(torrent, pieceIndex);
  
    const lastPieceLength = pieceLength % this.BLOCK_LEN;
    const lastPieceIndex = Math.floor(pieceLength / this.BLOCK_LEN);
  
    return blockIndex === lastPieceIndex ? lastPieceLength : this.BLOCK_LEN;
  };

exports.torrent = torrent;