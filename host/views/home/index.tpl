{% extends "home/layout.tpl" %}
{% block "seo" %}
	<title>Fa框架demo</title>
{% endblock %}
{% block "content" %}
{% require "home/index.less" %}
{% script %}
seajs.use("home/index");
{% endscript %}
<div class="container">
	 <h1>Hello FA APP</h1>
</div>

{% endblock %}