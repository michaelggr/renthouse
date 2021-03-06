var byId = function(id) {
	return document.getElementById(id);
};
var upload = {

	imageList: byId("image-list"),
	submitBtn: byId("commitHousePublish")
};

upload.files = [];
upload.serverId = [];

var paths = [];

//var getJssdkConfUrl = "http://www.lovespace.cc/?r=door/get-jssdk&url=http://www.lovespace.cc/weixin/Mine/MySettingModify.html";
var getJssdkConfUrl = "http://www.lovespace.cc/?r=door/get-jssdk&url=";

var addWeixinPicUrl = "http://www.lovespace.cc/index.php?r=user/add-wx-pic";

(function() {

	var index = 1;
	var size = null;
	var imageIndexIdNum = 0;
	var starIndex = 0;
    var hostUrl;//主页面
	upload.getFileInputArray = function() {
		return [].slice.call(upload.imageList.querySelectorAll('.file'));
	};
	upload.addFile = function(path) {
		upload.files.push({
			name: "images" + index,
			path: path
		});
		paths.push(path);
		index++;
	};
	
	upload.setHostUrl = function(path)
	{
		getJssdkConfUrl += path;
	}
	
	/**
	 * 初始化图片域占位
	 */
	upload.newPlaceholder = function() {
        document.querySelector('#headPic').addEventListener('tap', function() {
			var self = this;
			upload.files = [];

			wx.chooseImage({
				count: 1, // 默认9
				sizeType: ['compressed'], // 可以指定是原图还是压缩图，默认二者都有original compressed
				sourceType: ['album', 'camera'], // 可以指定来源是相册还是相机，默认二者都有
				success: function(res) {
					var localIds = res.localIds; // 返回选定照片的本地ID列表，localId可以作为img标签的src属性显示图片
					upload.addFile(localIds);
					byId("headPic").src = localIds;
				}
			});
		}, false);

	};

	upload.initJssdkConfig = function()
	{
		upload.newPlaceholder();
		ajax_get_jssdk_conf();
	};
	

	upload.uploadPics = function(successFun) {
		
		//console.log('asfadfad');
		//mui.toast("aaaa");
		var length1 = paths.length;
		//		mui.toast("bbb");
		//		mui.toast("length1=" + paths.length);
		if (paths.length == 0) {
			alert('请先选择图片');
			return;
		}
		var i = 0,
			length = paths.length;
		upload.serverId = [];
		//mui.toast("length=" + length);

		function uploadImageToWeixin() {
			var localId=paths[i].toString();
			wx.uploadImage({
				localId: localId,
				success: function(res) {
					i++;
					//alert('已上传：' + i + '/' + length + "serverId=" + res.serverId);
					upload.serverId.push(res.serverId);
					
					if (i < length) {
						uploadImageToWeixin();
					}
					//
					if (i == length)
					{
						//全部上传完成 调度发布函数
						//alert('begin publish');
						//publishHouseInfo();
						successFun();
					}
				},
				fail: function(res) {
					alert(JSON.stringify(res));
				}
			});
		}
		uploadImageToWeixin();
	}
    
})();

function ajax_get_jssdk_conf(options) {
	console.log('head.image.upload.js:ajax_get_jssdk_conf   '+JSON.stringify(options));
	console.log('ajax_get_jssdk_conf getJssdkConfUrl:'+getJssdkConfUrl);
	jQuery.ajax({
		url: getJssdkConfUrl,
		data: JSON.stringify(options),
		dataType: 'json', //服务器返回json格式数据
		type: 'get', //HTTP请求类型
		timeout: 10000, //超时时间设置为10秒；
		async: false,
		success: function(data) {

			getJssdkConfSuccess(data);
		},
		error: function(xhr, type, errorThrown) {
			getJssdkConfFailed(errorThrown);
		}
	});
}

function getJssdkConfSuccess(data) {
	console.log("config  " + JSON.stringify(data));
	wx.config({
		debug: false,
		appId: data.appId,
		timestamp: data.timestamp,
		nonceStr: data.nonceStr,
		signature: data.signature,
		jsApiList: [
			// 所有要调用的 API 都要加到这个列表中
			'chooseImage',
			'previewImage',
			'uploadImage',
			'downloadImage'
		]
	});
	wx.ready(function() {
		/* config信息验证后会执行ready方法，所有接口调用都必须在config接口获得结果之后，config是一个客户端的异步操作，
		所以如果需要在页面加载时就调用相关接口，则须把相关接口放在ready函数中调用来确保正确执行。对于用户触发时才调用的接口，
		可以直接调用，不需要放在ready函数中。*/
	});

}

function getJssdkConfFailed(data) {
	console.log("error " + JSON.stringify(data));
}

function ajax_add_weixin_pic(options) {
	//alert(addWeixinPicUrl);
	jQuery.ajax(addWeixinPicUrl, {
		data: JSON.stringify(options),
		dataType: 'json', //服务器返回json格式数据
		type: 'post', //HTTP请求类型
		timeout: 10000, //超时时间设置为10秒；
		async: false,
		success: function(data) {
			//验证通过后进行登录
			addWeixinPicSuccess(data);
		},
		error: function(xhr, type, errorThrown) {
			addWeixinPicFailed(errorThrown, options);
			//				toastMSG = '验证码不正确';
			//				mui.toast(toastMSG);
		}
	});
}

function addWeixinPicSuccess(data) {
	//alert("addWeixinPicSuccess success" + JSON.stringify(data));
	console.log("error " + JSON.stringify(data));
}

function addWeixinPicFailed(error, data) {
	//alert("error" + JSON.stringify(data));
	console.log("error " + JSON.stringify(data));
}