import { createStore } from 'vuex'
import createPersistedState from 'vuex-persistedstate'

export default createStore({
  plugins: [
    createPersistedState()
  ],
  state: {
    server: null,
    username: null,
    realname: null,
    userid: null,
    autologin: false,
    apikey: null,
    nodeid: null,
    nodename: null,
    buildTime: null
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
    commitUserRealname (state, realname) {
      if (realname != null && realname != undefined) {
        state.realname = realname
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
    commitNodeid (state, nodeid) {
      state.nodeid = nodeid
    },
    commitNodename (state, nodename) {
      state.nodename = nodename
    },
    commitBuildTime (state, buildTime) {
      state.buildTime = buildTime
    },
    clear (state) {
      state = {
        server: null,
        username: null,
        realname: null,
        userid: null,
        autologin: false,
        apikey: null,
        nodeid: null,
        nodename: null,
        buildTime: null
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
    setRealname (context, realname) {
      context.commit('commitUserRealname', realname)
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
    setNodeid (context, nodeid) {
      context.commit('commitNodeid', nodeid)
    },
    setNodename (context, nodename) {
      context.commit('commitNodename', nodename)
    },
    setBuildTime (context, buildTime) {
      context.commit('commitBuildTime', buildTime)
    },
    clearStore (context) {
      context.commit('clear')
    }
  }
})
