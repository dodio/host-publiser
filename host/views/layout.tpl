<!doctype html>
{% html framework='http://asset.example.com/vendor/run.js'%}

{% head %}
	<meta charset="UTF-8">
  
	{% block "seo" %}
  		<title>{{seo.title}}</title>
		<meta name="keywords" content="{{seo.keywords}}">
    	<meta name="description" content="{{seo.description}}">
	{% endblock %}
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
{% require "/js/config.js" %}
{% endhead %}

{% body %}
   {% block "content" %}{% endblock %}
{% endbody %}

{% endhtml %}
