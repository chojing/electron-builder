const Client = require('ftp')
const { shell } = require('electron')
const fs = require('fs')
const FileData = require('./globalFunk.js').FileData
const NotificationPopUp = require('./globalFunk.js').NotificationPopUp
const FileInfo = require('./fileinfo.js').FileInfo
const util = require('util')
const EventEmitter = require('events').EventEmitter
const gfileData = new FileData()

function FTPConnectTypeInfo () {
  this.ftpSiteList = []
  this.connectionType = ''
}
function FTPInfoType2 () {
  FTPInfo.apply(this, arguments) // 모든 파라미터를 부모로 넘김
  // arguments : _key, _event, _FTPServerConfig
}
FTPInfoType2.prototype = new FTPInfo() // 상속 (관련 함수, 변수 모두 사용 가능)
FTPInfoType2.prototype.RequestFTPWork = async function (_ftpType, _selectFiles, _connectionIndex) {
  const self = this
  return new Promise((resolve, reject) => {
    const PromiseResult = []

    self.doftp(_ftpType, PromiseResult, _selectFiles, _connectionIndex)

    // FTPInfo 가 끝나면 실행됨 (WorkObject 별 FTPInfo 가 모두 실행되면 출력)
    Promise.all(PromiseResult).then(value => {
      let result = true
      for (let i = 0; i < value.length; i++) {
        if (!value[i]) { // 실패
          console.log(self.m_FTPServerConfigList[_connectionIndex].host + ' is fail!')
          result = value[i]
        } else {
          console.log(self.m_FTPServerConfigList[_connectionIndex].host + ' is Success!')
        }
      }
      if (result) {
        resolve(true)
        return true
      } else {
        reject(result)
        return false
      }
    })// end Promise.all
  })// end Promise
}

function FTPInfoType1 () {
  FTPInfo.apply(this, arguments) // 모든 파라미터를 부모로 넘김
  // arguments : _key, _event, _FTPServerConfig
}
FTPInfoType1.prototype = new FTPInfo() // 상속 (관련 함수, 변수 모두 사용 가능)
FTPInfoType1.prototype.RequestFTPWork = function (_ftpType, _selectFiles, _connectionIndex) {
  const self = this
  const PromiseResult = []

  self.doftp(_ftpType, PromiseResult, _selectFiles, _connectionIndex)

  // 모든 upload 가 끝나면 실행됨
  Promise.all(PromiseResult).then(value => {
    if (!value[0]) {
      _connectionIndex = _connectionIndex + 1
      if (_connectionIndex === self.m_FTPServerConfigList.length) {
        return false
      }
      // Connection List 순차적으로 연결 및 업로드 시도
      this.RequestFTPWork(_ftpType, _selectFiles, _connectionIndex)
    } else {
      console.log(self.m_FTPServerConfigList[_connectionIndex].host + ' is Success!')
      return true
    }
  })
}

function FTPInfo (_key, _event, _FTPServerConfigList) {
  this.key = _key || '' // key는 보통 접속한 유저로 할 계획. 사용처는 클라이언트측에서 취소 요청시, 어떤 파일인지 찾기 위함
  this.event = _event || '' // 접속한 유저가 요청한 event를 등록해놓음. 나중에 result 할 때 필요함
  this.m_DES_FOLDER_PATH = ''
  this.m_FTPServerConfigList = _FTPServerConfigList || ''
  this.m_FTPInfoManager = new FTPInfoManager()
  this.m_NofiPopup = new NotificationPopUp()

  this.m_FTPInfoManager.m_UploadWorkObjectCnt = 1
  this.m_FTPInfoManager.m_DownloadWorkObjectCnt = 2
}
FTPInfo.prototype.RequestFTPWork = function (_ftpType, _selectFiles, _connectionIndex) {
  const self = this
  const PromiseResult = []

  self.doftp(_ftpType, PromiseResult, _selectFiles, _connectionIndex)
}
FTPInfo.prototype.SendMessage = function (_ftpData, _type, _errMsg) {
  const self = this
  if (_type === 'error') {
    console.log(_errMsg.message + '//' + _ftpData.key) // 에러처리
    self.event.sender.send('ftp-error', _ftpData)
    self.m_NofiPopup.show('sbspds-anywhere_Error', 'Error! \n' + _errMsg.message)
    return
  } else if (_type === 'finish') {
    if (_ftpData.isComplete) {
      self.m_NofiPopup.show('sbspds-anywhere_' + _ftpData.FTPtype, 'Success!\n' + _ftpData.srcPath)
    } else {
      self.m_NofiPopup.show('sbspds-anywhere_' + _ftpData.FTPtype, 'Fail!\n' + _ftpData.srcPath)
    }
  } else if (_type === 'cancel') {
    self.m_NofiPopup.show('sbspds-anywhere' + _ftpData.FTPtype, 'Cancel!\n' + _ftpData.srcPath)
    if (_ftpData.cancelInfo === undefined) {
      return
    }
    if (_ftpData.FTPtype === 'upload') {
      if (_ftpData.cancelInfo.isDelete) {
        const ftpStraem = new FTPStream()
        const deletePath = _ftpData.destPath + _ftpData.fileName
        ftpStraem.FTPDeleteFile(deletePath, _ftpData.cancelInfo.ftpConfig)
      }
    } else if (_ftpData.FTPtype === 'download') {
      if (_ftpData.cancelInfo.isDelete) {
        // 현재 파일 삭제
        const delFileName = _ftpData.cancelInfo.DelPath.fileName
        console.log(delFileName)
        const fileInfo = new FileInfo()
        const deleteFilePath = _ftpData.destPath + delFileName
        fileInfo.DeleteFile(deleteFilePath)

        // 완료된 파일 삭제
        if (_ftpData.cancelInfo.CompletePaths.length > 0) {
          const fileInfo = new FileInfo()
          for (let i = _ftpData.cancelInfo.CompletePaths.length - 1; i >= 0; i--) {
            fileInfo.DeleteFile(_ftpData.cancelInfo.CompletePaths[i])
            console.log('delete!!')
          }
        }
      }
    }
  }
  self.event.sender.send('ftp-result', _ftpData)
}
FTPInfo.prototype.DistributeWork = function (ArrObject, ArrPaths, WorkObjectCnt, indexDic, selectFiles, host) {
  const self = this
  for (let i = 0; i < WorkObjectCnt; i++) {
    const curFtpStream = new FTPStream()
    curFtpStream.on('data', function (ftpData) {
      self.SendMessage(ftpData, 'data')
    })
    curFtpStream.on('finish', function (ftpData) {
      self.SendMessage(ftpData, 'finish')
    })
    curFtpStream.on('cancel', function (ftpData) {
      self.SendMessage(ftpData, 'cancel')
    })
    curFtpStream.on('error', function (ftpData, _errMsg) {
      self.SendMessage(ftpData, 'error', _errMsg)
    })
    curFtpStream.key = host
    ArrObject.push(curFtpStream)
    const paths = []
    ArrPaths.push(paths)
  }

  for (let i = 0; i < selectFiles.length; i++) {
    const index = i % WorkObjectCnt
    const curFile = selectFiles[i]

    ArrPaths[index].push(curFile)
    indexDic[curFile.path] = index
  }
}
FTPInfo.prototype.doftp = function (_ftpType, PromiseResult, _selectFiles, _connectionIndex) {
  const self = this
  const ArrPaths = []
  const WorkObjectCnt = 1 // 쓰레드 1개 //순차적 추가
  const FTPStreamList = self.m_FTPInfoManager.m_FTPStreamList = [] // 초기화
  const ConnectionList = self.m_FTPServerConfigList
  self.m_FTPInfoManager.m_FTPInfoIndexDic = [] // 초기화

  self.DistributeWork(FTPStreamList, ArrPaths, WorkObjectCnt,
    self.m_FTPInfoManager.m_FTPInfoIndexDic, _selectFiles, ConnectionList[_connectionIndex].host)

  for (let i = 0; i < WorkObjectCnt; i++) {
    // ftp generate
    for (let j = 0; j < ArrPaths[i].length; j++) {
      const curFile = ArrPaths[i][j]
      const curPath = curFile.path
      const curFileName = gfileData.getFileFullName(curPath)
      const ftpData = new FTPData(_ftpType, curFile, self.m_DES_FOLDER_PATH, curFileName)

      FTPStreamList[i].m_WholeWorkFTPDataList[curPath] = ftpData
    }

    let result = FTPStreamList[i].work(ArrPaths[i], ConnectionList[_connectionIndex], 0).catch(
      function (error) {
        console.log(`FTPInfoType2_${_ftpType} ${ArrPaths[i].key} Error!!!` + error)
        // self.SendMessage(null, "error", error);
        result = error
      }
    )// end catch
    PromiseResult.push(result)
  }// end for
}

function FTPStream () {
  // eslint-disable-next-line no-unused-vars,camelcase
  let m_ftpClient
  // eslint-disable-next-line no-unused-vars,camelcase
  const m_ftpConnectConfig = {}
  // eslint-disable-next-line no-unused-vars
  let key
  // eslint-disable-next-line no-unused-vars,camelcase
  let m_CurWorkFTPData
  // eslint-disable-next-line no-unused-vars,camelcase
  const m_WholeWorkFTPDataList = {}
  // eslint-disable-next-line no-unused-vars,camelcase
  const m_CompleteFTPDataPath = []

  // eslint-disable-next-line no-unused-vars,camelcase
  const worklist = []
  // eslint-disable-next-line no-unused-vars,camelcase
  const isConnection = false
}
util.inherits(FTPStream, EventEmitter)
FTPStream.prototype.connect = function (_ftpConnectConfig) {
  const self = this
  return new Promise((resolve, reject) => {
    self.m_ftpClient = new Client()
    self.m_ftpClient.on('ready', () => {
      console.log('ftp ready')
      self.isConnection = true
      self.m_ftpConnectConfig = _ftpConnectConfig
      resolve('true')
    })
    this.m_ftpClient.on('close', () => {
      console.log('ftp close')
      // reject("close");
    })
    this.m_ftpClient.on('end', () => {
      console.log('ftp end')
      // reject("end");
    })
    this.m_ftpClient.on('error', (err) => {
      console.log('ftp err', err)
      reject(err)
    })

    this.m_ftpClient.connect(_ftpConnectConfig)
  })
}

FTPStream.prototype.work = async function (_srcPaths, _ftpConnectConfig, index) {
  const self = this
  self.worklist = _srcPaths
  await self.connect(_ftpConnectConfig).catch((err) => {
    console.log(err)
  })
  return new Promise((resolve, reject) => {
    function callPromiseResult (_promiseResultType, object) {
      if (_promiseResultType === 'resolve') {
        resolve(object)
      } else if (_promiseResultType === 'reject') {
        reject(object)
      }
    }
    const curFile = _srcPaths[index]
    if (curFile === undefined) { // file exist 확인(upload 의 경우)
      // eslint-disable-next-line prefer-promise-reject-errors
      reject(curFile.path + ' is undefined')
    }
    // find ftpData, registry curWorkData
    const ftpData = self.m_WholeWorkFTPDataList[curFile.path]
    ftpData.workIndex = index
    self.m_CurWorkFTPData = ftpData

    if (ftpData.FTPtype === 'upload') {
      // file exist check
      if (!(fs.existsSync(curFile.path))) {
        // eslint-disable-next-line prefer-promise-reject-errors
        reject('Not Exist File')
        return 'Not Exist File'
      }
      self.upload(ftpData, callPromiseResult)
    } else if (ftpData.FTPtype === 'download') {
      self.download(ftpData, callPromiseResult)
    }
  })
}
FTPStream.prototype.upload = function (ftpData, callPromiseResult) {
  const self = this
  const curPath = ftpData.srcPath
  const curDescPath = ftpData.destPath + ftpData.fileName

  if (!self.isConnection) {
    const err = new Error()
    err.message = 'Connection Fail'
    self.doError(undefined, ftpData, err, callPromiseResult)
    callPromiseResult('reject', 'Connection Fail')
  } else {
    // create readStream
    const curFileStream = fs.createReadStream(curPath, { emitClose: true })
    if (curFileStream === undefined) {
      // error
      const err = new Error()
      err.message = `${ftpData.destPath} ${ftpData.fileName} : No such file or directory.`
      self.doError(curFileStream, ftpData, err, callPromiseResult)
      callPromiseResult('reject', 'uploadFile undefined')
    }

    // FTP work
    curFileStream.on('data', function (buffer) {
      if (ftpData.isCancel) {
        self.m_ftpClient.end()
        self.doCheckRecursive_work(ftpData, curFileStream, callPromiseResult)
      } else {
        if (ftpData.isFirst) {
          self.doFirst(ftpData, ftpData.workIndex)
        }
        // console.log(self.m_ftpConnectConfig.host);
        ftpData = self.calculateFTPData(buffer, ftpData)
        self.emit('data', ftpData)
      }
    })
    // Local Path      //FTP Path
    self.m_ftpClient.put(curFileStream, curDescPath, function (err) {
      if (err) { // error
        self.doError(curFileStream, ftpData, err, callPromiseResult)
        callPromiseResult('reject', 'put Error + ' + err)
      } else { // 완료 후 //finish
        if (!ftpData.isCancel) { // cancel 되고 finish로 넘어왔을 때, 중복 호출을 막기 위함
          self.m_CompleteFTPDataPath.push(curDescPath) // ftp Path
          self.doCheckRecursive_work(ftpData, curFileStream, callPromiseResult)
        }
      }
    })
  }
}
FTPStream.prototype.download = function (ftpData, callPromiseResult) {
  const self = this
  if (!self.isConnection) {
    const err = new Error()
    err.message = 'Connection Fail'
    self.doError(undefined, ftpData, err, callPromiseResult)
    callPromiseResult('reject', 'Connection Fail')
  } else {
    // create writestream
    const curDescPath = ftpData.destPath + ftpData.fileName
    const curFileStream = fs.createWriteStream(curDescPath, { emitClose: true })
    const curPath = ftpData.srcPath

    // FTP work
    // eslint-disable-next-line handle-callback-err
    self.m_ftpClient.size(curPath, function (err, size) {
      ftpData.curMaxFileSize = size
      self.m_ftpClient.get(curPath, function (err, stream) {
        if (err) {
          console.log(err)
          self.doError(stream, ftpData, err, callPromiseResult)
          callPromiseResult('reject', err)
          return err
        } else {
          stream.on('data', function (buff) {
            if (ftpData.isCancel) {
              stream.destroy(true)
              self.m_ftpClient.end()
              self.doCheckRecursive_work(ftpData, curFileStream, callPromiseResult)
            } else {
              if (ftpData.isFirst) {
                self.doFirst(ftpData, ftpData.workIndex) // param : ftpData, key (임시 : index)
              }
              ftpData = self.calculateFTPData(buff, ftpData)
              self.emit('data', ftpData)
            }
          })
            .once('close', function () {
              if (!ftpData.isCancel) {
                self.m_CompleteFTPDataPath.push(curDescPath)
                self.doCheckRecursive_work(ftpData, curFileStream, callPromiseResult)
              }
            })
            .pipe(curFileStream, function (err) {
              if (err) {
                console.log(err)
                self.doError(stream, ftpData, err, callPromiseResult) // #cjy 2021.07.16 테스트 필요
                callPromiseResult('reject', err)
              } else {
                console.log('close')
              }
            })
        }
      })
    })
  }
}
FTPStream.prototype.doCheckRecursive_work = function (_ftpData, _curFileStream, callPromiseResult, isError = false) {
  const self = this
  // WriteStream release
  self.doReleaseStream(_curFileStream)
  // send Event
  self.doSendEvent(_ftpData, isError)

  const nextIndex = _ftpData.workIndex + 1
  // final job check or all cancel check
  if (nextIndex >= self.worklist.length) {
    // finish
    callPromiseResult('resolve', true)
    return
  }
  if (_ftpData.cancelInfo !== undefined) {
    if (_ftpData.cancelInfo.cancelType === 'all') {
      callPromiseResult('resolve', true)
      return
    }
  }

  // next job
  callPromiseResult('resolve', self.work(self.worklist, self.m_ftpConnectConfig, nextIndex).catch(
    function (error) {
      console.log('ftpStream_upload Error!!!')
      console.log(error)
    })
  )
}
FTPStream.prototype.downloadFolderOpen = function (_path) {
  shell.openExternal(_path)
}
FTPStream.prototype.cancel = function (_cancelInfo) {
  const self = this
  const value = self.m_CurWorkFTPData
  if (value === undefined) {
    console.log('ftp.js > Cancel > 해당 경로가 없습니다!')
    return false
  }
  value.isCancel = true
  value.cancelInfo = _cancelInfo
  return true
}
FTPStream.prototype.calculateFTPData = function (_buffer, _ftpData) {
  _ftpData.segmentLength = _buffer.length // 파일 보낸 량 확인 65536이 최대
  _ftpData.curTime = new Date().getTime() // 현재 시간 가져오기
  _ftpData.curFileSize += _ftpData.segmentLength // 현재 업로드된 사이즈 계산
  _ftpData.curWorkPersent = (_ftpData.curFileSize / _ftpData.curMaxFileSize * 100).toFixed(2) // 현재 업로드 % 계산

  _ftpData.elapsed = (_ftpData.curTime - _ftpData.startTime) / 1000 // 업로드 진행 시간 계산

  _ftpData.bps = _ftpData.elapsed ? _ftpData.curFileSize / _ftpData.elapsed : 0 // bps 전송 계산
  _ftpData.kbps = (_ftpData.bps / 1024).toFixed(2)
  _ftpData.mbps = 0
  if (_ftpData.kbps > 1024) {
    _ftpData.mbps = (_ftpData.kbps / 1024).toFixed(2)
    // console.log(_ftpData.mbps+ " / mbps");
  } else {
    // console.log(_ftpData.kbps+" / kbps");
  }
  /*
    console.log(`Progress[${_ftpData.srcPath}]:\t` + _ftpData.curWorkPersent + "%");
    console.log("Elapsed : " + _ftpData.elapsed);
    console.log(_ftpData.curFileSize + " byte");
    */

  return _ftpData
}
FTPStream.prototype.doError = function (_stream, _ftpData, _errMsg, callResolve) {
  const self = this
  _ftpData.isError = true
  _ftpData.errMsg = _errMsg
  self.doCheckRecursive_work(_ftpData, _stream, callResolve, true)
  self.isComplete = false
  self.emit('error', _ftpData, _errMsg)
}
FTPStream.prototype.doFirst = function (_ftpData, _key) {
  _ftpData.isFirst = false
  _ftpData.key = _key
  _ftpData.startTime = new Date().getTime()
  _ftpData.curFileSize = 0
}
FTPStream.prototype.doReleaseStream = function (_stream) {
  if (_stream === undefined) {
    return
  }
  _stream.close()
  _stream.destroy()
}
FTPStream.prototype.doSendEvent = function (_ftpData, isError) {
  const self = this
  if (_ftpData.isCancel) {
    self.doSendCancelEvent(_ftpData)
  } else {
    if (!isError) {
      self.m_ftpClient.end()
      self.doSendFinishEvent(_ftpData)
    }
  }
}
FTPStream.prototype.doSendFinishEvent = function (_ftpData, isError) {
  const self = this
  if (isError) {
    return
  }
  _ftpData.isComplete = true
  self.emit('finish', _ftpData)
}
FTPStream.prototype.doSendCancelEvent = function (_ftpData) {
  const self = this
  _ftpData.cancelInfo.ftpConfig = self.m_ftpConnectConfig
  _ftpData.cancelInfo.DelPath = self.m_CurWorkFTPData
  _ftpData.cancelInfo.CompletePaths = self.m_CompleteFTPDataPath
  _ftpData.cancelInfo.worklist = self.worklist
  self.emit('cancel', _ftpData)
}
FTPStream.prototype.doSendErrorEvent = function (_ftpData, _errMsg) {
  const self = this
  self.emit('error', _ftpData, _errMsg)
}
FTPStream.prototype.FTPDeleteFile = async function (_path, _ftpConfig) {
  const self = this
  await self.connect(_ftpConfig)
  self.m_ftpClient.delete(_path, function (err) {
    if (err) {
      console.log(err)
      return false
    } else {
      console.log('FTP 삭제 완료')
      return true
    }
  })
}
FTPStream.prototype.FTPCreateFolder = async function (_path, _ftpConfig) {
  const self = this
  await self.connect(_ftpConfig)
  self.m_ftpClient.mkdir(_path, true, function (err) {
    if (err) {
      console.log(err)
      return false
    } else {
      console.log('FTP 폴더 생성')
      return true
    }
  })
}
// function GetFileList (_event) {
//   this.ftpClient.list(function (err, list) {
//     if (err) throw err
//     console.dir(list)
//     _event.sender.send('ftp-get-list-result', list)
//     this.ftpClient.end()
//   })
// }
function FTPData (_type, _file, _desPath, _fileName) {
  // Size
  this.curFileSize = 0
  this.curMaxFileSize = _file.size || 0
  // eslint-disable-next-line no-unused-expressions
  this.segmentLength
  this.curWorkPersent = 0

  // Time
  // eslint-disable-next-line no-unused-expressions
  this.startTime
  // eslint-disable-next-line no-unused-expressions
  this.curTime
  // eslint-disable-next-line no-unused-expressions
  this.elapsed

  // bps
  // eslint-disable-next-line no-unused-expressions
  this.bps
  // eslint-disable-next-line no-unused-expressions
  this.kbps
  // eslint-disable-next-line no-unused-expressions
  this.mbps

  // file
  this.srcPath = _file.path || '' // src 파일 패스 + 이름 + 확장자
  this.destPath = _desPath || '' // des 파일 패스
  this.fileName = _fileName || '' // des 파일 이름 +  확장자

  // error
  this.isError = false
  this.errMsg = ''

  // etc
  this.key = _file.key | ''
  this.FTPtype = _type || 'none' // download / upload
  this.workIndex = 0
  this.isComplete = false
  this.isCancel = false
  this.isFirst = true
}

function FTPInfoManager () {
  this.m_FTPInfoIndexDic = {}
  this.m_FTPStreamList = []

  // eslint-disable-next-line no-unused-expressions
  this.m_UploadWorkObjectCnt
  // eslint-disable-next-line no-unused-expressions
  this.m_DownloadWorkObjectCnt
}

// #region MEMO #cjy 2021.07.14
/* Dictoinary 사용법 기록
FTPInfoManager.prototype.IfExist = function(_dictionary, _findKey){
    let result = (_findKey in _dictionary);
    return result;
}
FTPInfoManager.prototype.Add = function(_dictionary, _key, _value){
    _dictionary[_key] = _value;
}
FTPInfoManager.prototype.Delete = function(_dictionary, _key){
    delete _dictionary[_key];
}
FTPInfoManager.prototype.DicCount = function(_dictionary){
    return Object.keys(_dictionary).length;
}
FTPInfoManager.prototype.GetValue = function(_dictionary, _key){
    return _dictionary[_key];
}
*/
// #endregion

exports.FTPInfoType1 = FTPInfoType1
exports.FTPInfoType2 = FTPInfoType2
exports.FTPInfo = FTPInfo
exports.FTPStream = FTPStream
exports.FTPInfoManager = FTPInfoManager
exports.FTPConnectTypeInfo = FTPConnectTypeInfo
