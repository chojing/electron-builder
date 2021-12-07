// const electron = require('electron')
// const app = electron.app
// const { Notification } = require('electron')
const _path = require('path')
const fs = require('fs')
// eslint-disable-next-line no-unused-vars
let g_filter = []

function FileData () {
  this.path = ''
  this.size = 0
  this.fileName = ''
  this.key = ''
}

FileData.prototype.getFileFullName = function (_FilePath) {
  return this.getFilePathInfo(_FilePath, 'name')
}
FileData.prototype.getOnlyFileName = function (_FilePath) {
  let result = this.getFileFullName(_FilePath, 'name')
  result = this.getExtensionORFilename(result, 'name')
  return result
}
FileData.prototype.getOnlyFileExtention = function (_FilePath) {
  let result = this.getFileFullName(_FilePath, 'name')
  result = this.getExtensionORFilename(result, 'extention')
  return result
}
FileData.prototype.getOnlyFilePath = function (_FilePath) {
  return this.getFilePathInfo(_FilePath, 'path')
}

// searchType : extention / name
FileData.prototype.getExtensionORFilename = function (_filename, _searchType) {
  const fileLen = _filename.length
  const lastDot = _filename.lastIndexOf('.')
  let result
  _searchType = _searchType.toLowerCase()
  if (_searchType === 'extention') {
    result = _filename.substring(lastDot, fileLen).toLowerCase()
  } else if (_searchType === 'name') {
    result = _filename.substring(0, lastDot)
  }
  return result
}

// searchType : path / name
FileData.prototype.getFilePathInfo = function (_FilePath, _searchType) {
  let resultStr
  _searchType = _searchType.toLowerCase()
  if (_FilePath) {
    let filePath = _FilePath.replace(/\\/g, '/')
    var pointIndex = filePath.lastIndexOf('/')
    if (_searchType === 'path') {
      resultStr = filePath.substring(0, pointIndex)
      return resultStr
    } else if (_searchType === 'name') {
      resultStr = filePath.substring(pointIndex)
      if (resultStr.indexOf('/') === 0) {
        let len = resultStr.substring(-1)
        console.log(len)
        // resultStr = resultStr.substring
      }
    }
  }
  return resultStr
}

function NotificationPopUp () {
  // eslint-disable-next-line no-undef
  this.iconPath = _path.resolve(__static, 'img/icons/mac/16x16.png')
  this.subTitle = 'subTitle'
}

NotificationPopUp.prototype.show = function (_title, _body) {
//   if (process.platform === 'win32') {
//     app.setAppUserModelId('sbspds-anywhere')
//   }

//   new Notification({
//     title: _title,
//     body: _body,
//     icon: this.iconPath,
//     subtitle: this.subTitle
//   }).show()
}

function getNowyyyymmddhhiiss () {
  const date = new Date()
  const year = date.getFullYear()
  // eslint-disable-next-line no-new-wrappers
  let month = new String(date.getMonth() + 1)
  // eslint-disable-next-line no-new-wrappers
  let day = new String(date.getDate())
  let hour = date.getHours()
  let minute = date.getMinutes()
  let second = date.getSeconds()

  // 한자리수일 경우 0을 채워준다.
  function AttachZero (value) {
    if (value.length === 1) {
      value = '0' + value
    }
    return value
  }
  month = AttachZero(month)
  day = AttachZero(day)
  hour = AttachZero(hour)
  minute = AttachZero(minute)
  second = AttachZero(second)

  return year + month + day + hour + minute + second
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

function checkAvailableFile (path, cb) {
  try {
    const stats = fs.statSync(path)
    if (stats.isDirectory()) {
      // console.log(stats)
    } else {
      // console.log(stats)
    }
  } catch (e) {
    cb(e)
  }
}

exports.NotificationPopUp = NotificationPopUp
exports.FileData = FileData
exports.getNowyyyymmddhhiiss = getNowyyyymmddhhiiss
exports.checkFolderPath = checkFolderPath
exports.checkAvailableFile = checkAvailableFile
