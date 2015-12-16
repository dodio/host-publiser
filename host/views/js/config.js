(function() {
	"use strict";
	var rs_map = __RESOURCE_MAP__;
	var staticDomain = "__STATIC_DOMAIN__";
	staticDomain = (staticDomain == "") ? "/" : staticDomain;
	R.config("STATIC_DOMAIN", staticDomain);
	var staticDir = "__STATIC_DIR__";
	R.config("STATIC_DIR", staticDir);
	var staticBase ;
	if(rs_map === "NO_MAP"){
		staticBase = "/"
		rs_map = {};
	}else{
		staticBase =  (staticDomain == "/" ? "" : staticDomain) + staticDir;
	}
	R.config("STATIC_BASE", staticBase);
	R.faFisMap(rs_map);
})()