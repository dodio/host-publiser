{% extends "common/layout.tpl" %}

{% block "content" %}
<!-- 加载echarts主文件 -->
{% script %}
seajs.use("home/index");
R.config("prePid",{{prePid || 0 }})
{% endscript %}
	<div class="container-fluid" id="plan_editor">
  		{% include "home/edit.tpl" %}
 	</div>
</div>

{% endblock %}