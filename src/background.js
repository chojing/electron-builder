'use strict'

import { app, protocol, BrowserWindow, ipcMain } from 'electron'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
// import installExtension, { VUEJS3_DEVTOOLS } from 'electron-devtools-installer'
const { Menu, Tray, MenuItem } = require('electron')
const isDevelopment = process.env.NODE_ENV !== 'production'

const FileInfo = require('./assets/main/fileinfo.js').FileInfo
const FileCopyInfo = require('./assets/main/fileinfo.js').FileCopyInfo
const FTPStream = require('./assets/main/ftp.js').FTPStream
const globalFunk = require('./assets/main/globalFunk.js')
const FTPConnectTypeInfo = require('./assets/main/ftp.js').FTPConnectTypeInfo
// eslint-disable-next-line camelcase
const g_JSON = require('./assets/main/json.js')
const NotificationPopUp = require('./assets/main/globalFunk.js').NotificationPopUp
// test
// eslint-disable-next-line camelcase
const FTPInfo_Type1 = require('./assets/main/ftpinfo.js').FTPInfoType1
// eslint-disable-next-line camelcase
const FTPInfo_Type2 = require('./assets/main/ftpinfo.js').FTPInfoType2
const FileData = require('./assets/main/globalFunk.js').FileData // #cjy testCode 2021.07.08
const _path = require('path')

// #region main global value
const KONAN_ROOT_FOLDER = '//.konan'
// const MAIN_PAGE = 'test_index.html'
const MAIN_PAGE = 'loading.html'
// eslint-disable-next-line camelcase
const gWindows = []
// eslint-disable-next-line camelcase
let gWin = null
// eslint-disable-next-line camelcase
const g_NotificationPopUp = new NotificationPopUp()
// eslint-disable-next-line camelcase
let g_DOWNLOAD_FOLDER_PATH = ''
// eslint-disable-next-line camelcase
const g_loginInfo = {}
// eslint-disable-next-line camelcase
let g_curUserInfo

// Scheme must be registered before the app is ready
protocol.registerSchemesAsPrivileged([
  { scheme: 'app', privileges: { secure: true, standard: true } }
])

async function createWindow () {
  console.log('createWindow')
  // eslint-disable-next-line camelcase
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
  // 브라우저창이 읽어 올 파일 위치
  gWin.loadFile('loading.html')
  gWin.loadFile(MAIN_PAGE)
  gWin.webContents.openDevTools()
  gWin.setMenu(null)

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
}

function RunTray () {
  const tray = new Tray(_path.resolve(__dirname, '../public/img/icons/mac/16x16.png')) // 현재 애플리케이션 디렉터리를 기준으로 하려면 `__dirname + '/images/tray.png'` 형식으로 입력해야 합니다.
  tray.on('double-click', function () {
    if (!gWin.isShow) {
      windowShow(gWin)
    } else {
      WindowHide(gWin)
    }
  })

  const menu = new Menu()
  menu.append(new MenuItem(
    {
      label: 'Window Show',
      click () { windowShow(gWin) }
    }))
  menu.append(new MenuItem(
    {
      label: 'Window Hide',
      click () { WindowHide(gWin) }
    }))
  menu.append(new MenuItem(
    {
      label: 'Window Exit',
      click () {
        Exit(tray)
      }
    }))

  tray.setToolTip('Test ToolTip')
  tray.setContextMenu(menu)
}

function getUserHome () {
  // eslint-disable-next-line eqeqeq
  return process.env[(process.platform == 'win32') ? 'USERPROFILE' : 'HOME']
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
ipcMain.on('open-file-dialog', (event) => {
  const resultPaths = requestGetFilePaths(gWin, false)
  requetGetFileInfoResult(event, resultPaths)
})

ipcMain.on('open-directory-dialog', (event) => {
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
// eslint-disable-next-line camelcase
const g_FTPInfoDic = {}
// eslint-disable-next-line camelcase
const g_FTPWorkQueue = []
let statusWindow = null
ipcMain.on('ftp-file-upload', async (event, _selectFiles, _ftpConnectTypeInfo) => {
  let ftpConnectTypeInfo
  if (_ftpConnectTypeInfo === undefined) {
  // #region testCode FTPConnectTypeInfo
    ftpConnectTypeInfo = new FTPConnectTypeInfo()
    ftpConnectTypeInfo.connectionType = '2'
    /*
  let connectObject = {
    host: '10.10.18.28',
    port:'21',
    user: 'konan',
    password: 'konan415'
  }
  ftpConnectTypeInfo.ftpSiteList.push(connectObject)
  */
    const connectObject2 = {
      host: '10.10.18.29',
      port: '21',
      user: 'konan',
      password: 'konan415'
    }
    ftpConnectTypeInfo.ftpSiteList.push(connectObject2)
  /*
    let connectObject3 = {
    host: '10.10.18.28',
    port:'21',
    user: 'konan',
    password: 'konan415'
    }
    ftpConnectTypeInfo.ftpSiteList.push(connectObject3)
    */
  // #endregion
  } else {
    ftpConnectTypeInfo = _ftpConnectTypeInfo

    statusWindow = new BrowserWindow({
      width: 400,
      height: 500,
      parent: gWin,
      modal: true,
      webPreferences: {
        nodeIntegration: true, // api 접근 허용 여부
        contextIsolation: false
        // preload: g_path.join(app.getAppPath(), 'preload.js')
      }
    })
    statusWindow.isShow = true
    // 브라우저창이 읽어 올 파일 위치
    statusWindow.loadFile('./renderer/statusWindow.html')
    // 브라우저창과 웹사이트 연결
    // gWin.loadURL('https://www.naver.com')
    statusWindow.webContents.openDevTools()
    statusWindow.setMenu(null)
  }

  if (ftpConnectTypeInfo) {
    const desFolderPath = '/konan/electron_test/'
    FTPConnectTypeBranch('upload', event, ftpConnectTypeInfo, _selectFiles, desFolderPath)
  }
})

ipcMain.on('ftp-file-upload_new', async (event, _ftpSendData) => {
  const parentEvent = event
  _ftpSendData.event = event
  const ftpConnectTypeInfo = _ftpSendData.ftpConnectTypeInfo
  let statusWindow
  // statuswindow가 없을 경우에만 생성
  // eslint-disable-next-line no-prototype-builtins
  if (!gWindows.hasOwnProperty('statusWindow')) {
    statusWindow = new BrowserWindow({
      width: 400,
      height: 500,
      parent: gWin,
      modal: true,
      webPreferences: {
        nodeIntegration: true, // api 접근 허용 여부
        contextIsolation: false
        // preload: g_path.join(app.getAppPath(), 'preload.js')
      }
    })
    statusWindow.on('close', function (event) {
      delete gWindows.statusWindow
      // eslint-disable-next-line no-undef
      parentEvent.sender.send('windowClose', key, true, 'Success')
    })
    statusWindow.on('show', () => {
      setTimeout(() => {
        statusWindow.focus()
      }, 200)
    })

    statusWindow.isShow = true
    statusWindow.loadFile('./renderer/statusWindow.html')
    // gWin.loadURL('https://www.naver.com')
    statusWindow.webContents.openDevTools()
    statusWindow.setMenu(null)
    gWindows.statusWindow = statusWindow
    _ftpSendData.popUpWindow = statusWindow
  } else {
    statusWindow.show()
    _ftpSendData.popUpWindow = gWindows.statusWindow
  }
  _ftpSendData.desFolderPath = '/konan/electron_test/'
  // 이후 statuswindow 에서 시작하면 함. 스택에 쌓을뿐...
  if (ftpConnectTypeInfo) {
    g_FTPWorkQueue.push(_ftpSendData)
  }
})

ipcMain.on('ftp-file-upload-start', function () {
  console.log('FTP Upload start!')
  const ftpSendData = g_FTPWorkQueue.shift()
  FTPConnectTypeBranchNew('upload', ftpSendData)
})

ipcMain.on('ftp-file-download', (event, _selectFiles) => {
  // #region TestCode
  // TestCode #cjy 2021.07.06
  const testfile = new FileData()
  testfile.path = '/konan/electron_test//201906100001_002.MXF'
  testfile.size = 0
  // let testfile2 = new FileData()
  // testfile2.path = '/konan/electron_test/201906100001_002-copy.MXF'
  // testfile2.size = 0

  // let testfile3 = new FileData()
  // testfile3.path = '/konan/electron_test/22222222222.MXF'
  // testfile3.size = 0

  const testfile4 = new FileData()
  testfile4.path = '/konan/electron_test/201906100001_002-copy.MXF'
  testfile4.size = 0

  _selectFiles.push(testfile)
  // _selectFiles.push(testfile2)
  // _selectFiles.push(testfile3)
  _selectFiles.push(testfile4)

  const ftpConnectTypeInfo = new FTPConnectTypeInfo()
  ftpConnectTypeInfo.connectionType = '2'

  const connectObject = {
    host: '10.10.18.28',
    port: '21',
    user: 'konan',
    password: 'konan415'
  }
  ftpConnectTypeInfo.ftpSiteList.push(connectObject)

  const connectObject2 = {
    host: '10.10.18.29',
    port: '21',
    user: 'konan',
    password: 'konan415'
  }
  ftpConnectTypeInfo.ftpSiteList.push(connectObject2)
  // #endregion
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
  // eslint-disable-next-line camelcase
  g_DOWNLOAD_FOLDER_PATH = desFolderPath

  FTPConnectTypeBranch('download', event, ftpConnectTypeInfo, _selectFiles, desFolderPath)
})
function FTPConnectTypeBranch (_FTPType, event, _FTPConnectTypeInfo, _selectFiles, _desFolderPath) {
  const curType = _FTPConnectTypeInfo.connectionType
  const tempDic = {}
  if (curType === '1') {
    const ftpInfo = new FTPInfo_Type1('admin', event, _FTPConnectTypeInfo.ftpSiteList)
    tempDic[_FTPConnectTypeInfo.ftpSiteList[0].host] = ftpInfo
    g_FTPInfoDic.admin = tempDic
    g_FTPInfoDic.admin.connectionType = '1'
    ftpInfo.m_DES_FOLDER_PATH = _desFolderPath
    ftpInfo.RequestFTPWork(_FTPType, _selectFiles, 0)
  } else if (curType === '2') {
    const PromiseResult = []
    let i = 0
    while (i >= 0) {
      let result
      const ftpInfo = new FTPInfo_Type2('admin', event, _FTPConnectTypeInfo.ftpSiteList)
      ftpInfo.m_DES_FOLDER_PATH = _desFolderPath
      tempDic[_FTPConnectTypeInfo.ftpSiteList[i].host] = ftpInfo // dic[10.10.18.29] = ftpInfo
      result = ftpInfo.RequestFTPWork(_FTPType, _selectFiles, i).catch(
        function (error) {
          console.log(`FTPInfo_Type2_${_FTPType} Error!!!` + error)
          result = error
        }
      ) // end catch
      PromiseResult.push(result)
      i++
      if (i === _FTPConnectTypeInfo.ftpSiteList.length) {
        break
      }
    }// end while

    g_FTPInfoDic.admin = tempDic
    g_FTPInfoDic.admin.connectionType = '2'

    // 모든 작업이 다 완료되었을 때 출력 (모든 커넥션 작업 완료.)
    /*
    Promise.all(PromiseResult).then(value => {
      let isError = false
      console.log(g_FTPInfoDic['admin'])
      for(let i = 0 i<value.length i++){
        let cnt = g_FTPInfoDic['admin'][i].m_FTPInfoManager.m_FTPStreamList[i].m_WholeWorkFTPDataList
        let checkList = g_FTPInfoDic['admin'].m_FTPInfoManager.m_FTPStreamList[i].m_WholeWorkFTPDataList
        for(let j = 0 j<cnt j++){
          if(checkList[j].isError == true){
            g_FTPInfoDic['admin'].isError = true
            console.log(checkList[j].key + ' is fail.')
          }
        }
      }
    })//end Promise.all
    */
  }
}
function FTPConnectTypeBranchNew (_FTPType, ftpSendData) {
  const curType = ftpSendData.ftpConnectTypeInfo.connectionType
  const tempDic = {}
  if (curType === '1') {
    const ftpInfo = new FTPInfo_Type1('admin', ftpSendData.event, ftpSendData.ftpConnectTypeInfo.ftpSiteList, gWindows.statusWindow)
    tempDic[ftpSendData.ftpConnectTypeInfo.ftpSiteList[0].host] = ftpInfo
    g_FTPInfoDic.admin = tempDic
    g_FTPInfoDic.admin.connectionType = '1'
    ftpInfo.m_DES_FOLDER_PATH = ftpSendData.desFolderPath
    ftpInfo.RequestFTPWork(_FTPType, ftpSendData, 0)
  } else if (curType === '2') {
    const PromiseResult = []
    let i = 0
    while (i >= 0) {
      let result
      const ftpInfo = new FTPInfo_Type2('admin', ftpSendData.event, ftpSendData.ftpConnectTypeInfo.ftpSiteList, gWindows.statusWindow)
      ftpInfo.m_DES_FOLDER_PATH = ftpSendData.desFolderPath
      tempDic[ftpSendData.ftpConnectTypeInfo.ftpSiteList[i].host] = ftpInfo // dic[10.10.18.29] = ftpInfo
      result = ftpInfo.RequestFTPWork(_FTPType, ftpSendData, i).catch(
        function (error) {
          console.log(`FTPInfo_Type2_${_FTPType} Error!!!` + error)
          result = error
        }
      ) // end catch
      PromiseResult.push(result)
      i++
      if (i === ftpSendData.ftpConnectTypeInfo.ftpSiteList.length) {
        break
      }
    }// end while

    g_FTPInfoDic.admin = tempDic
    g_FTPInfoDic.admin.connectionType = '2'

    // 모든 작업이 다 완료되었을 때 출력 (모든 커넥션 작업 완료.) 2번타입일경우에만.
    /*
    Promise.all(PromiseResult).then(value => {
      let isError = false
      console.log(g_FTPInfoDic['admin'])
      for(let i = 0 i<value.length i++){
        let cnt = g_FTPInfoDic['admin'][i].m_FTPInfoManager.m_FTPStreamList[i].m_WholeWorkFTPDataList
        let checkList = g_FTPInfoDic['admin'].m_FTPInfoManager.m_FTPStreamList[i].m_WholeWorkFTPDataList
        for(let j = 0 j<cnt j++){
          if(checkList[j].isError == true){
            g_FTPInfoDic['admin'].isError = true
            console.log(checkList[j].key + ' is fail.')
          }
        }
      }
    })//end Promise.all
    */
  }
}
ipcMain.on('open-file-explore', (event) => {
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
      const cnt = g_FTPInfoDic[DicKey][cancelInfo.cancelConnectionList[i]].m_FTPInfoManager.m_FTPStreamList.length
      if (cnt === undefined) {
        return
      }
      FTPInfoList = g_FTPInfoDic[DicKey][cancelInfo.cancelConnectionList[i]].m_FTPInfoManager.m_FTPStreamList
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
ipcMain.on('login-read', (event) => {
  // let data = g_JSON.ReadUserJSON('./UserData.json')
  const path = getUserHome() + KONAN_ROOT_FOLDER + '//UserData.json'
  const data = g_JSON.ReadUserJSON(path)
  console.log('login-read', data)
  let lastloginInfo = {}

  if (data !== undefined) {
    lastloginInfo = data
  }

  let profile = 'default'
  for (const data of process.argv) {
    if (data.startsWith('profiles')) {
      profile = data.replace('profiles=', '')
    }
  }
  const properties = g_JSON.ReadUserJSON(_path.resolve(__dirname, '../src/assets/properties/' + profile + '.json'))
  lastloginInfo.server = properties.server

  event.sender.send('login-read-result', lastloginInfo)
})

ipcMain.on('login-write', (event, _loginInfo) => {
  _loginInfo.lastTime = globalFunk.getNowyyyymmddhhiiss()
  g_loginInfo[_loginInfo.id] = _loginInfo
  // eslint-disable-next-line camelcase
  g_curUserInfo = _loginInfo
  const path = getUserHome() + KONAN_ROOT_FOLDER
  // g_JSON.WriteUserJSON(path, g_loginInfo)
  g_JSON.WriteUserJSON(path, _loginInfo)
  // g_NotificationPopUp.show('Config Save', 'Login Info Save Success')
  event.sender.send('login-write-result', true)
})

ipcMain.on('getUserInfo', (event) => {
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
  if (gWindows.hasOwnProperty(key)) {
    event.sender.send('openWindow_result', key, windowInfo.data, false, 'Key exsist already!')
    return
  }
  if (windowInfo.url === '') {
    event.sender.send('openWindow_result', key, windowInfo.data, false, 'url is not exist!')
    return
  }

  const url = windowInfo.url
  let parentWindow
  if (windowInfo.parent === '' || windowInfo.parent === undefined || windowInfo.parent === '') {
    // eslint-disable-next-line camelcase
    parentWindow = gWin
  } else {
    parentWindow = gWindows[windowInfo.parent]
  }

  const window = new BrowserWindow({
    width: windowInfo.width,
    height: windowInfo.height,
    parent: parentWindow,
    modal: windowInfo.modal,
    webPreferences: {
      nodeIntegration: true, // api 접근 허용 여부
      contextIsolation: false
      // preload: g_path.join(app.getAppPath(), 'preload.js')
    }
  })
  window.on('close', function (event) {
    delete gWindows[key]
  })
  window.loadFile(url)
  window.setMenu(null)
  if (windowInfo.isUseDevTool) {
    window.webContents.openDevTools()
  }
  window.webContents.on('did-finish-load', (evt) => {
    // onWebcontentsValue 이벤트 송신
    window.webContents.send('receiveData', key, windowInfo.data, 'init')
  })
  window.isShow = true

  gWindows[key] = window
  event.sender.send('openWindow_result', key, windowInfo.data, true)
  console.log('OpenWindow Finish' + key)
}
ipcMain.on('sendData', (event, key, data, type) => {
  // eslint-disable-next-line no-prototype-builtins
  if (!gWindows.hasOwnProperty(key)) {
    event.sender.send('sendData_result', key, false, 'Key not exist!')
    return
  }
  gWindows[key].webContents.send('receiveData', key, data, type)
  event.sender.send('sendData_result', key, true, 'Success')
  console.log('SendData Finish' + key)
})

ipcMain.on('closeWindow', (event, key) => {
  // eslint-disable-next-line no-prototype-builtins
  if (gWindows.hasOwnProperty(key)) {
    event.sender.send('closeWindow_result', key, false, 'Key not exist!')
    return
  }
  gWindows[key].close()
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
    process.on('message', (data) => {
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
