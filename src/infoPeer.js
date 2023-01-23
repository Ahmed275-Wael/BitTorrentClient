'use strict';
const tp = require('./torrentParser');

module.exports = class {
  constructor(torrent , ip , port) {
    function buildPiecesArray() {
        const nPieces = torrent.info.pieces.length / 20;
        const arr = new Array(nPieces).fill(false);
        return arr;
    }
    this.id = ip;
    this.port = port;
    this._Pieces = buildPiecesArray();
    this.choked = false;
    this.choking = false;
    this.isInterested = false;
    this.isInteresting = false;
  }

  setChoking(){
    this.choking = true;
  }
  setChoked(){
    this.choked = true;
  }
  setUnChoked(){
    this.choked = false;
  }
  setInteresting(){
    this.isInteresting = true;
  }
  setInterested(){
    this.isInterested = true;
  }
  setNotInterested() {
    this.isInterested = false;
  }
  havePiece(pieceIndex){
    this._Pieces[pieceIndex] = true;
  }
  isChoked() {
    return this.choked;
  }
  isChoking() {
    return this.choking;
  }
};