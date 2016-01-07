(function(){
  	var staticDomain = R.config("STATIC_DOMAIN");
  	var staticDir = R.config("STATIC_DIR");

	var staticBase ;
  	if(staticDomain === undefined){
  		staticBase = "/";
  	}else{
  		staticBase =  staticDomain + staticDir;
  	}
	R.config("STATIC_BASE", staticBase);
	var map  = {
		// "home/index":"pkg/app"
	}
	seajs.config({
		map:map,
		base:staticBase
	});
})();

