import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'

export default createStore({
  plugins: [
    createPersistedState()
  ],
  state: {
    server: null,
    username: null,
    userid: null,
    autologin: false,
    apikey: null
  },
  mutations: {
    commitServer (state, server) {
      state.server = server
    },
    commitUsername (state, username) {
      if (username != null && username != undefined) {
        state.username = username
      }
    },
    commitUserid (state, userid) {
      state.userid = userid
    },
    commitAutologin (state, autologin) {
      state.autologin = autologin
    },
    commitApikey (state, apikey) {
      state.apikey = apikey
    },
    clear (state) {
      state = {
        server: null,
        username: null,
        userid: null,
        autologin: false,
        apikey: null
      }
    }
  },
  actions: {
    setServer (context, server) {
      context.commit('commitServer', server)
    },
    setUsername (context, username) {
      context.commit('commitUsername', username)
    },
    setUserid (context, userid) {
      context.commit('commitUserid', userid)
    },
    setAutologin (context, autologin) {
      context.commit('commitAutologin', autologin)
    },
    setApikey (context, apikey) {
      context.commit('commitApikey', apikey)
    },
    clearStore (context) {
      context.commit('crear')
    }
  }
})
