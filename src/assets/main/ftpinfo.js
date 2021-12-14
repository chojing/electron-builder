const NotificationPopUp = require('./globalFunk.js').NotificationPopUp
const FileInfo = require('./fileinfo.js').FileInfo
const FTPStream = require('./ftpStream').FTPStream
const log = require('electron-log')

function FTPInfo (_event, _FTPSite) {
  this.event = _event || '' // 접속한 유저가 요청한 event를 등록해놓음. 나중에 result 할 때 필요함
  this.m_FTPSite = _FTPSite || ''
  this.m_NofiPopup = new NotificationPopUp()
  this.ftpStreamList = {} // FTPStream
  this.clientSendData
  this.isFinish = false
  this.isEthernetConnect = true
}

FTPInfo.prototype.RequestFTPWork = async function (_ftpType, _FTPSendData, _connectionIndex) {
  let self = this
  let PromiseResult = []

  // eslint-disable-next-line no-unused-vars
  let result = await self.doftp(_ftpType, PromiseResult, _FTPSendData.fileList, _connectionIndex)
  self.isFinish = true
}

FTPInfo.prototype.doftp = function (_ftpType, PromiseResult, _fileList, _currentFtpServer) {
  let self = this
  let ftpServer = _currentFtpServer
  let ftpStreamKey = _currentFtpServer.name
  let desFolderPath = _currentFtpServer.rootpath
  let curFtpStream = new FTPStream()
  curFtpStream.on('data', function (ftpData) {
    self.SendMessage(ftpData, ftpServer, 'data')
  })
  curFtpStream.on('finish', function (ftpData) {
    self.SendMessage(ftpData, ftpServer, 'finish')
  })
  curFtpStream.on('cancel', function (ftpData) {
    self.SendMessage(ftpData, ftpServer, 'cancel')
  })
  curFtpStream.on('error', function (ftpData, _errMsg) {
    self.SendMessage(ftpData, ftpServer, 'error', _errMsg)
  })

  self.ftpStreamList[ftpStreamKey] = curFtpStream
  let totalSize = 0
  for (let j = 0; j < _fileList.length; j++) {
    let curFile = _fileList[j]
    let curPath = curFile.path
    let curFileName = curFile.fileName
    let ftpData = new FTPData(_ftpType, curFile, desFolderPath, curFileName)

    // 전체 취소를 위한 전체 작업 담기
    self.ftpStreamList[ftpStreamKey].m_WholeWorkFTPDataList[curPath] = ftpData

    // 전체 사이즈 체킹
    totalSize += curFile.size
  }
  curFtpStream.totalWorkSize = totalSize
  curFtpStream.totalWorkIndex = _fileList.length
  let result = self.ftpStreamList[ftpStreamKey].work(_fileList, ftpServer, 0).catch(
    function (error) {
      log.error(`FTPInfo_${_ftpType} Error!!!` + error)
      self.SendMessage(undefined, ftpServer, 'error', error)
      return error
    }
  )// end catch
  PromiseResult.push(result) // 작업 하나(FTPSendData)가 끝났다는것을 알림
}

FTPInfo.prototype.SendMessage = function (_ftpData, _curFtpServer, _type, _errMsg) {
  let self = this
  //   if (self.isEthernetConnect == false) {
  //     return
  //   }
  try {
    if (_type == 'error') {
      let errObj = {
        message: _errMsg.message,
        code: _errMsg.code,
        ftpData: _ftpData
      }
      if (self.event.sender.isDestroyed() == false) {
        self.event.sender.send('ftp-error', errObj)
        self.m_NofiPopup.show('sbspds-anywhere_Error', 'Error! \n' + _errMsg.message)
      }
      return
    } else if (_type == 'finish') {
      if (_ftpData.isComplete == true) {
        if (_ftpData.totalWorkIndex - 1 == _ftpData.workIndex) {
          _ftpData.isTotalComplete = true
        }
        self.m_NofiPopup.show('sbspds-anywhere_' + _ftpData.FTPtype, 'Success!\n' + _ftpData.srcPath)
        log.info('FTP ', _ftpData.FTPtype, ' Finish success!')
      } else {
        self.m_NofiPopup.show('sbspds-anywhere_' + _ftpData.FTPtype, 'Fail!\n' + _ftpData.srcPath)
        log.info('FTP ', _ftpData.FTPtype, ' Finish fail!')
      }
      log.info('FTP Server : ', _curFtpServer)
      log.info('FTP file : ', _ftpData.srcPath)
    } else if (_type == 'cancel') {
      self.m_NofiPopup.show('sbspds-anywhere' + _ftpData.FTPtype, 'Cancel!\n' + _ftpData.srcPath)
      if (_ftpData.cancelInfo === undefined) {
        return
      }
      if (_ftpData.FTPtype == 'upload') {
        log.info('FTP ', _ftpData.FTPtype, ' Cancel delete start!')
        if (_ftpData.cancelInfo.isDelete == true) {
        // eslint-disable-next-line prefer-const
          let ftpStraem = new FTPStream()
          // 현재 파일 삭제
          let deletePath = _ftpData.destPath + _ftpData.fileName
          ftpStraem.FTPDeleteFile(deletePath, _curFtpServer)

          // 완료된 파일 삭제
          if (_ftpData.cancelInfo.CompletePaths.length > 0) {
            for (let i = _ftpData.cancelInfo.CompletePaths.length - 1; i >= 0; i--) {
              ftpStraem.FTPDeleteFile(_ftpData.cancelInfo.CompletePaths[i], _curFtpServer)
            }
          }
        }
        log.info('FTP ', _ftpData.FTPtype, ' Cancel delete end!')
        log.info('FTP ', _ftpData.FTPtype, ' Cancel success!')
        log.info('FTP Server : ', _curFtpServer)
      } else if (_ftpData.FTPtype == 'download') {
        if (_ftpData.cancelInfo.isDelete == true) {
        // 현재 파일 삭제
          let delFileName = _ftpData.cancelInfo.DelPath.fileName
          let fileInfo = new FileInfo()
          let deleteFilePath = _ftpData.destPath + delFileName
          fileInfo.DeleteFile(deleteFilePath)

          // 완료된 파일 삭제
          if (_ftpData.cancelInfo.CompletePaths.length > 0) {
            for (let i = _ftpData.cancelInfo.CompletePaths.length - 1; i >= 0; i--) {
              fileInfo.DeleteFile(_ftpData.cancelInfo.CompletePaths[i])
            }
          }
          log.info('Download cancel, File delete!!')
        }
      }
    }
    let result = {
      ftpServer: _curFtpServer,
      ftpData: _ftpData
    }
    if (self.event.sender.isDestroyed() == false) {
      // if (self.isEthernetConnect == true) {
      self.event.sender.send('ftp-result', result)
      // }
    }
  } catch (e) {
    log.info('SendMessage >> ' + e.message)
  }
}

// 순차전송. 모든 FTPServer를 순차적으로 전송함
function FTPInfo_Type1 () {
  FTPInfo.apply(this, arguments) // 모든 파라미터를 부모로 넘김
  // arguments : _key, _event, _FTPServerConfig
}
FTPInfo_Type1.prototype = new FTPInfo() // 상속 (관련 함수, 변수 모두 사용 가능)
FTPInfo_Type1.prototype.RequestFTPWork = async function (_ftpType, _connectionIndex) {
  let self = this
  return new Promise((resolve, reject) => {
    let PromiseResult = []
    let ftpServerFinish = false
    let ftpServerCnt = this.clientSendData.ftpSite.ftpServerList.length
    let currentFtpServer = this.clientSendData.ftpSite.ftpServerList[_connectionIndex]
    let fileList = this.clientSendData.fileList

    _connectionIndex = _connectionIndex + 1
    if (_connectionIndex == ftpServerCnt) {
      ftpServerFinish = true
    }

    // eslint-disable-next-line no-unused-vars
    let result = self.doftp(_ftpType, PromiseResult, fileList, currentFtpServer)

    // 모든 upload 가 끝나면 실행됨
    Promise.all(PromiseResult).then(value => {
      self.isFinish = true
      let isSuccess = false
      if (value[0] != true) { // fail
        log.info(self.clientSendData.ftpSite.siteName + ' is fail!')
      } else { // success
        log.info(self.clientSendData.ftpSite.siteName + ' is Success!')
        isSuccess = true
      }

      // next job start
      if (ftpServerFinish == false) {
        this.RequestFTPWork(_ftpType, _connectionIndex)
      } else {
        let result = {
          isSuccess: isSuccess,
          deleteKey: self.clientSendData.ftpSite.siteName + self.clientSendData.clientData.transferid
        }
        resolve(result)
      }
    })
  })// end Promise
}

// 동시전송. 모든 FTPServer를 동시에 전송함
function FTPInfo_Type2 () {
  FTPInfo.apply(this, arguments) // 모든 파라미터를 부모로 넘김
  // arguments : _key, _event, _FTPServerConfig
}
FTPInfo_Type2.prototype = new FTPInfo() // 상속 (관련 함수, 변수 모두 사용 가능)
FTPInfo_Type2.prototype.RequestFTPWork = async function (_ftpType, _FTPSendData, _connectionIndex) {
  let self = this
  return new Promise((resolve, reject) => {
    let PromiseResult = []
    let fileList = this.clientSendData.fileList
    let currentFtpServer = this.clientSendData.ftpSite.ftpServerList[_connectionIndex]
    self.doftp(_ftpType, PromiseResult, fileList, currentFtpServer)

    // FTPInfo 가 끝나면 실행됨 (WorkObject 별 FTPInfo 가 모두 실행되면 출력)
    Promise.all(PromiseResult).then(value => {
      let result = true
      let curName = self.m_FTPSite.ftpServerList[_connectionIndex].name
      self.isFinish = true
      for (let i = 0; i < value.length; i++) {
        if (value[i] != true) { // 실패
          log.error(curName + ' is fail!')
          result = value[i]
        } else {
          log.info(curName + ' is Success!')
        }
      }
      if (result == true) {
        resolve({ name: curName, result: true })
        return true
      } else {
        reject(result)
        return false
      }
    })// end Promise.all
  })// end Promise
}

// 순차 전송이지만, A, B 서버 순으로 진행하고, A서버가 성공하면 B서버는 진행하지 않음.
// 만약, A서버가 실패하면 B서버도 시도함. B서버로 시도했을때 성공하면, 본 Site는 성공으로 간주
// 두 서버다 실패하면 실패
function FTPInfo_Type3 () {
  FTPInfo.apply(this, arguments) // 모든 파라미터를 부모로 넘김
  // arguments : _key, _event, _FTPServerConfig
}
FTPInfo_Type3.prototype = new FTPInfo() // 상속 (관련 함수, 변수 모두 사용 가능)
FTPInfo_Type3.prototype.RequestFTPWork = async function (_ftpType, _connectionIndex) {
  let self = this
  return new Promise((resolve, reject) => {
    let PromiseResult = []
    let ftpServerFinish = false
    let ftpServerCnt = this.clientSendData.ftpSite.ftpServerList.length
    let currentFtpServer = this.clientSendData.ftpSite.ftpServerList[_connectionIndex]
    let fileList = this.clientSendData.fileList

    _connectionIndex = _connectionIndex + 1
    if (_connectionIndex == ftpServerCnt) {
      ftpServerFinish = true
    }

    // eslint-disable-next-line no-unused-vars
    let result = self.doftp(_ftpType, PromiseResult, fileList, currentFtpServer)

    // 모든 upload 가 끝나면 실행됨
    Promise.all(PromiseResult).then(value => {
      self.isFinish = true
      let isSuccess = false
      if (value[0] != true) {
      // 실패했을 시, 다음 ftp가 있으면 연결 // 성공 시, 끝
        if (ftpServerFinish == true) {
          log.info(self.clientSendData.ftpSite.siteName + ' is fail!')
          return false
        }
        // Connection List 순차적으로 연결 및 업로드 시도
        this.RequestFTPWork(_ftpType, _connectionIndex)
      } else {
        isSuccess = true
        log.info(self.clientSendData.ftpSite.siteName + ' is Success!')
        let result = {
          isSuccess: isSuccess,
          deleteKey: self.clientSendData.ftpSite.siteName + self.clientSendData.clientData.transferid
        }
        resolve(result)
      }
    })
  })// end Promise
}

function FTPData (_type, _file, _desPath, _fileName) {
  // Size
  this.curFileSize = 0
  this.curMaxFileSize = _file.size || 0
  // eslint-disable-next-line no-unused-expressions
  this.segmentLength
  this.curWorkPersent = 0

  // totalSize
  this.totalWorkSize = 0
  this.totalWorkSize_Current = 0
  this.totalWorkSize_Percent = 0
  this.isTotalComplete = false

  // Time
  this.startTime
  this.curTime
  this.elapsed

  // bps
  this.bps
  this.kbps
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

exports.FTPInfo_Type1 = FTPInfo_Type1
exports.FTPInfo_Type2 = FTPInfo_Type2
exports.FTPInfo_Type3 = FTPInfo_Type3
exports.FTPInfo = FTPInfo
