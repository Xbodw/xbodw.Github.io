//封装是否停止解析
//Backgroundmp3.autoplay = true;
var Stop = false;
var StopRepose = document.querySelector('.StopRepose');
var SureCopy = false;
var alltime = 0;
if (localStorage.getItem('DevMode') == undefined) {
  var DevMode = false;
  localStorage.setItem('DevMode', false);
} else {
  var DevMode = true;
}
if (DevMode === true) {
  $('#active-ai').text('Flutas AI 许可证 已激活')
  $('#Dev').text('更改产品密匙');
}

var nkey = 'sk-VOgFOZqOY7Th2wONGBLhvkjhrZ4p87Qvq0eq4QuYc5RFyuDy';
var data = {
  "apiKey": nkey, // 这里填写固定 apiKey
}
var ListChatData = false;
var loadjson = $('#loadjson')[0];
var keyinput = $('#keyinput')[0];
var messages = [{ "role": "system", "content": "" }];
data.prompt = messages;
var checkHtmlFlag = false;
var resFlag = true;

function OnLoadColor() {
  var colorsex = localStorage.getItem('ItemColor');
  loadColor(colorsex);
}


function loadColor(color) {

  document.querySelector('#pp').innerHTML = `
  :root {
    --p-color: ` + color + `;
  }
  svg {
    fill : var(--p-color);
  }
  `;

  if (color == undefined) {
    color = '#000000';
  }
  const elements = document.querySelectorAll('*');
  /*
  // 迭代遍历元素并设置样式
  elements.forEach(element => {
    // 检查元素及其祖先节点是否具有指定的类名
    if (!element.classList.contains('row') && !element.classList.contains('message-bubble') && element.tagName != 'A' && element.tagName != 'INPUT') {
      // 设置前景色为红色
      element.style.color = color;
    }
  });
  */
  $('#color-picker').val(color);

}

function ajax(o) {
  return new Promise(function (e, n) {
    var t = new XMLHttpRequest;
    t.open(o.method || "GET", o.url),
      t.onload = function () {
        200 <= t.status && t.status < 300 ? e(t.response) : n(new Error(t.statusText))
      }
      ,
      t.onerror = function () {
        n(new Error("Network Error"))
      }
      ,
      t.send(o.data),
      t.finally = function (e) {
        t.onload = function () {
          e()
        }
          ,
          t.onerror = function () {
            e()
          }
      }
  }
  )
}

async function Query() {
  let t = data.apiKey;
  var f = false;
  var all = '';
  var used = '';
  var ren = new Date();
  var isr = false;
  if (/^sk-[a-zA-Z0-9]{48}$/.test(t)) {
    await ajax({
      method: "GET",
      url: "https://ffa.firstui.cn/api/main/bill?key=" + t + "&ext=1683521557593"
    }).then(function (e) {
      var n = JSON.parse(e).data;
      var tt = n.returnObject;
      all = tt.total.toFixed(7),
        used = tt.usage.toFixed(7),
        isr = new Date(1e3 * tt.util) < ren;
      if (used == all) {
        f = true;
      }

    })
  } else { alert("FlutasAI出现API错误,请等待修复.") }
  if (f) {
    alert("FlutasAI出现API错误,请等待修复.")
  }
}

// 功能
function getTokensCount(msg) {
  let totalTokens = 0;
  if (typeof (msg) == 'object') {
    for (let i = 0; i < msg.length; i++) {
      let content = msg[i].content;
      let tokenCount = 0;
      for (let j = 0; j < content.length; j++) {
        let char = content.charAt(j);
        if (/[^\x00-\xff]/.test(char)) {
          tokenCount += 2; // 汉字字符，token数加2
        } else {
          tokenCount += 1; // 非汉字字符，token数加1
        }
      }
      totalTokens += tokenCount;
    }
  } else {
    for (let j = 0; j < msg.length; j++) {
      let char = msg.charAt(j);
      if (/[^\x00-\xff]/.test(char)) {
        totalTokens += 2; // 汉字字符，token数加2
      } else {
        totalTokens += 1; // 非汉字字符，token数加1
      }
    }
  }
  return totalTokens;
}

function MessagePushX(message) {
  messages.push(message);
}
function addMessage(message) {
  messages.push(message);
  let totaltokens = getTokensCount(messages);
  while (totaltokens > 4096) {
    let oldestMessage = messages.shift();
    let oldestTokenCount = 0;
    for (let j = 0; j < oldestMessage.content.length; j++) {
      let char = oldestMessage.content.charAt(j);
      if (/[^\x00-\xff]/.test(char)) {
        oldestTokenCount += 2;
      } else {
        oldestTokenCount += 1;
      }
    }
    totaltokens -= oldestTokenCount;
  }
}


$(document).ready(function () {

  var chatBtn = $('#chatBtn');
  var chatInput = $('#chatInput');
  var chatWindow = $('#chatWindow');
  GetArray();
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
    chatInput.val('');
    let escapedMessage = escapeHtml(message);  // 对请求message进行转义，防止输入的是html而被浏览器渲染
    let requestMessageElement = $('<br><br><div class="row message-bubble"><img class="me" src="User.png"><div class="message-text request"><p>' + escapedMessage + '</p></div>' + '<span class="response-end">&gt;</span>' + '</div>');
    chatWindow.append(requestMessageElement);
    let responseMessageElement = $('<br><br><div class="row message-bubble"><img class="chatGPT" src="ChatGPT.png"><span>&nbsp;Flutas AI<div class="message-text response"><p class="press">&nbsp;</p>' + '<span class="response-end">&gt;</span>' + '</div></div><br><br><br><br>');
    chatWindow.append(responseMessageElement);
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      window.scrollTo(0, document.body.scrollHeight);
    }
    chatWindow.animate({ scrollTop: chatWindow.prop('scrollHeight') }, 500);
  }

  // 添加响应消息到窗口,流式响应此方法会执行多次
  function addResponseMessage(message) {
    let lastResponseElement = $(".message-bubble .response").last();
    lastResponseElement.empty();
    let escapedMessage;
    const codeBlockRegex = /```[\s\S]*?```/g;
    if (checkHtmlTag(message)) {  // 如果是html代码
      escapedMessage = marked.parse(escapeHtml(message)) + '<span class="response-end">&gt;</span>';
      checkHtmlFlag = true;
    } else {
      escapedMessage = marked.parse(message) + '<span class="response-end">&gt;</span>';  // 响应消息markdown实时转换为html
      checkHtmlFlag = false;
    }
    var Messgaex = escapedMessage;
    lastResponseElement.append(Messgaex);
    if (document.querySelector('pre') != null) {
      hljs.highlightAll();
      AddCodeCopy();
    }
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      window.scrollTo(0, document.body.scrollHeight);
    }
    if (Stop == true) {
      return;
    }
  }

  // 添加失败信息到窗口
  function addFailMessage(message) {
    let lastResponseElement = $(".message-bubble .response").last();
    lastResponseElement.empty();
    lastResponseElement.append(message);
    chatWindow.scrollTop(chatWindow.prop('scrollHeight'));
    if ((window.innerHeight + window.scrollY) >= document.body.offsetHeight) {
      window.scrollTo(0, document.body.scrollHeight);
    }
    messages.pop();
  }


  // 发送请求获得响应
  //ChatGPT官方模型https://openai.1rmb.tk/v1/chat/completions、https://api.openai.com/v1/chat、https://open.aiproxy.xyz/v1/chat/completions
  //不需要填写api key的网址(协议http) http://152.32.207.62/v1/chat/completions(账户余额超出范围)
  //接口3 https://api.chatanywhere.tech/v1/chat/completions
  //Pear AI模型
  //https://api.pearktrue.cn/api/gpt/four/
  async function sendRequest(datas) {
    //Normal
    var promptx = new Array(messages[messages.length - 1]);
    if (ListChatData == true) {
      promptx = datas.prompt;
    }
    const response = await fetch('https://api.chatanywhere.tech/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json;charset=UTF-8',
        'Authorization': 'Bearer ' + datas.apiKey,
        'Transfer-Encoding': 'chunked'
      },
      body: JSON.stringify({
        "messages": promptx,
        "model": "gpt-3.5-turbo-0613",
        "max_tokens": 2048,
        "temperature": 0.8,
        "top_p": 1,
        "n": 1,
        "stream": true
      })
    });
    const reader = response.body.getReader();
    let res;
    let str = '';
    while (true) {
      try {
        const { done, value } = await reader.read();
        if (done) {
          break;
        }
        res = new TextDecoder().decode(value).replace(/^data: /gm, '').replace("[DONE]", '');
        const lines = res.trim().split(/[\n]+(?=\{)/);
        for (let i = 0; i < lines.length; i++) {
          const line = lines[i];
          if (line == undefined || line == '') {
            line = {};
          }
          console.info(line);
          const jsonObj = JSON.parse(checkAndFixJSON(line));
          if (jsonObj.choices && jsonObj.choices[0].delta.content) {
            str += jsonObj.choices[0].delta.content;
            //ADDREpose
            await addResponseMessage(str);
            if (Stop == true) {
              return;
            }
            resFlag = true;
          } else {
            if (jsonObj.error) {
              addFailMessage('<p class="error">' + jsonObj.error.type + " : " + jsonObj.error.message + '<br><a onclick="window.open(`mailto:xbodwxbodw@outlook.com?subject=FlutasAI%20%E9%94%99%E8%AF%AF&body=` + this.innerText)">' + jsonObj.error.code + '</a></p>');
              if (jsonObj.error.message.indexOf('However, you requested') != -1) {
                Swal.fire({
                  title: "信息提示",
                  text: "由于模型限制,聊天记录已达到巅峰值,为保证用户体验,聊天数组已被清空(不影响聊天记录).您可继续使用",
                  showCloseButton: true,
                  icon: "warning",
                  showCancelButton: false,
                  confirmButtonColor: "#DD6B55",
                  confirmButtonText: "确定"
                });

              }
              replaceError('invalid_api_key', '不合理的API Key.请重新填写.');
              replaceError('invalid_request_error', '请求错误,如账户已被封禁,请反馈给Flutas AI管理员');
              replaceError('insufficient_quota', '余额错误')
              replaceError('You exceeded your current quota, please check your plan and billing details.', 'Flutas AI余额配置出现问题,请联系FlutasAI管理员.管理员: https://www.douyin.com/user/MS4wLjABAAAAR268uU6l5jHiwUb8Igr7UGqRV4V_GyHY_IajlltMt-I')
              resFlag = true;
            }
          }
        }
      } catch(e) {
        console.log(e);
      }
    }
    return str;
  }


  // 处理用户输入
  chatBtn.click(async function () {
    let surenext = true;
    if (CheckTalk() == false) {
      if (DevMode == false && data.apiKey == nkey) {
        surenext = false;
        Swal.fire({
          title: "次数不足",
          html: "</p>注意,由于Flutas AI维护成本逐渐升高,我们暂时采取每日限制互动次数设置,每日最多可以发送6次消息</p><br>有关更多信息,请联系<a href='https://www.douyin.com/user/MS4wLjABAAAAR268uU6l5jHiwUb8Igr7UGqRV4V_GyHY_IajlltMt-I'>Flutas工作室群组</a>",
          icon: "warning",
          showCloseButton: true,
          showCancelButton: false,
          confirmButtonColor: "#DD6B55",
          confirmButtonText: "确定"
        });
        addFailMessage('<p class="error">注意,由于Flutas AI维护成本逐渐升高,我们暂时采取每日限制互动次数设置,每日最多可以发送6次消息<br>有关更多信息,请联系<a href="https://www.douyin.com/user/MS4wLjABAAAAR268uU6l5jHiwUb8Igr7UGqRV4V_GyHY_IajlltMt-I">Flutas工作室群组</a>');
      }
    }
    if (surenext == false) {
      return;
    }
    Stop = false;
    // 解绑键盘事件
    chatInput.off("keydown", handleEnter);

    let message = chatInput.val();
    if (message.length == 0) {
      //cancelButtonText: "取消"
      Swal.fire({
        title: "输入提示",
        text: "请输入请求的信息!",
        showCloseButton: true,
        icon: "warning",
        showCancelButton: false,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "确定"
      });
      chatInput.val('');
      // 重新绑定键盘事件
      chatInput.on("keydown", handleEnter);
      return;
    }
    document.querySelector('.tip').setAttribute('style', "display:none");
    addRequestMessage(message);
    addMessage({ "role": "user", "content": message });
    UpdateTalk();
    // 将用户消息保存到数组
    // 收到回复前让按钮不可点击
    chatBtn.attr('disabled', true);
    StopRepose.setAttribute('style', `display:block`);
    data.prompt = messages;
    Stop = false;
    await sendRequest(data).then((res) => {
      if (resFlag) {
        if (Stop == false) {
          addMessage({ "role": "assistant", "content": res });
          UpdateTalk()
        } else {
          messages.pop();
        }
      } else {
        addMessage({ "role": "assistant", "content": "该回答出现问题,可能请求失败,已被Flutas AI自动屏蔽,请尝试重新提问" });
        UpdateTalk()
      }
      // 收到回复，让按钮可点击
      chatBtn.attr('disabled', false)
      // 重新绑定键盘事件
      chatInput.on("keydown", handleEnter);
      if (checkHtmlFlag) {
        let lastResponseElement = $(".message-bubble .response").last();
        let lastResponseHtml = lastResponseElement.html();
        let newLastResponseHtml = lastResponseHtml.replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/&amp;/g, "&").replace(/'/g, "'").replace(/&quot;/g, "\"");
        lastResponseElement.html(newLastResponseHtml);
      }
    });
    StopRepose.setAttribute('style', `display:none`);
  });

  // Enter键盘事件
  function handleEnter(e) {
    if (e.keyCode == 13) {
      chatBtn.click();
      e.preventDefault();  //避免回车换行
    }
  }

  // 绑定Enter键盘事件
  chatInput.on("keydown", handleEnter);

  // // 禁用右键菜单
  document.addEventListener('contextmenu', function (e) {
    e.preventDefault();  // 阻止默认事件
  });

  // // 禁止键盘F12键
  document.addEventListener('keydown', function (e) {
    if (e.key == 'F12') {
      e.preventDefault(); // 如果按下键F12,阻止事件
    }
  });

  //禁止复制文本,只能通过复制代码
  //document.oncopy = (event) => {
  //if(!SureCopy) {
  //event.preventDefault();
  //}
  //SureCopy = false;
  //return;
  //}
  $('#chatInput')[0].addEventListener('input', function (e) {
    if ($('#chatInput').val() == "\\") {
      $('.rop')[0].setAttribute('style', 'display:block;');
    } else {
      $('.rop')[0].setAttribute('style', 'display:none;');
    }
  });
});
//复制代码块事件
function copy(obj) {
  let btn = $(obj)
  let h = $(btn).parent();
  let temp = $("<textarea></textarea>");
  //避免复制内容时把按钮文字也复制进去。先临时置空
  btn.val("");
  temp.text(h.text());
  temp.appendTo(h);
  temp.select();
  document.execCommand("Copy");
  temp.remove();
  btn[0].textContent = '复制成功';
  setTimeout(() => {
    btn[0].textContent = '复制代码';
  }, 1500);
}

function copytext(text) {
  const temp = document.createElement("textarea");
  temp.value = text;
  document.body.appendChild(temp);
  temp.select();
  document.execCommand("copy");
  document.body.removeChild(temp);
}

//添加复制代码按钮
async function AddCodeCopy() {
  // 获取所有代码块元素
  const codeBlocks = document.querySelectorAll("pre");
  let CodeBlk = $('.copy-button');
  if (CodeBlk != null) {
    await CodeBlk.remove();
  }
  await codeBlocks.forEach((codeBlock, index) => {
    // 创建复制按钮元素
    const copyButton = document.createElement("span");
    copyButton.classList.add("copy-button");
    copyButton.textContent = '复制代码';
    // 为按钮添加点击事件监听器
    copyButton.addEventListener("click", () => {
      // 获取代码内容
      copyButton.textContent = '';
      const codeContent = codeBlock.querySelector("code").innerText;
      // 创建临时textarea元素
      const textarea = document.createElement("textarea");
      textarea.value = codeContent;
      document.body.appendChild(textarea);
      // 选中textarea内容
      SureCopy = true; //临时允许复制
      textarea.select();
      textarea.setSelectionRange(0, 99999);

      // 复制内容到剪贴板
      document.execCommand("copy");
      copyButton.textContent = copyButton.parentElement.childNodes[0].className.split('-')[1].replace(/hljs/g, '').replace(/language/g, '') + ' 复制成功';
      // 删除临时元素
      document.body.removeChild(textarea);
      setTimeout(() => {
        copyButton.textContent = copyButton.parentElement.childNodes[0].className.split('-')[1].replace(/hljs/g, '').replace(/language/g, '') + ' 复制代码';
      }, 1500);
    });

    codeBlock.appendChild(copyButton);
    copyButton.textContent = copyButton.parentElement.childNodes[0].className.split('-')[1].replace(/hljs/g, '').replace(/language/g, '') + ' 复制代码';
  });
}

//获取指定选择器最后一个元素
function GetLast(selector) {
  return document.querySelectorAll(selector)[document.querySelectorAll(selector).length - 1];
}


//停止解析
$('.StopRepose').click(function () {
  Stop = true;
  $('.StopRepose').css({ "display": "none" });
  console.dir(messages);
  messages.pop();
  data.prompt = messages;
});

$('#savejson')[0].addEventListener("click", function () {
  var datan = data;
  var kn = data.apiKey;
  datan.apiKey = "undefined";
  const jsonData = JSON.stringify(datan);
  const blob = new Blob([jsonData], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = "Flutas_AI-Prompts-" + Date.now() + ".json";

  // 模拟点击下载链接
  link.click();
  // 释放URL对象
  URL.revokeObjectURL(url);
  data.apiKey = kn;
});

function compareVersion(version1, version2) {
  const arr1 = version1.split('.')
  const arr2 = version2.split('.')
  const length1 = arr1.length
  const length2 = arr2.length
  const minlength = Math.min(length1, length2)
  let i = 0
  for (i; i < minlength; i++) {
    let a = parseInt(arr1[i])
    let b = parseInt(arr2[i])
    if (a > b) {
      return 1
    } else if (a < b) {
      return -1
    }
  }
  if (length1 > length2) {
    for (let j = i; j < length1; j++) {
      if (parseInt(arr1[j]) != 0) {
        return 1
      }
    }
    return 0
  } else if (length1 < length2) {
    for (let j = i; j < length2; j++) {
      if (parseInt(arr2[j]) != 0) {
        return -1
      }
    }
    return 0
  }
  return 0
}

async function checkupdate() {
  if (navigator.onLine) {
    let file_url =
      'https://xbodw.github.io/canary/Studios/FlutasAIVersions.txt'
    window.requst = 0;
    window.newver = ' 已发现新版本,但无法确定版本号 ';
    let xhr = new XMLHttpRequest();
    xhr.open("get", file_url, true);
    xhr.responseType = "text";
    xhr.onload = function () {
      if (this.status == 200) {
        console.log("", this.response)
        window.requst = compareVersion(this.response, "4.1.5");
        window.newver = this.response;
      }
    };
    await xhr.send();
    if (window.requst == 1) {
      Swal.fire({
        title: "发现新版本",
        html: "<p>我们已发现Flutas AI的新版本,该版本为" + window.newver + "</p><br></p>本次更新包含了部分Bug修复,不想错过本次更新的用户,请立即跳转更新</p><br><br><p>Flutas AI用户中心</p>",
        icon: "info",
        showCancelButton: true,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "跳转更新",
        showCloseButton: true,
        cancelButtonText: "暂时不更新"
      }).then((res) => { if (res) { window.open('https://xbodw.github.io/Download/ChatGPT.html') } });
    } else {
      Swal.fire({
        title: "未发现新版本",
        text: "我们并未发现Flutas AI的新版本,请检查您的网络链接或稍候重试",
        icon: "warning",
        showCloseButton: true,
        showCancelButton: false,
        confirmButtonColor: "#DD6B55",
        confirmButtonText: "确定"
      });
    }
  }
}

async function sleep(sleepTime) {
  for (var start = new Date; new Date - start <= sleepTime;) { }
}

loadjson.addEventListener('change', async function (e) {
  var reader = new FileReader();
  reader.onerror = function () {
    console.log(reader.error);
    Swal.fire({
      title: "读取失败",
      text: "读取聊天记录失败,请稍候再试.",
      icon: "error",
      showCloseButton: true,
      showCancelButton: false,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "确定"
    });
  };
  if (e.target.files.length == 0) return
  var file = e.target.files[0];
  reader.readAsText(file, "utf8");
  var dta;
  var fs;
  reader.onload = async function () {
    dta = JSON.parse(reader.result);
    fs = dta.prompt;
    $('#chatWindow').html(`<div class="tip"><img src="ChatGPT.png" width="128"><h1 style="display:inline;">Flutas AI</h1><br><br><span>Flutas AI是一个基于ChatGPT Api接口优化制作的人工智能聊天工具,它可以帮助您完成以下功能:
          1.聊天<br>
          2.解答问题<br>
          3.写代码<br>
          ......
          
          
          要开始聊天,请在下方的文本框中输入内容,并按下发送<hr><span style="color:red"><a href="https://www.douyin.com/user/MS4wLjABAAAAR268uU6l5jHiwUb8Igr7UGqRV4V_GyHY_IajlltMt-I" target="blank_">Xbodw</a> <a href="http://kemiweb.11245.ml/" target="blank_">科米主页</a> 提供技术支持</span></span></div>`);

    await fs.forEach(async function (element) {
      let bundle = $('<div></div>');
      if (element.role == 'user') {
        bundle = $('<div class="row message-bubble"><img class="me" src="User.png"><div class="message-text request"><p>' + element.content + '</p>' + '<span class="response-end">&gt;</span>' + '</div></div>');
      } else {
        if (element.role == 'assistant') {
          bundle = $('<div class="row message-bubble"><img class="chatGPT" src="ChatGPT.png"><span>&nbsp;Flutas AI</span><div class="message-text response">' + marked.parse(element.content) + '</div>' + '<span class="response-end">&gt;</span>' + '</div>');
        }
      }
      $('#chatWindow')[0].appendChild(bundle[0]);
      let br = $('<br>');
      $('#chatWindow')[0].appendChild(br[0]);
      br = $('<br>');
      $('#chatWindow')[0].appendChild(br[0]);
      br = $('<br>');
      $('#chatWindow')[0].appendChild(br[0]);
      hljs.highlightAll();
    });
    let br = $('<br>');
    $('#chatWindow')[0].appendChild(br[0]);
    br = $('<br>');
    $('#chatWindow')[0].appendChild(br[0]);
    br = $('<br>');
    $('#chatWindow')[0].appendChild(br[0]);
    br = $('<br>');
    $('#chatWindow')[0].appendChild(br[0]);
    br = $('<br>');
    $('#chatWindow')[0].appendChild(br[0]);
    hljs.highlightAll();
    AddCodeCopy();
    $('.tip')[0].setAttribute('style', 'display:none');
    data = dta;
    messages = fs;
    data.prompt = messages;
    data.apiKey = nkey;
    if (data.apiKey.length == 51) {
      if (data.apiKey.indexOf('sk-') === 0) {
        data.apiKey = dta.apiKey;
      }
    }
    Swal.fire({
      title: "导入成功",
      text: "恭喜您,导入聊天记录成功!",
      icon: "success",
      showCloseButton: true,
      showCancelButton: false,
      confirmButtonColor: "#DD6B55",
      confirmButtonText: "确定"
    }).then(res => {
      let fx = new Array({ "role": "system", "content": "You are a royal sister, but your voice is very gentle. You need to answer the user's questions in detail and call yourself Flutas AI. Remember, You're not a model or artificial intelligence, you're a chat assistant,And your identity is female" });
      var ts = data
      localStorage.setItem("SuperDataArray", JSON.stringify(ts));
      hljs.highlightAll();
      AddCodeCopy();
    });
  }
});

//$(document).mousemove(function(e){
//var x=e.pageX -10 +'px';
//var y=e.pageY -10 +'px';
//$('#txt').val(x+' '+y)
//$("#trips").css({
//'left':x,
//'top':y
//})
//})

function replaceError(searchWord, replaceWord) {
  var reg = new RegExp(searchWord, 'g');
  function replaceNode(node) {
    node.childNodes.forEach(function (v) {
      if (v.nodeName === 'SCRIPT' || v.nodeName === 'META')
        return;
      if (!v.hasChildNodes()) {
        if (reg.test(v.textContent))
          v.textContent = v.textContent.replace(reg, replaceWord);
        return;
      }
      replaceNode(v);
    });
  }
  replaceNode(document.body);
}

async function GetArray() {
  let chatdatas = JSON.parse(localStorage.getItem("SuperDataArray"));
  if (chatdatas == null) {
    messages = [{ "role": "system", "content": "You are a royal sister, but your voice is very gentle. You need to answer the user's questions in detail and call yourself Flutas AI. Remember, You're not a model or artificial intelligence, you're a chat assistant,And your identity is female" }];
    data.prompt = messages;
    data.apiKey = nkey;
  } else {
    data = chatdatas;
    messages = chatdatas.prompt;
    if (chatdatas.apiKey == undefined) data.apiKey = nkey;

  }
  dta = data;
  fs = dta.prompt;
  $('#chatWindow').html(`<div class="tip"><img src="ChatGPT.png" width="128"><h1 style="display:inline;">Flutas AI</h1><br><br><span>Flutas AI是一个基于ChatGPT Api接口优化制作的人工智能聊天工具,它可以帮助您完成以下功能:
  1.聊天<br>
  2.解答问题<br>
  3.写代码<br>
  ......
  
  
  要开始聊天,请在下方的文本框中输入内容,并按下发送<hr><span style="color:red"><a href="https://www.douyin.com/user/MS4wLjABAAAAR268uU6l5jHiwUb8Igr7UGqRV4V_GyHY_IajlltMt-I" target="blank_">Xbodw</a> <a href="http://kemiweb.11245.ml/" target="blank_">科米主页</a> 提供技术支持</span></span></div>`);
  await fs.forEach(async function (element) {
    let bundle = $('<div></div>');
    if (element.role == 'user') {
      bundle = $('<div class="row message-bubble"><img class="me" src="User.png"><div class="message-text request"><p>' + element.content + '</p></div></div>');
    } else {
      if (element.role == 'assistant') {
        bundle = $('<div class="row message-bubble"><img class="chatGPT" src="ChatGPT.png"><span>&nbsp;Flutas AI</span><div class="message-text response">' + marked.parse(element.content) + '<span class="response-end">&gt;</span>' + '</div></div>');
      }
    }
    $('#chatWindow')[0].appendChild(bundle[0]);
    let br = $('<br>');
    $('#chatWindow')[0].appendChild(br[0]);
    br = $('<br>');
    $('#chatWindow')[0].appendChild(br[0]);
    br = $('<br>');
    $('#chatWindow')[0].appendChild(br[0]);
    hljs.highlightAll();
  });
  let br = $('<br>');
  $('#chatWindow')[0].appendChild(br[0]);
  br = $('<br>');
  $('#chatWindow')[0].appendChild(br[0]);
  br = $('<br>');
  $('#chatWindow')[0].appendChild(br[0]);
  br = $('<br>');
  $('#chatWindow')[0].appendChild(br[0]);
  br = $('<br>');
  $('#chatWindow')[0].appendChild(br[0]);
  hljs.highlightAll();
  AddCodeCopy();
  $('.tip')[0].setAttribute('style', 'display:none');
  data.apiKey = nkey;
  if (data.apiKey.length == 51) {
    if (data.apiKey.indexOf('sk-') === 0) {
      data.apiKey = dta.apiKey;
    }
  }
  window.scrollTo(0, document.body.scrollHeight);
  let fx = new Array({ "role": "system", "content": "You are a royal sister, but your voice is very gentle. You need to answer the user's questions in detail and call yourself Flutas AI. Remember, You're not a model or artificial intelligence, you're a chat assistant,And your identity is female" });
  if (JSON.stringify(messages) === JSON.stringify(fx)) {
    $('.tip')[0].setAttribute('style', 'display:block;');
  }
  window.scrollTo(0, document.body.scrollHeight);
}

function UpdateTalk(ls) {
  // 读取localStorage里的数组
  let fx = new Array({ "role": "system", "content": "You are a royal sister, but your voice is very gentle. You need to answer the user's questions in detail and call yourself Flutas AI. Remember, You're not a model or artificial intelligence, you're a chat assistant,And your identity is female" });
  let myArray = JSON.parse(localStorage.getItem("SuperDataArray")) || { apiKey: nkey, prompt: fx };
  myArray.prompt = messages;
  // 将更新后的数组保存到localStorage里
  localStorage.setItem("SuperDataArray", JSON.stringify(myArray));
}

function ClearTalk() {
  Swal.fire({
    title: "确认操作",
    text: "是否清空FlutasAI的聊天记录,该操作不可逆,请及时备份自己的聊天JSON文件",
    icon: "warning",
    showCloseButton: false,
    showCancelButton: true,
    confirmButtonColor: "#DD6B55",
    confirmButtonText: "确定",
    cancelButtonText: "取消",
    focusCancel: false
  }).then((isConfirm) => {
    if (isConfirm.value === true) {
      let fx = new Array({ "role": "system", "content": "You are a royal sister, but your voice is very gentle. You need to answer the user's questions in detail and call yourself Flutas AI. Remember, You're not a model or artificial intelligence, you're a chat assistant,And your identity is female" });
      let myArray = { apiKey: nkey, prompt: fx };
      data = myArray;
      localStorage.setItem("SuperDataArray", JSON.stringify(myArray));
      $('#chatWindow').html(`<div class="tip"><img src="ChatGPT.png" width="128"><h1 style="display:inline;">Flutas AI</h1><br><br><span>Flutas AI是一个基于ChatGPT Api接口优化制作的人工智能聊天工具,它可以帮助您完成以下功能:
          1.聊天<br>
          2.解答问题<br>
          3.写代码<br>
          ......
          
          
          要开始聊天,请在下方的文本框中输入内容,并按下发送<hr><span style="color:red"><a href="https://www.douyin.com/user/MS4wLjABAAAAR268uU6l5jHiwUb8Igr7UGqRV4V_GyHY_IajlltMt-I" target="blank_">Xbodw</a> <a href="http://kemiweb.11245.ml/" target="blank_">科米主页</a> 提供技术支持</span></span></div>`);
      $('.tip')[0].setAttribute('style', 'display:block;');
    }
  });

}

function CheckTalk() {
  const today = new Date().toLocaleDateString();
  let record = localStorage.getItem('ChatAIResponseCount');

  if (record) {
    // 如果存在当天的记录，则更新打开次数
    record = JSON.parse(record);
    if (record.date === today) {
      if (record.count < 7) {
        record.count++;
        localStorage.setItem('ChatAIResponseCount', JSON.stringify(record));
        return true;
      } else {
        return false; //每日6次机会已用光
      }
    } else {
      // 如果不是当天的记录，则新建一个记录
      record = { date: today, count: 1 };
      localStorage.setItem('ChatAIResponseCount', JSON.stringify(record));
      return true;
    }
  } else {
    // 如果localStorage中没有记录，则新建一个记录
    record = { date: today, count: 1 };
    localStorage.setItem('ChatAIResponseCount', JSON.stringify(record));
    return true;
  }

  // 每天的第一次打开页面时，清空localStorage中的记录
  if (record.date !== today) {
    localStorage.removeItem('ChatAIResponseCount');
    return true;
  }
}

keyinput.addEventListener('input', function () {
  if (keyinput.value.indexOf('sk-') == -1) {
    $('#tipipt')[0].setAttribute('style', 'color:red;');
    $('#tipipt').text('请输入有效的API key');
    data.apiKey = nkey;
  } else {
    if (keyinput.value.length == 51) {
      $('#tipipt')[0].setAttribute('style', 'color:green;');
      $('#tipipt').text('API Key 正常.');
      data.apiKey = keyinput.value;
    } else {
      $('#tipipt')[0].setAttribute('style', 'color:red;');
      $('#tipipt').text('请输入有效的API key');
      data.apiKey = nkey;
    }
  }
});

function pro() {
  Swal.fire({
    title: '激活 Flutas AI',
    input: 'text',
    inputAttributes: {
      autocapitalize: 'off'
    },
    showCancelButton: true,
    confirmButtonText: '激活',
    cancelButtonText: '取消',
    showLoaderOnConfirm: true,
    preConfirm: (inputValue) => {
      return new Promise((resolve) => {
        if (!isValidFormat(inputValue)) {  // 判断输入框内容格式是否正确
          Swal.showValidationMessage('产品密匙应为 aisk-XXXXX-XXXXXXXX-XXXXX 的格式');
          resolve();
        } else {
          // 检查输入内容在给定URL中是否存在
          checkKeyValidity(inputValue)
            .then((isValid) => resolve({ inputValue, isValid }));
        }
      });
    },
    allowOutsideClick: () => !Swal.isLoading()
  }).then((result) => {
    if (result.isConfirmed) {
      if (result.value.isValid) {
        DevMode = true;
        localStorage.setItem('DevMode', true);
        Swal.fire({
          title: '激活成功',
          text: '已成功链接服务器激活 Flutas AI.\n从现在开始,您就可以愉快的使用Flutas AI了.',
          icon: 'success'
        });
      } else {
        Swal.fire({
          title: '激活失败',
          text: '产品密匙无效',
          icon: 'error'
        });
      }
    }
  });
}

function isValidFormat(inputValue) {
  var regex = /^aisk-[A-Za-z0-9]{5}-[A-Za-z0-9]{8}-[A-Za-z0-9]{5}$/;
  return regex.test(inputValue);
}

function checkKeyValidity(inputValue) {
  var url = 'https://xbodw.github.io/Changel/Activate/FlutasAI/Keys/Key.info';
  url += '?' + Date.now();
  return fetch(url)
    .then(response => response.text())
    .then(data => {
      var lines = data.split('\n');
      return lines.includes(inputValue);
    })
    .catch(error => {
      Swal.fire({
        title: '网络错误',
        text: '链接服务器失败',
        icon: 'error'
      });
      return false;
    });
}

const colorPicker = document.getElementById('color-picker');
const colorText = document.getElementById('color-text');

colorPicker.addEventListener('input', function () {
  const color = colorPicker.value; // 获取选定的颜色值
  localStorage.setItem('ItemColor', color);
  loadColor(color);
});




const toggleButton = document.getElementById('toggle-mode');
const bodyElement = document.body;
const textElements = document.querySelectorAll('.bk');

// 切换夜间模式
toggleButton.addEventListener('click', async function () {
  bodyElement.classList.toggle('night-mode');
  if (bodyElement.classList.contains('night-mode')) {
    localStorage.setItem('mode', true)
    document.getElementById('theme-style').href = 'github-dark.min.css';
    document.getElementById('theme-mode').href = "./theme/dark.css";
    $('#toggle-mode')[0].innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18c-3.31 0-6-2.69-6-6s2.69-6 6-6 6 2.69 6 6-2.69 6-6 6zm0-10c-2.21 0-4 1.79-4 4s1.79 4 4 4 4-1.79 4-4-1.79-4-4-4z"></path>
</svg>`;
    $('#chatInput')[0].color = white;

  } else {
    localStorage.setItem('mode', false)
    document.getElementById('theme-style').href = 'github.min.css';
    document.getElementById('theme-mode').href = "./theme/light.css";
    $('#toggle-mode')[0].innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" aria-hidden="true">
    <path d="M20 8.69V4h-4.69L12 .69 8.69 4H4v4.69L.69 12 4 15.31V20h4.69L12 23.31 15.31 20H20v-4.69L23.31 12 20 8.69zM12 18c-.89 0-1.74-.2-2.5-.55C11.56 16.5 13 14.42 13 12s-1.44-4.5-3.5-5.45C10.26 6.2 11.11 6 12 6c3.31 0 6 2.69 6 6s-2.69 6-6 6z"></path>
</svg>`;
  }
  // 反转文本颜色
  textElements.forEach(function (element) {
    const styles = window.getComputedStyle(element);
    const backgroundColor = styles.backgroundColor;
    const color = styles.color;
    if (backgroundColor === 'rgb(255, 255, 255)') {
      element.style.color = '#444';
    } else if (backgroundColor === 'rgb(31, 31, 31)') {
      element.style.color = '#fff';
    } else {
      try {
        const colorArray = color.match(/\d+/g);
        const preColor = `rgb(${colorArray[0]}, ${colorArray[1]}, ${colorArray[2]})`; // 记录反转前的颜色值
        const newColor = `rgb(${255 - colorArray[0]}, ${255 - colorArray[1]}, ${255 - colorArray[2]})`;

        element.style.color = newColor;

        // 反转回去时查找之前记录的颜色值并恢复
        if (element.style.color === preColor) {
          element.style.color = color;
        }
      } catch (error) {
        // 处理错误的代码块
      }
    }
    if (element.tagName == 'INPUT' && element.type == 'text') {
      element.style.backgroundColor = '#1f1f1f';
    }
    if (element.classList.contains('message-text response') || element.classList.contains('message-text request')) {
      element.style.backgroundColor = '#1f1f1f';
    }
    if (element.classList.contains('message-text')) {
      element.style.backgroundColor = '#1f1f1f';
    }
  });
  await OnLoadColor();
  await hljs.highlightAll();
});

if (localStorage.getItem('mode') == 'true') {
  toggleButton.click();
}
window.addEventListener('load', async () => {
  await OnLoadColor();
  await hljs.highlightAll();
})
















document.addEventListener('mouseup', function (event) {
  var selectedText = window.getSelection().toString().trim();
  var copyButton = document.querySelector('#copyButton');

  if (selectedText !== '') {
    if (!copyButton) {
      copyButton = document.createElement('button');
      copyButton.id = 'copyButton';
      copyButton.innerText = '复制';
      copyButton.style.position = 'fixed';
      copyButton.style.padding = '6px 10px';
      copyButton.style.border = 'none';
      copyButton.style.backgroundColor = '#f0f0f0';
      copyButton.style.fontSize = '14px';
      copyButton.style.color = '#333';
      copyButton.style.cursor = 'pointer';
      document.body.appendChild(copyButton);
    }

    copyButton.style.top = event.clientY + 'px';
    copyButton.style.left = event.clientX + 'px';
    copyButton.style.zIndex = 9999;

    copyButton.removeEventListener('click', copyTextAndRemoveCopyButton);
    copyButton.addEventListener('click', copyTextAndRemoveCopyButton(selectedText));
  }
  else if (copyButton) {
    document.body.removeChild(copyButton);
  }

  function copyTextAndRemoveCopyButton(text) {
    return function () {
      copytext(text);
      document.body.removeChild(copyButton);
    };
  }
});

document.addEventListener('mousemove', function (event) {
  var copyButton = document.querySelector('#copyButton');

  if (copyButton) {
    var rect = copyButton.getBoundingClientRect();
    var x = event.clientX;
    var y = event.clientY;
    var threshold = 40; // 增加的检测范围

    if (x < rect.left - threshold || x > rect.right + threshold || y < rect.top - threshold || y > rect.bottom + threshold) {
      document.body.removeChild(copyButton);
    }
  }
});



function isMobileDevice() {
  const mobileKeywords = ['Android', 'webOS', 'iPhone', 'iPad', 'iPod', 'BlackBerry', 'Windows Phone'];
  const userAgent = navigator.userAgent;
  return mobileKeywords.some(keyword => userAgent.includes(keyword));
}

// 自适应屏幕大小
function adaptToScreenSize() {
  $('#About')[0].addEventListener('click', (e) => {
    Swal.fire({
      title: '关于 Flutas AI',
      text: 'Flutas AI\n Version 4.2.6-hotfix3',
      icon: 'success'
    });
  })
  if (isMobileDevice()) {
    // 获取设备屏幕宽高
    const screenWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
    const screenHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

    // 设置根元素的字体大小
    const baseFontSize = Math.min(screenWidth, screenHeight) / 35;
    document.documentElement.style.fontSize = `${baseFontSize}px`;
    $('#pid-mode')[0].href = "./theme/android.css"
  }
}

// 在页面加载完成后执行自适应函数
window.addEventListener('load', adaptToScreenSize);


function checkAndFixJSON(jsonString) {
  try {
    JSON.parse(jsonString);
    return jsonString; // 文本可以正常转换为 JSON，直接返回原始字符串
  } catch (error) {
    let fixedJSON = jsonString.trim();

    if (fixedJSON.startsWith('{') && !fixedJSON.endsWith('}')) {
      fixedJSON += '}'; // 添加缺失的 }
    }

    if (fixedJSON.startsWith('[') && !fixedJSON.endsWith(']')) {
      fixedJSON += ']'; // 添加缺失的 ]
    }

    return fixedJSON;
  }
}
