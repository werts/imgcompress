# 图片压缩插件
## 无第三方库依赖，因此可以方便整合入项目，支持commonjs cmd
## 最先在内部使用，更多bug请联系作者
## 参考了网上部分资料，以及zhangxinxu的代码，整合更多预览、压缩功能

== DEMO
//require
var imgcompress = require('imgcompress');

//runtime
<script src="imgcompress.min.js"></script>
<script type="test/javascript">
    IMGCompress.init({
        fileInput: '#input', //文件输入
	deleteBtn: '.imgItem img', //删除按钮
	deployPics: '.deploy',  //放置预览图
	placement: '<p>最多可上传4张图片</p>', //没有图片时的提示信息，支持html文本
	uploadOpt: {
	    method: 'post', //支持post
	    url: '',
	    upBtn: '' //上传按钮
	},
	ajaxStart: function(){}, //异步上传前的操作
	ajaxError: function(){}, //异步失败回调
	ajaxSuccess: function(data){}, //异步成功的回调
    });
</script>
==
