function WindowInfo (_key, _url, _data, _width = 700, _height = 1000) {
  this.key = _key
  this.url = _url // connect url //ex) ./index.html
  this.width = _width
  this.height = _height
  this.data = _data

  this.isUseDevTool = true
  this.parent = '' // window key. 지정하지 않으면 main window
  this.modal = false // modal 여부 true / false
}

WindowInfo.prototype.SetStatusWindow = function (_key, _targetUrl) {
  this.key = _key
  this.url = _targetUrl
  this.width = 500
  this.height = 700

  this.modal = false
}

exports.WindowInfo = WindowInfo
