var conf = {};

module.exports = conf;


conf.error = {
	handler: function (error, req, res, next) {
        res.status(200);
        res.send(error.message || error);
    }
}