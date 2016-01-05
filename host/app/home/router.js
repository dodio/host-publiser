var plan = Host.model("plan");


function checkLogin(req,res,next){
	if(!req.session.logined){
		res.send({
			status:5,
			msg : "您没有权限修改"
		})
		return;
	}
	next();
}

module.exports = function(router) {

	router.get("/thisisit",function(req,res,next){
		req.session.logined = true;
		res.redirect("/");
	})
	router.get("/thisisnotit",function(req,res,next){
		req.session.logined = false;
		res.redirect("/");
	})
	// 首页
	router.get("/",function(req,res,next){
		var planId = req.query.pid;
		plan.getWithContent(planId).then(function(plan){
			res.data("plan",plan);
			res.data("prePid",planId);
			res.render("home/index", res.data.get() );
		})
		.catch(next)
	});
	// 获取编辑框
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

	// 查看host文件
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

	// 更新
	router.post("/node",checkLogin,function(req,res,next){
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

	// 删除
	router.get("/delete",checkLogin,function(req,res,next){
		var pid = req.query.pid;
		plan.del(pid).then(function(node){
			res.redirect("/");
			// res.json(node)
		})
		.catch(next)
	})

	// 添加
	router.post("/add",checkLogin,function(req,res,next){
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

