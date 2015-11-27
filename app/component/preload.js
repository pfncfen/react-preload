var React = require('react');


var Preload = React.createClass({
	getDefaultProps: function(){
		return {
			defaultProps: {
				sources: null,											//预加载资源数据

				progress: function(){},									//进度条回调
				completedCount: 0,										//已加载资源总数
				total: 0,												//资源总数
				id: 0,													//自增ID

				connector: null,										//接口数据
							
				flag: 0,												//标示梯队
				echelon: [],											//梯队加载资源
				echeloncb: [],											//梯队加载后的回调
				echetotal: null,										//梯队总数
				echelonlen: [],											//梯队长度
				allowType: ['jpg', 'png', 'gif'],						//允许加载的图片类型
				config: {
					xhr: null,
					timeOut: 15,										//超时时间
					timeOutCB: function(){},							//超时回调
					id: 0,												//超时标示
					max: 3												//超时最高次数
				},

				head: document.getElementsByTagName("head")[0],

				
				imgNode: [],											//img标签预加载
				imgNodePSrc: [],
				loadingIndicator: (										//loading界面
					< div className = "mask popload-mask flex flex-align-center flex-pack-center" >
					    < div className = "popload" >
					    	< span className = "popload-ico" > < /span>
							<p className="popload-txt">加载中...</p >
					    < /div>
					</div >
				)
			}
		}
	},

	//组件渲染前调用
	componentWillMount: function() {

		this.setState({completedCount: 0});


		for (var i in this.props.defaultProps) {

    		// console.log(i, !this.props.data[i]);

    		if(!this.props.data[i]){
    			this.props.data[i] = this.props.defaultProps[i];
    		}
		}
	},

	//组件渲染后调用
	componentDidMount: function() {
		var comments = this.props.data;

    	this._initData();
    	this._load(comments.echelon[0], comments.echeloncb[0], comments.echelonlen);	//开始请求资源
	},

    getInitialState: function() {
    	// console.log(this.props.data);
    	// this._initData();
    	
        return {
            data: []
        };
    },

    _initData: function() {
    	// console.log(this.props.data);
    	// console.log(opts);
		// console.log(this.state.data.flag);
		var comments = this.props.data;

		// this.state.completedCount = 0;

    	// console

    	//判断XHR
    	if (typeof XMLHttpRequest != "undefined") {
			comments._createXHR =  new XMLHttpRequest();
		} else if (typeof ActiveXObject != "undefined") {
			if (typeof arguments.callee.activeXString != "string") {
				var versions = ["MSXML2.XMLHttp.6.0", "MSXML2.XMLHttp.3.0",
						"MSXML2.XMLHttp"
					],
					i, len;
				for (i = 0, len = versions.length; i < len; i++) {
					try {
						comments._createXHR = new ActiveXObject(versions[i]);
						arguments.callee.activeXString = versions[i];
						break;
					} catch (ex) {
						//跳过
					}
				}
			}
			comments._createXHR = new ActiveXObject(arguments.callee.activeXString);
		} else {
			throw new Error("No XHR object available.");
		}


    	if(comments.sources === null) return; 

    	//梯队总数
		comments.echetotal = Object.getOwnPropertyNames(comments.sources).length;
    
		//处理梯队资源和回调
		for(var i in comments.sources){

			for(var j = 0, len = comments.sources[i].source.length; j < len; j++){
				comments.echelon.push(comments.sources[i].source[j]);
			}
			comments.echelonlen.push(comments.sources[i].source.length);


			comments.echeloncb.push(typeof comments.sources[i].callback == 'undefined' ? null : comments.sources[i].callback);
		}

		//梯队回调标示位置
		for(var i = 1, len = comments.echelonlen.length; i < len; i++){
			comments.echelonlen[i] = comments.echelonlen[i - 1] + comments.echelonlen[i];
		}

		//资源总数
		comments.total = comments.echelon.length;

		//处理img标签的预加载
		comments.imgNode = document.getElementsByTagName('img');			//获取img标签节点
		for(var i = 0, len = comments.imgNode.length; i < len; i++){
			if(comments.imgNode[i].attributes.pSrc){
				comments.imgNodePSrc[i] = comments.imgNode[i].attributes.pSrc.value;
			}
		}

		// console.log(this.props.data);

    },
    

    _load: function(res, callback, length) {
    	var self = this,
    		comments = this.props.data;

    	if(comments.id >= length[comments.flag]){
			if(comments.echeloncb[comments.flag] != null){
				comments.echeloncb[comments.flag]();
			}
			++comments.flag;
		}

		if(comments.flag >= comments.echetotal) return;

		if(this.isImg(res)) {
			var img = new Image();
			// createTimer(new Date());
			// console.log(comments.config.timeOut);
			var timer = setTimeout(function(){
    			comments.config.timeOutCB();

			}, comments.config.timeOut*1000);

			img.src = res;

			//加载成功后执行
			img.onload = function () {

				// console.log(data);

				//加载成功后清理计时器
				clearTimeout(timer);
				// console.log(this.props.data);
				++comments.completedCount;
				self.setState({completedCount: comments.completedCount});
				comments.progress(comments.completedCount, comments.total);

				for(var i = 0, len = comments.imgNodePSrc.length; i < len; i++){
					if(comments.imgNodePSrc[i] == res){
						comments.imgNode[i].src =  comments.imgNodePSrc[i];
						break;
					}
				}

				self._load(comments.echelon[++comments.id], callback, length);
			}

			//加载失败后执行
			img.onerror = function() {
				comments.progress(++completedCount, total);
				_load(echelon[++id], callback, length);
			}
		}else{
			comments.config.xhr = comments._createXHR;
			
			comments.config.xhr.onreadystatechange = function() {
				if (comments.config.xhr.readyState == 4){
					if((comments.config.xhr.status >= 200 && comments.config.xhr.status < 300) || comments.config.xhr.status === 304){

						++comments.completedCount;
						self.setState({completedCount: comments.completedCount});
						comments.progress(comments.completedCount, comments.total);
						self._load(comments.echelon[++comments.id], callback, length);
					}
				}else if(comments.config.xhr.status >= 400 && comments.config.xhr.status < 500){
					comments.progress(++comments.completedCount, comments.total);
					self._load(comments.echelon[++comments.id], callback, length);
				}
			};

			comments.config.xhr.open("GET", res, true);

			comments.config.xhr.send(null);
		}
    },

    //判断是否是图片
    isImg: function(res) {
    	var type = res.split('.').pop(),
    		comments = this.props.data;
		for (var i = 0, len = comments.allowType.length; i < len; i++) {
			if (type == comments.allowType[i]) return true;
		}
		return false;
    },

    render: function() {
    	// var data = this.props.data;
    	

    	// console.log(this.props.data);
    	// this.props.data.test = [1,2,3,4];

    	return (										//loading界面
			< div className = "mask popload-mask flex flex-align-center flex-pack-center" >
			    < div className = "popload" >
			    	< span className = "popload-ico" >< /span>
					<p className="popload-txt">{Math.floor((this.state.completedCount / this.props.data.total) * 100) }%</p >
			    < /div>
			</div >
		)
        // return this.props.loadingIndicator ? this.props.loadingIndicator : opts.loadingIndicator;
    }
});

module.exports = Preload;