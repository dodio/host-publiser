var options = {
	// 当前server的根路径
	rootPath:__dirname ,
	// 所需要的插件列表，（会自动加载依赖插件，所以这里只填了http，中间件依赖的插件会自动加载)
	pluginList : ['http'],

	// 在rootFa中注册的 服务器实例名字，可以通过rootFa.servers() 来获取当前rootFa环境中所有的 服务器
	serverName : "Main",

	// 部署时的静态资源在 domain 中的目录 一般以项目域名运行在的域名为准
	staticDir : "/www/", //
	// 静态资源部署的域名
	staticDomain : "//asset.example.com" ,
	
	// 在服务器中虚拟主机信息
	vhost : {
		domain:"www.example.com"
	}
};

module.exports = options;