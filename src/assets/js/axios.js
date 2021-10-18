import axios from 'axios'
axios.defaults.headers.common['Access-Control-Allow-Origin'] = '*'
function setBaseUrl (url) {
  axios.defaults.baseURL = url
}
function getAPIKey () {
  return axios.defaults.headers.common.Authorization
}
async function login (id, password) {
  const response = await axios.post('/v1/users/apikey', null, {
    params: {
      id: id,
      password: password
    }
  })
  axios.defaults.headers.common.Authorization = response.result.apikey
}
async function getSyncAxios (url, param, callback, fail) {
  await axios.get(url, {
    params: param
  }).then(function (response) {
    if (typeof callback === 'function') callback(response)
    else alert(response)
  }).catch(function (error) {
    if (typeof fail === 'function') fail(error)
    else setError(error)
  })
}
function getAsyncAxios (url, param, callback, fail) {
  axios.get(url, {
    params: param
  }).then(function (response) {
    if (typeof callback === 'function') callback(response)
    else alert(response)
  }).catch(function (error) {
    if (typeof fail === 'function') fail(error)
    else setError(error)
  })
}

async function postSyncAxios (url, body, param, callback, fail) {
  let contentType = 'application/x-www-form-urlencoded; charset=UTF-8'
  if (body.length > 0) {
    contentType = 'application/json; charset=utf-8'
  }
  await axios.post(url, body, {
    params: param,
    headers: {
      'Content-Type': contentType
    }
  }).then(function (response) {
    if (typeof callback === 'function') callback(response)
    else alert(response)
  }).catch(function (error) {
    if (typeof fail === 'function') fail(error)
    else setError(error)
  })
}
function postAsyncAxios (url, body, param, callback, fail) {
  let contentType = 'application/x-www-form-urlencoded; charset=UTF-8'
  if (body.length > 0) {
    contentType = 'application/json; charset=utf-8'
  }
  axios.post(url, body, {
    params: param,
    headers: {
      'Content-Type': contentType
    }
  }).then(function (response) {
    if (typeof callback === 'function') callback(response)
    else alert(response)
  }).catch(function (error) {
    if (typeof fail === 'function') fail(error)
    else setError(error)
  })
}

async function putSyncAxios (url, body, param, callback, fail) {
  let contentType = 'application/x-www-form-urlencoded; charset=UTF-8'
  if (body.length > 0) {
    contentType = 'application/json; charset=utf-8'
  }
  await axios.put(url, body, {
    params: param,
    headers: {
      'Content-Type': contentType
    }
  }).then(function (response) {
    if (typeof callback === 'function') callback(response)
    else alert(response)
  }).catch(function (error) {
    if (typeof fail === 'function') fail(error)
    else setError(error)
  })
}
function putAsyncAxios (url, body, param, callback, fail) {
  let contentType = 'application/x-www-form-urlencoded; charset=UTF-8'
  if (body.length > 0) {
    contentType = 'application/json; charset=utf-8'
  }
  axios.put(url, body, {
    params: param,
    headers: {
      'Content-Type': contentType
    }
  }).then(function (response) {
    if (typeof callback === 'function') callback(response)
    else alert(response)
  }).catch(function (error) {
    if (typeof fail === 'function') fail(error)
    else setError(error)
  })
}

async function deleteSyncAxios (url, body, param, callback, fail) {
  let contentType = 'application/x-www-form-urlencoded; charset=UTF-8'
  if (body.length > 0) {
    contentType = 'application/json; charset=utf-8'
  }
  await axios.delete(url, body, {
    params: param,
    headers: {
      'Content-Type': contentType
    }
  }).then(function (response) {
    if (typeof callback === 'function') callback(response)
    else alert(response)
  }).catch(function (error) {
    if (typeof fail === 'function') fail(error)
    else setError(error)
  })
}
function deleteAsyncAxios (url, body, param, callback, fail) {
  let contentType = 'application/x-www-form-urlencoded; charset=UTF-8'
  if (body.length > 0) {
    contentType = 'application/json; charset=utf-8'
  }
  axios.delete(url, body, {
    params: param,
    headers: {
      'Content-Type': contentType
    }
  }).then(function (response) {
    if (typeof callback === 'function') callback(response)
    else alert(response)
  }).catch(function (error) {
    if (typeof fail === 'function') fail(error)
    else setError(error)
  })
}

function setError (xhr) {
  if (xhr.status === 401 || (xhr.status === 400 && xhr.responseJSON.code === 401)) {
    alert('에러 \n세션이 끊겼습니다.\n로그인 페이지로 이동합니다.')
    this.$router.push('/login')
    return false
  } else {
    let errorCode = '[ ERROR CODE : ' + xhr.status + ' ]<br/>'
    if (typeof xhr.responseText !== 'undefined') {
      const responseText = xhr.responseText
      const isJson = checkJsonString(responseText)

      if (isJson) {
        if (typeof JSON.parse(xhr.responseText).message !== 'undefined') {
          const message = JSON.parse(xhr.responseText).message
          const idx = message.indexOf(':')
          if (idx > 0) {
            errorCode += message.substring(idx + 1)
          } else {
            errorCode += message
          }
        }
      } else {
        const message = '리스트 조회하는데 실패했습니다.'
        errorCode += message
      }
    }

    if (xhr.status >= 400) {
      alert('에러\n' + errorCode)
    } else {
      alert(errorCode)
    }

    return false
  }
}

function checkJsonString (str) {
  try {
    const json = JSON.parse(str)
    return (typeof json === 'object')
  } catch (e) {
    return false
  }
}

export {
  setBaseUrl,
  getAPIKey,
  login,
  getSyncAxios,
  getAsyncAxios,
  postSyncAxios,
  postAsyncAxios,
  putSyncAxios,
  putAsyncAxios,
  deleteSyncAxios,
  deleteAsyncAxios
}
