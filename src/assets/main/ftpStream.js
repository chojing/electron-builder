// const Buffer = require('buffer')
// const Client = require('ftp')
const Client = require('../../../libs/custom_ftp')
const { shell } = require('electron')
const fs = require('fs')
const util = require('util')
const EventEmitter = require('events').EventEmitter

function FTPStream () {
  this.m_ftpClient
  this.m_ftpConnectConfig = undefined
  this.key
  this.m_CurWorkFTPData
  this.m_WholeWorkFTPDataList = {}
  this.m_CompleteFTPDataPath = []

  this.totalWorkSize = 0
  this.totalWorkSize_Current = 0
  this.totalWorkSize_Percent = 0

  this.worklist = []
  this.isConnection = false
}
util.inherits(FTPStream, EventEmitter)

FTPStream.prototype.connect = function (_ftpConnectConfig) {
  let self = this
  let config = {}
  if (self.m_ftpConnectConfig === undefined) {
    config = {
      host: _ftpConnectConfig.host,
      port: _ftpConnectConfig.port,
      user: _ftpConnectConfig.username,
      password: _ftpConnectConfig.password
    }
  } else {
    config = self.m_ftpConnectConfig
  }
  return new Promise((resolve, reject) => {
    self.m_ftpClient = new Client()
    self.m_ftpClient.on('ready', () => {
      console.log('ftp ready')
      self.isConnection = true
      self.m_ftpConnectConfig = config
      resolve('true')
    })
    this.m_ftpClient.on('close', () => {
      self.isConnection = false
      console.log('ftp close')
      // reject("close");
    })
    this.m_ftpClient.on('end', () => {
      self.isConnection = false
      console.log('ftp end')
      // reject("end");
    })
    this.m_ftpClient.on('error', (err) => {
      self.isConnection = false
      console.log('ftp err', err)
      reject(err)
    })

    this.m_ftpClient.connect(config)
  })
}

// 한번 요청한 fileList 를 처리함. work가 끝나면 FTPSendData 1개가 끝난것.
FTPStream.prototype.work = async function (_srcPaths, _ftpConnectConfig, index) {
  let self = this
  let err
  let isConnection = true
  self.worklist = _srcPaths
  await self.connect(_ftpConnectConfig).catch((_err) => {
    console.log(_err)
    err = _err
    isConnection = false
  })
  return new Promise((resolve, reject) => {
    if (isConnection == false) {
      reject(err)
      return 'Connection Fail'
    }
    function callPromiseResult (_promiseResultType, object) {
      if (_promiseResultType == 'resolve') {
        resolve(object)
      } else if (_promiseResultType == 'reject') {
        reject(object)
      }
    }
    let curFile = _srcPaths[index]
    if (curFile === undefined) { // file exist 확인(upload 의 경우)
      reject(curFile.path + ' is undefined')
    }
    // find ftpData, registry curWorkData
    let ftpData = self.m_WholeWorkFTPDataList[curFile.path]
    ftpData.workIndex = index
    self.m_CurWorkFTPData = ftpData

    if (ftpData.FTPtype == 'upload') {
      // file exist check
      if (!(fs.existsSync(curFile.path))) {
        reject('Not Exist File')
        return 'Not Exist File'
      }
      self.upload(ftpData, callPromiseResult)
    } else if (ftpData.FTPtype == 'download') {
      self.download(ftpData, callPromiseResult)
    }
  })
}
FTPStream.prototype.upload = async function (ftpData, callPromiseResult) {
  let self = this
  let curPath = ftpData.srcPath
  let curDescPath = ftpData.destPath + ftpData.fileName

  if (self.isConnection == false) {
    let err = new Error()
    err.message = 'Connection Fail'
    self.doError(undefined, ftpData, err, callPromiseResult)
    callPromiseResult('reject', 'Connection Fail')
  } else {
    // create readStream
    // eslint-disable-next-line prefer-const
    let curFileStream = fs.createReadStream(curPath, { emitClose: true })
    if (curFileStream === undefined) {
      // error
      let err = new Error()
      err.message = `${ftpData.destPath} ${ftpData.fileName} : No such file or directory.`
      self.doError(curFileStream, ftpData, err, callPromiseResult)
      callPromiseResult('reject', 'uploadFile undefined')
    }

    self.m_ftpClient.cwd(ftpData.destPath, (err, path) => {
      if (path === undefined) { // 폴더 없음
        self.m_ftpClient.mkdir(ftpData.destPath, true, function (err) {
          if (err) {
            let error = new Error()
            error.message = err
            self.doError(curFileStream, ftpData, error, callPromiseResult)
            return false
          } else {
            console.log('FTP 폴더 생성')
            self.ftpUploadPut(curFileStream, curDescPath, callPromiseResult, ftpData)
          }
        })
      } else { // 폴더 있음
        self.ftpUploadPut(curFileStream, curDescPath, callPromiseResult, ftpData)
      }
    })
  }
}
FTPStream.prototype.ftpUploadPut = function (curFileStream, curDescPath, callPromiseResult, ftpData) {
  let self = this
  // eslint-disable-next-line prefer-const
  self.m_ftpClient.put(curFileStream, curDescPath, false, function (err) {
    if (err) { // error
      callPromiseResult('reject', err)
      self.doError(curFileStream, ftpData, err, callPromiseResult)
    } else { // 완료 후 //finish
      if (ftpData.isCancel == false) { // cancel 되고 finish로 넘어왔을 때, 중복 호출을 막기 위함
        self.m_CompleteFTPDataPath.push(curDescPath) // ftp Path
        self.doCheckRecursive_work(ftpData, curFileStream, callPromiseResult)
      }
    }
  })

  curFileStream.on('data', function (buffer) {
    if (ftpData.isCancel == true) {
      self.m_ftpClient.end()
      self.doCheckRecursive_work(ftpData, curFileStream, callPromiseResult)
    } else {
      if (ftpData.isFirst == true) {
        self.doFirst(ftpData, ftpData.workIndex)
      }
      // console.log(self.m_ftpConnectConfig.host);
      ftpData = self.calculateFTPData(buffer, ftpData)
      self.emit('data', ftpData)
    }
  })
}
FTPStream.prototype.download = function (ftpData, callPromiseResult) {
  let self = this
  if (self.isConnection == false) {
    let err = new Error()
    err.message = 'Connection Fail'
    self.doError(undefined, ftpData, err, callPromiseResult)
    callPromiseResult('reject', 'Connection Fail')
  } else {
    // create writestream
    let curDescPath = ftpData.destPath + ftpData.fileName
    let curFileStream = fs.createWriteStream(curDescPath, { emitClose: true })
    let curPath = ftpData.srcPath

    // FTP work
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
            if (ftpData.isCancel == true) {
              stream.destroy(true)
              self.m_ftpClient.end()
              self.doCheckRecursive_work(ftpData, curFileStream, callPromiseResult)
            } else {
              if (ftpData.isFirst == true) {
                self.doFirst(ftpData, ftpData.workIndex) // param : ftpData, key (임시 : index)
              }
              ftpData = self.calculateFTPData(buff, ftpData)
              self.emit('data', ftpData)
            }
          })
            .once('close', function () {
              if (ftpData.isCancel == false) {
                self.m_CompleteFTPDataPath.push(curDescPath)
                self.doCheckRecursive_work(ftpData, curFileStream, callPromiseResult)
              }
            })
            .pipe(curFileStream, function (err) {
              if (err) {
                console.log(err)
                callPromiseResult('reject', err)
                self.doError(stream, ftpData, err, callPromiseResult) // #cjy 2021.07.16 테스트 필요
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
  let self = this
  // WriteStream release
  self.doReleaseStream(_curFileStream)
  // send Event
  self.doSendEvent(_ftpData, isError)

  if (isError == true) {
    return
  }

  let nextIndex = _ftpData.workIndex + 1
  // final job check or all cancel check
  if (nextIndex >= self.worklist.length) {
    // finish
    callPromiseResult('resolve', true)
    return
  }
  if (_ftpData.cancelInfo !== undefined) {
    if (_ftpData.cancelInfo.cancelType == 'all') {
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
  let self = this
  let value = self.m_CurWorkFTPData
  if (value === undefined) {
    console.log('ftpStream.js > Cancel > 해당 경로가 없습니다!')
    return false
  }
  value.isCancel = true
  value.cancelInfo = _cancelInfo
  return true
}
FTPStream.prototype.calculateFTPData = function (_buffer, _ftpData) {
  let self = this
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
  }

  // total Work 계산
  self.calculateTotalWorkData(_ftpData)
  _ftpData.totalWorkSize = self.totalWorkSize
  _ftpData.totalWorkSize_Current = self.totalWorkSize_Current
  _ftpData.totalWorkSize_Percent = self.totalWorkSize_Percent

  return _ftpData
}
FTPStream.prototype.calculateTotalWorkData = function (_ftpData) {
  let self = this
  self.totalWorkSize_Current += _ftpData.segmentLength
  self.totalWorkSize_Percent = (self.totalWorkSize_Current / self.totalWorkSize * 100).toFixed(2) // 현재 업로드 % 계산
}
FTPStream.prototype.doError = function (_stream, _ftpData, _errMsg, callResolve) {
  let self = this
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
  let self = this
  if (_ftpData.isCancel == true) {
    self.doSendCancelEvent(_ftpData)
  } else {
    if (isError == false) {
      self.m_ftpClient.end()
      self.doSendFinishEvent(_ftpData)
    }
  }
}
FTPStream.prototype.doSendFinishEvent = function (_ftpData, isError) {
  let self = this
  if (isError == true) {
    return
  }
  _ftpData.isComplete = true
  self.emit('finish', _ftpData)
}
FTPStream.prototype.doSendCancelEvent = function (_ftpData) {
  let self = this
  _ftpData.cancelInfo.ftpConfig = self.m_ftpConnectConfig
  _ftpData.cancelInfo.DelPath = self.m_CurWorkFTPData
  _ftpData.cancelInfo.CompletePaths = self.m_CompleteFTPDataPath
  _ftpData.cancelInfo.worklist = self.worklist
  self.emit('cancel', _ftpData)
}
FTPStream.prototype.doSendErrorEvent = function (_ftpData, _errMsg) {
  let self = this
  self.emit('error', _ftpData, _errMsg)
}
FTPStream.prototype.FTPDeleteFile = async function (_path, _ftpConfig) {
  let self = this
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
  let self = this
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
exports.FTPStream = FTPStream
