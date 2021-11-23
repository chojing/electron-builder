/* eslint-disable no-undef */
/* eslint-disable no-unused-vars */
/* eslint-disable no-new-wrappers */
const log = require('electron-log')
const fs = require('fs')
let curlibraryDefaultDir = ''

log.transports.file.archiveLog = (oldPath) => {
  let file = oldPath.toString()
  try {
    fs.renameSync(file, curlibraryDefaultDir + '/main_' + func_get_now_yyyymmddhhiiss() + '.log')
  } catch (e) {
    log.warn('Could not rotate log', e)
  }
}
log.transports.file.resolvePath = (variables) => getLogPath(variables)
// log.transports.file.maxSize = 10240 // test
log.transports.file.maxSize = 10485760 // bytes 단위 10485760 bytes = 10 MB

function getLogPath (variables) {
  curlibraryDefaultDir = variables.libraryDefaultDir
  let resultName = variables.libraryDefaultDir + '/main.log'

  return resultName
}
function func_get_now_yyyymmddhhiiss () {
  var date = new Date()
  var year = date.getFullYear()
  var month = new String(date.getMonth() + 1)
  var day = new String(date.getDate())
  var hour = date.getHours()
  var minute = date.getMinutes()
  var second = date.getSeconds()
  // 한자리수일 경우 0을 채워준다.
  if (month.length == 1) {
    month = '0' + month
  }
  if (day.length == 1) {
    day = '0' + day
  }
  if (hour.length == 1) {
    hour = '0' + hour
  }
  if (minute.length == 1) {
    minute = '0' + minute
  }
  if (second.length == 1) {
    second = '0' + second
  }
  return year + month + day + '_' + hour + minute + second
}
