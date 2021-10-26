<template>
  <section class="userInfo-container pd40">
    <div class="wrap">
      <div class="info-box">
        <div class="btn-box mb20">
          <button type="button" class="btn blue addUser">+</button>
          <button type="button" class="btn deleteUser">-</button>
        </div>
        <table class="mb20">
          <colgroup>
            <col width="30px">
            <col width="15%">
            <col width="*">
          </colgroup>
          <thead>
            <tr>
              <th>
                <div class="check">
                  <input type="checkbox" id="allCheck">
                  <label for="allCheck"></label>
                </div>
              </th>
              <th class="name">이름</th>
              <th>연락처</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>
                <div class="check"><input type="checkbox" id=""><label for=""></label></div>
              </td>
              <td class="name"></td>
              <td class="tel"></td>
            </tr>
          </tbody>
        </table>
        <div class="btn-box">
          <button type="button" id="submitBtn" class="btn blue">확인</button>
          <button type="button" id="cancel" class="btn">닫기</button>
        </div>
      </div>
    </div>
  </section>

  <div class="bg"></div>
  <div class="user-info-add">
    <div class="inner">
      <button class="close" type="button"><i class="fas fa-times"></i></button>
      <div class="box flex-box mb20">
        <input type="text" placeholder="이름" id="info-name" class="name">
        <input type="tel" placeholder="연락처" id="info-tel">
      </div>
      <div class="btn-box">
        <button id="addCheck" class="btn" type="button" >추가</button>
      </div>
    </div>
  </div>
</template>
