// const exp = require('constants')
const electron = require('electron')
const dialog = electron.dialog
const fs = require('fs')
const FileData = require('./globalFunk.js').FileData
const _path = require('path')
const util = require('util')
const EventEmitter = require('events').EventEmitter

function FileInfo () {
  // Path
  this.m_resultPathArr = [] // 결과 fileData 객체의 Arr
  this.m_isSubDirFileRead = true // 하위 디렉토리 안까지 모든 파일 검색
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
FileInfo.prototype.PushFileData = function (_size, _path, _resultArr) {
  const curFileData = new FileData()
  curFileData.size = _size
  curFileData.path = _path
  curFileData.fileName = curFileData.getFileFullName(_path)
  _resultArr.push(curFileData)
}
FileInfo.prototype.GetAllFileInfo = function (_filePaths) {
  const rePathArr = []
  for (let i = 0; i < _filePaths.length; i++) {
    const curPath = _filePaths[i] // file Path or dir Path
    const stats = fs.statSync(curPath)

    if (stats.isDirectory()) {
      fs.readdirSync(curPath).forEach(file => { // 파일 리스트 확인
        const curRepath = curPath + '/' + file
        if (fs.lstatSync(_path.resolve(curPath, file)).isDirectory()) { // 파일 리스트중 디렉토리가 있는지 확인
          // 디렉토리
          rePathArr.push(curRepath)
          if (this.m_isSubDirFileRead) {
            this.GetAllFileInfo(rePathArr, this)
          }
        } else {
          // 파일. 위의 stats는 폴더의 정보이기 때문에 재 statSync 검색함
          this.PushFileData(fs.statSync(curRepath).size, curRepath, this.m_resultPathArr)
        }
      })
    } else {
      this.PushFileData(stats.size, curPath, this.m_resultPathArr)
    }
  }
}
FileInfo.prototype.CreateDir = function (_dirPath) {
  const isExists = fs.existsSync(_dirPath)
  try {
    if (!isExists) {
      fs.mkdirSync(_dirPath, { recursive: true })
    } else { return false }

    return true
  } catch (err) {
    console.log('mkdir > ' + err)
    return false
  }
}
FileInfo.prototype.DeleteFile = function (_filePath) {
  const isExist = fs.existsSync(_filePath)
  if (isExist) {
    fs.unlink(_filePath, (err) => {
      if (err) {
        console.log(err)
        console.log(_filePath)
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
  const curFileData = new FileData()
  const result = curFileInfo.OpenDialog(true, _win) // 복사할 파일이 위치할 폴더 경로
  if (result === undefined) {

  } else {
    for (let i = 0; i < _originPaths.length; i++) {
      const strDesFilePath = result[0] + '/' + curFileData.getOnlyFileName(_originPaths[i].path) + this.m_CopyText + curFileData.getOnlyFileExtention(_originPaths[i].path)
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
      console.log('ipcMain_file-copy Error : ' + _err)
      this.emit('copyError', _err, _srcPath, _desPath)
    } else {
      console.log('Success!')
      this.emit('copyFinish', _srcPath, _desPath)
    }
  })
}

exports.FileInfo = FileInfo
exports.FileCopyInfo = FileCopyInfo
