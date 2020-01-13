// pages/common/common.js
//获取应用实例
const app = getApp();
const util = require('../../utils/util.js');
const md5 = require('../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    sexArr: ["男", "女"],
    userInfo: null,
    // phone: null,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function() {
    var that = this;
    // 获取用户信息
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        if (res.errMsg == 'getStorage:ok') {
          that.setData({
            userInfo: res.data,
            sex: res.data.userSex,
            nickName: res.data.userName,
            headUrl: res.data.userHeadPic,
          })
        }
      },
    })
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
  // 修改头像
  imgChange: function() {
    var that = this;
    wx.chooseImage({
      count: 1,
      success(res) {
        const tempFilePaths = res.tempFilePaths
        wx.uploadFile({
          url: app.globalData.url + '/user/uploadHeadPic',
          filePath: tempFilePaths[0],
          name: 'file',
          header: {
            'charset': 'UTF - 8'
          },
          success(res) {
            console.log(JSON.parse(res.data))
            if (JSON.parse(res.data).status == 0) {
              var userInfo = that.data.userInfo;
              userInfo.headlmgUrl = JSON.parse(res.data).data
              let data = {
                openid: that.data.userInfo.openid,
                cinemaCode: app.globalData.cinemaCode,
                userName: that.data.nickName,
                userSex: that.data.sex,
                birthday: that.data.birthday,
                userHeadPic: userInfo.headlmgUrl
              }
              let dataInfo = md5.md5Sign(data)
              wx.request({
                url: app.globalData.url + '/user/miniUpdateInfo',
                data: dataInfo,
                method: "POST",
                header: {
                  // "Content-Type": "application/x-www-form-urlencoded",
                  // 'cookie': wx.getStorageSync("sessionid")
                },
                success: function (res) {
                  if (res.data.status == 0) {
                    that.setData({
                      userInfo: userInfo,
                      headUrl: userInfo.headlmgUrl
                    })
                    app.globalData.userInfo.headlmgUrl = userInfo.headlmgUrl
                    wx.getStorage({
                      key: 'accredit',
                      success: function (res) {
                        res.data.userInfo.avatarUrl = userInfo.headlmgUrl
                        var oRes = res
                        console.log(oRes)
                        wx.setStorage({
                          key: 'accredit',
                          data: res.data,
                        })
                      },
                    });
                    app.globalData.userInfo.userHeadPic = userInfo.headlmgUrl
                    wx.getStorage({
                      key: 'loginInfo',
                      success: function (res) {
                        res.data.userHeadPic = userInfo.headlmgUrl
                        var oRes = res
                        console.log(oRes)
                        wx.setStorage({
                          key: 'loginInfo',
                          data: res.data,
                        })
                      },
                    })
                    wx.showToast({
                      title: '修改成功',
                    })
                  } else {
                    wx.showToast({
                      title: res.data.message,
                      icon: 'none',
                      mask: true
                    })
                  }
                  wx.hideLoading();
                }
              })
            } else {
              wx.showToast({
                title: '更改头像失败',
                mask: true,
                icon: 'none'
              })
            }
          }
        })
      }
    })
  },

  bindSexChange: function(e) { //性别
    let that = this;
    var sex = parseInt(e.detail.value) + 1;
    var userInfo = that.data.userInfo;
    userInfo.sex = sex;
    that.setData({
      sex: sex,
    })
    wx.showLoading({
      title: '加载中',
    })
    let data = {
      openid: that.data.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode,
      userName: that.data.nickName,
      userSex: sex,
      birthday: that.data.birthday,
    }
    let dataInfo = md5.md5Sign(data)
    wx.request({
      url: app.globalData.url + '/user/miniUpdateInfo',
      data: dataInfo,
      method: "POST",
      header: {
        // "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      success: function (res) {
        if (res.data.status == 0) {
          wx.showToast({
            title: '修改成功',
          })
          wx.setStorage({
            key: 'loginInfo',
            data: that.data.userInfo,
          })
          app.globalData.userInfo = that.data.userInfo;
          wx.getStorage({
            key: 'loginInfo',
            success: function (res) {
              res.data.userName = that.data.userInfo.userName
              var oRes = res
              console.log(oRes)
              wx.setStorage({
                key: 'loginInfo',
                data: res.data,
              })
            },
          })
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            mask: true
          })
        }
        wx.hideLoading();
      }
    })
  },

  nameChange: function(e) {
    var that = this;
    var name = e.detail.value;
    var userInfo = that.data.userInfo;
    userInfo.userName = name;
    that.setData({
      nickName: name,
      userInfo: userInfo,
    })
    var nowtime = new Date().getTime();
    var userInfo = that.data.userInfo;
    if (userInfo.birthday == null) {
      userInfo.birthday = ""
    }
    wx.showLoading({
      title: '加载中',
    })
    let data = {
      openid: that.data.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode,
      userName: that.data.nickName,
      userSex: that.data.sex,
      birthday: that.data.birthday,
    }
    let dataInfo = md5.md5Sign(data)
    wx.request({
      url: app.globalData.url + '/user/miniUpdateInfo',
      data: dataInfo,
      method: "POST",
      header: {
        // "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      success: function(res) {
        if (res.data.status == 0) {
          wx.showToast({
            title: '修改成功',
          })
          wx.setStorage({
            key: 'loginInfo',
            data: that.data.userInfo,
          })
          app.globalData.userInfo = that.data.userInfo;
          wx.getStorage({
            key: 'loginInfo',
            success: function (res) {
              res.data.userName = that.data.userInfo.userName
              var oRes = res
              console.log(oRes)
              wx.setStorage({
                key: 'loginInfo',
                data: res.data,
              })
            },
          })
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            mask: true
          })
        }
        wx.hideLoading();
      }
    })
  },
})