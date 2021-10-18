// const crypto = require('crypto')

function RESTAPIConnectInfo (_host, _port) {
  this.host = _host || ''
  this.port = _port || ''
}
function RESTAPIPropertyInfo (_actionUrl, _param) {
  this.actionUrl = _actionUrl || ''
  this.params = _param || {}
}
function AssetInfo (_workflowname, _storagename, _filesize, _filename, _transferstatus) {
  this.workflowname = _workflowname || ''
  this.storagename = _storagename || ''
  this.filesize = _filesize || 0
  this.filename = _filename || ''
  this.transferstatus = _transferstatus || 0
  this.transferjobid = 0

  this.errMsg = ''
}
AssetInfo.prototype.Settransferstatus = function (_transferstatus) {
  this.transferstatus = _transferstatus
}
AssetInfo.prototype.Settransferjobid = function (_transferjobid) {
  this.transferjobid = _transferjobid
}
function RESTAPIInfo () {
  // const m_RESTAPIConnect_test = new RESTAPIConnectInfo('http:// 10.10.18.233', '7079')
  this.m_RESTAPIConnect_SBSAPI = new RESTAPIConnectInfo('http://10.10.20.73', '8089')
}

RESTAPIInfo.prototype.login = async function (_id, _pw) {
  const self = this
  const restPropertyInfo = new RESTAPIPropertyInfo('/v1/users/apikey')
  // const cryptoPassword = CryptoEncodingSHA512(_pw)
  const params = {
    username: _id,
    password: _pw // cryptoPassword 로 변경예정.
  }

  restPropertyInfo.params = params

  // request REST API
  const resultURL = self.createRequestURL(self.m_RESTAPIConnect_SBSAPI, restPropertyInfo)
  const apikey = await self.POST_RESTAPI(resultURL).catch(function (err) {
    console.log(err)
  })
  self.m_apikey = apikey
  return apikey
}
RESTAPIInfo.prototype.CreateAsset = async function (_assetInfo, _apikey) {
  const self = this
  const restPropertyInfo = new RESTAPIPropertyInfo('/v1/assets')
  const requestBody = {
    assetviewname: 'asset_transferjob',
    parameter: {
      workflowname: _assetInfo.workflowname,
      storagename: _assetInfo.storagename,
      filesize: _assetInfo.filesize,
      filename: _assetInfo.filename,
      transferstatus: _assetInfo.transferstatus
    }
  }

  const resultURL = self.createRequestURL(self.m_RESTAPIConnect_SBSAPI, restPropertyInfo)
  const result = await self.POST_RESTAPI(resultURL, _apikey, requestBody)
  return result
}
RESTAPIInfo.prototype.GetAsset = async function (_transferjobid, _apikey) {
  const self = this
  const restPropertyInfo = new RESTAPIPropertyInfo('/v1/assets/asset_transferjob')
  const params = {
    condition: `{'$and':[{'$eq':{'transferjobid':'${_transferjobid}'}}]}`
  }
  restPropertyInfo.params = params

  // request REST API
  const resultURL = self.createRequestURL(self.m_RESTAPIConnect_SBSAPI, restPropertyInfo)
  const result = await self.GET_RESTAPI(resultURL, _apikey)
  return result
}
RESTAPIInfo.prototype.SetAsset = async function (_assetInfo, _apikey) {
  const self = this
  const restPropertyInfo = new RESTAPIPropertyInfo('/v1/assets/asset_transferjob')
  const requestBody = {
    assetviewname: 'asset_transferjob',
    condition: {
      $and: [
        {
          $eq: {
            transferjobid: _assetInfo.transferjobid
          }
        }
      ]
    },
    parameter: {
      workflowname: _assetInfo.workflowname,
      storagename: _assetInfo.storagename,
      filesize: _assetInfo.filesize,
      filename: _assetInfo.filename,
      transferstatus: _assetInfo.transferstatus,
      errmsg: _assetInfo.errMsg
    }
  }
  // requestBody = encodeURI (requestBody)
  // request REST API
  const resultURL = self.createRequestURL(self.m_RESTAPIConnect_SBSAPI, restPropertyInfo)
  const result = await self.PUT_RESTAPI(resultURL, _apikey, requestBody)
  return result
}
RESTAPIInfo.prototype.DelAsset = async function (_transferjobid, _apikey) {
  const self = this
  const restPropertyInfo = new RESTAPIPropertyInfo('/v1/assets/asset_transferjob')
  const params = {
    condition: `{'$and':[{'$eq':{'transferjobid':'${_transferjobid}'}}]}`
  }
  restPropertyInfo.params = params
  const resultURL = self.createRequestURL(self.m_RESTAPIConnect_SBSAPI, restPropertyInfo)
  const result = await self.DEconstE_RESTAPI(resultURL, _apikey)
  return result
}
RESTAPIInfo.prototype.SearchAsset = async function (_apikey, _filename = '%%', _startTime = 20200101000000, _endTime = 20211231235959, _timeSort = 'desc', _offset = 0, _limit = 20, _search5 = false, _nocache = false) {
  const self = this
  const restPropertyInfo = new RESTAPIPropertyInfo('/v1/search/search_transfer')
  const params = {
    condition: `{'$and':[{'$like':{'filename':'${_filename}'}},{'$and':[{'$ge':{'createtime':'${_startTime}'}},{'$lt':{'createtime':'${_endTime}'}}]}]}`,
    sort: `{'$sort':{'createtime':'${_timeSort}'}}`,
    offset: _offset,
    limit: _limit,
    search5: _search5,
    nocache: _nocache
  }
  restPropertyInfo.params = params

  // request REST API
  const resultURL = self.createRequestURL(self.m_RESTAPIConnect_SBSAPI, restPropertyInfo)
  const result = await self.GET_RESTAPI(resultURL, _apikey)
  console.log(result)
  return result
}
RESTAPIInfo.prototype.GetUserInfo = async function (_apikey, _userid) {
  const self = this
  const restPropertyInfo = new RESTAPIPropertyInfo(`/v1/admin/users/${_userid}`)

  // request REST API
  const resultURL = self.createRequestURL(self.m_RESTAPIConnect_SBSAPI, restPropertyInfo)
  const result = await self.GET_RESTAPI(resultURL, _apikey)
  console.log(result)
  return result
}
RESTAPIInfo.prototype.GET_RESTAPI = function (_requestUrl, _strAuth) {
  return new Promise((resolve, reject) => {
    fetch(_requestUrl, {
      method: 'GET',
      headers:
    {
      'content-type': 'application/json',
      Authorization: _strAuth // x-auth-token 4e074614-c98a-4ed6-983e-43bbf781797b
    }
    })
      .then(
        function (response) {
          console.log('status', response.status)
          if (response.status !== 200) {
            reject(response.status)
          }
          resolve(response.json())
        // return response.json ()
        }
      )
  })
}
RESTAPIInfo.prototype.POST_RESTAPI = function (_requestUrl, _strAuth = '', _requestBody) {
  return new Promise((resolve, reject) => {
    fetch(_requestUrl, {
      method: 'POST',
      headers:
    {
      'content-type': 'application/json',
      Authorization: _strAuth
    },
      body: JSON.stringify(_requestBody)
    })
      .then(
        function (response) {
          console.log('status', response.status)
          if (response.status !== 200) {
            reject(response.status)
          }
          resolve(response.json())
        }
      )
  })
}
RESTAPIInfo.prototype.PUT_RESTAPI = function (_requestUrl, _strAuth, _requestBody) {
  return new Promise((resolve, reject) => {
    fetch(_requestUrl, {
      method: 'PUT',
      headers:
    {
      'content-type': 'application/json',
      Authorization: _strAuth
    },
      body: JSON.stringify(_requestBody)
    })
      .then(
        function (response) {
          console.log('status', response.status)
          if (response.status !== 200) {
            reject(response.status)
          }
          resolve(response.json())
        }
      )
  })
}
RESTAPIInfo.prototype.DEconstE_RESTAPI = function (_requestUrl, _strAuth) {
  return new Promise((resolve, reject) => {
    fetch(_requestUrl, {
      method: 'DEconstE',
      headers:
        {
          Authorization: _strAuth
        }
    })
      .then(
        function (response) {
          console.log('status', response.status)
          if (response.status !== 200) {
            reject(response.status)
          }
          resolve(response.json())
        }
      )
  })
}
// eslint-disable-next-line camelcase
RESTAPIInfo.prototype.createRequestURL = function (g_RESTAPIConnect, _restPropertyInfo) {
  const self = this
  const baseUrl = g_RESTAPIConnect.host + ':' + g_RESTAPIConnect.port + '/server'

  const paramStart = '?'
  let resultParams = self.createParamURL(_restPropertyInfo.params)
  if (resultParams === '') {
    return encodeURI(baseUrl + _restPropertyInfo.actionUrl)
  }
  // eslint-disable-next-line no-const-assign
  resultParams = baseUrl + _restPropertyInfo.actionUrl + paramStart + resultParams
  resultParams = encodeURI(resultParams)
  return resultParams
}
RESTAPIInfo.prototype.createParamURL = function (params) {
  let resultParams = ''

  let isfirst = true
  for (const [key, value] of Object.entries(params)) {
    if (isfirst) {
      isfirst = false
    } else {
      resultParams += '&'
    }
    const strTemp = key + '=' + value
    resultParams += strTemp
  }
  return resultParams
}
// function CryptoEncodingSHA512(str) {
//   const hash = crypto.createHash('sha512')
//   const digest = hash.update(str, 'utf-8').digest()
//   const encodingPW = digest.toString('hex')
//   // WriteText ('encoding-test-id', encodingPW)
//   return encodingPW
// }

exports.RESTAPIConnectInfo = RESTAPIConnectInfo
exports.RESTAPIPropertyInfo = RESTAPIPropertyInfo
exports.RESTAPIInfo = RESTAPIInfo
exports.AssetInfo = AssetInfo
