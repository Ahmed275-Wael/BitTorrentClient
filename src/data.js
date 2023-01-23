 
 
const Buffer = require('buffer').Buffer;
const torrentParser = require("./torrentParser");
 
 
const buffer = Buffer.alloc(16); 
/*
Offset  Size            Name            Value
0       64-bit integer  protocol_id     0x41727101980 // magic constant
8       32-bit integer  action          0 // connect
12      32-bit integer  transaction_id //random one
*/
const data = Buffer.from("0000041727101980", 'hex');
 const data2 = Buffer.from("00000000", 'hex');
 const data3 = Buffer.from("11111111", 'hex'); 
 const finalData = Buffer.concat([data, data2, data3]);
module.exports = {url, finalData};