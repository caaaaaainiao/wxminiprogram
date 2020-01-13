// pages/openCard/openCard.js
//获取应用实例
const app = getApp();
const util = require('../../utils/util.js');
const md5 = require('../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    sex: "1",
    passward: "",
    passward2: "",
    birthday: "",
    name: "",
    cardId: '120101200005299837', //身份证号码
    isShow: false,
    cinematype: 1,
    showAlertExchange2: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    var that = this;
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        that.setData({
          userInfo: res.data
        })
      },
    })
    that.queryOpenRules();
    // 满天星需要输入身份证号码
    if (app.globalData.ticketingSystemType == 4) {
      that.setData({
        isShow: true,
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this;
    that.queryOpenRules();
    if (app.globalData.ticketingSystemType == 4) {
      that.setData({
        isShow: true,
      })
    }
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    if (app.globalData.miniShareTitle && app.globalData.miniShareTitle != '') {
      if (app.globalData.miniSharePosters && app.globalData.miniSharePosters != '') {
        return {
          title: app.globalData.miniShareTitle,
          path: '/pages/index/index?shareUserMobile=' + this.data.userInfo.userMobile,
          imageUrl: app.globalData.miniSharePosters
        }
      } else {
        return {
          title: app.globalData.miniShareTitle,
          path: '/pages/index/index?shareUserMobile=' + this.data.userInfo.userMobile
        }
      }
    } else if (app.globalData.miniSharePosters && app.globalData.miniSharePosters != '') {
      if (app.globalData.miniShareTitle && app.globalData.miniShareTitle != '') {
        return {
          title: app.globalData.cinemaList.cinemaName,
          path: '/pages/index/index?shareUserMobile=' + this.data.userInfo.userMobile,
          imageUrl: app.globalData.miniSharePosters
        }
      } else {
        return {
          title: app.globalData.miniShareTitle,
          path: '/pages/index/index?shareUserMobile=' + this.data.userInfo.userMobile,
          imageUrl: app.globalData.miniSharePosters
        }
      }
    } else {
      return {
        title: app.globalData.cinemaList.cinemaName,
        path: '/pages/index/index?shareUserMobile=' + this.data.userInfo.userMobile
      }
    }
  },
  // 查询开卡规则
  queryOpenRules: function () {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let that = this;
    let data = {
      openid: app.globalData.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode
    }
    let dataInfo = md5.md5Sign(data);
    wx.request({
      url: app.globalData.url + '/memberCard/queryMemberCardOpenRules',
      data: dataInfo,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      success: function (res) {
        if (res.data.status == 0) {
          wx.hideLoading();
          that.setData({
            openRule: res.data.data,
            payFee: res.data.data.cardCostFee + res.data.data.memberFee,
            credit: res.data.data.cardCostFee + res.data.data.memberFee + res.data.data.rechargeAmount
          })
        } else if (res.data == "{code=notLogin, message=请先登录, data=null, status=1000}") {
          wx.getStorage({
            key: 'loginInfo',
            success: function (result) {
              let json = {
                openid: result.data.openid,
                cinemaCode: app.globalData.cinemaCode
              };
              let obj1 = util.md5Sign(json);
              wx.request({
                url: app.globalData.url + '/user/miniLogin',
                data: obj1,
                method: "POST",
                header: {
                  "Content-Type": "application/x-www-form-urlencoded",
                },
                success: function (e) {
                  if (e.data.status == 0) {
                    if (e.header['Set-Cookie']) {
                      wx.setStorage({
                        key: 'sessionid',
                        data: e.header['Set-Cookie'],
                      })
                    }
                    wx.request({
                      url: app.globalData.url + '/memberCard/queryMemberCardOpenRules',
                      data: dataInfo,
                      method: "POST",
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        // 'cookie': e.header['Set-Cookie']
                      },
                      success: function (msg) {
                        if (msg.data.status == 0) {
                          wx.hideLoading();
                          that.setData({
                            openRule: res.data.data,
                            payFee: res.data.data.cardCostFee + res.data.data.memberFee,
                            credit: res.data.data.cardCostFee + res.data.data.memberFee + res.data.data.rechargeAmount
                          })
                          app.globalData.ticketingSystemType = res.data.data.ticketingSystemType;
                        } else {
                          wx.hideLoading();
                          wx.showToast({
                            title: msg.data.message,
                            icon: 'none',
                            mask: true
                          })
                        }
                      }
                    })
                  } else {
                    wx.hideLoading();
                    wx.showToast({
                      title: e.data.message,
                      icon: 'none',
                      mask: true
                    })
                  }
                }
              })
            },
          })
        } else {
          wx.hideLoading();
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            mask: true
          })
        }
      }
    })
  },

  setPassword: function(e) {
    this.setData({
      passward: e.detail.value
    })
  },
  surePassword: function(e) {
    this.setData({
      passward2: e.detail.value
    })
  },
  setName: function(e) {
    this.setData({
      name: e.detail.value
    })
  },
  setEmployeeCode: function (e) {
    this.setData({
      employeeCode: e.detail.value
    })
  },
  getId: function(e) {
    this.setData({
      cardId: e.detail.value
    })
  },
  // 查看会员协议
  cinemaAgreement: function () {
    let that = this;
    that.setData({
      showMemberCardMessage: true,
      memberCardAgreement: app.globalData.membershipServiceAgreement,
    })
  },

  // 关闭会员协议
  close: function () {
    let that = this;
    that.setData({
      showMemberCardMessage: false,
    })
  },
  setSex: function(e) {
    this.setData({
      sex: e.currentTarget.dataset.sex
    })
  },
  setBirthday: function(e) {
    this.setData({
      birthday: e.detail.value
    })
  },
  closeShow: function() {
    let that = this;
    that.setData({
      showAlertExchange2: !that.data.showAlertExchange2
    })
  },

  // 开卡
  open: function() {
    var that = this;
    var Num = /^(((13[0-9]{1})|(15[0-9]{1})|(18[0-9]{1})|(17[0-9]{1}))+\d{8})$/;
    if (that.data.passward == '' || that.data.name == '' || that.data.index002 == '') {
      wx.showToast({
        title: '请填写必要信息！',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    if (that.data.passward != that.data.passward2) {
      wx.showToast({
        title: '密码不一致！',
        icon: 'none',
        duration: 2000
      })
      return;
    }
    wx.showModal({
      title: '是否立即开卡',
      content: '您当前所处（' + app.globalData.cinemaList.cinemaName + '）请确保填入的信息准确无误',
      success(res) {
        if (res.confirm) { // 点击确认则开卡
          wx.showLoading({
            title: '加载中',
            mask: true
          });
          let data = {};
          if (app.globalData.ticketingSystemType == 4) {
            if (that.data.employeeCode && that.data.employeeCode != '') {
              data.employeeCode = that.data.employeeCode;
            }
            data.openid = app.globalData.userInfo.openid;
            data.cinemaCode = app.globalData.cinemaCode;
            data.cardPassWord = that.data.passward;
            data.userName = that.data.name;
            data.userMobile = that.data.userInfo.userMobile;
            data.idCardNumber = that.data.cardId;
            data.sex = that.data.sex;
            data.birthDay = that.data.birthday;
          } else {
            if (that.data.employeeCode && that.data.employeeCode != '') {
              data.employeeCode = that.data.employeeCode;
            }
              data.openid = app.globalData.userInfo.openid;
              data.cinemaCode = app.globalData.cinemaCode;
              data.cardPassWord = that.data.passward;
              data.idCardNumber = that.data.cardId;
              data.userName = that.data.name;
              data.userMobile = that.data.userInfo.userMobile;
              data.sex = that.data.sex;
              data.birthDay = that.data.birthday;
          }
          let dataInfo = md5.md5Sign(data)
            wx.request({
              url: app.globalData.url + '/memberCard/registerMemberCard',
              data: dataInfo,
              method: "POST",
              header: {
                "Content-Type": "application/x-www-form-urlencoded",
                // 'cookie': wx.getStorageSync("sessionid")
              },
              success: function (res) {
                if (res.data.status == 0) {
                  wx.hideLoading();
                  if (res.data.data.payStatus == 1) {
                    wx.showToast({
                      title: '开卡成功！',
                      mask: true
                    })
                    setTimeout(function () {
                      wx.redirectTo({
                        url: '../mycard/mycard',
                      })
                    }, 2000)
                  }
                  if (res.data.data.payStatus == 2) { // 需支付
                    wx.requestPayment({
                      timeStamp: res.data.data.timeStamp,
                      nonceStr: res.data.data.nonceStr,
                      package: res.data.data.package,
                      signType: 'MD5',
                      paySign: res.data.data.paySign,
                      success(e) {
                        wx.showToast({
                          title: '开卡成功！',
                          mask: true
                        })
                        setTimeout(function () {
                          wx.redirectTo({
                            url: '../mycard/mycard',
                          })
                        }, 2000)
                      }
                    })
                  }
                } else {
                  wx.hideLoading();
                  wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    mask: true
                  })
                }
              }
            })
        } else if (res.cancel) {
          return
        }
      }
    })
  }
})