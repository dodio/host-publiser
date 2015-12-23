/**
 * 模块  
 * 依赖  xx,xx,xx
 * @return {[type]}             [description]
 */
define(function(require, exports, module){
	"use strict";
 	var sidebar = require("common/sidebar");
 	var plan = sidebar.plan;
 	if(window.addEventListener){
 		window.addEventListener("popstate",function(e){
 			var node = e.state.node;
	 		$("#plan_editor").load("/editForm?pid="+node.id);
	 	})
 	}
 	setTimeout(function(){
 		plan.bind("nodeSelected",function(e,node){
		var url = "/?pid="+node.id;
		if(history.pushState){
			$("#plan_editor").load("/editForm?pid="+node.id,function(){
				history.pushState({
				node:node	 					
				},node.text,url);
			});
		}else{
			window.location.href=url;
		}
	});
 	},1e3)

});