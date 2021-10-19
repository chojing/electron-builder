import { createStore } from 'vuex'

export default createStore({
  state: {
    username: null,
    apikey: null,
    server: null
  },
  mutations: {
    commitServer (state, server) {
      state.server = server
    },
    commitUsername (state, username) {
      state.username = username
    },
    commitApikey (state, apikey) {
      state.apikey = apikey
    }
  },
  actions: {
    setServer (context, server) {
      context.commit('commitServer', server)
    },
    setUsername (context, username) {
      context.commit('commitUsername', username)
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
