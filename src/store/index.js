import { createStore } from 'vuex'

export default createStore({
  state: {
    username: null,
    apikey: null,
    server: null
  },
  mutations: {
    commitServer (state, server) {
      console.log('commitServer', server)
      state.server = server
    },
    commitUsername (state, username) {
      console.log('commitUsername', username)
      state.username = username
    },
    commitApikey (state, apikey) {
      console.log('commitApikey', apikey)
      state.apikey = apikey
    }
  },
  actions: {
    setServer (context, server) {
      console.log('setServer', server)
      context.commit('commitServer', server)
    },
    setUsername (context, username) {
      console.log('setUsername', username)
      context.commit('commitUsername', username)
    },
    setApikey (context, apikey) {
      console.log('setApikey', apikey)
      context.commit('commitApikey', apikey)
    }
  },
  modules: {
  }
})
