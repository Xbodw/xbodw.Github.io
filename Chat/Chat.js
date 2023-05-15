// 封装弹窗layer组件等
var common_ops = {
  alert:function( msg ,cb ){
      layer.alert( msg,{
          yes:function( index ){
              if( typeof cb == "function" ){
                  cb();
              }
              layer.close( index );
          }
      });
  },
  confirm:function( msg,callback ){
      callback = ( callback != undefined )?callback: { 'ok':null, 'cancel':null };
      layer.confirm( msg , {
          btn: ['确定','取消'] //按钮
      }, function( index ){
          //确定事件
          if( typeof callback.ok == "function" ){
              callback.ok();
          }
          layer.close( index );
      }, function( index ){
          //取消事件
          if( typeof callback.cancel == "function" ){
              callback.cancel();
          }
          layer.close( index );
      });
  },
  tip:function( msg,target ){
      layer.tips( msg, target, {
          tips: [ 3, '#e5004f']
      });
      $('html, body').animate({
          scrollTop: target.offset().top - 10
      }, 100);
  }
};


// 功能
$(document).ready(function() {
  var chatBtn = $('#chatBtn');
  var chatInput = $('#chatInput');
  var chatWindow = $('#chatWindow');

  // 存储对话信息,实现连续对话
  var messages = [];

  // 检测是否是html代码的标志变量
  var checkHtmlFlag = false;

  // 检查返回的信息是否是正确信息
  var resFlag = true

  // 转义html代码(对应字符转移为html实体)，防止在浏览器渲染
  function escapeHtml(html) {
    let text = document.createTextNode(html);
    let div = document.createElement('div');
    div.appendChild(text);
    return div.innerHTML;
  }

  // 判断输出内容是否包含html标签
  function checkHtmlTag(str) {
    let pattern = /<\s*\/?\s*[a-z]+(?:\s+[a-z]+=(?:"[^"]*"|'[^']*'))*\s*\/?\s*>/i;  // 匹配HTML标签的正则表达式
    return pattern.test(str); // 返回匹配结果
  }
  
  // 添加请求消息到窗口
  function addRequestMessage(message) {
    $(".tips").css({"display":"none"});    // 打赏卡隐藏
    chatInput.val('');
    let escapedMessage = escapeHtml(message);  // 对请求message进行转义，防止输入的是html而被浏览器渲染
    let requestMessageElement = $('<br><br><div class="row message-bubble"><div class="message-text request">' +  escapedMessage + '</div><img class="me" src="User.png"></div>');
    chatWindow.append(requestMessageElement);
    let responseMessageElement = $('<br><br><div class="row message-bubble"><img class="chatGPT" src="ChatGPT.png"><span>&nbsp;Flutas ChatGPT AI<div class="message-text response"><p>Reposeing...</p></div></div><br><br><br><br>');
    chatWindow.append(responseMessageElement);
    window.scrollTo(0, document.documentElement.scrollHeight);
    chatWindow.animate({ scrollTop: chatWindow.prop('scrollHeight') }, 500);
  }
  
  // 添加响应消息到窗口,流式响应此方法会执行多次
  function addResponseMessage(message) {
    let lastResponseElement = $(".message-bubble .response").last();
    lastResponseElement.empty();
    let escapedMessage;
    if(checkHtmlTag(message)){  // 如果是html代码
      escapedMessage = marked(escapeHtml(message)); 
      checkHtmlFlag = true;
    }else{
      escapedMessage = marked(message);  // 响应消息markdown实时转换为html
      checkHtmlFlag = false;
    }
    var Messgaex = escapedMessage.replace(/GPT/g, 'Flutas ChatGPT AI');
    lastResponseElement.append(Messgaex);
    chatWindow.scrollTop(chatWindow.prop('scrollHeight'));
    if(document.querySelector('code') != null) {
     hljs.highlightAll();
    }
    window.scrollTo(0, document.documentElement.scrollHeight);
  }

  // 添加失败信息到窗口
  function addFailMessage(message) {
    let lastResponseElement = $(".message-bubble .response").last();
    lastResponseElement.empty();
    lastResponseElement.append(message);
    chatWindow.scrollTop(chatWindow.prop('scrollHeight'));
    window.scrollTo(0, document.documentElement.scrollHeight);
    messages.pop() // 失败就让用户输入信息从数组删除
  }
  

  // 发送请求获得响应
  //备用网址https://openai.1rmb.tk/v1/chat/completions、https://api.openai.com/v1/chat、https://open.aiproxy.xyz/v1/chat/completions
//不需要填写api key的网址(协议http) http://152.32.207.62/v1/chat/completions
  async function sendRequest(data) {
    const response = await fetch('http://152.32.207.62/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + data.apiKey,
        'User-Agent': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT10.0; Trident/5.0)',
      },
      body: JSON.stringify({
        "messages": data.prompt,
        "model": "gpt-3.5-turbo",
        "max_tokens": 2048,
        "temperature": 0.5,
        "top_p": 1,
        "n": 1,
        "stream": true
      })
    }); 
  
    const reader = response.body.getReader();
    let res;
    let str = '';
    while (true) {
      const { done, value } = await reader.read();
      if (done) {
        break;
      }
      res = new TextDecoder().decode(value).replace(/^data: /gm, '').replace("[DONE]",'');
      const lines = res.trim().split(/[\n]+(?=\{)/);
      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const jsonObj = JSON.parse(line);
        if (jsonObj.choices && jsonObj.choices[0].delta.content) {
          str += jsonObj.choices[0].delta.content;
          addResponseMessage(str);
          resFlag = true;
        }else{
          if(jsonObj.error){
            addFailMessage('<p class="error">抱歉,ChatGPT遇到错误. ' + jsonObj.error.type + " : " + jsonObj.error.message + '</p>');
            resFlag = false;
          }
        } 
      }
      if(document.querySelector('code') != null) {
      }
    }
    return str;
  }

  // 处理用户输入
  chatBtn.click(function() {
    // 解绑键盘事件
    chatInput.off("keydown",handleEnter);
    
    // 保存api key与对话数据
    let data = {
      "apiKey" : "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", // 这里填写固定 apiKey
    }
   
    // 判断是否使用自己的api key
    if ($(".key .ipt-1").prop("checked")){
      var apiKey = $(".key .ipt-2").val();
      if (apiKey.length < 20 ){
          common_ops.alert("请输入正确的 api key ！",function(){
            chatInput.val('');
            // 重新绑定键盘事件
            chatInput.on("keydown",handleEnter);
          })
          return
      }else{
        data.apiKey = apiKey;
      }

    }

    let message = chatInput.val();
    if (message.length == 0){
      common_ops.alert("请输入内容！",function(){
        chatInput.val('');
        // 重新绑定键盘事件
        chatInput.on("keydown",handleEnter);
      })
      return
    }

    addRequestMessage(message);
    // 将用户消息保存到数组
    messages.push({"role": "user", "content": message})
    // 收到回复前让按钮不可点击
    chatBtn.attr('disabled',true)

    data.prompt = messages;
    
    sendRequest(data).then((res) => {
      if(resFlag){
        messages.push({"role": "assistant", "content": res});
      }
      // 收到回复，让按钮可点击
      chatBtn.attr('disabled',false)
      // 重新绑定键盘事件
      chatInput.on("keydown",handleEnter); 
      if (checkHtmlFlag) {
        let lastResponseElement = $(".message-bubble .response").last();
        let lastResponseHtml = lastResponseElement.html();
        let newLastResponseHtml = lastResponseHtml.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/'/g, "'").replace(/&quot;/g, "\"");
        lastResponseElement.html(newLastResponseHtml);
      }
    });

  });  

  // Enter键盘事件
  function handleEnter(e){
    if (e.keyCode==13){
      document.querySelector('.tip').setAttribute('style',"display:none");
      chatBtn.click();
      e.preventDefault();  //避免回车换行
    }
  }

  // 绑定Enter键盘事件
  chatInput.on("keydown",handleEnter);
  
  // // 禁用右键菜单
  // document.addEventListener('contextmenu',function(e){
  //   e.preventDefault();  // 阻止默认事件
  // });

  // // 禁止键盘F12键
  // document.addEventListener('keydown',function(e){
  //   if(e.key == 'F12'){
  //       e.preventDefault(); // 如果按下键F12,阻止事件
  //   }
  // });
});

function copy(obj) {
 let btn = $(obj)
 let h = $(btn).parent();
 let temp = $("<textarea></textarea>");
        //避免复制内容时把按钮文字也复制进去。先临时置空
        btn.text("");
        temp.text(h.text());
        temp.appendTo(h);
        temp.select();
        document.execCommand("Copy");
        temp.remove();
        btn.val('复制成功');
        setTimeout(()=> {
            btn.val('复制代码');
        },1500);
}

function AddCodeCopy(){
        let preList = $('code[class*="hljs.language"');
    for (let pre of preList) {
        //给每个代码块增加上“复制代码”按钮
        let btn = $("<span class=\"btn-pre-copy\" onclick='copy(this)'>复制代码</span>");
        btn.prependTo(pre);
    }
    }