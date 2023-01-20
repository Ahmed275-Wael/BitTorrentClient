const responseHandler = require("./res.js")
const requestHandler = require("./req.js");
const torrentParser = require("./torrentParser");

const Buffer = require('buffer').Buffer;

function getPeers(url, callBack) {
 
    const dgram = require('dgram');
    const socket = dgram.createSocket('udp4');
    socket.on('err', console.log);
    //Connect Messsage 
  
    const connectRequestBody = requestHandler.bulidConnectRequest();
    console.log("Buliding Connection With the Tracker Server");
    socket.send(connectRequestBody, 0, connectRequestBody.length, url.port, url.hostname, (err) => {
        if (err) {
        console.log(err);
        }
    });

    socket.on('message', msg => {
        //Check Response Type
        // console.log(msg);
        //Check That The Response Txn Idea is the same one as you randomly choose it 
        if (responseHandler.getResponseType(msg) == 'connect') {
            const respObj = responseHandler.parseConnectResponse(msg);
            const requestBufferObj = requestHandler.buildAnnounceReq(respObj.connectionId, torrentParser.torrent);
            //Send Announce Request
            console.log("Send Announcing Request");
            socket.send(requestBufferObj, 0, requestBufferObj.length, url.port, url.hostname, (err) => {
                //     console.log(respObj);
                console.log("Announcing message Sent..");
            });
        } else if (responseHandler.getResponseType(msg) == 'announce') {
            const obj = responseHandler.parseAnnounceResp(msg);
            console.log("Announce Response Recieved");
            callBack(obj.peers, torrentParser.torrent);

        }

    });


    //socket.on('data', console.log);

}
exports.getPeers = getPeers;