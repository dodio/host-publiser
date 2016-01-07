<!doctype html>
{% html framework='//asset.danlu.com/static/vendor/run.js?t=1448162498953' id="admin-danlu" %}

{% head %}
	<meta charset="UTF-8">
  	<title>HOST管理</title>
	{% block "meta" %}
	<meta http-equiv="X-UA-Compatible" content="IE=edge,chrome=1" />
    <meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="renderer" content="webkit" />
	{% endblock %}
	<script>
		// hack for config.js
		var HEAD_TIME = new Date().getTime();
		var __RESOURCE_MAP__ = "NO_MAP";
	</script>
  {% require "/styles/global.less" %}
  {% require "/js/sb-admin/bootstrap/css/bootstrap.css" %}
  {% require "/js/sb-admin/sb/css/sb-admin-2.css" %}
  {% require "/js/sb-admin/font-awesome/css/font-awesome.css" %}
  {% require "/styles/global.less" %}
{% require "/js/conf/config.js" %}
{% script %}
	seajs.use("js/sb-admin/sb/js/sb-admin-2.js");
{% endscript %}
{% endhead %}

{% body %}
	<div id="wrapper">
		<nav class="navbar navbar-default navbar-static-top" role="navigation" style="margin-bottom: 0">
            {% include "common/navbar-header.tpl" %}
            {% include "common/navbar-right.tpl" %}
            {% include "common/sidebar.tpl" %}
		</nav>
		{# 导航条结束 #}
		<div id="page-wrapper">
   			{% block "content" %}{% endblock %}
		</div>
		{# endof pagewrapper #}
	</div>
	{# end of wrapper #}

{% endbody %}

{% endhtml %}
