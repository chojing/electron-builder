import store from '@/store/index'
import router from '@/router/index'
import axios from 'axios'
// const log = window.require('electron-log')
const { ipcRenderer } = window.require('electron')
const custom = require('@/assets/js/common.js')
axios.defaults.headers['Access-Control-Allow-Origin'] = '*'
axios.defaults.baseURL = store.state.server

async function login (id, password) {
  axios.defaults.baseURL = store.state.server
  await axios.post('/v2/users/apikey', null, {
    params: {
      clienttype: 27, // 웹 26, 앱 27
      username: id,
      password: password
    },
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(function (response) {
    store.commit('commitUsername', response.data.result.username)
    store.commit('commitUserRealname', response.data.result.realname)
    store.commit('commitUserid', response.data.result.userid)
    store.commit('commitApikey', response.data.result.apikey)
  }).catch(function (error) {
    store.commit('commitUsername', null)
    store.commit('commitUserRealname', null)
    store.commit('commitUserid', null)
    store.commit('commitApikey', null)
    ipcRenderer.send('WriteLog', 'axios login ' + error)
    setError(error)
  })
}
async function getSyncAxios (url, param, fail) {
  let result
  await axios.get(url, {
    headers: {
      Authorization: store.state.apikey
    },
    params: param
  }).then(function (response) {
    result = response.data
  }).catch(function (error) {
    ipcRenderer.send('WriteLog', 'axios get' + url + ' ' + custom.proxy2string(param) + ' ' + error)
    if (typeof fail === 'function') fail(error)
    else setError(error)
  })
  console.log('axios', result)
  return result
}
function getAsyncAxios (url, param, callback, fail) {
  axios.get(url, {
    headers: {
      Authorization: store.state.apikey
    },
    params: param
  }).then(function (response) {
    if (typeof callback === 'function') callback(response)
    else ipcRenderer.send('alert', response)
  }).catch(function (error) {
    ipcRenderer.send('WriteLog', 'axios get' + url + ' ' + custom.proxy2string(param) + ' ' + error)
    if (typeof fail === 'function') fail(error)
    else setError(error)
  })
}

async function postSyncAxios (url, body, param, callback, fail) {
  let contentType = 'application/x-www-form-urlencoded; charset=UTF-8'
  if (body != null && body.length > 0) {
    contentType = 'application/json; charset=utf-8'
  }
  let result
  await axios.post(url, body, {
    headers: {
      'Content-Type': contentType,
      Authorization: store.state.apikey
    },
    params: param
  }).then(function (response) {
    result = response.data
  }).catch(function (error) {
    ipcRenderer.send('WriteLog', 'axios post' + url + ' ' + body + ' ' + param + ' ' + error)
    if (typeof fail === 'function') fail(error)
    else setError(error)
  })
  return result
}
function postAsyncAxios (url, body, param, callback, fail) {
  let contentType = 'application/x-www-form-urlencoded; charset=UTF-8'
  if (body != null && body.length > 0) {
    contentType = 'application/json; charset=utf-8'
  }
  axios.post(url, body, {
    headers: {
      'Content-Type': contentType,
      Authorization: store.state.apikey
    },
    params: param
  }).then(function (response) {
    if (typeof callback === 'function') callback(response)
    else ipcRenderer.send('alert', response)
  }).catch(function (error) {
    ipcRenderer.send('WriteLog', 'axios post' + url + ' ' + body + ' ' + param + ' ' + error)
    if (typeof fail === 'function') fail(error)
    else setError(error)
  })
}

async function putSyncAxios (url, body, param, callback, fail) {
  let contentType = 'application/x-www-form-urlencoded; charset=UTF-8'
  if (body != null && body.length > 0) {
    contentType = 'application/json; charset=utf-8'
  }
  let result
  await axios.put(url, body, {
    headers: {
      'Content-Type': contentType,
      Authorization: store.state.apikey
    },
    params: param
  }).then(function (response) {
    result = response.data
  }).catch(function (error) {
    ipcRenderer.send('WriteLog', 'axios put' + url + ' ' + body + ' ' + param + ' ' + error)
    if (typeof fail === 'function') fail(error)
    else setError(error)
  })
  return result
}
function putAsyncAxios (url, body, param, callback, fail) {
  let contentType = 'application/x-www-form-urlencoded; charset=UTF-8'
  if (body != null && body.length > 0) {
    contentType = 'application/json; charset=utf-8'
  }
  axios.put(url, body, {
    headers: {
      'Content-Type': contentType,
      Authorization: store.state.apikey
    },
    params: param
  }).then(function (response) {
    if (typeof callback === 'function') callback(response)
    else ipcRenderer.send('alert', response)
  }).catch(function (error) {
    ipcRenderer.send('WriteLog', 'axios put' + url + ' ' + body + ' ' + param + ' ' + error)
    if (typeof fail === 'function') fail(error)
    else setError(error)
  })
}

async function deleteSyncAxios (url, body, param, callback, fail) {
  let contentType = 'application/x-www-form-urlencoded; charset=UTF-8'
  if (body.length > 0) {
    contentType = 'application/json; charset=utf-8'
  }
  let result
  await axios.delete(url, {
    headers: {
      'Content-Type': contentType,
      Authorization: store.state.apikey
    },
    data: { body },
    params: param
  }).then(function (response) {
    result = response.data
  }).catch(function (error) {
    ipcRenderer.send('WriteLog', 'axios delete' + url + ' ' + body + ' ' + param + ' ' + error)
    if (typeof fail === 'function') fail(error)
    else setError(error)
  })
  return result
}
function deleteAsyncAxios (url, body, param, callback, fail) {
  let contentType = 'application/x-www-form-urlencoded; charset=UTF-8'
  if (body != null && body.length > 0) {
    contentType = 'application/json; charset=utf-8'
  }
  axios.delete(url, {
    headers: {
      'Content-Type': contentType,
      Authorization: store.state.apikey
    },
    data: { body },
    params: param
  }).then(function (response) {
    if (typeof callback === 'function') callback(response)
    else ipcRenderer.send('alert', response)
  }).catch(function (error) {
    ipcRenderer.send('WriteLog', 'axios delete' + url + ' ' + body + ' ' + param + ' ' + error)
    if (typeof fail === 'function') fail(error)
    else setError(error)
  })
}

function setError (error) {
  if (error.response) {
    let xhr = error.response.data
    if (xhr.status === 401) {
      let msg = '에러 \n세션이 끊겼습니다.\n로그인 페이지로 이동합니다.'
      if (xhr.message) {
        msg = xhr.message
      }
      ipcRenderer.send('alert', msg)
      router.push({ name: 'Login' })
      return false
    } else if (xhr.message === 'ID 또는 비밀번호를 다시 확인하세요. 등록되지 않은 ID이거나, 아이디 또는 비밀번호를 잘못 입력하셨습니다') {
      let msg = ''
      if (xhr.message) {
        msg = xhr.message
      }
      ipcRenderer.send('alert', msg)
      router.push({ name: 'Login' })
    } else if (xhr.status === 400) { // 간헐적으로 발생하는 apikey 분실 임시 대응 로직
      let msg = '에러 \n세션이 끊겼습니다.\n로그인 페이지로 이동합니다.'
      ipcRenderer.send('alert', msg)
      router.push({ name: 'Login' })
      return false
    } else {
      let errorCode = '[ ERROR CODE : ' + xhr.status + ' ]'
      if (xhr.message) {
        errorCode += xhr.message

        if (xhr.status >= 400) {
          ipcRenderer.send('error', '에러\n' + errorCode)
        } else {
          ipcRenderer.send('error', errorCode)
        }
      }
      return false
    }
  } else {
    ipcRenderer.send('WriteLog', error)
    alert(error)
  }
}

export {
  login,
  getSyncAxios,
  getAsyncAxios,
  postSyncAxios,
  postAsyncAxios,
  putSyncAxios,
  putAsyncAxios,
  deleteSyncAxios,
  deleteAsyncAxios,
  setError
}
