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

function pageSetting (total, limit, offset, page) {
  const totalPage = Math.ceil(total / limit)
  var currentPage = page
  var startIndex = (Math.ceil(currentPage / offset) - 1) * offset + 1
  var endIndex = startIndex + offset > totalPage ? totalPage : startIndex + offset - 1
  console.log('total : ', total, ' totalPage : ', totalPage, ' currentPage : ', currentPage, ' startIndex : ', startIndex, 'endIndex : ', endIndex)
  console.log('offset : ', offset)
  console.log('(Math.ceil(currentPage / offset) - 1) : ', (Math.ceil(currentPage / offset) - 1))
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
export {
  proxy2map,
  proxy2string,
  code,
  pageSetting,
  getFormatBytes
}
