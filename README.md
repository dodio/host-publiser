# host-publiser
用来发布hosts映射方案

在进行测试时，我们通常有多套测试环境，或者我们测试时会有多个域名需要做映射。
让不懂host的相关知识的人去了解细节会花时间成本，况且每次手动改也容易出错。

https://github.com/oldj/SwitchHosts
这个工具提供了本地管理多套host方案的功能，
以及读取线上host方案的能力。

本工具就是用来配合 SwitchHosts 的在线方案的功能，来进行hosts方案的发布.


#使用
clone 本工程到目录
clone fa-core 到工程目录中（原谅我没有发布到 npm里面）
然后 npm install
npm run dev 就可以本地使用了.
