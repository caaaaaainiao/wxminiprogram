// pages/phoneYZM.js
const app = getApp()
const util = require('../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    codes: '获取验证码',
    modalHidden: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        that.setData({
          openid: res.data.openid,
          cinemaCode: options.cinemaCode,
          userInfo: res.data,
          logo: app.globalData.logo
        })
      },
    })
    wx.getStorage({
      key: 'shareInfo',
      success: function (res) {
        that.setData({
          shareInfo: res.data
        })
      },
    })
    wx.getStorage({
      key: 'employeeCode',
      success: function (res) {
        that.setData({
          employeeCode: res.data
        })
      },
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

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

  //点击注册
  login: function () {
    let that = this;
    if (!that.data.phoneNumber) {
      wx.showToast({
        title: '请输入手机号！',
        icon: 'none',
        mask: true
      })
      return;
    }
    if (that.data.phoneNumber.length != 11) {
      wx.showToast({
        title: '请输入正确手机号码！',
        icon: 'none',
        mask: true
      })
      return;
    }
    if (!that.data.codeNumber) {
      wx.showToast({
        title: '请输入验证码！',
        icon: 'none',
        mask: true
      })
      return;
    }
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        let info = res.data;
        wx.showToast({
          title: '注册中',
          icon: "loading",
          mask: true
        })
        let shareUserMobile = '';
        let employeeCode = '';
        if (that.data.shareInfo && that.data.shareInfo.shareUserMobile) {
          shareUserMobile = that.data.shareInfo.shareUserMobile
        }
        if (that.data.employeeCode) {
          employeeCode = that.data.employeeCode
        }
        let json = {
          cinemaCode: that.data.cinemaCode,
          openid: that.data.openid,
          mobile: that.data.phoneNumber,
          validateCode: that.data.codeNumber,
          userName: info.userName,
          userSex: info.userSex,
          birthday: info.birthday,
          city: info.city,
          country: info.country,
          province: info.province,
          userHeadPic: info.userHeadPic,
          shareUserMobile: shareUserMobile,
          employeeCode: employeeCode
        }
        let obj1 = util.md5Sign(json)
        wx.request({
          url: app.globalData.url + '/user/miniManualRegister',
          data: obj1,
          method: "POST",
          header: {
            "Content-Type": "application/x-www-form-urlencoded",
            // 'cookie': wx.getStorageSync("sessionid")
          },
          success(e) {
            wx.hideLoading();
            if (e.data.status == 0) {
              app.globalData.userInfo = res.data.data;
              wx.setStorage({
                key: 'loginInfo',
                data: e.data.data,
              })
              if (e.data.data.registerDialog && e.data.data.registerDialog != '') {
                that.setData({
                  image: e.data.data.registerDialog,
                  modalHidden: false
                })
              } else {
                wx.switchTab({
                  url: '../index/index',
                })
              }
            } else {
              wx.showToast({
                title: e.data.message,
                icon: "none"
              })
            }
          }
        })
      },
    })
  },

  // 获取验证码
  getCode: function () {
    let that = this;
    if (!that.data.phoneNumber) {
      wx.showToast({
        title: '请输入手机号！',
        icon: 'none',
        mask: true
      })
      return;
    }
    if (that.data.phoneNumber.length != 11) {
      wx.showToast({
        title: '请输入正确手机号码！',
        icon: 'none',
        mask: true
      })
      return;
    }
    if (that.data.codes != '获取验证码') {
      return
    }
    wx.showLoading({
      title: '发送中',
      mask: true
    })
    let time = 60;
    var intervalId = setInterval(function () {
      wx.hideLoading();
      time --;
      that.setData({
        codes: time + '秒后重发'
      })
      if (time == 0) {
        clearInterval(intervalId);
        that.setData({
          codes: '获取验证码'
        })
      }
    }, 1000)
    let json = {
      from: "miniRegister",
      mobile: that.data.phoneNumber,
      cinemaCode: that.data.cinemaCode,
      openid: that.data.openid
    }
    let obj1 = util.md5Sign(json)
    wx.request({
      url: app.globalData.url + '/user/miniRegisterCode',
      data: obj1,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      success: function (res) {
        if (res.data.status != 0) {
          wx.showToast({
            title: res.data.message,
            icon: "none",
            mask: true
          })
        }
      }
    })
  },

  // 获取手机号码
  getMobile: function (e) {
    let that = this;
    that.setData({
      phoneNumber: e.detail.value
    })
  },

  // 获取用户输入的验证码
  getCodeNumber: function (e) {
    let that = this;
    that.setData({
      codeNumber: e.detail.value
    })
  },

  /**
 * 点击取消
 */
  modalCandel: function () {
    this.setData({
      modalHidden: true
    })
    wx.switchTab({
      url: '../index/index',
    })
  },

  /**
   *  点击确认
   */
  modalConfirm: function () {
    // do something
    this.setData({
      modalHidden: true
    })
    wx.redirectTo({
      url: '../mycoupon/mycoupon?cinemacode=' + this.data.currentCode,
    })
  },
})