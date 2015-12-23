<ul class="nav navbar-top-links navbar-right">
    
    <!-- /.dropdown -->
    <li class="dropdown">
        <a class="dropdown-toggle" data-toggle="dropdown" href="javascript:">
            <i class="fa fa-user fa-fw"></i> {{user.name||"未登录"}} <i class="fa fa-caret-down"></i>
        </a>
        <ul class="dropdown-menu dropdown-user">
            <li><a href="/login/logout"><i class="fa fa-sign-out fa-fw"></i> 退出系统</a>
            </li>
        </ul>
        <!-- /.dropdown-user -->
    </li>
    <!-- /.dropdown -->
</ul>
<!-- /.navbar-top-links -->