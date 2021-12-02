<template>
  <section class="userInfo-container pd40">
    <div class="wrap">
      <div class="info-box">
        <div class="btn-box mb20">
          <button @click="active = !active" :aria-pressed="active ? 'true' : 'false'" type="button" class="btn blue addUser">+</button>
         <button @click="userDel" type="button" class="btn deleteUser">-</button>
        </div>
        <table class="mb20">
          <colgroup>
            <col width="30px">
            <col width="20%">
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
            <tr v-for="user in users" :key="user.memberid">
              <td>
                <div class="check"><input type="checkbox" v-model="selected" :value="user.phonenumber" :id="user.memberid"><label :for="user.memberid"></label></div>
              </td>
              <td class="name">{{user.name}}</td>
              <td class="tel">{{user.phonenumber}}</td>
            </tr>
          </tbody>
        </table>
        <div class="paging mt20 mb20">
          <pagination class ="pagination" ref="pagination" style="margin-top: 24px;"
                      :pageData="pageSet(total, limit, this.page)"
                      @paging="getUserList"/>
        </div>
        <div class="btn-box">
          <button @click="submit" type="button" id="submitBtn" class="btn blue">확인</button>
          <button @click="cancel" type="button" id="cancel" class="btn">닫기</button>
        </div>
      </div>
    </div>
  </section>

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
  name: 'UserInfo',
  components: {
    pagination
  },
  data () {
    return {
      active: false,
      g_curWindowKey: '',
      parentKey: '',
      user: '',
      name: '',
      phonenumber: '',
      users: [],
      selected: [],
      page: 1,
      total: null,
      limit: 5,
      isShow: false
    }
  },
  created () {
    ipcRenderer.on('receiveData', this.init)
  },
  methods: {
    // 값 넘기는 부분
    init: function (event, key, data, type) {
      if (type == 'init') {
        // console.log('부모키', data)
        console.log('apikey : ', this.$store.state.apikey)
        this.parentKey = data.parentKey
        // eslint-disable-next-line camelcase
        this.g_curWindowKey = key
        this.getUserList(1)
      }
    },
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
    },
    userAdd: function () {
      if (!/^[a-z0-9_-]{8,13}$/.test(this.phonenumber)) {
        ipcRenderer.send('alert','숫자만 입력해주세요.(8~13자리)')
        this.$refs.usertelInput.focus()
      } else if (!this.phonenumber) {
        ipcRenderer.send('alert','연락처를 입력해주세요.')
        this.$refs.usertelInput.focus()
      } else if (!this.name) {
        ipcRenderer.send('alert','이름을 입력해주세요.')
        this.$refs.usernameInput.focus()
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
      // this.selected.forEach(seleted => {
      //   this.users.forEach(user => {
      //     if (user.phonenumber == seleted) {
      //       let memberid = user.memberid
      //       let test = {}
      //       axios.deleteAsyncAxios('/v2/members/' + memberid, test, test, (response) => {
      //         // console.log('delete', response)
      //       })
      //     }
      //   })
      // })
      // this.selected = []
      // this.getUserList(1)
    },
    submit: function () {
      const data = []
      this.selected.forEach(userTelData => {
        if (userTelData !== '') {
          data.push(userTelData)
        }
      })
      // key, data, type
      ipcRenderer.send('sendData', this.parentKey, data, 'userTelData')
      ipcRenderer.send('closeWindow', this.g_curWindowKey)
    },
    cancel: function () {
      ipcRenderer.send('closeWindow', this.g_curWindowKey)
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
          this.users.forEach(function (user) {
            selected.push(user.phonenumber)
            console.log('유저번호=id: ' + user.phonenumber)
            console.log('전체체크한 유저정보: ' + selected)
          })
        }
        this.selected = selected
      }
    }
  }
}
</script>
