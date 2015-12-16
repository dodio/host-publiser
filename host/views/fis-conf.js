var fs = require("fs");
fis.set("project.ignore",[ 'node_modules/**', "/favicon.ico" ,"/fis-conf.js" , "/**/*.tpl"])
var prod = fis.media("prod");

var outputDir = "../output";
var projectInfo = require("../project");


// 发布到 output文件夹中,并加上md5戳
var local_dilvery = [fis.plugin('local-deliver', {
      to: outputDir
  	})];

fis.match("*",{
	deploy: local_dilvery,
  	useHash:true
});

// 将views下的js视作seajs 模块
fis.match("*.js",{ 
  isMod: true
})
fis.hook('cmd', {
  // "baseUrl" : "views/js"
  paths:{
    "/" : "/"
  }
})

// 默认发布到static（供本地访问）
fis.match("*",{
  release : "/static/$0"
})

// 将mapjson 信息输出到mapJson.build.js中 供插件使用
fis.match("mapJson.js",{
	deploy: fis.plugin('local-deliver', {
      to : "../conf/"
  	}),
  	release : "mapJson.build.js",
  	useHash : false,
    isMod : false
})




// 编译less
fis.match("**.less",{
  parser: fis.plugin('less',{
    paths:[ [__dirname,"views"].join("/") ]
  }),
  rExt:"css"
});

// inc/lib 内的 less 不编译, 不发布
fis.match("/styles/{inc,lib}/**.{less,css}",{
  parser : null,
  release : false
})

// 将编译信息写入前端config.js
fis.match("/js/config.js",{
  isMod : false,
	deploy : replacer([
        {
            from: '__STATIC_DOMAIN__',
            to: ""
        },{
        	from: '__STATIC_DIR__',
        	to:"/static/"
        }
    ]).concat(local_dilvery)
})

prod.match("/js/config.js",{
	deploy : replacer([
        {
            from: '__STATIC_DOMAIN__',
            to: projectInfo.staticDomain
        },
        {
            from: '__STATIC_DIR__',
            to: projectInfo.staticDir
        }
    ]).concat(local_dilvery)
})


// 产品发布到 domain + 目录下
prod.match("!mapJson.js",{
	domain : projectInfo.staticDomain,
	release : projectInfo.staticDir + "$0"
})

// 产品模式压缩css
prod.match("*.{less,css}",{
	optimizer:fis.plugin('clean-css')
})
// 产品模式压缩js
prod.match("*.js",{
	optimizer:fis.plugin("uglify-js")
})
// 产品打包
prod.match("::package",{
	postpackager: fis.plugin('loader')
});

prod.match("!(styles)/!(lib/**).less",{
	packTo:projectInfo.staticDir + "/pkg/aio.css"
});

console.log("开始清理结果目录:%s",outputDir);
clean(outputDir);
function clean(folder){
	if(!fs.existsSync(folder)){
		return;
	}
	var stat  = fs.statSync(folder);
	if(stat.isFile()){
		fs.unlinkSync(folder);
		return;
	}
	var sub_files = fs.readdirSync(folder);
	if(sub_files.length === 0 ){
		fs.rmdirSync(folder);
		return;
	}
	sub_files.forEach(function(sub){
		clean(folder+"/"+sub);
	});
}



function replacer(opt) {
    if (!Array.isArray(opt)) {
        opt = [opt];
    }
    var r = [];
    opt.forEach(function (raw) {
    	// console.log(raw);
        r.push(fis.plugin('replace', raw));
    });
    return r;
};