const _log = require('electron-log')
const _path = require('path')
const KONAN_LOG_ROOT_FOLDER = '//.konan'
_log.transports.file.resolvePath = () => _path.join(getUserHome() + KONAN_LOG_ROOT_FOLDER, 'logs/main.log')

function getUserHome () {
  return process.env[process.platform == 'win32' ? 'USERPROFILE' : 'HOME']
}

function Log () {
}
Log.prototype.info = function (str) {
  _log.info(str)
}

exports.Log = Log
