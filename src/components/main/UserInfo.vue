<template>
  <section class="userInfo-container pb10">
    <div class="wrap">
      <div class="info-box">
        <div class="mt20 mb20">
          <h4>내 연락처</h4>
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
      g_curWindowKey: '',
      parentKey: '',
      user: '',
      name: '',
      phonenumber: '',
      users: [],
      selected: [],
      telValue: [],
      page: 1,
      total: null,
      limit: 6,
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
        this.parentKey = data.parentKey
        if (data.telValue.length !== 0) {
          this.telValue = data.telValue
        }
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
        let selected = []
        if (this.telValue.length !== 0) {
          this.telValue.forEach(checked => {
            if (this.users.length !== 0) {
              this.users.forEach(user => {
                if (checked.memberid === user.memberid) {
                  selected.push(user)
                }
              })
            }
          })
          this.selected = selected
        }
      })
      this.selectAll = false // 전체체크박스 해제
    },
    submit: function () {
      let data = []
      if (this.selected.length > 0) {
        this.selected.forEach(userTelData => {
          // if (userTelData !== '') {
          let users = {}
          users.memberid = userTelData.memberid
          users.name = userTelData.name
          users.phonenumber = userTelData.phonenumber
          data.push(users)
          // }
        })
      }
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
