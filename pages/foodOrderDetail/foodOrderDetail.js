  // pages/orderDetail/orderDetail.js
  //获取应用实例
  const app = getApp();
  const util = require('../../utils/util.js');
  const md5 = require('../../utils/md5.js');
  Page({

    /**
     * 页面的初始数据
     */
    data: {
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function(options) {
      let that = this;
      that.setData({
        orderNum: options.orderNum,
      });
      wx.getStorage({
        key: 'loginInfo',
        success: function (res) {
          that.setData({
            userInfo: res.data
          })
        },
      })
      that.foodOrderDetail(options.orderNum);
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function() {
    },

    phone: function(e) {
      var phone = e.currentTarget.dataset.phone;
      wx.makePhoneCall({
        phoneNumber: phone,
      })
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
    foodOrderDetail: function (code) {
      let that = this;
      let data = {
        unifiedOrderNo: code,
        openid: app.globalData.userInfo.openid,
        cinemaCode: app.globalData.cinemaCode
      }
      let dataInfo = md5.md5Sign(data)
      wx.request({
        url: app.globalData.url + '/miniMerchandise/queryMerchandiseOrder',
        data: dataInfo,
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
          // 'cookie': wx.getStorageSync("sessionid")
        },
        method: 'POST',
        success: function (res) {
          console.log(res)
          if (res.data.status == 0) {
            wx.hideLoading();
            that.setData({
              order: res.data.data
            })
          } else if (res.data == "{code=notLogin, message=请先登录, data=null, status=1000}") {
            wx.getStorage({
              key: 'loginInfo',
              success: function (result) {
                let json = {
                  openid: result.data.openid,
                  cinemaCode: app.globalData.cinemaCode
                };
                let obj1 = md5.md5Sign(json);
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
                        url: app.globalData.url + '/miniMerchandise/queryMerchandiseOrder',
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
                              order: msg.data.data
                            })
                          } else {
                            wx.hideLoading();
                            wx.showToast({
                              title: msg.data.message,
                              mask: true,
                              icon: 'none'
                            })
                          }
                        }
                      })
                    } else {
                      wx.hideLoading();
                    }
                  }
                })
              },
              fail: function () {
                wx.hideLoading();
              }
            })
          } else {
            wx.hideLoading();
            wx.showToast({
              title: res.data.message,
              mask: true,
              icon: 'none'
            })
          }
        }
      })
    }

  })