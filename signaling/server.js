console.log("-------------------------------"); 
console.log("/* VSWebRTC Signaling Server */");
console.log("-------------------------------");

const _vsWebRTCServer = require("./vswebrtc/vswebrtc-server.js");
const _environment = require("./environments/environment.js");

_vsWebRTCServer.setLimitRoomSize(process.argv[3] || 100);
_vsWebRTCServer.setMaxRoomPerUser(process.argv[4] || 2);

if (_environment.configuration.SSL) {
  const _fs = require('fs');
  const sslOptions = {
    key: _fs.readFileSync(_environment.configuration.SSL_KEY),
    cert: _fs.readFileSync(_environment.configuration.SSL_CERT)
  };
  _vsWebRTCServer.start(process.argv[2] || _environment.configuration.PORT, _environment.configuration.REDIS_SERVER, sslOptions);
} else {
  _vsWebRTCServer.start(process.argv[2] || _environment.configuration.PORT, _environment.configuration.REDIS_SERVER, null);
}