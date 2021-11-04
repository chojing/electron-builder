import store from '@/store/index'
import router from '@/router/index'
import axios from 'axios'

axios.defaults.baseURL = store.state.server
axios.defaults.headers['Access-Control-Allow-Origin'] = '*'

async function login (id, password) {
  // axios.defaults.baseURL = store.state.server
  await axios.post('/v2/users/apikey', null, {
    params: {
      username: id,
      password: password
    },
    headers: {
      'Content-Type': 'application/json'
    }
  }).then(function (response) {
    store.commit('commitUsername', response.data.result.username)
    store.commit('commitUserid', response.data.result.userid)
    store.commit('commitApikey', response.data.result.apikey)
  }).catch(function (error) {
    setError(error.response.data)
  })
}
async function getSyncAxios (url, param, fail) {
  let result
  await axios.get(url, {
    params: param,
    headers: {
      Authorization: store.state.apikey
    }
  }).then(function (response) {
    result = response.data
  }).catch(function (error) {
    if (typeof fail === 'function') fail(error)
    else setError(error.response.data)
  })
  console.log('axios', result)
  return result
}
function getAsyncAxios (url, param, callback, fail) {
  axios.get(url, {
    params: param,
    headers: {
      Authorization: store.state.apikey
    }
  }).then(function (response) {
    if (typeof callback === 'function') callback(response)
    else alert(response)
  }).catch(function (error) {
    if (typeof fail === 'function') fail(error)
    else setError(error.response.data)
  })
}

async function postSyncAxios (url, body, param, callback, fail) {
  let contentType = 'application/x-www-form-urlencoded; charset=UTF-8'
  if (body.length > 0) {
    contentType = 'application/json; charset=utf-8'
  }
  let result
  await axios.post(url, body, {
    params: param,
    headers: {
      'Content-Type': contentType,
      Authorization: store.state.apikey
    }
  }).then(function (response) {
    result = response.data
  }).catch(function (error) {
    if (typeof fail === 'function') fail(error)
    else setError(error.response.data)
  })
  return result
}
function postAsyncAxios (url, body, param, callback, fail) {
  let contentType = 'application/x-www-form-urlencoded; charset=UTF-8'
  if (body.length > 0) {
    contentType = 'application/json; charset=utf-8'
  }
  axios.post(url, body, {
    params: param,
    headers: {
      'Content-Type': contentType,
      Authorization: store.state.apikey
    }
  }).then(function (response) {
    if (typeof callback === 'function') callback(response)
    else alert(response)
  }).catch(function (error) {
    if (typeof fail === 'function') fail(error)
    else setError(error.response.data)
  })
}

async function putSyncAxios (url, body, param, callback, fail) {
  let contentType = 'application/x-www-form-urlencoded; charset=UTF-8'
  if (body.length > 0) {
    contentType = 'application/json; charset=utf-8'
  }
  let result
  await axios.put(url, body, {
    params: param,
    headers: {
      'Content-Type': contentType,
      Authorization: store.state.apikey
    }
  }).then(function (response) {
    result = response.data
  }).catch(function (error) {
    if (typeof fail === 'function') fail(error)
    else setError(error.response.data)
  })
  return result
}
function putAsyncAxios (url, body, param, callback, fail) {
  let contentType = 'application/x-www-form-urlencoded; charset=UTF-8'
  if (body.length > 0) {
    contentType = 'application/json; charset=utf-8'
  }
  axios.put(url, body, {
    params: param,
    headers: {
      'Content-Type': contentType,
      Authorization: store.state.apikey
    }
  }).then(function (response) {
    if (typeof callback === 'function') callback(response)
    else alert(response)
  }).catch(function (error) {
    if (typeof fail === 'function') fail(error)
    else setError(error.response.data)
  })
}

async function deleteSyncAxios (url, body, param, callback, fail) {
  let contentType = 'application/x-www-form-urlencoded; charset=UTF-8'
  if (body.length > 0) {
    contentType = 'application/json; charset=utf-8'
  }
  let result
  await axios.delete(url, body, {
    params: param,
    headers: {
      'Content-Type': contentType,
      Authorization: store.state.apikey
    }
  }).then(function (response) {
    result = response.data
  }).catch(function (error) {
    if (typeof fail === 'function') fail(error)
    else setError(error.response.data)
  })
  return result
}
function deleteAsyncAxios (url, body, param, callback, fail) {
  let contentType = 'application/x-www-form-urlencoded; charset=UTF-8'
  if (body.length > 0) {
    contentType = 'application/json; charset=utf-8'
  }
  axios.delete(url, body, {
    params: param,
    headers: {
      'Content-Type': contentType,
      Authorization: store.state.apikey
    }
  }).then(function (response) {
    if (typeof callback === 'function') callback(response)
    else alert(response)
  }).catch(function (error) {
    if (typeof fail === 'function') fail(error)
    else setError(error.response.data)
  })
}

function setError (xhr) {
  if (xhr.status === 401) {
    let msg = '에러 \n세션이 끊겼습니다.\n로그인 페이지로 이동합니다.'
    if (xhr.message !== null) {
      msg = xhr.message
    }
    alert(msg)
    router.push({ name: 'Login' })
    return false
  } else {
    let errorCode = '[ ERROR CODE : ' + xhr.status + ' ]'
    if (xhr.message !== null) {
      errorCode += xhr.message

      if (xhr.status >= 400) {
        alert('에러\n' + errorCode)
      } else {
        alert(errorCode)
      }
    }
    return false
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
