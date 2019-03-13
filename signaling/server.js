console.log("-------------------------------");
console.log("/* Abelon Signaling Server */");
console.log("-------------------------------");

const _abelonSignalingServer = require("./abelon-signaling/abelon-signaling-server.js");
const _environment = require("./environments/environment.js");

if (_environment.configuration.SSL) {
  const _fs = require('fs');
  const sslOptions = {
    key: _fs.readFileSync(_environment.configuration.SSL_KEY),
    cert: _fs.readFileSync(_environment.configuration.SSL_CERT)
  };
  _abelonSignalingServer.start(process.argv[2] || _environment.configuration.PORT, _environment.configuration.REDIS_SERVER, sslOptions);
} else {
  _abelonSignalingServer.start(process.argv[2] || _environment.configuration.PORT, _environment.configuration.REDIS_SERVER, null);
}