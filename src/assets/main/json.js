const fs = require('fs')

function WriteUserJSON (_path, data) {
  const userJSON = JSON.stringify(data)
  // fs.wirteFileSync("UserData.json", userJSON);
  const folderPath = _path
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true })
  }
  fs.writeFileSync(folderPath + '//UserData.json', userJSON)
}

function WriteFilterJSON (_path, data) {
  const userJSON = JSON.stringify(data)
  // fs.wirteFileSync("UserData.json", userJSON);
  const folderPath = _path
  if (!fs.existsSync(folderPath)) {
    fs.mkdirSync(folderPath, { recursive: true })
  }
  fs.writeFileSync(folderPath + '//filterData.json', userJSON)
}

function ReadUserJSON (_path) {
  if (fs.existsSync(_path)) {
    const dataBuffer = fs.readFileSync(_path)
    const dataJSON = dataBuffer.toString()
    const data = JSON.parse(dataJSON)
    return data
  }
}
exports.WriteUserJSON = WriteUserJSON
exports.WriteFilterJSON = WriteFilterJSON
exports.ReadUserJSON = ReadUserJSON
