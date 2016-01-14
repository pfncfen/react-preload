# react-preload
react preload component
##install
```
git clone https://github.com/jayZOU/react-preload.git
npm i
npm run dev
```
[http://localhost:8080/](http://localhost:8080/)

##npm
```
npm install react-jay-preload
```

##Usage
```javascript
import React from 'react';
import ReactDOM from 'react-dom';
import Preload from './component/preload.js';

/**
    *   Preload 资源预加载组件
    *   @author jayzou
    *   @time 2016-1-14
    *   @version 0.0.7
    *   @class Preload
    *   @param {object} sources             必填  加载队列容器，支持队列加载以及加载一个队列后传入回调
    *   @param {boolean} isDebug            选填      是否开启debug选项，用于移动端调试，默认false
    *   @param {object} connector           选填      后台数据接口，可选择同步或异步
    *   @param int      loadingOverTime     选填      预加载超时时间，默认15， 单位:秒
    *   @param {object} loadingOverTimeCB   选填      预加载超时回调
    *   @param {object} wrap                选填  进度条容器，返回记载进度信息
    *   @param {object} completeLoad        选填  完成所有加载项执行回调，包括同、异步获取数据
**/

//loading加载画面，选填
var loadingElm = (
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
);

var data = {
    isDebug: true,
    sources: {
        imgs: {
            source: [
                "./images/b2.jpg",
                "./images/b1.jpg"
            ],
            callback: function() {
                // console.log("队列1完成");
            }
        },
        audio: {
            source: [
                "./audio/a.mp3",
                "./audio/b.mp3"
            ]
        },
        imgs2: {
            source: [
                "./images/b3.jpg",
                "./images/b4.jpg",
                "http://7xl041.com1.z0.glb.clouddn.com/OrthographicCamera.png",
                "http://7xl041.com1.z0.glb.clouddn.com/audio.gif",
            ],
            callback: function() {
                // console.log("队列3完成");
            }
        }
    },
    // loadingOverTime: 3,
    // loadingOverTimeCB: function(res) {
    //     console.log("资源加载超时：", res);
    // },
    // connector: {
    //     int1: {
    //         url: 'http://localhost/test/index.php?callback=read&city=上海市',
    //         jsonp: true
    //     },
    //     int2: {
    //         url: 'http://localhost/test/index.php?callback=read&city=深圳市',
    //         jsonp: false,
    //         callback: function(data) {
    //             console.log("同步：", data);
    //         }
    //     }
    // },
    progress: function(completedCount, total) {
        // console.log(total);
        // console.log(Math.floor((completedCount / total) * 100));
    },
    completeLoad: function() {
        // console.log("已完成所有加载项");
        document.getElementById("loadingBox").className = "box hide";
    }
};

function read() {
    console.log("异步：", arguments[0])
}


ReactDOM.render( < Preload loadingElm={loadingElm} data={data}/ > , document.getElementById("loading"));
```

##Usage
[MIT]()
