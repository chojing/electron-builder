// const exp = require('constants')
const electron = require('electron')
const dialog = electron.dialog
const fs = require('fs')
const FileData = require('./globalFunk.js').FileData
// eslint-disable-next-line no-unused-vars
const g_globalFunk = require('./globalFunk.js')
const util = require('util')
const EventEmitter = require('events').EventEmitter
const log = require('electron-log')
function FileInfo () {
  // Path
  this.m_resultPathArr = [] // 결과 fileData 객체의 Arr
  this.m_isSubDirFileRead = true // 하위 디렉토리 안까지 모든 파일 검색
  this.m_MaxFileReadCount = 100
  this.isMaxOver = false
  this.filters = ['.mov', '.mxf', '.mp4', '.txt'] // filter check 를 file 모드로 사용시에 본 filter는 사용되지 않음

  this.fileFunk = new FileData()
}
util.inherits(FileInfo, EventEmitter)

// Common
FileInfo.prototype.OpenDialog = function (_isDirDialog, _win) {
  let curProperties
  if (_isDirDialog) {
    curProperties = ['openDirectory', 'multiSelections']
  } else {
    curProperties = ['openFile', 'multiSelections']
  }
  const result = dialog.showOpenDialogSync(_win, { // win 이 있으면 모달, win을 생략하면 모달리스
    title: 'Open files or folders',
    properties: curProperties,
    filters: [
      { name: 'Images', extensions: ['jpg', 'png', 'gif'] },
      { name: 'Movies', extensions: ['mkv', 'avi', 'mp4'] },
      { name: 'All Files', extensions: ['*'] }
    ]
  })

  return result
}
FileInfo.prototype.GetDirPath = function (_win) {
  const DirPaths = this.OpenDialog(true, _win)
  if (DirPaths === undefined) {
    return undefined
  }
  return DirPaths
}

// Get Paths
FileInfo.prototype.GetFilePath = function (_win) {
  const result = this.OpenDialog(false, _win)
  return result
}
FileInfo.prototype.PushFileData = function (_size, _path, _resultArr, _name = undefined, _baseDir = undefined) {
  const curFileData = new FileData()
  let extention = curFileData.getOnlyFileExtention(_path)
  // if (this.filters.includes(extention)) { // hard coding
  if (g_globalFunk.g_filter.includes(extention)) { // text file
    curFileData.size = _size
    curFileData.path = _path
    if (_name !== undefined) {
      curFileData.fileName = _name
    } else {
      if (_baseDir !== undefined) {
        curFileData.fileName = _baseDir + curFileData.getFileFullName(_path)
      } else {
        curFileData.fileName = curFileData.getFileFullName(_path)
      }
    }
    curFileData.fileName = checkFolderPath(curFileData.fileName)
    curFileData.path.normalize('nfc')
    curFileData.fileName.normalize('nfc')
    if (!(_resultArr.find(element => element.fileName === curFileData.fileName))) {
      if (_resultArr.length < this.m_MaxFileReadCount + 1) {
        _resultArr.push(curFileData)
      }
    }
  }
}
function checkFolderPath (preFolders) {
  let flag = true
  while (flag == true) {
    if (preFolders.indexOf('//') != -1) {
      preFolders = preFolders.replace('//', '/')
    } else {
      flag = false
    }
  }
  return preFolders
}
FileInfo.prototype.GetAllFileInfo = function (_filePaths, baseDir = '') {
  const rePathArr = []
  for (let i = 0; i < _filePaths.length; i++) {
    if (this.m_resultPathArr.length > this.m_MaxFileReadCount) {
      this.isMaxOver = true
      break
    }
    let curPath = _filePaths[i] // file Path or dir Path
    if (typeof curPath === 'object') {
      this.PushFileData(curPath.size, curPath.path, this.m_resultPathArr, curPath.fileName)
    } else {
      const stats = fs.statSync(curPath)

      if (stats.isDirectory()) {
        baseDir += this.fileFunk.getFilePathInfo(curPath, 'name') + '/'
        fs.readdirSync(curPath).forEach(file => { // 파일 리스트 확인
          const curRepath = curPath + '/' + file
          if (fs.lstatSync(curRepath).isDirectory()) { // 파일 리스트중 디렉토리가 있는지 확인
          // 디렉토리
            rePathArr.push(curRepath)
            if (this.m_isSubDirFileRead) {
              this.GetAllFileInfo(rePathArr, baseDir)
            }
          } else {
          // 파일. 위의 stats는 폴더의 정보이기 때문에 재 statSync 검색함
            this.PushFileData(fs.statSync(curRepath).size, curRepath, this.m_resultPathArr, undefined, baseDir)
          }
        })
      } else {
        this.PushFileData(stats.size, curPath, this.m_resultPathArr)
      }
    }
  }
  return { isMaxCapa: true }
}
FileInfo.prototype.CreateDir = function (_dirPath) {
  const isExists = fs.existsSync(_dirPath)
  try {
    if (!isExists) {
      fs.mkdirSync(_dirPath, { recursive: true })
    } else { return false }

    return true
  } catch (err) {
    log.info('CreateDir > ', err.message)
    return false
  }
}
FileInfo.prototype.DeleteFile = function (_filePath) {
  const isExist = fs.existsSync(_filePath)
  if (isExist) {
    fs.unlink(_filePath, (err) => {
      if (err) {
        log.error('DeleteFile ', _filePath)
        return false
      } else {
        console.log(`${_filePath} 를 정상적으로 삭제했습니다`)
        return true
      }
    })
  } else {
    console.log('파일이 없습니다.')
    return false
  }
}

// Copy
function FileCopyInfo () {
  // Copy
  this.m_CopyText = '_copy'
  this.m_isOverwrite = false
}
util.inherits(FileCopyInfo, EventEmitter)

FileCopyInfo.prototype.FileCopy = function (_win, _originPaths) {
  const curFileInfo = new FileInfo()
  const result = curFileInfo.OpenDialog(true, _win) // 복사할 파일이 위치할 폴더 경로
  if (result === undefined) {

  } else {
    for (let i = 0; i < _originPaths.length; i++) {
      const strDesFilePath = result[0] + '/' + this.fileFunk.getOnlyFileName(_originPaths[i].path) + this.m_CopyText + this.fileFunk.getOnlyFileExtention(_originPaths[i].path)
      if (fs.existsSync(strDesFilePath)) { // 선택한 폴더에 같은 이름의 복사할 파일이 있는 경우
        if (!this.m_isOverwrite) {
          this.emit('copyDuplicate', _originPaths[i].path, strDesFilePath)
          continue
        }
      }
      this.DoFileCopy(_originPaths[i].path, strDesFilePath)
    }
  }
}
FileCopyInfo.prototype.DoFileCopy = function (_srcPath, _desPath) {
  fs.copyFile(_srcPath, _desPath, (_err) => {
    if (_err) {
      log.error('DoFileCopy ', _err)
      this.emit('copyError', _err, _srcPath, _desPath)
    } else {
      this.emit('copyFinish', _srcPath, _desPath)
    }
  })
}

exports.FileInfo = FileInfo
exports.FileCopyInfo = FileCopyInfo
