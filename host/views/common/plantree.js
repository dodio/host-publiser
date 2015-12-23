/**
 * 模块  
 * 依赖  xx,xx,xx
 * @return {[type]}             [description]
 */
define(function(require, exports, module){
	"use strict";
 	var $ = require("jquery");
 	require("js/sb-admin/tree/bootstrap-treeview");
 	var cache = require("js/cache");

 	var prePid = R.config("prePid");
 	var nodes = cache.api(function(){
 		return $.get("/nodes");
 	});

	return {
		load :function(ele){
			var def = $.Deferred();
			nodes().then(function(nodes){
				var a = $(ele);
				if(prePid){
					var preNode = find(prePid,nodes);
					preNode.state = {
						selected : true
					}
				}
				a.treeview({
					data: nodes,
					levels:4,
					searchResultColor:"#fff",
					searchResultBackColor:"#800"
				});
				var trv = a.data("treeview");
				def.resolve(trv);
			}).fail(function(err){
				def.reject(err);
			})

			return def.promise();
		}
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
			$.each(plans,function(i,v){
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
});