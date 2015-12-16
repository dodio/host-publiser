require('./fa-core').init();
var port = 80;
var app = require("./host").app;
app.listen(port,function() {
	console.log("listens on port : %s",port);
})
app.on("error",function(err){
	console.log(err);
})