<template>
    <div class ="main-border pb10">
      <div class="user-name flex-box flex-center mt10">
        <p><i class="fas fa-user"></i>&ensp;{{username}} <span>({{realname}})</span></p>
        <div class="btn-box">
          <button id="pwModify" class="btn h30" @click="pwModify">비밀번호 변경</button>
          <button id="logoutBtn" class="btn h30" @click="logoutCheck">Logout</button>
        </div>
      </div>
    </div>
    <div class = "userInfo-container">
      <div class="info-box">
        <div class="flex-center mt10 mb10">
          <h4>SMS 관리</h4>
          <div class="btn-box">
            <button @click="active = !active" :aria-pressed="active ? 'true' : 'false'" type="button" class="btn blue h30 addUser">+</button>
            <button @click="userDel" type="button" class="btn h30 deleteUser">-</button>
          </div>
        </div>
        <table class="mb20">
          <colgroup>
            <col width="30px">
            <col width="25%">
            <col width="*">
          </colgroup>
          <thead>
          <tr>
            <th>
              <div class="check">
                <input type="checkbox" id="allCheck" v-model="selectAll">
                <label for="allCheck"></label>
              </div>
            </th>
            <th class="name">이름</th>
            <th>연락처</th>
          </tr>
          </thead>
          <tbody>
            <tr v-for="user in this.users" :key="user.memberid">
              <td>
                <div class="check">
                  <input type="checkbox" v-model="selected" :value="user" :id="user.memberid">
                  <label :for="user.memberid"></label>
                </div>
              </td>
              <td class="name">{{user.name}}</td>
              <td class="tel">{{user.phonenumber}}</td>
            </tr>
            <tr v-show="isShow">
              <td colspan="3">조회 결과가 없습니다.</td>
            </tr>
          </tbody>
        </table>
      </div>
      <div class="paging mt20 mb20">
        <pagination class ="pagination" ref="pagination" style="margin-top: 24px;"
                    :pageData="pageSet(total, limit, this.page)"
                    @paging="getUserList"/>
      </div>
    </div>
    <div class="logoutCheckPop" v-show="isLogoutCheck">
      <p>로그아웃 하시겠습니까?</p>
      <div class="btn-box">
        <button class="btn h30" @click="logout">확인</button>
        <button class="btn h30 blue" @click="logoutCancel">취소</button>
      </div>
    </div>
    <div class="bg view" v-show="isLogoutCheck"></div>
    <div class="bg" :class="{view:active}"></div>
    <div class="user-info-add" :class="{view:active}">
      <div class="inner">
        <button @click="active = false" class="close"><i class="fas fa-times"></i></button>
        <div class="box flex-box mb20">
          <input v-model="name" ref="usernameInput" type="text" placeholder="이름" id="info-name" class="name">
          <input v-model="phonenumber" ref="usertelInput" type="tel" placeholder="연락처" id="info-tel">
        </div>
        <div class="btn-box">
          <button @click="userAdd" id="addCheck" class="btn" type="button" >추가</button>
        </div>
      </div>
    </div>
</template>
<script>
import pagination from '@/components/includes/Template_pagination'
const { axios, custom, ipcRenderer } = require('@/assets/js/include.js')

export default {
  components: {
    pagination
  },
  data () {
    return {
      g_windowIndex: 0,
      /* 비밀번호 변경, 로그아웃 */
      username: this.$store.state.username,
      realname: this.$store.state.realname,
      c_node_type: [],
      isMain: true,
      isUserPwModifyClose: false,
      isLogoutCheck: false,
      rootNodeId: 0,
      /* SMS관리 */
      user: '',
      name: '',
      phonenumber: '',
      users: [],
      selected: [],
      active: false,
      page: 1,
      total: null,
      limit: 10,
      isShow: false
    }
  },
  mounted () {
    this.getUserList(1)
  },
  methods: {
    init: function (event, key, data, type) {
      if (type == 'isUserPwModifyClose') {
        this.isUserPwModifyClose = data
        if (this.isUserPwModifyClose) {
          this.logout()
        }
      }
    },
    /* 비밀번호변경, 로그아웃 */
    pwModify: function () {
      const data = {
        parentKey: this.selfKey
      }
      ipcRenderer.send('openWindow', {
        key: ++this.g_windowIndex,
        url: 'UserPwModify',
        data: data,
        width: 420,
        height: 365,
        parent: '',
        modal: true
      })
      ipcRenderer.once('receiveData', this.init)
    },
    logoutCheck: function () {
      this.isLogoutCheck = true
    },
    logout: function () {
      console.trace()
      this.$store.commit('commitApikey', '')
      axios.deleteAsyncAxios('/v2/users/apikey', null, null, (response) => {
        ipcRenderer.send('alert', '로그아웃 되었습니다.')
        this.goTo('Login?Logout')
      })
    },
    logoutCancel: function () {
      this.isLogoutCheck = false
    },
    goTo: function (page) {
      this.$router.push(page)
    },
    /* SMS 관리 */
    getUserList: function (page) {
      if (page == null) {
        this.page = 1
      } else {
        this.page = page
      }
      const param = {}
      const condition = {}
      condition.userid = this.$store.state.username
      param.condition = condition
      const sort = {}
      sort.createtime = 'desc'
      param.sort = sort
      param.limit = this.limit
      param.offset = (this.page - 1) * this.limit

      axios.getAsyncAxios('/v2/members', param, (response) => {
        this.users = response.data.results
        this.total = response.data.paging.total
        this.limit = response.data.paging.limit
        if (this.users.length === 0) {
          this.isShow = true
        } else {
          this.isShow = false
        }
      })
      this.selectAll = false // 전체체크박스 해제
    },
    userAdd: function () {
      if (!this.name) {
        ipcRenderer.send('alert', '이름을 입력해주세요.')
        this.$refs.usernameInput.focus()
      } else if (!this.phonenumber) {
        ipcRenderer.send('alert', '연락처를 입력해주세요.')
        this.$refs.usertelInput.focus()
      } else if (!/^[a-z0-9_-]{8,13}$/.test(this.phonenumber)) {
        ipcRenderer.send('alert', '숫자만 입력해주세요.(8~13자리)')
        this.$refs.usertelInput.focus()
      } else {
        this.active = false
        let body = {
          name: this.name,
          phonenumber: this.phonenumber,
          userid: this.$store.state.username
        }
        axios.postAsyncAxios('/v2/members', JSON.stringify(body), null, (response) => {
          this.getUserList(1)
        })
        this.name = ''
        this.phonenumber = ''
      }
    },
    userDel: function () {
      this.selected.forEach(selected => {
        this.users.forEach(user => {
          if (user.memberid === selected.memberid) {
            let memberid = user.memberid
            axios.deleteAsyncAxios('/v2/members/' + memberid, {}, {}, (response) => {
              // console.log('delete', response)
              this.selected = []
              this.getUserList(1)
            })
          }
        })
      })
    },
    pageSet: function (total, limit, page) {
      return custom.pageSetting(total, limit, page)
    }
  },
  computed: {
    selectAll: {
      get () {
        return this.users ? this.selected.length === this.users.length : false
      },
      set (value) {
        var selected = []
        if (value) {
          for (let idx in this.users) {
            let user = this.users[idx]
            selected.push(user)
            // console.log('전체체크한 유저정보: ', selected)
          }
        }
        this.selected = selected
        // console.log('this.selected : ', this.selected)
      }
    }
  }
}
</script>
