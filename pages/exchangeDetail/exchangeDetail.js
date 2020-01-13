// pages/exchangeDetail.js
const app = getApp();
const util = require('../../utils/util.js');
const md5 = require('../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    pageNo: 1,
    pageSize: 10,
    result: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        that.setData({
          userInfo: res.data
        })
      },
    })
    wx.setNavigationBarTitle({
      title: '兑换明细'
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    this.getDetail();
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

  // 查询兑换明细
  getDetail: function () {
    let that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let data = {
      cinemaCode: app.globalData.cinemaCode,
      pageNo: that.data.pageNo,
      pageSize: that.data.pageSize,
      openid: app.globalData.userInfo.openid
    }
    let dataInfo = md5.md5Sign(data)
    wx.request({
      url: app.globalData.url + '/acquireGold/getIntegrateChange',
      data: dataInfo,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      method: 'POST',
      success: function (res) {
        if (res.data.status == 0) {
          wx.hideLoading();
          if (res.data.data.data.length > 0) {
            that.setData({
              result: that.data.result.concat(res.data.data.data),
              page: res.data.data.totalPage,
            })
          }
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
                      url: app.globalData.url + '/acquireGold/getIntegrateChange',
                      data: dataInfo,
                      method: "POST",
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        // 'cookie': e.header['Set-Cookie']
                      },
                      success: function (msg) {
                        if (msg.data.status == 0) {
                          wx.hideLoading();
                          if (msg.data.data.length > 0) {
                            that.setData({
                              result: that.data.result.concat(msg.data.data.data),
                              page: msg.data.data.totalPage
                            })
                          }
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
  },

  searchScrollLower: function () {
    let that = this;
    let pageNo = that.data.pageNo;
    let page = that.data.page;
    if (pageNo + 1 > page) {
      return
    } else {
      that.setData({
        pageNo: pageNo + 1, //每次触发上拉事件，把pageNo+1  
      });
      that.getDetail();
    }
  }
})