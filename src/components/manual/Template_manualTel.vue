<template>
    <div class = "userInfo-container">
      <div class="info-box">
        <div class="flex-center mt10 mb10">
          <h4>내 연락처 관리</h4>
          <div class="btn-box">
<!--            <button @click="active = !active" :aria-pressed="active ? 'true' : 'false'" type="button" class="btn blue h30 addUser">추가</button>-->
            <button @click="userAddActive" :aria-pressed="active ? 'true' : 'false'" type="button" class="btn blue h30 addUser">추가</button>
            <button @click="userModifyActive" :aria-pressed="active ? 'true' : 'false'" type="button" class="btn blue h30 addUser">편집</button>
            <button @click="userDel" type="button" class="btn h30 deleteUser">삭제</button>
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
            <tr v-show="isShow" class="no-result">
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
    <div class="bg" :class="{view:active}"></div>
    <div class="user-info-add" :class="{view:active}">
      <div class="inner">
        <button @click="active = false" class="close"><i class="fas fa-times"></i></button>
        <div class="box flex-box mb20">
          <input v-model="name" ref="usernameInput" type="text" placeholder="이름" id="info-name" class="name">
          <input v-model="phonenumber" ref="usertelInput" type="tel" placeholder="연락처" id="info-tel" maxlength="13">
        </div>
        <div class="btn-box">
          <button @click="userAdd" id="addCheck" class="btn" type="button" v-show="isNew">추가</button>
          <button @click="userAdd" class="btn" type="button" v-show="!isNew">수정</button>
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
      /* 멤버관리 */
      user: '',
      name: '',
      phonenumber: '',
      users: [],
      selected: [],
      active: false,
      isNew: true,
      memberid: '',
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
    },
    /* 멤버 관리 */
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
    userAddActive: function () {
      this.name = ''
      this.phonenumber = ''
      this.active = true
      this.isNew = true
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
        if (this.isNew) {
          axios.postAsyncAxios('/v2/members', JSON.stringify(body), null, (response) => {
            this.getUserList(1)
          })
        } else if (!this.isNew) {
          body.memberid = this.memberid
          axios.putAsyncAxios('/v2/members/' + this.memberid, JSON.stringify(body), null, (response) => {
            this.getUserList(this.page)
          })
        }
        this.name = ''
        this.phonenumber = ''
      }
    },
    userModifyActive: function () {
      this.isNew = false
      if (this.selected.length === 0) {
        ipcRenderer.send('alert', '편집할 연락처를 선택해주세요.')
      } else if (this.selected.length !== 1) {
        ipcRenderer.send('alert', '연락처 편집은 단일 선택만 가능합니다.')
      } else {
        let item = custom.proxy2map(this.selected)
        this.name = item[0].name
        this.phonenumber = item[0].phonenumber
        this.memberid = item[0].memberid
        this.active = true
      }
    },
    userDel: function () {
      if (this.selected.length === 0) {
        ipcRenderer.send('alert', '삭제할 연락처를 선택해주세요.')
      } else {
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
      }
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
