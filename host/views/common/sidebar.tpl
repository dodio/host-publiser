<div class="navbar-default sidebar" role="navigation">
    <div class="input-group custom-search-form">
        <input type="text" class="form-control" id="search-input" placeholder="Search...">
        <span class="input-group-btn">
            <button class="btn btn-default" id="expand" type="button"><span>展开</span></button>
            <button class="btn btn-default" id="addnew" type="button">
                <span>新增</span>
            </button>
        </span>
    </div>
    <div id="plans" class="mt20">
        
    </div>
</div>
{% script %}
seajs.use("common/sidebar");
{% endscript %}
<!-- /.navbar-static-side -->