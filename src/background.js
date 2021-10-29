/* eslint-disable no-tabs */
'use strict'

import { app, protocol, BrowserWindow, ipcMain, globalShortcut } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
const { Menu, Tray, MenuItem } = require('electron')
const isDevelopment = process.env.NODE_ENV !== 'production'

const FileInfo = require('./assets/main/fileinfo.js').FileInfo
const FileCopyInfo = require('./assets/main/fileinfo.js').FileCopyInfo
const FTPStream = require('./assets/main/ftpStream.js').FTPStream
const globalFunk = require('./assets/main/globalFunk.js')

const g_JSON = require('./assets/main/json.js')
const NotificationPopUp = require('./assets/main/globalFunk.js')
  .NotificationPopUp
const WindowInfo = require('./assets/main/windows.js').WindowInfo
// test
const FTPInfo_Type1 = require('./assets/main/ftpinfo.js').FTPInfo_Type1
const FTPInfo_Type2 = require('./assets/main/ftpinfo.js').FTPInfo_Type2
const _path = require('path')

// #region main global value
const KONAN_ROOT_FOLDER = '//.konan'
const g_windows = []
let gWin = null
const g_NotificationPopUp = new NotificationPopUp()
let g_DOWNLOAD_FOLDER_PATH = ''
const g_UPLOAD_FTP_FOLDER_PATH = '/konan/electron_test/'
let g_curUserInfo
// eslint-disable-next-line no-unused-vars
let gIsMac = false

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow () {
  console.log('createWindow')
  gWin = new BrowserWindow({
    width: 700,
    height: 700,
    webPreferences: {
      // Required for Spectron testing
      enableRemoteModule: !!process.env.IS_TEST,
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      // nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      // contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
      nodeIntegration: true, // api 접근 허용 여부
      contextIsolation: false,
      webSecurity: false // false로 지정하면 same-origin 정책을 비활성화
    }
  })

  gWin.on('minimize', function (event) {
    event.preventDefault()
    WindowHide(gWin)
  })
  gWin.on('close', function (event) {
    if (!app.isQuiting) {
      event.preventDefault()
      WindowHide(gWin)
    }
    return false
  })
  gWin.isShow = true

  // StartFolder Create
  const fileInfo = new FileInfo()
  const path = getUserHome() + KONAN_ROOT_FOLDER
  fileInfo.CreateDir(path)

  gWin.setMenu(null)
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await gWin.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) gWin.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    await gWin.loadURL('app://./index.html')
  }

  if (process.platform === 'darwin') {
    gIsMac = true
  }
}

function RunTray () {
  const tray = new Tray(
    _path.resolve(__dirname, '../public/img/icons/mac/16x16.png')
  )
  tray.on('double-click', function () {
    if (!gWin.isShow) {
      windowShow(gWin)
    } else {
      WindowHide(gWin)
    }
  })

  const menu = new Menu()
  menu.append(
    new MenuItem({
      label: 'Window Show',
      click () {
        windowShow(gWin)
      }
    })
  )
  menu.append(
    new MenuItem({
      label: 'Window Hide',
      click () {
        WindowHide(gWin)
      }
    })
  )
  menu.append(
    new MenuItem({
      label: 'Window Exit',
      click () {
        Exit(tray)
      }
    })
  )

  tray.setToolTip('Test ToolTip')
  tray.setContextMenu(menu)
}

function getUserHome () {
  return process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME']
}
function Exit (_tray) {
  app.isQuiting = true
  _tray.Visible = false
  _tray.Icon = null
  _tray.destroy()
  app.quit()
}
function WindowHide (_win) {
  _win.hide()
  _win.isShow = false
}
function windowShow (_win) {
  _win.show()
  _win.isShow = true
}

app.whenReady().then(() => {
  globalShortcut.register('CommandOrControl+R', () => {
    console.log('CommandOrControl+R is pressed: Shortcut Disabled')
  })
  RunTray()
  g_NotificationPopUp.show('sbspds-anywhere', 'Start!')
  createWindow()

  // Mac OS 를 위한 코드
  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// #endregion
// #region Print File Path & Copy
// getPath
ipcMain.on('open-file-dialog', event => {
  const resultPaths = requestGetFilePaths(gWin, false)
  requetGetFileInfoResult(event, resultPaths)
})

ipcMain.on('open-directory-dialog', event => {
  const resultPaths = requestGetFilePaths(gWin, true)
  requetGetFileInfoResult(event, resultPaths)
})

// eslint-disable-next-line camelcase
ipcMain.on('drag-file', (event, p_filePaths) => {
  // eslint-disable-next-line camelcase
  const filePath_fileInfo = new FileInfo()
  const resultPaths = requestGetAllFileInfo(p_filePaths, filePath_fileInfo)
  requetGetFileInfoResult(event, resultPaths)
})
function requestGetFilePaths (_win, _isDir) {
  let result
  // eslint-disable-next-line camelcase
  const filePath_fileInfo = new FileInfo()
  if (_isDir) {
    result = filePath_fileInfo.GetDirPath(_win)
  } else {
    result = filePath_fileInfo.GetFilePath(_win)
  }
  if (result === undefined) {
    return undefined
  } else {
    if (result.length <= 0) {
      return undefined
    }
    return requestGetAllFileInfo(result, filePath_fileInfo)
  }
}
// eslint-disable-next-line camelcase
function requestGetAllFileInfo (p_filePaths, p_fileInfo) {
  p_fileInfo.GetAllFileInfo(p_filePaths)
  return p_fileInfo.m_resultPathArr
}
function requetGetFileInfoResult (event, FileDatas) {
  const isCancel = false
  if (FileDatas === undefined) {
    event.sender.send('open-dialog-result', isCancel, undefined)
    return
  }
  event.sender.send('open-dialog-result', isCancel, FileDatas)
}
// copy
ipcMain.on('files-copy', (event, filePaths) => {
  let curFileCopyInfo = new FileCopyInfo()

  curFileCopyInfo.on('copyDuplicate', function (originPath, desPath) {
    console.log('main Duplication : ' + originPath + ' => ' + desPath)
    event.sender.send('files-copy-result', originPath, desPath, 'duplicate')
  })
  curFileCopyInfo.on('copyError', function (err, srcPath, desPath) {
    event.sender.send('files-copy-result', srcPath, desPath, 'error : ' + err)
  })
  curFileCopyInfo.on('copyFinish', function (srcPath, desPath) {
    event.sender.send('files-copy-result', srcPath, desPath, 'success')
    curFileCopyInfo = null
  })

  curFileCopyInfo.FileCopy(gWin, filePaths)
})
// Create Dir
ipcMain.on('dir-create', (event, _dirPath) => {
  const fileInfo = new FileInfo()
  const result = fileInfo.CreateDir(_dirPath)
  console.log('Create Folder : ' + result)
})

ipcMain.on('file-delete', (event, _dirPath) => {
  // let fileInfo = new FileInfo()
  // let deleteFilePath = _dirPath
  // fileInfo.DeleteFile(deleteFilePath)

  const ftpStream = new FTPStream()
  ftpStream.FTPDeleteFile(_dirPath)
})

// mkdir( './test/mkdir' )
// #endregion
// #region FTP
// ftp
const g_FTPInfoDic = {}
const g_FTPWorkQueue = []
// eslint-disable-next-line no-unused-vars
const statusWindow = null

ipcMain.on('ftp-file-upload', async (event, _ftpSendData) => {
  _ftpSendData.event = event
  const ftpSite = _ftpSendData.ftpSite

  _ftpSendData.desFolderPath = g_UPLOAD_FTP_FOLDER_PATH
  // 이후 statuswindow 에서 시작하면 함. 스택에 쌓을뿐...
  if (ftpSite.ftpServerList.length != 0) {
    g_FTPWorkQueue.push(_ftpSendData)
  }

  // statuswindow가 없을 경우에만 생성
  // eslint-disable-next-line no-prototype-builtins
  if (g_windows.hasOwnProperty('statusWindow_upload') == false) {
    const windowInfo = new WindowInfo()
    windowInfo.SetStatusWindow('statusWindow_upload', _ftpSendData.targetUrl)
    WindowCreate(event, windowInfo)
    _ftpSendData.popUpWindow = windowInfo
  } else {
    g_windows.statusWindow_upload.show()
    _ftpSendData.popUpWindow = g_windows.statusWindow_upload
  }
})

ipcMain.on('ftp-file-upload-start', function () {
  console.log('FTP Upload start!')
  const ftpSendData = g_FTPWorkQueue.shift()
  FTPConnectTypeBranch_new('upload', ftpSendData)
})

ipcMain.on('ftp-file-download', (event, _ftpSendData) => {
  // 다운로드할 패스 선택 다이얼로그
  const curFileInfo = new FileInfo()
  const getFolderPath = curFileInfo.GetDirPath(gWin)
  if (getFolderPath === undefined) {
    return
  }

  const desFolderPath = getFolderPath[0]
  if (desFolderPath === undefined) {
    return false
  }
  g_DOWNLOAD_FOLDER_PATH = desFolderPath
  _ftpSendData.desFolderPath = desFolderPath

  _ftpSendData.event = event
  const ftpSite = _ftpSendData.ftpSite

  // 이후 statuswindow 에서 시작하면 함. 스택에 쌓을뿐...
  if (ftpSite != undefined && ftpSite != '') {
    g_FTPWorkQueue.push(_ftpSendData)
  }

  // statuswindow가 없을 경우에만 생성
  // eslint-disable-next-line no-prototype-builtins
  if (g_windows.hasOwnProperty('statusWindow_download') == false) {
    const windowInfo = new WindowInfo()
    windowInfo.SetStatusWindow('statusWindow_download', _ftpSendData.targetUrl)
    WindowCreate(event, windowInfo)
    _ftpSendData.popUpWindow = windowInfo
  } else {
    g_windows.statusWindow_download.show()
    _ftpSendData.popUpWindow = g_windows.statusWindow_download
  }
})
ipcMain.on('ftp-file-download-start', function () {
  console.log('FTP Download start!')
  const ftpSendData = g_FTPWorkQueue.shift()
  FTPConnectTypeBranch_new('download', ftpSendData)
})
function FTPConnectTypeBranch_new (_FTPType, ftpSendData) {
  const curType = ftpSendData.ftpSite.connectionType
  const tempDic = {}
  const windowName = 'statusWindow_' + ftpSendData.type
  if (curType == '1') {
    const ftpInfo = new FTPInfo_Type1(ftpSendData.event, ftpSendData.ftpSite, g_windows[windowName])
    g_FTPInfoDic[ftpSendData.ftpSite.siteName] = ftpInfo
    g_FTPInfoDic[ftpSendData.ftpSite.siteName].connectionType = curType
    ftpInfo.m_DES_FOLDER_PATH = ftpSendData.desFolderPath
    ftpInfo.clientSendData = ftpSendData
    ftpInfo.RequestFTPWork(_FTPType, 0)
  } else if (curType == '2') {
    const PromiseResult = []
    let i = 0
    while (i >= 0) {
      let result
      const ftpInfo = new FTPInfo_Type2(ftpSendData.event, ftpSendData.ftpSite, g_windows[windowName])
      ftpInfo.m_DES_FOLDER_PATH = ftpSendData.desFolderPath
      ftpInfo.clientSendData = ftpSendData
      tempDic[ftpSendData.ftpSite.ftpServerList[i].serverName] = ftpInfo // dic[10.10.18.29] = ftpInfo
      result = ftpInfo.RequestFTPWork(_FTPType, ftpSendData, i).catch(
        function (error) {
          console.log(`FTPInfo_Type2_${_FTPType} Error!!!` + error)
          result = error
        }
      ) // end catch
      PromiseResult.push(result)
      i++
      if (i == ftpSendData.ftpSite.ftpServerList.length) {
        break
      }
    }// end while

    g_FTPInfoDic[ftpSendData.ftpSite.siteName] = tempDic
    g_FTPInfoDic[ftpSendData.ftpSite.siteName].connectionType = curType

    // 모든 작업이 다 완료되었을 때 출력 (모든 커넥션 작업 완료.) 2번타입일경우에만.

    Promise.all(PromiseResult).then(value => {
      // eslint-disable-next-line no-unused-vars
      const isError = false
      console.log(g_FTPInfoDic)
    })// end Promise.all
  }
}
ipcMain.on('open-file-explore', event => {
  // eslint-disable-next-line camelcase
  if (g_DOWNLOAD_FOLDER_PATH === undefined) {
    return
  }
  const ftpStream = new FTPStream()
  ftpStream.downloadFolderOpen(g_DOWNLOAD_FOLDER_PATH)
})

ipcMain.on('ftp-cancel', (event, cancelInfo) => {
  ftpCancelBranch(cancelInfo)
})
ipcMain.on('ftp-upload-cancel-allstop', (event, cancelInfo) => {
  ftpCancelBranch(cancelInfo)
})
ipcMain.on('ftp-download-cancel-allstop', (event, cancelInfo) => {
  ftpCancelBranch(cancelInfo)
})
ipcMain.on('ftp-upload-cancel-path', (event, cancelInfo) => {
  ftpCancelBranch(cancelInfo)
})
ipcMain.on('ftp-download-cancel-path', (event, cancelInfo) => {
  ftpCancelBranch(cancelInfo)
})
// _cancelType : all / path
function ftpCancelBranch (cancelInfo) {
  const DicKey = 'admin'
  if (g_FTPInfoDic[DicKey] === undefined) {
    // 현재 작업중인 FTP가 없음
    return
  }
  let FTPInfoList

  if (g_FTPInfoDic[DicKey].connectionType === '1') {
    const cnt = g_FTPInfoDic[DicKey].m_FTPInfoManager.m_FTPStreamList.length
    if (cnt === undefined) {
      return
    }
    FTPInfoList = g_FTPInfoDic[DicKey].m_FTPInfoManager.m_FTPStreamList
    ftpCancel(cancelInfo, cnt, FTPInfoList)
  } else if (g_FTPInfoDic[DicKey].connectionType === '2') {
    for (let i = 0; i < cancelInfo.cancelConnectionList.length; i++) {
      const cnt =
        g_FTPInfoDic[DicKey][cancelInfo.cancelConnectionList[i]]
          .m_FTPInfoManager.m_FTPStreamList.length
      if (cnt === undefined) {
        return
      }
      FTPInfoList =
        g_FTPInfoDic[DicKey][cancelInfo.cancelConnectionList[i]]
          .m_FTPInfoManager.m_FTPStreamList
      ftpCancel(cancelInfo, cnt, FTPInfoList)
    }
  }
}
function ftpCancel (_cancelInfo, cnt, FTPInfoList) {
  for (let i = 0; i < cnt; i++) {
    FTPInfoList[i].cancel(_cancelInfo)
  }
}
// #endregion
// #region Login
// JSON Test
ipcMain.on('login-read', event => {
  // let data = g_JSON.ReadUserJSON('./UserData.json')
  const path = getUserHome() + KONAN_ROOT_FOLDER + '//UserData.json'
  const data = g_JSON.ReadUserJSON(path)
  console.log('login-read', data)
  let lastloginInfo = {}

  if (data !== undefined) {
    lastloginInfo = data
  }

  /*
  let profile = 'default'
  if (isDevelopment === true) {
    profile = 'developer'
  }
  const properties = g_JSON.ReadUserJSON(
    _path.resolve(__dirname, '../src/assets/properties/' + profile + '.json')
  )
  */

  console.log('NODE_ENV', process.env.NODE_ENV)
  const properties = g_JSON.ReadUserJSON(_path.resolve(__dirname, '../src/assets/properties/' + process.env.NODE_ENV + '.json'))
  lastloginInfo.server = properties.server

  event.sender.send('login-read-result', lastloginInfo)
})

ipcMain.on('login-write', (event, _loginInfo) => {
  _loginInfo.lastTime = globalFunk.getNowyyyymmddhhiiss()
  g_curUserInfo = _loginInfo
  const path = getUserHome() + KONAN_ROOT_FOLDER
  g_JSON.WriteUserJSON(path, _loginInfo)
  // g_NotificationPopUp.show('Config Save', 'Login Info Save Success')
  event.sender.send('login-write-result', true)
})

ipcMain.on('getUserInfo', event => {
  event.sender.send('getUserInfo_result', g_curUserInfo)
})
// #endregion
// #region new window test
ipcMain.on('openWindow', (event, windowInfo) => {
  WindowCreate(event, windowInfo)
})
function WindowCreate (event, windowInfo) {
  const key = windowInfo.key
  // eslint-disable-next-line no-prototype-builtins
  if (g_windows.hasOwnProperty(key)) {
    event.sender.send(
      'openWindow_result',
      key,
      windowInfo.data,
      false,
      'Key exsist already!'
    )
    return
  }
  if (windowInfo.url === '') {
    event.sender.send(
      'openWindow_result',
      key,
      windowInfo.data,
      false,
      'url is not exist!'
    )
    return
  }

  const url = windowInfo.url
  let parentWindow
  if (
    windowInfo.parent === '' ||
    windowInfo.parent === undefined
  ) {
    parentWindow = gWin
  } else {
    parentWindow = g_windows[windowInfo.parent]
  }
  const position = parentWindow.getPosition()
  const size = parentWindow.getSize()
  const window = new BrowserWindow({
    width: windowInfo.width,
    height: windowInfo.height,
    parent: parentWindow,
    x: position[0] + size[0] + (g_windows.length * 20),
    y: position[1] + (g_windows.length * 20),
    modal: windowInfo.modal,
    resizable: false,
    minimizable: false,
    maximizable: false,
    webPreferences: {
      nodeIntegration: true, // api 접근 허용 여부
      contextIsolation: false
      // preload: g_path.join(app.getAppPath(), 'preload.js')
    }
  })
  window.on('close', function (event) {
    delete g_windows[key]
  })
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    window.loadURL(process.env.WEBPACK_DEV_SERVER_URL + url)
    if (!process.env.IS_TEST) window.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    window.loadURL('app://./index.html#/' + url)
  }
  window.setMenu(null)
  window.webContents.on('did-finish-load', (evt) => {
    // onWebcontentsValue 이벤트 송신
    window.webContents.send('receiveData', key, windowInfo.data, 'init')
  })
  window.isShow = true

  g_windows[key] = window
  event.sender.send('openWindow_result', key, windowInfo.data, true)
  console.log('OpenWindow Finish' + key)
}
ipcMain.on('sendData', (event, key, data, type) => {
  // eslint-disable-next-line no-prototype-builtins
  if (!g_windows.hasOwnProperty(key)) {
    event.sender.send('sendData_result', key, false, 'Key not exist!')
    return
  }
  g_windows[key].webContents.send('receiveData', key, data, type)
  event.sender.send('sendData_result', key, true, 'Success')
  console.log('SendData Finish' + key)
})

ipcMain.on('closeWindow', (event, key) => {
  // eslint-disable-next-line no-prototype-builtins
  if (!g_windows.hasOwnProperty(key)) {
    event.sender.send('closeWindow_result', key, false, 'Key not exist!')
    return
  }
  g_windows[key].close()
})
// #endregion
// #region ContextMenu

ipcMain.on('contextMenu', (event, type) => {
  let template
  if (type === 'testIndex') {
    template = [
      {
        label: 'File Upload',
        click () {
          event.sender.send('contextMenu_result', 'File Upload')
        }
      },
      { label: 'Cut', role: 'cut' },
      { label: 'Copy', role: 'copy' },
      { label: 'Paste', role: 'paste' },
      { label: 'Select All', role: 'selectall' }
      // { type: 'separator' },
    ]
  }

  if (template === undefined) {
    // error
    event.sender.send('contextMenu_result', 'error! No Type')
    return
  }
  const testContextMenu = Menu.buildFromTemplate(template)
  testContextMenu.popup()
})

// Quit when all windows are closed.
app.on('window-all-closed', () => {
  // On macOS it is common for applications and their menu bar
  // to stay active until the user quits explicitly with Cmd + Q
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// Exit cleanly on request from parent process in development mode.
if (isDevelopment) {
  if (process.platform === 'win32') {
    process.on('message', data => {
      if (data === 'graceful-exit') {
        app.quit()
      }
    })
  } else {
    process.on('SIGTERM', () => {
      app.quit()
    })
  }
}
