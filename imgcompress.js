(function(win, doc) {
	var IMGCompress = {
			fileInput: null,
			placement: null, //没有图片时的占位区域
			deployPics: null, //图片放置区域
			previewPicTemplate: '<div class="imgItem" data-index="{index}"><img src="{src}"/><i class="iconfont">&#xe661;</i></div>',
			fileFilter: [],
			filedata: [],
			allFiles: [],
			resstrictNum: 4,
			onSelect: function(e) {
				var files = e.target.files,
					self = this,
					previews = [];
				this.fileFilter = this.fileFilter.concat(filter(files));
				this.allFiles = this.fileFilter;
				
				//当文件数大于限制图片数时，直接返回
				if (this.fileFilter.length > options.resstrictNum){
					alert('不要上传大于限定的数量： ' + options.resstrictNum);
					return;
				}
				//为文件添加索引
				for (var i = 0, file; file = this.fileFilter[i]; i++) {
					file.index = i;
				}
				//实现预览与裁剪
				this.filedata = [];
				var j = 0,
					afterSelect = function() {
						var file = self.fileFilter[j];
						var fd = {
							index: j
						};
						if (file) {
							//压缩并预览
							var reader = new FileReader();
							reader.onload = function(e) {
								//去除对png的压缩
								if (file.type.indexOf('png') > -1) {
									//处理预览图
									var ptemp = self.previewPicTemplate;
									fd.filedata = e.target.result;
									self.filedata.push(fd);
									try {
										ptemp = ptemp.replace(/\{index\}/g, fd.index)
											.replace(/\{src\}/g, fd.filedata);
										previews.push(ptemp);
									} catch (error) {
										//TODO handle the exception
									}
								} else {
									compress(e.target.result, file.index, function(result) {
										//处理预览图
										var ptemp = self.previewPicTemplate;
										fd.filedata = result;
										self.filedata.push(fd);
										try {
											ptemp = ptemp.replace(/\{index\}/g, fd.index)
												.replace(/\{src\}/g, fd.filedata);
											previews.push(ptemp);
										} catch (error) {
											//TODO handle the exception
										}
									});
								}
								j++;
								afterSelect();
							};
							reader.readAsDataURL(file);
						} else {
							var deploy = doc.querySelectorAll(options.deployPics);
							if (deploy[0]){
								deploy[0].innerHTML = previews.join(' ');
							}
						}
					};
				afterSelect();
				return this;
			},
			onDelete: function(fileToDelete) {
				var fileArr = [],
					fileDataArr = [];
				for (var i = 0, file; file = this.fileFilter[i]; i++) {
					if (file != fileToDelete) {
						fileArr.push(file);
					}
				}
				for (var i = 0, file; file = this.filedata[i]; i++) {
					if (file.index != fileToDelete.index) {
						fileDataArr.push(file);
					} else {
						//处理删除
						this.afterDelete(fileToDelete);
					}
				}
				this.fileFilter = fileArr;
				this.filedata = fileDataArr;				
				return this;
			}
		},
		options = {};
	var extend = function() {
		var i = 0;
		var result = {};
		for (; i < arguments.length; i++) {
			var attributes = arguments[i];
			for (var key in attributes) {
				result[key] = attributes[key];
			}
		}
		return result;
	};
	var filter = function(files) {
		var fileArr = [];
		for (var i = 0, file; file = files[i]; i++) {
			if (file.type.indexOf('image') == -1) {
				alert('请不要上传不是图片的文件');
			} else {
				fileArr.push(file);
			}
		}
		return fileArr;
	};
	//图片压缩的实现
	var compress = function(img, index, callback) {
		var image = new Image(),
			imgOnloadCallback, compressProcess;
		image.src = img;
		imgOnloadCallback = function() {
			var w = image.width,
				h = image.height;
			//缩放比例
			var ratio = 1;
			if ((ratio = w * h / 4000000) > 1) {
				ratio = Math.sqrt(ratio);
				w /= ratio;
				h /= ratio;
			} else {
				ratio = 1;
			}
			//往页面上增加canvas
			var canvas = doc.createElement('canvas');
			canvas.width = w;
			canvas.height = h;
			//获取context
			var ctx = canvas.getContext('2d');
			ctx.fillStyle = '#ffffff';
			ctx.fillRect(0, 0, w, h);
			//如果图片大于100万像素，需要分片处理 ios
			var count = 0;
			if ((count = w * h / 1000000) > 1) {
				//计算分片
				count = Math.ceil(Math.sqrt(count)) + 1;
				//计算每个分片的宽高
				var tw = Math.ceil(w / count),
					th = Math.ceil(h / count);
				//分片绘制
				var tcanvas = doc.createElement('canvas');
				tcanvas.width = tw;
				tcanvas.height = th;
				var tctx = tcanvas.getContext('2d');
				tctx.fillStyle = '#FFFFFF';
				tctx.fillRect(0, 0, tw, th);
				for (var i = 0; i < count; i++) {
					for (var j = 0; j < count; j++) {
						tctx.drawImage(image, i * ratio * tw, j * ratio * th, tw * ratio, th * ratio, 0, 0, tw, th);
						ctx.drawImage(tcanvas, i * tw, j * th, tw, th);
					}
				}
			} else {
				ctx.drawImage(image, 0, 0, w, h);
			}
			var re = canvas.toDataURL('image/jpeg', 0.65);
			callback(re);
		};
		if (image.complete) {
			imgOnloadCallback();
		} else {
			image.onload = imgOnloadCallback;
		}
	};
	IMGCompress.init = function(opt) {
		options = extend(options, opt);
		this.bind();
	};
	IMGCompress.afterDelete = function(file) {
		var index = file.index;
		var toDelete = doc.querySelectorAll(options.deleteBtn);
		for (var i = 0, to; to = toDelete[i]; i++) {
			var node = to.parentNode,
				indexs = node.getAttribute('data-index');
			if (index == indexs) {
				node.style.display = 'none';
			}
		}
		//已经删除完全
		if (this.fileFilter.length == 1){
			var deploy = doc.querySelectorAll(options.deployPics);
			if (deploy[0]){
				deploy[0].innerHTML = options.placement;
			}
		}
	};
	IMGCompress.bind = function() {
		//bind fileinput widget, only for id selector
		var self = this;
		if (options.fileInput) {
			var inputs = doc.querySelectorAll(options.fileInput);
			inputs[0].addEventListener('change', function(e) {
				self.onSelect(e);
			}, false);
		}
		//bind delete
		if (options.deleteBtn && options.deployPics) {
			doc.querySelectorAll(options.deployPics)[0].addEventListener('click', function(e) {
				var target = e.target,
					d = Array.prototype.slice.call(doc.querySelectorAll(options.deleteBtn));
				if (d.indexOf(target) > -1) {
					var index = target.parentNode.getAttribute('data-index');
					self.onDelete(self.allFiles[parseInt(index)]);
				}
			});
		}
		//bind upload
		if (options.uploadOpt.upBtn) {
			var btn = doc.querySelectorAll(options.uploadOpt.upBtn);
			if (btn) {
				btn[0].addEventListener('click', function(e) {
					IMGCompress.upload();
					e.preventDefault();
					e.stopPropagation();
				});
			}
		}
	};
	IMGCompress.upload = function() {
		var postDataArr = [],
			self = this,
			len = this.filedata.length,
			uped = 0;
		while(len > 0){
			var file = this.filedata[len-1];
			var filestr = win.atob(file.filedata.split(',')[1]);
			var type = file.filedata.split(',')[0];
			var buffer = new ArrayBuffer(filestr.length);
			var ubuffer = new Uint8Array(buffer);
			var Builder = win.WebKitBlobBuilder || win.MozBlobBuilder;
			var blob;
			type = type.replace(/([a-z]+\:)|(\;[a-z0-9]+)/g, '');
			for (var j = 0; j < filestr.length; j++) {
				ubuffer[j] = filestr.charCodeAt(j);
			}
			
			if (Builder) {
				var builder = new Builder();
				builder.append(buffer);
				blob = builder.getBlob(type);
			} else {
				blob = new win.Blob([buffer], {
					type: type
				});
			}
			
			var formdata = new FormData();
			var xhr = new XMLHttpRequest();
			formdata.append('images', blob);
			options.ajaxStart();
			if (xhr.upload) {
				if (xhr.readyState == 4) {
					if (xhr.status == 200) {
						options.ajaxSuccess(xhr.responseText);
						uped++;
						options.ajaxEnd();						
					} else {
						options.ajaxError(xhr.responseText);
						options.ajaxEnd();
						
					}
				}
				//start upload
				xhr.open(options.uploadOpt.method, options.uploadOpt.url, true);
				//setting headers
				//xhr.setRequestHeader();
				xhr.send(formdata);
				if (--len == 0){
					options.ajaxUploaded(uped);
				}
			}		
		}			
	};
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = IMGCompress;
	else if(typeof define === 'function' && define.amd)
		define([], IMGCompress);
	else if(typeof exports === 'object')
		exports["IMGCompress"] = IMGCompress;
	else
		win.IMGCompress = IMGCompress;
}(window, document));