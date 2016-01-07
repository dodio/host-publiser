var conf = {};

module.exports = conf;


conf.error = {
	handler: function (error, req, res, next) {
        res.status(200);
        res.send(error.message || error);
    }
}


var middleware = [
    'favicon',
	"compression",
	"responseTime",
	"bodyParser",
	"cookieParser",
	"session",
	'data'
]
middleware.push("static");

middleware = middleware.concat([
	// "ral",
	"views",
	"methodOverride",
	"dispatcher"
	]);

middleware.push('notFound');
middleware.push('error');

conf.middleware = middleware;