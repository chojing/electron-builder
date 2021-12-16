function proxy2map (proxy) {
  return JSON.parse(JSON.stringify(proxy))
}
function proxy2string (proxy) {
  return JSON.stringify(proxy)
}

let code = {
  convert: function (codelist, from, to, data) {
    for (var i in codelist) {
      var asset = codelist[i]
      if (asset[from] == data) {
        return asset[to]
      }
    }
  },
  valueToCode: function (codelist, value) {
    return this.convert(codelist, 'dbvalue', 'codevalue', value)
  },
  valueToCaption: function (codelist, value) {
    return this.convert(codelist, 'dbvalue', 'caption', value)
  },
  codeToValue: function (codelist, code) {
    return this.convert(codelist, 'codevalue', 'dbvalue', code)
  },
  codeToCaption: function (codelist, code) {
    return this.convert(codelist, 'codevalue', 'caption', code)
  },
  captionToValue: function (codelist, caption) {
    return this.convert(codelist, 'caption', 'dbvalue', caption)
  },
  captionToCode: function (codelist, caption) {
    return this.convert(codelist, 'caption', 'codevalue', caption)
  }
}

function pageSetting (total, limit, page) {
  const totalPage = Math.ceil(total / limit)
  var offset = 5
  var currentPage = page
  var startIndex = (Math.ceil(currentPage / offset) - 1) * offset + 1
  var endIndex = startIndex + offset > totalPage ? totalPage : startIndex + offset - 1
  var list = []
  for (let idx = startIndex; idx <= endIndex; idx++) {
    list.push(idx)
  }
  let prev =
    currentPage > 1 ? startIndex - 1 : null
  if (prev <= 0 && prev !== null) {
    prev = parseInt(currentPage, 10) - parseInt(1, 10)
  }
  let next =
    totalPage !== currentPage ? endIndex + 1 : null
  if (next >= totalPage && next !== null) {
    next = parseInt(currentPage, 10) + parseInt(1, 10)
  }
  return { prev, next, list, currentPage, totalPage }
}

function getFormatBytes (bytes) {
  if (bytes < 1024) return bytes + ' Bytes'
  else if (bytes < (1024 * 1024)) return (bytes / 1024).toFixed(3) + ' KB'
  else if (bytes < (1024 * 1024 * 1024)) return (bytes / (1024 * 1024)).toFixed(3) + ' MB'
  else if (bytes < (1024 * 1024 * 1024 * 1024)) return (bytes / (1024 * 1024 * 1024)).toFixed(3) + ' GB'
  else return (bytes / (1024 * 1024 * 1024 * 1024)).toFixed(3) + ' TB'
}

/* eslint-disable no-new-wrappers */
function get_now_yyyymmddhhiiss () {
  var date = new Date()
  var year = date.getFullYear()
  var month = new String(date.getMonth() + 1)
  var day = new String(date.getDate())
  var hour = date.getHours() + ''
  var minute = date.getMinutes() + ''
  var second = date.getSeconds() + ''
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
  return year + month + day + hour + minute + second
}

function convertDate (dateTime) {
  if (dateTime !== 0 && dateTime !== null) {
    var date = String(dateTime)
    var year = date.substring(0, 4)
    var month = date.substring(4, 6)
    var day = date.substring(6, 8)
    var hour = date.substring(8, 10)
    var minute = date.substring(10, 12)
    var second = date.substring(12, 14)
    dateTime = year + '-' + month + '-' + day + ' ' + hour + ':' + minute + ':' + second
    return dateTime
  } else if (dateTime === 0 && dateTime !== null) {
    return ''
  } else if (dateTime === null) {
    return ''
  }
}

export {
  proxy2map,
  proxy2string,
  code,
  pageSetting,
  getFormatBytes,
  get_now_yyyymmddhhiiss,
  convertDate
}
