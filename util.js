"use strict";
const crypto = require('crypto');

let id = null;

module.exports.genId = () => {
  if (!id) {
    id = crypto.randomBytes(20);
    Buffer.from('-EXTORRENT-').copy(id, 0);
  }
  return id;
};