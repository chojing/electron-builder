'use strict'

import { app, protocol, BrowserWindow, ipcMain, globalShortcut } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
// eslint-disable-next-line no-unused-vars
import { logConfig } from './assets/main/logConfig.js'
// eslint-disable-next-line no-unused-vars
const { Menu, Tray, MenuItem, dialog } = require('electron')
const { autoUpdater } = require('electron-updater')
const isDevelopment = process.env.NODE_ENV !== 'production'
const fs = require('fs')

const net = require('net')

const FileInfo = require('./assets/main/fileinfo.js').FileInfo
const FileCopyInfo = require('./assets/main/fileinfo.js').FileCopyInfo
const FTPStream = require('./assets/main/ftpStream.js').FTPStream
const globalFunk = require('./assets/main/globalFunk.js')

const g_JSON = require('./assets/main/json.js')
// eslint-disable-next-line no-unused-vars
const NotificationPopUp = require('./assets/main/globalFunk.js')
  .NotificationPopUp
const WindowInfo = require('./assets/main/windows.js').WindowInfo
// test
const FTPInfo_Type1 = require('./assets/main/ftpinfo.js').FTPInfo_Type1
const FTPInfo_Type2 = require('./assets/main/ftpinfo.js').FTPInfo_Type2
const FTPInfo_Type3 = require('./assets/main/ftpinfo.js').FTPInfo_Type3
const _path = require('path') 
const log = require('electron-log')
const customIcon = 'img/icons/arrow16x16.png'
const ymlPath = 'properties/dev-app-update.yml'

autoUpdater.logger = log
autoUpdater.logger.transports.file.level = 'debug'
//autoUpdater.setFeedURL('http://10.10.18.178')
if(isDevelopment){
  let testvalue = _path.resolve(__static, ymlPath)
  autoUpdater.updateConfigPath = _path.resolve(__static, ymlPath)
}

var testvalue = autoUpdater.getFeedURL()
console.log(testvalue)
// #region main global value
const KONAN_ROOT_FOLDER = '//.konan'
let g_windows = {}
let gWin = null
const g_UPLOAD_FTP_FOLDER_PATH = '/konan/electron_test/'
let g_curUserInfo
let g_NotificationPopUp = new NotificationPopUp()
// eslint-disable-next-line no-unused-vars
let gIsMac = false

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow () {
  // checkPortPing('10.10.18.28', 21, 2500)
  gWin = new BrowserWindow({
    width: 600,
    height: 760,
    webPreferences: {
      // Required for Spectron testing
      enableRemoteModule: !!process.env.IS_TEST,
      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      // nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      // contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
      nodeIntegration: true, // api ?????? ?????? ??????
      contextIsolation: false,
      webSecurity: false // false??? ???????????? same-origin ????????? ????????????
    },
    // eslint-disable-next-line no-undef
    icon: _path.join(__static, customIcon)
  })

  autoUpdater.on('checking-for-update', () => {
    sendStatusToWindow('Checking for update...')
  })
  autoUpdater.on('update-available', (info) => {
    sendStatusToWindow('Update available.')
  })
  autoUpdater.on('update-not-available', (info) => {
    sendStatusToWindow('Update not available.')
  })
  autoUpdater.on('error', (err) => {
    sendStatusToWindow('Error in auto-updater. ' + err)
  })
  autoUpdater.on('download-progress', (progressObj) => {
    let log_message = 'Download speed: ' + progressObj.bytesPerSecond
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%'
    log_message = log_message + ' (' + progressObj.transferred + '/' + progressObj.total + ')'
    sendStatusToWindow(log_message)
  })
  autoUpdater.on('update-downloaded', (info) => {
    sendStatusToWindow('Update downloaded')
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
  gWin.webContents.on('did-finish-load', (evt) => {
    // onWebcontentsValue ????????? ??????
    gWin.webContents.send('receiveData', 'main', undefined, 'init')
  })
  gWin.isShow = true
  log.info('Window Config Setting')
  // StartFolder Create
  let fileInfo = new FileInfo()
  let path = getUserHome() + KONAN_ROOT_FOLDER
  fileInfo.CreateDir(path)
  log.info('Login Info File Create')
  gWin.setMenu(null)
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    await gWin.loadURL(process.env.WEBPACK_DEV_SERVER_URL)
    if (!process.env.IS_TEST) gWin.webContents.openDevTools()
  } else {
    log.info('Access Product Path')
    createProtocol('app')
    log.info('Create Protocol')
    // Load the index.html when not in development
    await gWin.loadURL('app://./index.html')
    // gWin.webContents.openDevTools()
    log.info('Request Index Page')
  }

  if (process.platform === 'darwin') {
    gIsMac = true
  }
  let windowKey = 'main'
  g_windows[windowKey] = gWin
  log.info('create main window end')
}

function sendStatusToWindow (text) {
  log.debug(text)
  // log.info(text)
  // win.webContents.send('message', text)
}

function RunTray () {
  let tray = new Tray(
    // eslint-disable-next-line no-undef
    _path.resolve(__static, customIcon)
  )
  tray.on('double-click', function () {
    if (!gWin.isShow) {
      windowShow(gWin)
    } else {
      WindowHide(gWin)
    }
  })

  let menu = new Menu()
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
        log.info('end SBSPDS')
        Exit(tray)
      }
    })
  )

  tray.setToolTip('Test ToolTip')
  tray.setContextMenu(menu)
  log.info('Create Tray icon')
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
  })
  const gotTheLock = app.requestSingleInstanceLock()

  if (!gotTheLock) {
    // const options = {
    //   type: 'info',
    //   buttons: ['OK'],
    //   defaultId: 0,
    //   title: 'Information',
    //   message: '?????? Anywhere??? ??????????????????.'
    //   // detail: 'The program will end'
    // }
    // dialog.showMessageBoxSync(null, options)
    app.quit()
  } else {
    app.on('second-instance', () => {
      // Someone tried to run a second instance, we should focus our window.
      if (gWin) {
        if (gWin.isMinimized() || !gWin.isVisible()) {
          gWin.show()
        }
        gWin.focus()
        // eslint-disable-next-line no-useless-return
        return
      }
    })
    RunTray()
    g_NotificationPopUp.show('sbspds-anywhere', 'Start!')
    createWindow()
    //autoUpdater.setFeedURL('10.10.18.178:80/release')
    autoUpdater.checkForUpdates().catch(e => {
      console.log(e)
    })
    // Mac OS ??? ?????? ??????
    app.on('activate', function () {
      if (BrowserWindow.getAllWindows().length === 0) createWindow()
    })
  }
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
ipcMain.on('drag-file', (event, p_filePaths, isSubDirFileRead) => {
  // eslint-disable-next-line camelcase
  const filePath_fileInfo = new FileInfo()
  filePath_fileInfo.m_isSubDirFileRead = isSubDirFileRead
  const resultFileInfo = requestGetAllFileInfo(p_filePaths, filePath_fileInfo)
  resultFileInfo.m_resultPathArr
  requetGetFileInfoResult(event, resultFileInfo.m_resultPathArr, resultFileInfo.isMaxOver)
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
  return p_fileInfo
}
function requetGetFileInfoResult (event, FileDatas, isfileOver = false) {
  const isCancel = false
  if (FileDatas === undefined) {
    event.sender.send('open-dialog-result', isCancel, undefined, isfileOver)
    return
  }
  event.sender.send('open-dialog-result', isCancel, FileDatas, isfileOver)
}
// copy
ipcMain.on('files-copy', (event, filePaths) => {
  let curFileCopyInfo = new FileCopyInfo()

  curFileCopyInfo.on('copyDuplicate', function (originPath, desPath) {
    log.info('main CopyDuplication : ' + originPath + ' => ' + desPath)
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
  log.info('Create Folder : ' + result)
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
let g_FTPInfoDic = {}
let g_FTPWorkQueue = []
// eslint-disable-next-line no-unused-vars
let statusWindow = null

ipcMain.on('ftp-file-upload', async (event, _ftpSendData) => {
  log.info('FTP Upload Response')
  _ftpSendData.event = event
  let ftpSite = _ftpSendData.ftpSite

  _ftpSendData.desFolderPath = g_UPLOAD_FTP_FOLDER_PATH
  if (ftpSite.ftpServerList.length != 0) {
    g_FTPWorkQueue.push(_ftpSendData)
  }

  if (_ftpSendData.targetUrl === undefined || _ftpSendData.targetUrl === '') {
    startUpload(event)
  } else {
    // ??? ????????? ???????????? ??????. ?????? ???????????? ??????
    let parentKey = 'statusWindow_upload_' + _ftpSendData.clientData.parentKey
    // eslint-disable-next-line no-prototype-builtins
    if (g_windows.hasOwnProperty(parentKey) == false) {
      let windowInfo = new WindowInfo()
      windowInfo.SetStatusWindow(_ftpSendData.ftpSite.siteName + _ftpSendData.clientData.transferid, _ftpSendData.targetUrl)
      windowInfo.data = {}
      windowInfo.data.g_ftpSendData = _ftpSendData
      windowInfo.data.g_ftpSendData.event = undefined
      WindowCreate(event, windowInfo)
    } else {
      g_windows[parentKey].show()
    }
  }
})

ipcMain.on('ftp-file-upload-start', function (event) {
  startUpload(event)
})
function startUpload (event) {
  log.info('FTP Upload start!')
  let ftpSendData = g_FTPWorkQueue.shift()
  ftpSendData.event = event
  FTPConnectTypeBranch_new('upload', ftpSendData)
}

ipcMain.on('ftp-file-download', (event, _ftpSendData) => {
  // ??????????????? ?????? ?????? ???????????????
  const curFileInfo = new FileInfo()
  const getFolderPath = curFileInfo.GetDirPath(gWin)
  if (getFolderPath === undefined) {
    return
  }

  const desFolderPath = getFolderPath[0]
  if (desFolderPath === undefined) {
    return false
  }
  _ftpSendData.desFolderPath = desFolderPath

  _ftpSendData.event = event
  const ftpSite = _ftpSendData.ftpSite

  // ?????? statuswindow ?????? ???????????? ???. ????????? ?????????...
  if (ftpSite != undefined && ftpSite != '') {
    g_FTPWorkQueue.push(_ftpSendData)
  }

  // statuswindow??? ?????? ???????????? ??????
  // eslint-disable-next-line no-prototype-builtins
  if (g_windows.hasOwnProperty('statusWindow_download') == false) {
    const windowInfo = new WindowInfo()
    windowInfo.SetStatusWindow('statusWindow_download', _ftpSendData.targetUrl)
    WindowCreate(event, windowInfo)
  } else {
    g_windows['statusWindow_download'].show()
  }
})
ipcMain.on('ftp-file-download-start', function () {
  log.info('FTP Download start!')
  let ftpSendData = g_FTPWorkQueue.shift()
  FTPConnectTypeBranch_new('download', ftpSendData)
})
function FTPConnectTypeBranch_new (_FTPType, ftpSendData) {
  let transferid = ftpSendData.clientData.transferid
  let curType = ftpSendData.ftpSite.connectionType
  let tempDic = {}
  log.info('Start FTP ', _FTPType)
  log.info('SiteName : ', ftpSendData.ftpSite)
  if (curType == 'sequential') {
    let PromiseResult = []
    let ftpInfo = new FTPInfo_Type1(ftpSendData.event, ftpSendData.ftpSite)
    let strKey = ftpSendData.ftpSite.siteName + transferid
    console.log(strKey)
    g_FTPInfoDic[ftpSendData.ftpSite.siteName + transferid] = ftpInfo
    g_FTPInfoDic[ftpSendData.ftpSite.siteName + transferid].connectionType = curType
    ftpInfo.clientSendData = ftpSendData
    let result = ftpInfo.RequestFTPWork(_FTPType, 0)
    PromiseResult.push(result)
    Promise.all(PromiseResult).then(value => {
      if (value[0] !== undefined) {
        delete g_FTPInfoDic[value[0].deleteKey]
      } else {
        log.info(ftpSendData.ftpSite.siteName + ftpSendData.clientData.transferid + ' problem')
      }
    })// end Promise.all
  } else if (curType == 'simultaneous') {
    let PromiseResult = []
    let i = 0
    while (i >= 0) {
      let result
      let ftpInfo = new FTPInfo_Type2(ftpSendData.event, ftpSendData.ftpSite)
      ftpInfo.clientSendData = ftpSendData
      tempDic[ftpSendData.ftpSite.ftpServerList[i].name] = ftpInfo // dic[10.10.18.29] = ftpInfo
      result = ftpInfo.RequestFTPWork(_FTPType, ftpSendData, i).catch(
        function (error) {
          log.info(`FTPInfo_Type2_${_FTPType} Error!!!` + error)
          result = error
        }
      ) // end catch
      PromiseResult.push(result)
      i++
      if (i == ftpSendData.ftpSite.ftpServerList.length) {
        break
      }
    }// end while

    g_FTPInfoDic[ftpSendData.ftpSite.siteName + transferid] = tempDic
    g_FTPInfoDic[ftpSendData.ftpSite.siteName + transferid].connectionType = curType

    // ?????? ????????? ??? ??????????????? ??? ?????? (?????? ????????? ?????? ??????.) 2????????????????????????.

    Promise.all(PromiseResult).then(value => {
      let result = true
      for (let i = 0; i < value.length; i++) {
        let tempRst = value[i].result
        if (tempRst == false) {
          result = false
        }
      }
      if (result == false) {
        log.info(ftpSendData.ftpSite.siteName + ftpSendData.clientData.transferid + ' problem')
      }
      delete g_FTPInfoDic[ftpSendData.ftpSite.siteName + ftpSendData.clientData.transferid]
    })// end Promise.all
  } else if (curType == 'roundrobin') {
    let PromiseResult = []
    let ftpInfo = new FTPInfo_Type3(ftpSendData.event, ftpSendData.ftpSite)
    let strKey = ftpSendData.ftpSite.siteName + transferid
    console.log(strKey)
    g_FTPInfoDic[ftpSendData.ftpSite.siteName + transferid] = ftpInfo
    g_FTPInfoDic[ftpSendData.ftpSite.siteName + transferid].connectionType = curType
    ftpInfo.clientSendData = ftpSendData
    let result = ftpInfo.RequestFTPWork(_FTPType, 0)
    PromiseResult.push(result)
    Promise.all(PromiseResult).then(value => {
      if (value[0] !== undefined) {
        delete g_FTPInfoDic[value[0].deleteKey]
      } else {
        log.info(ftpSendData.ftpSite.siteName + ftpSendData.clientData.transferid + ' problem')
      }
    })// end Promise.all
  }
}
ipcMain.on('open-file-explore', (event, path) => {
  let ftpStream = new FTPStream()
  ftpStream.downloadFolderOpen(path, result => {
    log.info(result)
    event.sender.send('open-file-explore-result', result.message)
  })
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
  let CurCancelServer = cancelInfo.cancelConnectionList[0]
  let transferid = cancelInfo.transferid
  let DicKey = CurCancelServer.parentSiteName
  let FTPInfo
  if (g_FTPInfoDic[DicKey + transferid] === undefined) {
    // ?????? ???????????? FTP??? ??????
    return
  } else {
    FTPInfo = g_FTPInfoDic[DicKey + transferid]
  }
  let result = true
  if (g_FTPInfoDic[DicKey + transferid].connectionType == 'sequential') {
    result = ftpCancel(FTPInfo, cancelInfo)
  } else if (g_FTPInfoDic[DicKey + transferid].connectionType == 'simultaneous') {
    for (let i = 0; i < cancelInfo.cancelConnectionList.length; i++) {
      FTPInfo = g_FTPInfoDic[DicKey + transferid][cancelInfo.cancelConnectionList[i].name]
      let tempResult = ftpCancel(FTPInfo, cancelInfo)
      if (tempResult == false) {
        result = false
      }
    }
  }
  if (result == false) {
    log.info('cancel fail ', g_FTPInfoDic[DicKey + transferid])
  }
}
function ftpCancel (_FtpInfo, _cancelInfo) {
  let result = true
  if (_FtpInfo === undefined) {
    log.info('Cancel Fail! no ftpInfo')
    return
  }
  if (_FtpInfo.ftpStreamList === undefined) {
    log.info('Cancel Fail! No file list')
    return
  }
  if (_FtpInfo.isFinish == true) {
    log.info('Cancel Fail! Job is already done.')
  }
  let KeyList = Object.keys(_FtpInfo.ftpStreamList)

  for (let i = 0; i < KeyList.length; i++) {
    let tmpResult = _FtpInfo.ftpStreamList[KeyList[i]].cancel(_cancelInfo)
    if (tmpResult == false) {
      result = false
    }
  }
  return result
}
// #endregion
// #region Login
// JSON Test
ipcMain.on('login-read', event => {
  // let data = g_JSON.ReadUserJSON('./UserData.json')
  const path = getUserHome() + KONAN_ROOT_FOLDER + '//UserData.json'
  const data = g_JSON.ReadUserJSON(path)
  if (data === undefined) {
    log.info('login-read fail')
  }

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

  // eslint-disable-next-line no-undef
  const properties = g_JSON.ReadUserJSON(_path.resolve(__static, 'properties/' + process.env.NODE_ENV + '.json'))
  if (properties === undefined) {
    log.info('Fail read properties file(development/production)')
  }
  lastloginInfo.server = properties.server
  log.info('NODE_ENV', lastloginInfo)
  fs.stat('./', (err, stats) => {
    if (err) throw err

    // The timestamp when the file is created
    lastloginInfo.buildTime = stats.ctime
    event.sender.send('login-read-result', lastloginInfo)
  })
  const filterFolderPath = getUserHome() + KONAN_ROOT_FOLDER
  let filterPath = filterFolderPath + '//filterData.json'
  const filterData = g_JSON.ReadUserJSON(filterPath)
  if (filterData === undefined) {
    log.info('no filter. Create default filter file.')
    let filter = ['.mov', '.mxf', '.mp4', '.txt']
    let temp = {}
    temp.filter = filter
    g_JSON.WriteFilterJSON(filterFolderPath, temp)
  } else {
    globalFunk.g_filter = filterData.filter
  }
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
  log.info('WindowCreate start', key)
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
  // log.debug('WindowCreate g_windows.length', Object.keys(g_windows), Object.keys(g_windows).length)
  const window = new BrowserWindow({
    width: windowInfo.width,
    height: windowInfo.height,
    parent: parentWindow,
    x: position[0] + ((Object.keys(g_windows).length + 1) * 20),
    y: position[1] + ((Object.keys(g_windows).length + 1) * 20),
    modal: windowInfo.modal,
    // resizable: false,
    minimizable: false,
    maximizable: false,
    webPreferences: {
      nodeIntegration: true, // api ?????? ?????? ??????
      contextIsolation: false
    },
    // eslint-disable-next-line no-undef
    icon: _path.join(__static, customIcon)
  })
  window.on('close', function (event) {
    delete g_windows[key]
  })
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    console.log(process.env.WEBPACK_DEV_SERVER_URL)
    // Load the url of the dev server if in development mode
    window.loadURL(process.env.WEBPACK_DEV_SERVER_URL + '#/' + url)
    if (!process.env.IS_TEST) window.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    window.loadURL('app://./index.html#/' + url)
  }
  window.setMenu(null)
  window.webContents.on('did-finish-load', (evt) => {
    // onWebcontentsValue ????????? ??????
    window.webContents.send('receiveData', key, windowInfo.data, 'init')
  })
  window.isShow = true

  g_windows[key] = window
  event.sender.send('openWindow_result', key, windowInfo.data, true)
  log.info('WindowCreate end')
}
ipcMain.on('sendData', (event, key, data, type) => {
  // eslint-disable-next-line no-prototype-builtins
  if (!g_windows.hasOwnProperty(key)) {
    event.sender.send('sendData_result', key, false, 'Key not exist!')
    return
  }
  g_windows[key].webContents.send('receiveData', key, data, type)
  event.sender.send('sendData_result', key, true, 'Success')
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
// #endregion
ipcMain.on('checkPortPing', (event, ip, port, timeout = 2500) => {
  // event.sender.send('contextMenu_result', 'error! No Type')
  checkPortPing(ip, port, timeout, event)
})
function checkPortPing (ip, port, timeout, event = undefined) {
  let hosts = [[ip, port]]
  let result = {
    isConnect: false,
    message: ''
  }
  function sendEvent (_isConnect, _msg, event) {
    if (event !== undefined) {
      result.isConnect = _isConnect
      result.message = _msg
      event.sender.send('checkPortPing_result', result)
    }
  }
  hosts.forEach(function (item) {
    let sock = new net.Socket()
    sock.setTimeout(timeout)
    sock.on('connect', function () {
      console.log(item[0] + ':' + item[1] + ' is up.')
      sock.destroy()
      sendEvent(true, item[0] + ':' + item[1] + ' is up.', event)
    }).on('error', function (e) {
      console.log(item[0] + ':' + item[1] + ' is down: ' + e.message)
      sendEvent(false, item[0] + ':' + item[1] + ' is down: ' + e.message, event)
    }).on('timeout', function (e) {
      console.log(item[0] + ':' + item[1] + ' is down: timeout')
      sendEvent(false, item[0] + ':' + item[1] + ' is down: timeout', event)
    }).connect(item[1], item[0])
  })
}

ipcMain.on('offline', (event) => {
  log.info('ethernnet Disconnect')
  for (var key in g_FTPInfoDic) {
    let curFTPInfo = g_FTPInfoDic[key]
    curFTPInfo.isEthernetConnect = false
    for (var key2 in curFTPInfo.ftpStreamList) {
      let curStream = curFTPInfo.ftpStreamList[key2]
      curStream.doReleaseStream(curStream.m_CurrentStream)
      log.info(key2, ' stream release')
    }
  }

  event.sender.send('offline_result')
  log.info('offline job success')
})

ipcMain.on('WriteLog', (event, msg) => {
  log.info(' [Renderer] : ', msg)
})

ipcMain.on('info', (event, message, resultPath) => {
  const options = {
    type: 'info', // ??????
    buttons: ['??????', '??????'], // ?????? ?????????
    title: 'Anywhere', // ??????
    message: message,
    checkboxChecked: false // ????????????(???????????? ??????????????? ?????? ??????)
  }
  dialog.showMessageBox(null, options).then(result => {
    if (result.response === 0) {
      // ??????
      event.sender.send(resultPath, true)
    } else if (result.response === 1) {
      // ??????
      event.sender.send(resultPath, false)
    }
  })
})
ipcMain.on('alert', (event, message) => {
  const options = {
    type: 'warning', // ??????
    buttons: ['??????'], // ?????? ?????????
    title: 'Anywhere', // ??????
    message: message,
    checkboxChecked: false // ????????????(???????????? ??????????????? ?????? ??????)
  }
  dialog.showMessageBox(null, options)
})
ipcMain.on('error', (event, message) => {
  const options = {
    type: 'error', // ??????
    buttons: ['??????'], // ?????? ?????????
    title: 'Anywhere', // ??????
    message: message,
    checkboxChecked: false // ????????????(???????????? ??????????????? ?????? ??????)
  }
  dialog.showMessageBox(null, options)
})

ipcMain.on('ondragstart', (event, filePath) => {
  filePath = globalFunk.checkFolderPath(filePath)
  globalFunk.checkAvailableFile(filePath, (e) => {
    console.log(e)
    // send Error
    if (e !== undefined) {
      event.sender.send('ondragstart_result', e)
    }
  })
  event.sender.startDrag({
    file: filePath,
    // eslint-disable-next-line no-undef
    icon: _path.join(__static, customIcon)
  })
})
