const FileData = require('./globalFunk.js').FileData
const NotificationPopUp = require('./globalFunk.js').NotificationPopUp
const FileInfo = require('./fileinfo.js').FileInfo
const FTPStream = require('./ftpStream').FTPStream
const gfileData = new FileData()

// const g_FTPWorkQueue = []
//
// function FTPConnectTypeInfo () {
//   this.ftpSiteList = []
//   this.connectionType = ''
// }

function FTPInfo (_event, _FTPSite, _popUpWnd) {
  this.event = _event || '' // 접속한 유저가 요청한 event를 등록해놓음. 나중에 result 할 때 필요함
  this.m_FTPSite = _FTPSite || ''
  this.m_NofiPopup = new NotificationPopUp()
  this.ftpStreamList = {} // FTPStream
  this.clientSendData
  this.isFinish = false

  this.m_popUpWnd = _popUpWnd || ''
}

FTPInfo.prototype.RequestFTPWork = async function (_ftpType, _FTPSendData, _connectionIndex) {
  const self = this
  const PromiseResult = []
  // 여기서 ftp 큐를 걸자
  // await 빠져 나오면 그다음 큐
  // 여기서 말하는 큐는 FTP 하나 전송 데이터(_FTPSendData).. FTPType이 있을수도 있으니까

  // eslint-disable-next-line no-unused-vars
  const result = await self.doftp(_ftpType, PromiseResult, _FTPSendData.fileList, _connectionIndex)
  self.isFinish = true
  // console.log("Finish!!!!!!!!!!!!!");
}

FTPInfo.prototype.doftp = function (_ftpType, PromiseResult, _fileList, _currentFtpServer) {
  const self = this
  const ftpServer = _currentFtpServer
  const ftpStreamKey = _currentFtpServer.name
  const desFolderPath = _currentFtpServer.rootpath
  const curFtpStream = new FTPStream()
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

  for (let j = 0; j < _fileList.length; j++) {
    const curFile = _fileList[j]
    const curPath = curFile.path
    const curFileName = gfileData.getFileFullName(curPath)
    const ftpData = new FTPData(_ftpType, curFile, desFolderPath, curFileName)

    // 전체 취소를 위한 전체 작업 담기
    self.ftpStreamList[ftpStreamKey].m_WholeWorkFTPDataList[curPath] = ftpData
  }

  const result = self.ftpStreamList[ftpStreamKey].work(_fileList, ftpServer, 0).catch(
    function (error) {
      console.log(`FTPInfo_${_ftpType} Error!!!` + error)
      return error
    }
  )// end catch
  PromiseResult.push(result) // 작업 하나(FTPSendData)가 끝났다는것을 알림
}

FTPInfo.prototype.SendMessage = function (_ftpData, _curFtpServer, _type, _errMsg) {
  const self = this
  if (_type == 'error') {
    console.log(_errMsg)
    console.log(_errMsg.message + '// AssetKey : ' + _ftpData.key) // 에러처리
    self.event.sender.send('ftp-error', _ftpData)
    self.m_NofiPopup.show('sbspds-anywhere_Error', 'Error! \n' + _errMsg.message)
    return
  } else if (_type == 'finish') {
    if (_ftpData.isComplete == true) {
      self.m_NofiPopup.show('sbspds-anywhere_' + _ftpData.FTPtype, 'Success!\n' + _ftpData.srcPath)
    } else {
      self.m_NofiPopup.show('sbspds-anywhere_' + _ftpData.FTPtype, 'Fail!\n' + _ftpData.srcPath)
    }
  } else if (_type == 'cancel') {
    self.m_NofiPopup.show('sbspds-anywhere' + _ftpData.FTPtype, 'Cancel!\n' + _ftpData.srcPath)
    if (_ftpData.cancelInfo === undefined) {
      return
    }
    if (_ftpData.FTPtype == 'upload') {
      if (_ftpData.cancelInfo.isDelete == true) {
        const ftpStraem = new FTPStream()
        // 현재 파일 삭제
        const deletePath = _ftpData.destPath + _ftpData.fileName
        ftpStraem.FTPDeleteFile(deletePath, _ftpData.cancelInfo.ftpConfig)

        // 완료된 파일 삭제
        if (_ftpData.cancelInfo.CompletePaths.length > 0) {
          for (let i = _ftpData.cancelInfo.CompletePaths.length - 1; i >= 0; i--) {
            ftpStraem.FTPDeleteFile(_ftpData.cancelInfo.CompletePaths[i], _ftpData.cancelInfo.ftpConfig)
            console.log('delete!!')
          }
        }
      }
    } else if (_ftpData.FTPtype == 'download') {
      if (_ftpData.cancelInfo.isDelete == true) {
        // 현재 파일 삭제
        const delFileName = _ftpData.cancelInfo.DelPath.fileName
        console.log(delFileName)
        const fileInfo = new FileInfo()
        const deleteFilePath = _ftpData.destPath + delFileName
        fileInfo.DeleteFile(deleteFilePath)

        // 완료된 파일 삭제
        if (_ftpData.cancelInfo.CompletePaths.length > 0) {
          for (let i = _ftpData.cancelInfo.CompletePaths.length - 1; i >= 0; i--) {
            fileInfo.DeleteFile(_ftpData.cancelInfo.CompletePaths[i])
            console.log('delete!!')
          }
        }
      }
    }
  }
  const result = {
    ftpServer: _curFtpServer,
    ftpData: _ftpData
  }
  if (self.m_popUpWnd === undefined || self.m_popUpWnd === '') {
    self.event.sender.send('ftp-result', result)
  } else {
    if (self.m_popUpWnd.isShow == true) {
      self.m_popUpWnd.webContents.send('ftp-result', result)
    }
  }
}

function FTPInfo_Type1 () {
  FTPInfo.apply(this, arguments) // 모든 파라미터를 부모로 넘김
  // arguments : _key, _event, _FTPServerConfig
}
FTPInfo_Type1.prototype = new FTPInfo() // 상속 (관련 함수, 변수 모두 사용 가능)
FTPInfo_Type1.prototype.RequestFTPWork = async function (_ftpType, _connectionIndex) {
  const self = this

  // 여기서 ftp 큐를 걸자
  // await 빠져 나오면 그다음 큐
  // 여기서 말하는 큐는 FTP 하나 전송 데이터(_FTPSendData).. FTPType이 있을수도 있으니까
  const PromiseResult = []
  let ftpServerFinish = false
  const ftpServerCnt = this.clientSendData.ftpSite.ftpServerList.length
  const currentFtpServer = this.clientSendData.ftpSite.ftpServerList[_connectionIndex]
  const fileList = this.clientSendData.fileList

  _connectionIndex = _connectionIndex + 1
  if (_connectionIndex == ftpServerCnt) {
    ftpServerFinish = true
  }

  // eslint-disable-next-line no-unused-vars
  const result = await self.doftp(_ftpType, PromiseResult, fileList, currentFtpServer)

  // 모든 upload 가 끝나면 실행됨
  Promise.all(PromiseResult).then(value => {
    self.isFinish = true
    if (value[0] != true) {
      if (ftpServerFinish == true) {
        return false
      }
      // Connection List 순차적으로 연결 및 업로드 시도
      this.RequestFTPWork(_ftpType, _connectionIndex)
    } else {
      console.log(currentFtpServer.host + ' is Success!')
      return true
    }
  })
}

function FTPInfo_Type2 () {
  FTPInfo.apply(this, arguments) // 모든 파라미터를 부모로 넘김
  // arguments : _key, _event, _FTPServerConfig
}
FTPInfo_Type2.prototype = new FTPInfo() // 상속 (관련 함수, 변수 모두 사용 가능)
FTPInfo_Type2.prototype.RequestFTPWork = async function (_ftpType, _FTPSendData, _connectionIndex) {
  const self = this
  return new Promise((resolve, reject) => {
    const PromiseResult = []
    const fileList = this.clientSendData.fileList
    const currentFtpServer = this.clientSendData.ftpSite.ftpServerList[_connectionIndex]
    self.doftp(_ftpType, PromiseResult, fileList, currentFtpServer)

    // FTPInfo 가 끝나면 실행됨 (WorkObject 별 FTPInfo 가 모두 실행되면 출력)
    Promise.all(PromiseResult).then(value => {
      let result = true
      const curName = self.m_FTPSite.ftpServerList[_connectionIndex].name
      self.isFinish = true
      for (let i = 0; i < value.length; i++) {
        if (value[i] != true) { // 실패
          console.log(curName + ' is fail!')
          result = value[i]
        } else {
          console.log(curName + ' is Success!')
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

function FTPData (_type, _file, _desPath, _fileName) {
  // Size
  this.curFileSize = 0
  this.curMaxFileSize = _file.size || 0
  // eslint-disable-next-line no-unused-expressions
  this.segmentLength
  this.curWorkPersent = 0

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
exports.FTPInfo = FTPInfo
