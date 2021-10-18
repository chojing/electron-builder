// const Client = require('ftp')
// const { shell } = require('electron')
// const fs = require('fs')
const FileData = require('./globalFunk.js').FileData
const NotificationPopUp = require('./globalFunk.js').NotificationPopUp
const FileInfo = require('./fileinfo.js').FileInfo
// const util = require('util')
// const EventEmitter = require('events').EventEmitter
const FTPStream = require('./ftpStream').FTPStream
const gfileData = new FileData()

// const g_FTPWorkQueue = []
//
// function FTPConnectTypeInfo () {
//   this.ftpSiteList = []
//   this.connectionType = ''
// }

function FTPInfo (_key, _event, _FTPServerConfigList, _popUpWnd) {
  this.key = _key || '' // key는 보통 접속한 유저로 할 계획. 사용처는 클라이언트측에서 취소 요청시, 어떤 파일인지 찾기 위함
  this.event = _event || '' // 접속한 유저가 요청한 event를 등록해놓음. 나중에 result 할 때 필요함
  this.m_DES_FOLDER_PATH = ''
  this.m_FTPServerConfigList = _FTPServerConfigList || ''
  this.m_NofiPopup = new NotificationPopUp()
  // eslint-disable-next-line no-unused-expressions
  this.ftpStream // FTPStream

  this.m_popUpWnd = _popUpWnd || ''
}

FTPInfo.prototype.RequestFTPWork = async function (_ftpType, _FTPSendData, _connectionIndex) {
  const self = this
  const PromiseResult = []
  // 여기서 ftp 큐를 걸자
  // await 빠져 나오면 그다음 큐
  // 여기서 말하는 큐는 FTP 하나 전송 데이터(_FTPSendData).. FTPType이 있을수도 있으니까

  await self.doftp(_ftpType, PromiseResult, _FTPSendData.fileList, _connectionIndex)
  // console.log("Finish!!!!!!!!!!!!!");
}

FTPInfo.prototype.doftp = function (_ftpType, PromiseResult, _selectFiles, _connectionIndex) {
  const self = this
  const ConnectionList = self.m_FTPServerConfigList
  const curFtpStream = self.ftpStream = new FTPStream()
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

  for (let j = 0; j < _selectFiles.length; j++) {
    const curFile = _selectFiles[j]
    const curPath = curFile.path
    const curFileName = gfileData.getFileFullName(curPath)
    const ftpData = new FTPData(_ftpType, curFile, self.m_DES_FOLDER_PATH, curFileName)

    // 전체 취소를 위한 전체 작업 담기
    self.ftpStream.m_WholeWorkFTPDataList[curPath] = ftpData
  }

  let result = self.ftpStream.work(_selectFiles, ConnectionList[_connectionIndex], 0).catch(
    function (error) {
      console.log(`FTPInfoType2_${_ftpType} Error!!!` + error)
      // self.SendMessage(null, "error", error);
      result = error
    }
  )// end catch
  PromiseResult.push(result) // 작업 하나(FTPSendData)가 끝났다는것을 알림
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
  self.m_popUpWnd.webContents.send('ftp-result', _ftpData)
}

function FTPInfoType1 () {
  FTPInfo.apply(this, arguments) // 모든 파라미터를 부모로 넘김
  // arguments : _key, _event, _FTPServerConfig
}
FTPInfoType1.prototype = new FTPInfo() // 상속 (관련 함수, 변수 모두 사용 가능)
FTPInfoType1.prototype.RequestFTPWork = async function (_ftpType, _FTPSendData, _connectionIndex) {
  const self = this

  // 여기서 ftp 큐를 걸자
  // await 빠져 나오면 그다음 큐
  // 여기서 말하는 큐는 FTP 하나 전송 데이터(_FTPSendData).. FTPType이 있을수도 있으니까

  const PromiseResult = []
  await self.doftp(_ftpType, PromiseResult, _FTPSendData.fileList, _connectionIndex)

  // 모든 upload 가 끝나면 실행됨
  Promise.all(PromiseResult).then(value => {
    if (!value[0]) {
      _connectionIndex = _connectionIndex + 1
      if (_connectionIndex === self.m_FTPServerConfigList.length) {
        return false
      }
      // Connection List 순차적으로 연결 및 업로드 시도
      // eslint-disable-next-line no-undef
      this.RequestFTPWork(_ftpType, _selectFiles, _connectionIndex)
    } else {
      console.log(self.m_FTPServerConfigList[_connectionIndex].host + ' is Success!')
      return true
    }
  })
}

function FTPInfoType2 () {
  FTPInfo.apply(this, arguments) // 모든 파라미터를 부모로 넘김
  // arguments : _key, _event, _FTPServerConfig
}
FTPInfoType2.prototype = new FTPInfo() // 상속 (관련 함수, 변수 모두 사용 가능)
FTPInfoType2.prototype.RequestFTPWork = async function (_ftpType, _FTPSendData, _connectionIndex) {
  const self = this
  return new Promise((resolve, reject) => {
    const PromiseResult = []

    // eslint-disable-next-line no-undef
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

exports.FTPInfoType1 = FTPInfoType1
exports.FTPInfoType2 = FTPInfoType2
exports.FTPInfo = FTPInfo
