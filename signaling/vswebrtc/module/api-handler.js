function handle(app) {
	app.get('/', function(req, res) {
		res.send("Signaling API");
	});
}

//----------      
exports.handle = handle;