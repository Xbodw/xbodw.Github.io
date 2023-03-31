"use script";
//This script by Xbodw.
//此脚本由Xbodw编写，请勿盗用!

var TapPage=function(Page) {
  window.location.pathname=path;
}

var AddElement=function(ElementName,GetElement) {
  var result=document.createElement(ElementName);
  GetElement.appendChild(result);
  return result;
}

var LoadingPageLevel=function(){
  var adder= `<div class="loading">
  <style><style type="text/css">html,
bocy,
div {
  margin: 0;
  padding: 0;
}
 
html,
body {
  width: 100%;
  height: 100%;
}
 
.loading {
  width: 100%;
  height: 100%;
  position:fixed;
  background-color: black;
  top: 0;
            bottom: 0;
            left: 0;
            right: 0;
            margin: auto;
}
 
.loading i {
  margin: auto;
  position: absolute;
  top: calc(50% - 40px);
  left: calc(50% - 40px);
  width: 80px;
  height: 80px;
  display: block;
}
 
.loading span {
  position: absolute;
  width: 100%;
  height: 100%;
  opacity: 0;
  color: black;
}
 
.loading span:after {
  content: "";
  display: block;
  position: absolute;
  left: 0px;
  top: 0px;
  width: 10px;
  height: 10px;
  background: var(--main, #00baff);
  border-radius: 50%;
}
 
.loading span:nth-child(1) {
  animation: i1 5.5s 0.2s infinite;
}
 
.loading span:nth-child(2) {
  animation: i2 5.5s 0.4s infinite;
}
 
.loading span:nth-child(3) {
  animation: i3 5.5s 0.6s infinite;
}
 
.loading span:nth-child(4) {
  animation: i4 5.5s 0.8s infinite;
}
 
.loading span:nth-child(5) {
  animation: i5 5.5s 1s infinite;
}
 
.loading span:nth-child(6) {
  animation: i6 5.5s 1.2s infinite;
}
 
@keyframes i1 {
  0% {
    opacity: 1;
    transform: rotate(190deg);
    animation-timing-function: cubic-bezier(0.29, 0.44, 0.32, 0.74);
  }
  7% {
    opacity: 1;
    transform: rotate(300deg);
    animation-timing-function: linear;
  }
  30% {
    opacity: 1;
    transform: rotate(450deg);
    animation-timing-function: cubic-bezier(0.53, 0.27, 0.37, 0.81);
  }
  39% {
    opacity: 1;
    transform: rotate(645deg);
    animation-timing-function: linear;
  }
  63% {
    opacity: 1;
    transform: rotate(800deg);
    animation-timing-function: cubic-bezier(0.5, 0.32, 0.82, 0.54);
  }
  68% {
    opacity: 1;
    transform: rotate(920deg);
    animation-timing-function: ease-in;
  }
  69% {
    opacity: 0;
    transform: rotate(930deg);
  }
}
@keyframes i2 {
  0% {
    opacity: 1;
    transform: rotate(180deg);
    animation-timing-function: cubic-bezier(0.29, 0.44, 0.32, 0.74);
  }
  7% {
    opacity: 1;
    transform: rotate(300deg);
    animation-timing-function: linear;
  }
  30% {
    opacity: 1;
    transform: rotate(450deg);
    animation-timing-function: cubic-bezier(0.53, 0.27, 0.37, 0.81);
  }
  39% {
    opacity: 1;
    transform: rotate(645deg);
    animation-timing-function: linear;
  }
  63% {
    opacity: 1;
    transform: rotate(800deg);
    animation-timing-function: cubic-bezier(0.5, 0.32, 0.82, 0.54);
  }
  68% {
    opacity: 1;
    transform: rotate(910deg);
    animation-timing-function: ease-in;
  }
  69% {
    opacity: 0;
    transform: rotate(920deg);
  }
}
@keyframes i3 {
  0% {
    opacity: 1;
    transform: rotate(170deg);
    animation-timing-function: cubic-bezier(0.29, 0.44, 0.32, 0.74);
  }
  7% {
    opacity: 1;
    transform: rotate(300deg);
    animation-timing-function: linear;
  }
  30% {
    opacity: 1;
    transform: rotate(450deg);
    animation-timing-function: cubic-bezier(0.53, 0.27, 0.37, 0.81);
  }
  39% {
    opacity: 1;
    transform: rotate(645deg);
    animation-timing-function: linear;
  }
  63% {
    opacity: 1;
    transform: rotate(800deg);
    animation-timing-function: cubic-bezier(0.5, 0.32, 0.82, 0.54);
  }
  68% {
    opacity: 1;
    transform: rotate(900deg);
    animation-timing-function: ease-in;
  }
  69% {
    opacity: 0;
    transform: rotate(910deg);
  }
}
@keyframes i4 {
  0% {
    opacity: 1;
    transform: rotate(160deg);
    animation-timing-function: cubic-bezier(0.29, 0.44, 0.32, 0.74);
  }
  7% {
    opacity: 1;
    transform: rotate(300deg);
    animation-timing-function: linear;
  }
  30% {
    opacity: 1;
    transform: rotate(450deg);
    animation-timing-function: cubic-bezier(0.53, 0.27, 0.37, 0.81);
  }
  39% {
    opacity: 1;
    transform: rotate(645deg);
    animation-timing-function: linear;
  }
  63% {
    opacity: 1;
    transform: rotate(800deg);
    animation-timing-function: cubic-bezier(0.5, 0.32, 0.82, 0.54);
  }
  68% {
    opacity: 1;
    transform: rotate(890deg);
    animation-timing-function: ease-in;
  }
  69% {
    opacity: 0;
    transform: rotate(900deg);
  }
}
@keyframes i5 {
  0% {
    opacity: 1;
    transform: rotate(150deg);
    animation-timing-function: cubic-bezier(0.29, 0.44, 0.32, 0.74);
  }
  7% {
    opacity: 1;
    transform: rotate(300deg);
    animation-timing-function: linear;
  }
  30% {
    opacity: 1;
    transform: rotate(450deg);
    animation-timing-function: cubic-bezier(0.53, 0.27, 0.37, 0.81);
  }
  39% {
    opacity: 1;
    transform: rotate(645deg);
    animation-timing-function: linear;
  }
  63% {
    opacity: 1;
    transform: rotate(800deg);
    animation-timing-function: cubic-bezier(0.5, 0.32, 0.82, 0.54);
  }
  68% {
    opacity: 1;
    transform: rotate(880deg);
    animation-timing-function: ease-in;
  }
  69% {
    opacity: 0;
    transform: rotate(880deg);
  }
}
@keyframes i6 {
  0% {
    opacity: 1;
    transform: rotate(140deg);
    animation-timing-function: cubic-bezier(0.29, 0.44, 0.32, 0.74);
  }
  7% {
    opacity: 1;
    transform: rotate(300deg);
    animation-timing-function: linear;
  }
  30% {
    opacity: 1;
    transform: rotate(450deg);
    animation-timing-function: cubic-bezier(0.53, 0.27, 0.37, 0.81);
  }
  39% {
    opacity: 1;
    transform: rotate(645deg);
    animation-timing-function: linear;
  }
  63% {
    opacity: 1;
    transform: rotate(800deg);
    animation-timing-function: cubic-bezier(0.5, 0.32, 0.82, 0.54);
  }
  68% {
    opacity: 1;
    transform: rotate(870deg);
    animation-timing-function: ease-in;
  }
  69% {
    opacity: 0;
    transform: rotate(880deg);
  }
}</style>
    <i>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
        <span></span>
    </i>
</div>`;
    var add = document.createElement('div');
    add.innerHTML = adder;
    document.body.appendChild(add);
}

var DeleteLoadingPageLevel= function() {
  document.querySelector('div[id="loading"]').remove();
}

var checkm=function() {
  var userAgentInfo=navigator.userAgent;
        var Agents =new Array("Android","iPhone","SymbianOS","Windows Phone","iPad","iPod");
        var flag=true;
        for(var v=0;v<Agents.length;v++) {
           if(userAgentInfo.indexOf(Agents[v])>0) {
             flag=false;
             break;
           }
         }
         if(flag == false) {
            window.location.pathname = "/AndroidNotch.html";
         } else {
           DeleteLoadingPageLevel();
         }
}
var check=function() {
        LoadingPageLevel();
        setTimeout("checkm();", 3000 )
}
 
