import { createStore } from 'vuex'

export default createStore({
  state: {
    server: null,
    username: null,
    autologin: false,
    apikey: null
  },
  mutations: {
    commitServer (state, server) {
      state.server = server
    },
    commitUsername (state, username) {
      state.username = username
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
    setAutologin (context, autologin) {
      context.commit('commitAutologin', autologin)
    },
    setApikey (context, apikey) {
      context.commit('commitApikey', apikey)
    },
    clearStore (context) {
      context.commit('crear')
    }
  },
  modules: {
  }
})
