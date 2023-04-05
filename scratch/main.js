const {app, BrowserWindow, ipcMain, powerSaveBlocker } = require('electron')
const path = require('path')
const url = require('url')
const {autoUpdater} = require("electron-updater");
const isDev = require('electron-is-dev');
const cp = require('child_process')
const os = require('os')
const fs = require('fs-extra')
const AdmZip = require('adm-zip')
const kill = require('tree-kill');
const { dir } = require('console');

// Keep a global reference of the window object, if you don't, the window will
// be closed automatically when the JavaScript object is garbage collected.
let splash;
let win;
let initSb3;
let klinkCore = null

// 禁用缓存防止偶尔会出现读取不到新插件的问题
app.commandLine.appendSwitch("disable-http-cache");


///*
autoUpdater.on('checking-for-update', () => {
  console.log('Checking for update...');
})
autoUpdater.on('update-available', (info) => {
  console.log('Update available.');
})
autoUpdater.on('update-not-available', (info) => {
  console.log('Update not available.');
})
autoUpdater.on('error', (err) => {
  console.log('Error in auto-updater.');
})
autoUpdater.on('download-progress', (progressObj) => {
  let log_message = "Download speed: " + progressObj.bytesPerSecond;
  log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
  log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
  console.log(log_message);
})
autoUpdater.on('update-downloaded', (info) => {
  console.log('Update downloaded; will install in 5 seconds');
});
ipcMain.on('restartapp', (event) => {
  if (klinkCore && klinkCore.pid){
    console.log("kill klink", klinkCore.pid)
    kill(klinkCore.pid)
  }
  setTimeout(() => {
    app.relaunch()
    app.exit(0)
  }, 1000)
})
//*/

// fake update communication
/*
ipcMain.on('update', (event, msg) => {
	if(msg == 'downloadupdate'){
		let percent = 0;
		let timerId = setInterval(() => {
			win.webContents.send('updateprogress', percent);
			percent++;
			if(percent>100){
				clearInterval(timerId);
			}
		}, 100);

	}else if(msg == 'quitandinstall'){

	}
});
*/

var rmdir = (dirpath) => {
  const file = fs.statSync(dirpath)
  if (file.isDirectory()) {
    const fileList = fs.readdirSync(dirpath)
    fileList.forEach(subFile => {
      fs.removeSync(path.join(dirpath, subFile))
    })
    fs.rmdirSync(dirpath)
  } else {
    fs.removeSync(dirpath)
  }
}

// 删除插件和配置文件
async function clearConfig (resolve) {
  try {
    const configPath = path.join(app.getPath('userData'), 'kittenblock.json')
    const extensionsPath = path.join(app.getPath('userData'), 'extensions')
    fs.removeSync(configPath)
    rmdir(extensionsPath)
    resolve(1)
  } catch (err) {
    console.log(err);
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function createWindow () {
  console.log("cwd", app.getAppPath());
  splash = new BrowserWindow({
    width: 418,
    height: 480,
    resizable: false,
    backgroundColor: '#000',
    frame: false
  })
  splash.loadURL(url.format({
    pathname: path.join(__dirname, 'loading.html'),
    protocol: 'file:',
    slashes: true
  }))


  // Create the browser window.
  win = new BrowserWindow({
    width: 1400,
    height: 775,
    minWidth: 1200,
    minHeight: 775,
    backgroundColor: '#31C7D5',
    show: false,
    webPreferences: {
      nodeIntegration: true
    }
  })

  if (isDev){
    win.loadURL("http://localhost:8601/index.html")
  } else {
    win.loadURL(url.format({
      pathname: path.join(__dirname, 'index.html'),
      protocol: 'file:',
      slashes: true
    }))
  }
  
  powerSaveBlocker.start('prevent-app-suspension');

  // Open the DevTools.
  if (isDev){
    win.webContents.openDevTools()
  }
  win.setMenu(null);

  win.webContents.on('did-stop-loading', () => {
    if (initSb3){
      win.webContents.send('opensb3', initSb3)
      initSb3 = null 
    }
  })

  win.once('ready-to-show', () => {
    win.show()
    splash.close();
  });
  
  win.on('close', async (e) => {
    console.log("close notify");
    e.preventDefault();
    const shouldClose = await new Promise((resolve, reject) => {
      //
      // 通过 ipcrender 触发时，函数作为参数无法传递，先这样处理
      app.emit('close-app', resolve, reject)
    })
    if (shouldClose) {
      win.webContents.send('closeapp');
      if (klinkCore && klinkCore.pid){
        console.log("kill klink", klinkCore.pid)
        kill(klinkCore.pid)
      }
      setTimeout(() => {
        app.exit(0);
      }, 1000);
    }
  });
  

  
  // Emitted when the window is closed
  win.on('closed', () => {
    // Dereference the window object, usually you would store windows
    // in an array if your app supports multi windows, this is the time
    // when you should delete the corresponding element.
    win = null
  })
  
}

app.on('removeConfig', (...args) => {
  console.log(path.join(app.getPath('userData'), 'kittenblock.json'), args);
  clearConfig(...args)
})

app.on("get-focus-again", () => {
  win.blur();
  win.focus();
});

const gotTheLock = app.requestSingleInstanceLock()
if (!gotTheLock) {
  app.quit()
} else {
  app.on('ready', createWindow)
  // Quit when all windows are closed.
  app.on('window-all-closed', () => {
    // On macOS it is common for applications and their menu bar
    // to stay active until the user quits explicitly with Cmd + Q
    if (process.platform !== 'darwin') {
      app.quit()
    }
  })

  app.on('second-instance', (event, commandLine, workingDirectory) => {
    // Someone tried to run a second instance, we should focus our window.
    console.log('second instance');
    if (win) {
      if (win.isMinimized()) win.restore()
      win.focus()
      win.webContents.send('opensb3', commandLine[commandLine.length - 1])
    }
  })

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (win === null) {
      createWindow()
    }
  })

  app.on('will-finish-launching', () => {
    app.on('open-file', (event, path) => {
      event.preventDefault();
      initSb3 = path
      if (win){
        win.webContents.send('opensb3', path)
      }
    });
  });


  // start klink
  let isFirstRun = false
  let runtimeContext;
  const configPath = path.join(app.getPath('userData'), 'kittenblock.json')
  
  const cwd = app.getAppPath()
  let pyexe = path.resolve(cwd, '../../python/python.exe')
  if (isDev) {
    if (os.platform()!== 'darwin') {
      pyexe = path.resolve('./input/python/win/python.exe')
    } else {
      pyexe = path.resolve(cwd, './input/python/Python.framework/Versions/3.7/bin/python3')
    }
    runtimeContext = JSON.parse(fs.readFileSync('package.json', 'utf8'))
  } else {
    runtimeContext = JSON.parse(fs.readFileSync(path.join(cwd, 'package.json'), 'utf8'))
    if (os.platform() == 'darwin') {
        pyexe = path.resolve(cwd, '../../Frameworks/Python.framework/Versions/3.7/bin/python3')
      }
  }

  if (!fs.existsSync(configPath)) {
    isFirstRun = true
    electronConfig = { version: runtimeContext.version }
  } else {
    electronConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'))
    if (electronConfig?.version !== runtimeContext.version){
      isFirstRun = true
    }
  }

  const appdata = app.getPath('userData')
  const userPath = path.resolve(appdata, 'workspace')
  const extPath = path.resolve(appdata, 'extensions')
  const pioPath = path.resolve(appdata, 'pio')
  const managerPath = path.resolve(appdata, 'manager')
  console.log(pyexe)
  console.log("start klink with", userPath, pioPath, extPath, pyexe, managerPath)

  if (isFirstRun) {
    // 第一次启动才解压，否则后续会不断顶掉更新的版本
    try {
      const extZipPath = path.join(cwd, 'extensions.zip')
      const pioZipPath = path.join(cwd, 'pio.zip')
      if (fs.existsSync(extZipPath)) {
          fs.removeSync(extPath)
          const z = AdmZip(extZipPath)
          const p = AdmZip(pioZipPath)
          z.extractAllTo(extPath, true)
          p.extractAllToAsync(pioPath, true)
      }
      electronConfig.version = runtimeContext.version
      fs.writeFileSync(configPath, JSON.stringify(electronConfig), 'utf8')
    } catch (err) {
      console.error(err)
    }
  } 

  klinkCore = cp.spawn(pyexe, ['klinkrun.py', userPath, pioPath, extPath, pyexe, managerPath], {
      encoding: 'utf8',
      cwd: cwd
  })
  klinkCore.stdout.on('data', data => {
      console.log("[KL]", data.toString())
  })
  klinkCore.stdout.on('end', code => {
      console.log("[KL] ##### End #####", code)
  })
  klinkCore.stderr.on('data', data => {
      console.log("[KL]", data.toString())
  })
}
