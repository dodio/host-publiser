/**
 * 模块  首页的js文件
 * 依赖  user
 * @return {[type]}             [description]
 */
define(function(require, exports, module){
	"use strict";
 	var user = require("js/user");
 	var $ = require("jquery");
 	$(function() {
 		require("js/zui/js/zui.js");
		console.log("sdjlfk");
		console.log(user);
	});
	
	var header = require("home/common/header");
	header.render(user.userid);
});

