const torrentParser = require("./torrentParser");
const urlParse = require('url').parse;
const trackerUrl = urlParse(torrentParser.getTrackerUrl());
console.log("Loading");
const trackerHandler = require("./tracker.js");
const peerHandler = require("./peer.js");
 
//getPeers(url,callBack(list of Peers))
let peers = trackerHandler.getPeers(trackerUrl,peerHandler.handlePeer);
 