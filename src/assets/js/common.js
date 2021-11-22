function proxy2map (proxy) {
  return JSON.parse(JSON.stringify(proxy))
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
export {
  proxy2map,
  code
}
