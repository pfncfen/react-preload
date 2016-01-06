# react-preload
react preload component
##install
```
git clone https://github.com/jayZOU/react-preload.git
npm i
npm run dev
```
[http://localhost:8080/](http://localhost:8080/)
##Usage
```javascript
var React = require('react'),
	ReactDOM = require("react-dom"),
    Preload = require('./component/preload.js');

var data = {
    sources: {
        imgs: {
            source: [
                "./images/b2.jpg",
                "./images/b1.jpg"
            ],
            callback: function() {
                // alert("队列1完成");
            }
        },
        audio: {
            source: [
                "./audio/a.mp3",
                "./audio/b.mp3"
            ],
           callback: function() {
               //alert(2);
           }

       },
    },
    config: {
        timeOut: 11,
        timeOutCB: function(){
            console.log("资源加载超时");
        },
    }
}

ReactDOM.render(<Preload data={data}/> , document.getElementById("loading"));
```
