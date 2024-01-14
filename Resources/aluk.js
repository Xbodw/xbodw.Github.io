/* 
    Aluk Query Library
    (c)2023 Flutas,All rights,Reserved.
    (Powered by Xbodw)

    Linense MIT
*/

var aluk = function (select) {
    return new querylist(select);
};
aluk.version = '1.4.8';
aluk.language = 'zh-cn';

querylist = function (selector) {
    var ce;
    if (selector == '' || selector == undefined) {
        ce = '';
        return;
    }
    if (typeof (selector) == 'string' && aluk.checkHtml(selector) === false) {
        ce = document.querySelectorAll(selector);
    } else {
        if (typeof (selector) == 'number') {
            ce = '';
        } else {
            if (typeof (selector) == 'object') {
                ce = new Array(selector);
            } else {
                if (aluk.checkHtml(selector) === true) {
                    ce = new Array(aluk.htmlToElement(selector));
                }
            }
        }
    }
    if (ce.length > 1) {
        ce.forEach(element => {
            this.push(element);
        });
    } else {
        if (ce.length > 0) {
            this.push(ce[0]);
        }
    }
    var fn = this;
    this.NormalResult = document;
}

querylist.prototype = new Array();
querylist.prototype.createChildElement = function (index, options) {
    if (typeof (options) != 'object') {
        if (aluk.language != 'zh-cn') {
            throw new Error('Element Options Type Must as the Object');
        } else {
            throw new Error('Element选项必须是Object');
        }
    }
    if (options.ElementType == undefined) {
        if (aluk.language != 'zh-cn') {
            throw new Error('Element name not specified or empty')
        } else {
            throw new Error('Element类型不能为空');
        }


    }
    if (options.ElementType == '') {
        if (aluk.language != 'zh-cn') {
            throw new Error('Element name not specified or empty')
        } else {
            throw new Error('Element类型不能为空');
        }
    }
    var result = document.createElement(options.ElementType);
    if (options.Class == undefined) {

    } else {
        result.classList.value += options.Class;
    }
    if (options.id == undefined) {

    } else {
        result.id = options.id;
    }
    if (options.innerHTML == undefined) {

    } else {
        result.innerHTML = options.innerHTML;
    }
    this[index].appendChild(result);
    return Promise.resolve(this[index]);
}

aluk.objectToCss = function (obj) {
    return Object.entries(obj)
        .map(([key, value]) => `${key}: ${value};`)
    //.join('\n');
}

querylist.prototype.SetCss = function (index, cssList) {
    if (index > this.length - 1) {
        throw new Error('Index超出了预期范围');
    } else if (index == undefined || index == null) {
        throw new Error('Index为空或不存在');
    }
    if (typeof (cssList) != 'object') {
        throw new Error('Css列表必须为Object');
    }
    var csst = aluk.objectToCss(cssList);
    this[index].style.cssText = '';
    var cssaddcount = 0;
    csst.forEach(h => {
        this[index].style.cssText += h;
        cssaddcount++;
    })
    return cssaddcount;
}

querylist.prototype.AppendorMoveto = function (index, index2, appender) {
    var append;
    if (appender instanceof querylist) {
        if (index > appender.length - 1) {
            throw new Error('Index超出了预期范围');
        } else if (index == undefined || index == null) {
            throw new Error('Index为空或不存在: 如果使用aluk querylist对象代替Element,那么请指定Index');
        }
        append = appender[index];
    } else {
        if (!aluk.isHtmlElement(appender)) {
            throw new Error('请指定html元素或者aluk querylist对象');
        }
        append = appender;
    }
    if (index2 > this.length - 1) {
        throw new Error('Index2超出了预期范围');
    } else if (index2 == undefined || index2 == null) {
        throw new Error('Index2为空或不存在: 选择第几项来插入到appender的' + index2 + '项', '那么请指定Index2');
    }
    append.appendChild(this[index]);
}

querylist.prototype.RemoveX = function () {
    let count = 0;
    this.forEach(s => {
        s.remove();
        count++;
    })
    return count;
}

querylist.prototype.continue = function (select) {
    if (select == undefined || select == '') {
        if (aluk.language != 'zh-cn') {
            throw new Error('Your Selector was empty or undefined,please.');
        } else {
            throw new Error('您的选择器为空或未定义');
        }
    }
    var newElements = [];

    // 在当前 elements 数组中查找符合选择器的元素，并添加到 newElements 数组中
    for (var i = 0; i < this.length; i++) {
        var matches = this[i].querySelectorAll(select);
        newElements.push(matches);
    }
    var newQueryList = new querylist('<null>');
    newQueryList.shift()
    newElements.forEach(y => {
        y.forEach(z => {
            newQueryList.push(z)
        })
    })
    newQueryList.NormalResult = newQueryList[0];
    return newQueryList;
}

querylist.prototype.gsval = function (text) {
    if (text == undefined) {
        var result = [];
        this.forEach(e => {
            result.push(e.value)
        })
        return result;
    } else {
        this.forEach(e => {
            e.value = text;
        })
    }
}

querylist.prototype.gstext = function (text) {
    if (text == undefined) {
        var result = [];
        this.forEach(e => {
            result.push(e.innerText)
        })
        return result;
    } else {
        this.forEach(e => {
            e.innerText = text;
        })
    }
}

querylist.prototype.newclicke = function (call) {
    if (call == undefined || typeof call != 'function') {
        throw new Error('函数为空');
    }
    this.forEach(ef => {
        ef.addEventListener('click', function (e) {
            call(e);
        })
    })
}

querylist.prototype.Prep = function (call) {
    var _0x2721 = ['addEventListener'];
    var _0x2616 = function (_0x2721e2, _0x261676) {
        _0x2721e2 = _0x2721e2 - 0x0;
        var _0x1f869d = _0x2721[_0x2721e2];
        return _0x1f869d;
    };
    document[_0x2616('0x0')]('DOMContentLoaded', function (_0x56217b) {
        call(_0x56217b);
    });
}

aluk.isHtmlElement = function (variable) {
    return variable instanceof Element || variable instanceof HTMLElement;
}

aluk.createElementX = function (options) {
    if (typeof (options) != 'object') {
        if (aluk.language != 'zh-cn') {
            throw new Error('Element Options Type Must as the Object');
        } else {
            throw new Error('Element选项必须是Object');
        }
    }
    if (options.ElementType == undefined) {
        if (aluk.language != 'zh-cn') {
            throw new Error('Element name not specified or empty')
        } else {
            throw new Error('Element类型不能为空');
        }


    }
    if (options.ElementType == '') {
        if (aluk.language != 'zh-cn') {
            throw new Error('Element name not specified or empty')
        } else {
            throw new Error('Element类型不能为空');
        }
    }
    var result = document.createElement(options.ElementType);
    if (options.Class == undefined) {

    } else {
        result.classList.value += options.Class;
    }
    if (options.id == undefined) {

    } else {
        result.id = options.id;
    }
    if (options.innerHTML == undefined) {

    } else {
        result.innerHTML = options.innerHTML;
    }
    return aluk(result);
}

aluk.htmlEscape = function (htmlStr) {
    return htmlStr.replace(/<|>|"|&/g, match => {
        switch (match) {
            case '<':
                return '&lt;';
            case '>':
                return '&gt;';
            case '"':
                return '&quot;';
            case '&':
                return '&amp;';
        }
    })
}
aluk.htmlUnescape = function (html) {
    return html.replace(/&lt;|&gt;|&quot;|&amp;/g, match => {
        switch (match) {
            case '&lt;':
                return '<';
            case '&gt;':
                return '>';
            case '&quot;':
                return '"';
            case '&amp;':
                return '&';
        }
    })
}


aluk.appendHTMLX = function (appender, element, options) {
    if (appender == undefined) {
        if (aluk.language != 'zh-cn') {
            throw new Error('AppendElement name not specified or empty')
        } else {
            throw new Error('追加者Element类型不能为空');
        }
    }
    if (element == undefined) {
        if (aluk.language != 'zh-cn') {
            throw new Error('Append HTML not specified or empty')
        } else {
            throw new Error('追加的HTML不能为空');
        }
    }
    if (typeof (options) != 'boolean') {
        if (options != undefined) {
            if (aluk.language != 'zh-cn') {
                throw new Error('Options not specified or empty')
            } else {
                throw new Error('选项为空或不存在');
            }
        }
    }
    let fixr = element.innerHTML;
    let fixed = fixr;
    if (options) {
        fixed = aluk.htmlEscape(fixr);
    }
    appender.innerHTML += fixed;
    return Promise.resolve(appender.innerHTML);
}

aluk.checkHtml = function (htmlStr) {

    var reg = /<[a-z][\s\S]*>/i;

    return reg.test(htmlStr);

}
aluk.htmlToElement = function (html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc.body.firstChild;
}

aluk.WebUrlToBase64 = function (url, callback) {
    var _0x63c0 = [
        'send',
        'responseType',
        'onload'
    ];
    var _0x4c90 = function (_0x63c015, _0x4c901c) {
        _0x63c015 = _0x63c015 - 0x0;
        var _0xca29bf = _0x63c0[_0x63c015];
        return _0xca29bf;
    };
    var xhr = new XMLHttpRequest();
    xhr[_0x4c90('0x2')] = function () {
        var _0x5155c3 = new FileReader();
        _0x5155c3['onloadend'] = function () {
            callback(_0x5155c3['result']);
        };
        _0x5155c3['readAsDataURL'](xhr['response']);
    };
    xhr['open']('GET', url);
    xhr[_0x4c90('0x1')] = 'blob';
    xhr[_0x4c90('0x0')]();
}



aluk.Request = function (method, url, data, onlyheader, resultX) {
    if (typeof resultX != 'function') {
        throw new Error('返回函数不能为空')
    }
    const xhr = new XMLHttpRequest();
    xhr.open(method, url, true);
    //xhr.setRequestHeader('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.107 Safari/537.36');
    if (onlyheader != undefined) {
        xhr.setRequestHeader('Content-Type', onlyheader);
    }
    xhr.onload = function () {
        if (xhr.status === 200) {
            resultX(xhr.response);
        } else {
            resultX(xhr.statusText);
        }
    };
    xhr.onerror = function () {
        reject('Network error');
    };
    xhr.send(data);
}

aluk.encodeX = function (code,key) {
    var keys;
    if(key == undefined) {
        keys = '0';
    } else {
        keys = key;
    }
    var codeb;
    if (typeof code == 'object') {
        codeb = JSON.stringify(code)
    } else {
        codeb = code;
    }
    var codea = window.btoa(window.encodeURI(codeb));
    var lista = [];
    for (var i = 0; i < codea.length; i++) {
        var asciic = escape(codea.charCodeAt(i)).replace(/\%u/g, '/u');
        lista.push(asciic);
    } return lista;
}


aluk.decodeX = function (code,key) {
    if (!Array.isArray(code)) { return }
    var keys;
    if(key == undefined) {
        keys = '0';
    } else {
        keys = key;
    }
    var result = '';
    var resultb = '';
    code.forEach(e => {
        var sh = unescape(String.fromCharCode(e)).replace(/\/u/g, '%u');
        resultb += sh;
    })
    result = window.decodeURI(window.atob(resultb));
    return result;
}
Terminal = function (output) {
    if (!aluk.isHtmlElement(output)) {
        return this;
    }
    this.Resultelement = output;
}
TerminalAPI = function () { return this; };
var API = undefined;
var consolebak = undefined;
function InTerminal(e) {
    consolebak = console.log;
    console.log = function (e) { return e; };
    API = new TerminalAPI();
    API.InvertHTMLinit = function () {
        aluk.createElementX({
            ElementType: "style",
            id: "InvertHTMLStyleSheet",
            innerHTML: "*.invert {filter: invert(100%);}"
        }).AppendorMoveto(0, 0, document.head);
    }
    API.Invert = function () {
        aluk('*').forEach(e => {
            e.classList.add('invert');
        })
    }
    API.Revert = function () {
        aluk('*').forEach(e => {
            e.classList.remove('invert');
        })
    }
}
Terminal.prototype = new Object();
Terminal.prototype.command = function (command) {
    InTerminal('');
    var t = '<br>' + eval(command) + '<br>';
    this.Resultelement.innerHTML += t;
    API = undefined;
    console.log = consolebak;
}

function Alarm(construct, title) {
    this.onalarmisdiscard = null; // 初始化 onalarmisdiscard 事件为 null
    this.obj = construct;
    this.title = '提示';
    if (title != undefined) {
        this.title = title;
    }
}

// 定义 show 函数
Alarm.prototype.show = function () {
    // 创建提示框元素
    var alarmBox = document.createElement('div');
    alarmBox.className = 'alarm-box';
    alarmBox.innerHTML = '<h4 id="alarm-title">' + this.title + '</h4><span id="alarm-text">' + this.obj + '</span>';
    // 创建关闭按钮元素
    var closeButton = document.createElement('div');
    closeButton.className = 'close-button';
    closeButton.innerText = '×';
    alarmBox.appendChild(closeButton);
    var styleElement = document.createElement('style');
    styleElement.classList.add('alarmbox-style');
    var cssCode = `
    .alarm-box {
        position: fixed;
        top: 20px;
        left: 0px;
        right: 0px;
        width: 300px;
        margin: auto;
        padding: 20px;
        background-color: #f9f9f9;
        border-radius: 5px;
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      }
      
      .alarm-box .close-button {
        position: absolute;
        top: 10px;
        right: 10px;
        width: 20px;
        height: 20px;
        line-height: 20px;
        text-align: center;
        cursor: pointer;
        color: #888;
      }

      .alarm-box>* {
        font-family: "Microsoft YaHei Ui Light",ui-sans-serif,system-ui,Segoe UI;
        font-size: 95%;
        max-width: fix-content;
      }
      
      .alarm-box .close-button:hover {
        color: #000;
      }
`;
    styleElement.appendChild(document.createTextNode(cssCode));
    document.head.appendChild(styleElement);
    document.body.appendChild(alarmBox);
    closeButton.onclick = 'this.parentNode.removeChild(this)';
    closeButton.addEventListener('click', async function () {
        await aluk('.alarmbox-style').RemoveX();
        await closeButton.parentElement.remove();
        if (this.onalarmisdiscard) {
            this.onalarmisdiscard();
        }
    }.bind(this));
};

