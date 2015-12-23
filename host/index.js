var fa = rootFa;
var options = require("./project");
var server = fa.createServer(options)

server.model = rootFa.module("require").module([__dirname,"model"].join("/"))

module.exports = server;
