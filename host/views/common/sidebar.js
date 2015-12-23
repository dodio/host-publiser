/**
 * 模块  首页的js文件
 * 依赖  user
 * @return {[type]}             [description]
 */
define(function(require, exports, module){
	"use strict";
 	
 	var plantree = require("./plantree");
 	var plan = $("#plans");
 	plantree.load(plan).then(function(treeview){
 		
 	})
 	$("#addnew").click(function(){
 		var selectedNode = plan.data("treeview").getSelected().pop();
 		var pid = selectedNode ? selectedNode.id : "" ;
 		$.post("/add",{pid:pid},function(res){
 			if(!res.status){
 				window.location.href = "/?pid="+ res.data.id;
 				return;
 			}
 			alert(res.msg);
 		})
 	})
 	$("#search-input").keyup(function(){
 		var key = $.trim( $(this).val() );
 		var trv = plan.data("treeview");
 		if(key == ""){
 			trv.clearSearch()
 		}else{
 			trv.search(key);
 		}
 	})
 	$("#expand").click(function(){
 		var trv = plan.data("treeview");
 		trv.expandAll();
 	})
 	return {
 		plan:plan
 	}
});

