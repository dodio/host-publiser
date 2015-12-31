var plan = Host.model("plan");
module.exports = function(router) {
	router.get("/",function(req,res,next){
		var planId = req.query.pid;
		plan.getWithContent(planId).then(function(plan){
			res.data("plan",plan);
			res.data("prePid",planId);
			res.render("home/index", res.data.get() );
		})
		.catch(next)
	});
	router.get("/editForm",function(req,res,next){
		var planId = req.query.pid;
		plan.getWithContent(planId).then(function(plan){
			res.data("plan",plan);
			res.render("home/edit", res.data.get() );
		})
		.catch(next)
	})
	router.get("/nodes",function(req,res,next){
		plan.getAll()
		.then(function(nodes){
			res.json(nodes);
		})
		.catch(next);
	})
	router.post("/node",function(req,res,next){
		var pid = req.body.pid;
		if(!pid){
			next("没有pid");
			return;
		}

		plan.save(pid,req.body.text,req.body.content)
		.then(function(){
			res.redirect(req.get("referrer"));
		})
		.catch(next)

	})

	router.get("/view",function(req,res,next){
		var pid = req.query.pid;
		plan.get(pid).then(function(node){
			if(node){
				var realFile = plan.resolveFile(node);
				res.sendFile(realFile);
			}else{
				res.send("#没有找到相应的方案");
			}
		})
	})

	router.get("/delete",function(req,res,next){
		var pid = req.query.pid;
		plan.del(pid).then(function(node){
			res.redirect("/");
			// res.json(node)
		})
		.catch(next)
	})

	router.post("/add",function(req,res,next){
		plan.add(req.body.pid)
		.then(function(plan){
			res.json({
			 	status:0,
			 	data : plan
			})
		})
		.catch(next)
	})

	
}

