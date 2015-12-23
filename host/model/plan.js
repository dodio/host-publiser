var fs = require("fs");
var plan = module.exports;
var data_dir = [Host.options.rootPath,"data"].join("/");
var nodeFile = [data_dir,"nodes.json"].join("/");
var _ = require("lodash");
plan.getAll = function() {
	return fs.readFileAsync(nodeFile)
		.then(JSON.parse)
}

plan.resolveFile = function(node){
	return [data_dir,'hosts', node.filename ].join("/");
}

plan.get = function(pid){
	//没有则返回空
	if(!pid){
		return Promise.resolve();
	}
	return this.getAll().then(function(plans){
		return find(pid,plans);
	})

}

plan.getWithContent = function(pid){
	if(!pid){
		return Promise.resolve();
	}
	return this.get(pid)

	.then(function(plan){
		if(!plan){
			return 
		}
		plan.realFile = [data_dir,'hosts', plan.filename ].join("/");
		
		try{
			plan.content = fs.readFileSync(plan.realFile).toString();
		}catch(e){
			plan.content = "#没有内容"
		}
		return plan;
	});
}

plan.del = function(pid){
	if(!pid){
		return Promise.reject("缺少pid");
	}
	return this.get(pid)
	.then(function(node){
		if(!node){
			return Promise.reject("没有找到相应的方案");
		}
		if(node.nodes && node.nodes.length){
			return Promise.reject("该方案还有子方案，请先删除子方案");
		}
		return plan.getAll()
		.then(bakeUpPlans)
		.then(function(plans){
			var parentNodeList = getParent(node,plans);
			_.remove(parentNodeList,function(v){
				return v.id === node.id;
			})

			var realFile = [data_dir,'hosts', node.filename ].join("/");
			var data = JSON.stringify(plans);
			return Promise.all(
				[fs.unlinkAsync(realFile),
				fs.writeFileAsync(nodeFile,data)]
				)

		})
		.then(function(){
			// 返回被删除的方案
			return node;
		})
	})
}
//在pid下增加一个新的发版方案
plan.add = function(pid){
	return this.getAll()
	// 备份plans
	.then(bakeUpPlans)
	.then(function(plans){
		var plan = find(pid,plans);
		var parent;
		if(plan){
			parent = plan.nodes = plans.nodes || [];
		}else{
			parent = plans;
		}
		
		var file = Date.now();
		var node = {
			text : "新增方案",
			id : file,
			filename : file+".txt"
		}
		parent.push(node);
		var realFile = [data_dir,'hosts', node.filename ].join("/");
		var tmpContent = fs.readFileSync([data_dir, "template.txt" ].join("/")).toString();

		var data = JSON.stringify(plans);
		return Promise.all(
			[fs.writeFileAsync(realFile,tmpContent),
			fs.writeFileAsync(nodeFile,data)]
			)
		.then(function(){
			return node;
		})
	});
}
plan.save = function(pid,text,content){

	return this.getAll()
	.then(bakeUpPlans)
	.then(function(plans){
		plan = find(pid,plans);
		plan.text = text || plan.text;
		var realFile =  [data_dir,'hosts', plan.filename ].join("/");
		var data = JSON.stringify(plans);
	    return Promise.all(
	    	[fs.writeFileAsync(realFile,content),
	    	fs.writeFileAsync(nodeFile,data)]
	    );
	})

}


function find(pid,plans){

	var plan;
	function _find(plans){
		if(plan){
			return;
		}
		if(!plans){
			return ;
		}
		_.each(plans,function(v,i){
			if(v.id == pid){
				plan = v;
			}
			if(v.nodes){
				_find(v.nodes);
			}
		});
	}
	_find(plans);
	return plan;
}

function getParent(node,nodes){
	var parent ;
	_.each(nodes,function(v,i){
		if(v.id === node.id){
			parent = nodes;
		}
	})

	if(!parent){
		_.each(nodes,function(v,i){
			if(parent){
				return;
			}
			if(v.nodes){
				parent = getParent(node,v.nodes);
			}
		})
	}
	return parent;
}

function bakeUpPlans(plans){
	var data = JSON.stringify(plans);
	return fs.writeFileAsync(nodeFile+".bak",data)
	.then(function(){
		return Promise.resolve(plans);
	})
}