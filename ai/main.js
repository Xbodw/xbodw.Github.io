//Flutas AI 
//Version 4.1.5
//Author Xbodw

const { app, BrowserWindow, ipcMain, dialog } = require('electron')
var electron = require('electron')

// 保持对window对象的全局引用，如果不这么做的话，当JavaScript对象被
// 垃圾回收的时候，window对象将会自动的关闭
let win;
console.log('Flutas AI Version 4.1.5 Designed by Xbodw.')
 
function createWindow () {
  win = new BrowserWindow({
    width: 1100,
    height: 730,
    icon: "favicon.ico",
    backgroundColor: '#f5f5f5',
    webPreferences: { nodeIntegration: true , contextIsolation: false }
  })
 
  // 加载加载界面文件文件
   win.loadFile('./assets/loading/index.html')
  //win.webContents.openDevTools();
	
if (!app.isPackaged) {
    //production
    //console.log('devmode');
    win.webContents.openDevTools();
}
  //开启开发人员工具
  win.setMenu(null); 
  //win.maximize();
  // 当 window 被关闭，这个事件会被触发。
  win.on('close', e => {
        e.preventDefault(); //先阻止一下默认行为，不然直接关了，提示框只会闪一下
        electron.dialog.showMessageBox({
            type: 'info',
            title: 'Flutas AI 提示',
            message:'确认退出Flutas AI吗？\n\nPowered by Xbodw.',
            buttons: ['确认', '取消'],   //选择按钮，点击确认则下面的idx为0，取消为1
            cancelId: 1, //这个的值是如果直接把提示框×掉返回的值，这里设置成和“取消”按钮一样的值，下面的idx也会是1
        }).then(idx => {    
        //注意上面↑是用的then，网上好多是直接把方法做为showMessageBox的第二个参数，我的测试下不成功
            console.log(idx)
            if (idx.response == 1) {
                console.log('Flutas AI => Then')
                e.preventDefault();
            } else {
                console.log('Flutas AI => Closed')
                mainWindow = null
                app.exit();
            }
            })
        });
}
 
// Electron 会在初始化后并准备
// 创建浏览器窗口时，调用这个函数。
// 部分 API 在 ready 事件触发后才能使用。

app.on('ready', createWindow)

// 当全部窗口关闭时退出。
app.on('window-all-closed', () => {
  // 在 macOS 上，除非用户用 Cmd + Q 确定地退出，
  // 否则绝大部分应用及其菜单栏会保持激活。
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

app.on('open-url', (event, url) => {
    app.openExternal(url);
});

let newwin;
ipcMain.on('add',()=>
{
    newwin = new BrowserWindow({
        width: 500, 
        height: 400,
        frame: false,
        parent: win,
        webPreferences: { nodeIntegration: true , contextIsolation: false }
    })
    newwin.loadFile('about.html');
    newwin.on('closed',()=>{newwin = null});

})