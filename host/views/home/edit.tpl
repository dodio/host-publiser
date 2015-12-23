<!-- 数据概述头部 -->
  {% if plan %}
  <div class="row">
    	<div class="col-lg-12">
      		<h1 class="page-header">{{plan.text}}</h1>
    	</div>
  	</div>
  {% endif %}
  	{% if plan %}
  <form method="post" action="/node">
  	<div class="row">
  	  	<div class="col-lg-6">
  	  		<input type="hidden" name="pid" value="{{plan.id}}">
  	  		<input type="text" name="text" class="form-control" value="{{plan.text}}">
  	  	</div>
  	</div>
  	<div class="row mt20">
    	<div class="col-lg-6">
    		<textarea name="content" class="form-control" style="min-height:400px;">{{plan.content}}</textarea>
    	</div>
  	</div>
  	<div class="row mt20">
  		<div class="col-lg-12">
  			<button class="btn btn-primary" style="width:100px;">保存</button>
  			<a class="btn btn-success" style="width:100px;" target="_blank" href="/view?pid={{plan.id}}">查看</a>
  			<a class="btn btn-default delete_plan" style="width:100px;" onclick="return confirm('确定删除该方案吗？');" href="/delete?pid={{plan.id}}">删除</a>
  		</div>
  	</div>
  </form>
{% else %}
<div class="well">方案不存在，或者当前没有选择任何方案</div>
{% endif %}