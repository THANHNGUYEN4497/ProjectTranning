const _log = require("./util/log.js");
const _apiHandler = require("./module/api-handler.js");
const _webSocketHandler = require("./module/websocket-handler.js");
const _userManager = require("./module/user-manager.js");

//------------------
function start(httpPort, redisServerInfo, sslOptions) {	
	_log.writeServerLog(2,"Listenning on "+httpPort+(sslOptions == null?"":"(SSL)")+"...");
	
	_userManager.initializeRedis(redisServerInfo.host,redisServerInfo.port);

	let webServer;
	const app = require('express')();
	
	if(sslOptions == null) {
		const httpServer = require("http");
		webServer = httpServer.createServer(app);
	}
	else {
		const httpServer = require("https");
		webServer = httpServer.createServer(sslOptions,app);
	}

	_apiHandler.handle(app);
	
	webServer.listen(httpPort);
	_webSocketHandler.handle(webServer, redisServerInfo, _userManager);
}

//------------------
exports.start = start;