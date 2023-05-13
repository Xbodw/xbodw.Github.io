// 灏佽寮圭獥layer缁勪欢绛 
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
          btn: ['确定','取消']
      }, function( index ){
          //纭畾浜嬩欢
          if( typeof callback.ok == "function" ){
              callback.ok();
          }
          layer.close( index );
      }, function( index ){
          //鍙栨秷浜嬩欢
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


// 鍔熻兘
$(document).ready(function() {
  var chatBtn = $('#chatBtn');
  var chatInput = $('#chatInput');
  var chatWindow = $('#chatWindow');

  // 瀛樺偍瀵硅瘽淇℃伅,瀹炵幇杩炵画瀵硅瘽
  var messages = [];

  // 妫€娴嬫槸鍚︽槸html浠ｇ爜鐨勬爣蹇楀彉閲 
  var checkHtmlFlag = false;

  // 妫€鏌ヨ繑鍥炵殑淇℃伅鏄惁鏄纭俊鎭 
  var resFlag = true

  // 杞箟html浠ｇ爜(瀵瑰簲瀛楃杞Щ涓篽tml瀹炰綋)锛岄槻姝㈠湪娴忚鍣ㄦ覆鏌 
  function escapeHtml(html) {
    let text = document.createTextNode(html);
    let div = document.createElement('div');
    div.appendChild(text);
    return div.innerHTML;
  }

  // 鍒ゆ柇杈撳嚭鍐呭鏄惁鍖呭惈html鏍囩
  function checkHtmlTag(str) {
    let pattern = /<\s*\/?\s*[a-z]+(?:\s+[a-z]+=(?:"[^"]*"|'[^']*'))*\s*\/?\s*>/i;  // 鍖归厤HTML鏍囩鐨勬鍒欒〃杈惧紡
    return pattern.test(str); // 杩斿洖鍖归厤缁撴灉
  }
  
  // 娣诲姞璇锋眰娑堟伅鍒扮獥鍙 
  function addRequestMessage(message) {
    $(".answer .tips").css({"display":"none"});    // 鎵撹祻鍗￠殣钘 
    chatInput.val('');
    let escapedMessage = escapeHtml(message);  // 瀵硅姹俶essage杩涜杞箟锛岄槻姝㈣緭鍏ョ殑鏄痟tml鑰岃娴忚鍣ㄦ覆鏌 
    let requestMessageElement = $('<br><br><div class="row message-bubble"><div class="message-text request">' +  escapedMessage + '</div></div>');
    chatWindow.append(requestMessageElement);
    let responseMessageElement = $('<br><br><div class="row message-bubble"><div class="message-text response"><p>ChatGPT正在解析...</p></div></div><br>');
    chatWindow.append(responseMessageElement);
    window.scrollTo(0, document.documentElement.scrollHeight);
    chatWindow.animate({ scrollTop: chatWindow.prop('scrollHeight') }, 500);
  }
  
  // 娣诲姞鍝嶅簲娑堟伅鍒扮獥鍙 ,娴佸紡鍝嶅簲姝ゆ柟娉曚細鎵ц澶氭
  function addResponseMessage(message) {
    let lastResponseElement = $(".message-bubble .response").last();
    lastResponseElement.empty();
    let escapedMessage;
    if(checkHtmlTag(message)){  // 濡傛灉鏄痟tml浠ｇ爜
      escapedMessage = marked(escapeHtml(message)); 
      checkHtmlFlag = true;
    }else{
      escapedMessage = marked(message);  // 鍝嶅簲娑堟伅markdown瀹炴椂杞崲涓篽tml
      checkHtmlFlag = false;
    }
    lastResponseElement.append(escapedMessage);
    chatWindow.scrollTop(chatWindow.prop('scrollHeight'));
    hljs.initHighlightingOnLoad();
    window.scrollTo(0, document.documentElement.scrollHeight);
  }

  // 娣诲姞澶辫触淇℃伅鍒扮獥鍙 
  function addFailMessage(message) {
    let lastResponseElement = $(".message-bubble .response").last();
    lastResponseElement.empty();
    lastResponseElement.append(message);
    chatWindow.scrollTop(chatWindow.prop('scrollHeight'));
    window.scrollTo(0, document.documentElement.scrollHeight);
    messages.pop() // 澶辫触灏辫鐢ㄦ埛杈撳叆淇℃伅浠庢暟缁勫垹闄 
  }
  

  // 鍙戦€佽姹傝幏寰楀搷搴 
  //澶囩敤缃戝潃https://openai.1rmb.tk/v1/chat/completions銆乭ttps://api.openai.com/v1/chat
  async function sendRequest(data) {
    //V1 string add chat/ to Use Model 3.5
    const response = await fetch('https://openai.1rmb.tk/v1/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + data.apiKey
      },
      body: JSON.stringify({
        "messages": data.prompt,
        "model": "gpt-3.0",
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
            addFailMessage('<p class="ChatGPTError">抱歉,ChatGPT遇到错误,请稍后重试.</p>');
            resFlag = false;
          }
        } 
      }
    }
    return str;
  }

  // 澶勭悊鐢ㄦ埛杈撳叆
  chatBtn.click(function() {
    // 瑙ｇ粦閿洏浜嬩欢
    chatInput.off("keydown",handleEnter);
    
    // 淇濆瓨api key涓庡璇濇暟鎹 
    let data = {
      "apiKey" : "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",
    }
   
    // 鍒ゆ柇鏄惁浣跨敤鑷繁鐨刟pi key
    if ($(".key .ipt-1").prop("checked")){
      var apiKey = $(".key .ipt-2").val();
      if (apiKey.length < 20 ){
          common_ops.alert("请输入正确的 api key ！",function(){
            chatInput.val('');
            chatInput.on("keydown",handleEnter);
          })
          return
      }else{
        data.apiKey = apiKey
      }

    }

    let message = chatInput.val();
    if (message.length == 0){
      common_ops.alert("请输入内容",function(){
        chatInput.val('');
        // 閲嶆柊缁戝畾閿洏浜嬩欢
        chatInput.on("keydown",handleEnter);
      })
      return
    }

    addRequestMessage(message);
    messages.push({"role": "user", "content": message})
    chatBtn.attr('disabled',true)

    data.prompt = messages;
    
    sendRequest(data).then((res) => {
      if(resFlag){
        messages.push({"role": "assistant", "content": res});
      }
      // 鏀跺埌鍥炲锛岃鎸夐挳鍙偣鍑 
      chatBtn.attr('disabled',false)
      // 閲嶆柊缁戝畾閿洏浜嬩欢
      chatInput.on("keydown",handleEnter); 
      if (checkHtmlFlag) {
        let lastResponseElement = $(".message-bubble .response").last();
        let lastResponseHtml = lastResponseElement.html();
        let newLastResponseHtml = lastResponseHtml.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/'/g, "'").replace(/&quot;/g, "\"");
        lastResponseElement.html(newLastResponseHtml);
      }
    });

  });  

  function handleEnter(e){
    if (e.keyCode==13){
      document.querySelector('.tip').setAttribute('style',"display:none");
      chatBtn.click();
      e.preventDefault();  //閬垮厤鍥炶溅鎹㈣
    }
  }

  chatInput.on("keydown",handleEnter);
  //document.addEventListener('contextmenu',function(e){e.preventDefault();});
document.addEventListener('keydown',function(e){if(e.key == 'F12'){e.preventDefault();}});
});
