/**
 * 模块 
 * 依赖  		
 * @return {[type]}             [description]
 */
define(function(require, exports, module){
	"use strict";
 	
 	return {
 		api:function(factory){
 			var tmp;

 			return function(reload){
 				if(!reload && tmp){
 					return tmp;
 				}
 				return tmp = factory();
 			}
 		}
 	}
});