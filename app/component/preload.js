import React from 'react';
// import Lib from './lib';

// console.log(Lib);

class Preload extends React.Component {
    // let lib;
    constructor(props) {
        super(props);
        let opts = props.data;

        let defaultElm = (
                <div className="box" id="loadingBox">
                    <div id="floatingCirclesG">
                        <div className="f_circleG" id="frotateG_01"></div>
                        <div className="f_circleG" id="frotateG_02"></div>
                        <div className="f_circleG" id="frotateG_03"></div>
                        <div className="f_circleG" id="frotateG_04"></div>
                        <div className="f_circleG" id="frotateG_05"></div>
                        <div className="f_circleG" id="frotateG_06"></div>
                        <div className="f_circleG" id="frotateG_07"></div>
                        <div className="f_circleG" id="frotateG_08"></div>
                    </div>
                </div>
        )

        // console.log(props.loadingElm);

        // this.lib = new Lib(props.data);
        this.isDebug = opts.isDebug || false;
        this.sources = opts.sources || null;
        this.progress = opts.progress || function(){};
        this.connector = opts.connector || null;
        this.completeLoad = opts.completeLoad || function(){};
        this.timeOut = opts.loadingOverTime || 15;
        this.timeOutCB = opts.loadingOverTimeCB || function(){};
        this.loadingElm = props.loadingElm || defaultElm;

        //业务逻辑所需参数
        this.params = {
            echetotal: 0,                                           //队列总数
            echelon: [],                                            //队列资源列表
            echelonlen: [],                                         //记录每个队列长度
            echeloncb: [],                                          //队列回调标示

            id: 0,                                                  //自增ID
            flag: 0,                                                //标示梯队

            allowType: ['jpg', 'jpeg', 'png', 'gif'],               //允许加载的图片类型
            total: 0,                                               //资源总数
            completedCount: 0,                                      //已加载资源总数

            _createXHR: null,                                       //Ajax初始化

            //img、audio标签预加载
            PNode: [],
            nodePSrc: [],

            //img标签
            imgNode: [],

            //audio标签
            audioNode: [],

            //异步调用接口数据
            head: document.getElementsByTagName("head")[0],

            //超时对象
            timer: [],
        }


        //初始化进度参数
        this.state = {
            completedCount: 0,
            total: 0
        }

        if(this.sources == null){
            this.throwIf('必须传入sources参数');
            return;
        }

        console.log(this.props);

        this._init();

    }

    _init() {
        let self = this,
            params = self.params;
        // console.log("sources", this.sources);
        // console.log("progress", this.progress);
        // console.log("connector", this.connector);
        // console.log("completeLoad", this.completeLoad);
        // console.log("timeOut", this.timeOut);
        // console.log("timeOutCB", this.timeOutCB);
        // console.log("params", this.params);

        // 初始化资源参数
        self._initData();

        //开始预加载资源
        self._load(params.echelon[0]);
        

        //调用接口数据
        if (self.connector !== null) {
            self._getData();
        }
    }

    _load(flagRes, flag = 0) {
        let self = this,
            params = self.params;


        // console.log(flagRes);

        /*
        *   返回队列内资源加载promise数组，异步
        *
        */
        let promise = flagRes.map((res) => {

            if(self.isImg(res)) {
                params.timer[res] = setTimeout(() => {
                    self.timeOutCB(res);
                }, self.timeOut * 1000);
                return self.preloadImage(res);
                
            }else{
                return self.preloadAudio(res);
            }
        });

        /*
        *   执行队列内资源加载promise数组，分成功和失败
        *
        */
        Promise.all(promise).then((success) => {
            // console.log("图片加载成功");
            // console.log("success", success);
            // console.log("type", type);

            success.map((Svalue) => {
                console.log(Svalue);
                // console.log(params.nodePSrc);
                let index = params.nodePSrc.findIndex((value, index, arr) => {
                    return value == Svalue
                })


                // console.log(index);

                // console.log(index);
                if(index == -1) return;
                params.PNode[index].src = Svalue;


            });

            if(params.flag < params.echetotal - 1) {
                params.echeloncb[params.flag]();
                self._load(params.echelon[++params.flag]);
            }else {
                params.echeloncb[params.flag]();
                self.completeLoad();
            }
        }).catch((error) => {
            // alert(1);
            let msg = error.path ? "资源加载失败，检查资源路径：" + error.path[0].src : error;
            self.throwIf(msg);
        })

    }

    /*
    *   初始化预加载所需数据
    *   echetotal                                   队列总数
    *   echelon                                     队列资源数组
    *   total                                       资源总数
    *   echelonlen                                  队列回调标记数组
    *   echeloncb                                   队列回调函数数组
    */
    _initData() {
        let self = this,
            params = self.params,
            k = 0;
        params.echetotal = Object.getOwnPropertyNames(self.sources).length;
    
        //处理梯队资源和回调
        for(let i in self.sources){
            params.echelon[k] = []
            for(let j = 0, len = self.sources[i].source.length; j < len; j++){
                ++params.total;
                params.echelon[k].push(self.sources[i].source[j]);
            }
            //对于资源队列echelon进行去重
            params.echelon[k] = [...new Set(params.echelon[k])];

            // console.log(params.echelon[k]);

            params.echelonlen.push(params.echelon[k].length);


            params.echeloncb.push(typeof self.sources[i].callback == 'undefined' ? function(){} : self.sources[i].callback);

            k++;
        }


        //Ajax初始化
        // params._createXHR = self.getXHR();

        //梯队回调标示位置
        for(let i = 1, len = params.echelonlen.length; i < len; i++){
            params.echelonlen[i] = params.echelonlen[i - 1] + params.echelonlen[i];
        }

        //处理img标签的预加载
        params.imgNode = document.getElementsByTagName('img');          //获取img标签节点
        for(let i = 0, len = params.imgNode.length; i < len; i++){
            if(params.imgNode[i].attributes.pSrc){
                params.nodePSrc.push(params.imgNode[i].attributes.pSrc.value);
                params.PNode.push(params.imgNode[i]);
            }
        }

        //处理audio标签的预加载
        params.audioNode = document.getElementsByTagName('audio');          //获取img标签节点
        for(let i = 0, len = params.audioNode.length; i < len; i++){
            if(params.audioNode[i].attributes.pSrc){
                params.nodePSrc.push(params.audioNode[i].attributes.pSrc.value);
                params.PNode.push(params.audioNode[i]);
                // params.audioNodePSrc[i] = params.audioNode[i].attributes.pSrc.value;
            }
        }

        // self.setState({total: params.total});

        // console.log("sources", self.sources);
        // console.log("params.echetotal", params.echetotal);
        // console.log("params.echelon", params.echelon);
        // console.log("params.echelonlen", params.echelonlen);
        // console.log("params.echeloncb", params.echeloncb);
        // console.log("params._createXHR", params._createXHR);
        // console.log("params.total", params.total);
        console.log("params.PNode", params.PNode);
        console.log("params.nodePSrc", params.nodePSrc);
        // console.log("params.flag", params.flag);
        // console.log("self.completeLoad", self.completeLoad);
        // console.log("self.progress", self.progress);
        // console.log("params.id", params.id);
    }

    //返回超时Promise对象
    // timeOutPromise(time) {
    //  return new Promise((resolve, reject) => {
    //      setTimeout(resolve, time);
    //  });
    // }

    _getData() {

        let self = this,
            params = self.params;

        for (let i in self.connector) {
            if (self.connector[i].jsonp) {
                self.asynGetData(self.connector[i].url);
            } else {
                self.syncGetData(self.connector[i].url, self.connector[i].callback)
            }
        }
    }

    /*
    *   同步获取后台数据
    *   
    *   @param  url         接口路径 
    *   @param  callback    成功后回调 
    *
    */
    syncGetData(url, callback) {
        let self = this,
            params = self.params;


        params._createXHR = new XMLHttpRequest();
        // config.xhr = _createXHR;
        params._createXHR.onreadystatechange = function() {
            if (params._createXHR.readyState == 4) {
                if ((params._createXHR.status >= 200 && params._createXHR.status < 300) || params._createXHR.status === 304) {
                    callback(params._createXHR.responseText)
                }
            }
        }

        params._createXHR.open("GET", url, true);

        params._createXHR.send(null);
    }

    /*
    *   跨域获取后台数据
    *   
    *   @param  url 接口路径 
    *
    */
    asynGetData(url) {
        let self = this,
            params = self.params;
        let script = document.createElement("script");
        script.src = url;
        params.head.appendChild(script);
    }


    //返回加载图片资源premise对象
    preloadImage(url) {
        let self = this,
            params = self.params;
        return new Promise(function(resolve, reject) {
            let image = new Image();
            image.onload = function() {
                // alert(1);

                // console.log(params.completedCount);

                self.progress(++params.id, params.total);

                self.setState({completedCount: params.id});
                
                //清除计时器
                clearTimeout(params.timer[url]);

                // console.log(11111);
                resolve(url);
            }
            image.onerror = reject;
            image.src = url;
        });
    }

    //返回加载音频资源premise对象
    preloadAudio(url) {
        let self = this,
            params = self.params;

        // console.log("params", params);

        return new Promise((resolve, reject) => {
            params._createXHR = new XMLHttpRequest();
            params._createXHR.open("GET", url);
            params._createXHR.onreadystatechange = handler;
            params._createXHR.send();

            function handler() {
                if (this.readyState !== 4) {
                    return;
                }
                if (this.status === 200) {
                    self.progress(++params.id, params.total);
                    resolve(url);
                } else {
                    // console.log(this.statusText);
                    reject(url);
                }
            }

        });
    }

    //错误数据弹出
    throwIf(msg = '未知错误') {
        if(this.isDebug){
            alert(msg);
            return;
        }
    }

    //判断是否是图片
    isImg(res) {
        let self = this,
            params = self.params,
            type = res.split('.').pop();

        for (var i = 0, len = params.allowType.length; i < len; i++) {
            if (type == params.allowType[i]) return true;
        }
        return false;
    }

    render() {
        let self = this,
            params = self.params;
    	// var data = this.props.data;
        // console.log(this.lib);
    	

    	// console.log(this.props.data);
    	// this.props.data.test = [1,2,3,4];

    	return self.loadingElm
        // return this.props.loadingIndicator ? this.props.loadingIndicator : opts.loadingIndicator;
    }
};

module.exports = Preload;