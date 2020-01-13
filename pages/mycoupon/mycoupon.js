// pages/mycoupon/mycoupon.js
//获取应用实例
const app = getApp();
const util = require('../../utils/util.js');
const md5 = require('../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isAdd: false,
    result: [],
    pageNo: 1,
    pageSize: 10,
    couponCount: 0,
    couponNum: "",
    isShow: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        that.setData({
          userInfo: res.data
        })
      },
    })
    if (options.cinemacode) {
      that.ask1(options.cinemacode);
      app.globalData.cinemaCode = options.cinemacode;
    } else {
      that.ask();
    }
    wx.setNavigationBarTitle({
      title: '我的优惠券'
    });
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

  ask: function () {
    var that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let data = {
      openid: app.globalData.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode,
      pageNo: that.data.pageNo,
      pageSize: that.data.pageSize
    }
    let dataInfo = md5.md5Sign(data);
    wx.request({
      url: app.globalData.url + '/userCenter/myTotalCoupons',
      data: dataInfo,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      success: function (res) {
        if (res.data.status == 0) {
          wx.hideLoading();
          for (let i = 0; i < res.data.data.data.length; i++) {
            res.data.data.data[i].startTime = res.data.data.data[i].startTime.split(" ")[0]
            res.data.data.data[i].endTime = res.data.data.data[i].endTime.split(" ")[0];
          }
          that.setData({
            result: that.data.result.concat(res.data.data.data),
            page: res.data.data.totalPage,
          })
        } else if (res.data == '{code=notLogin, message=请先登录, data=null, status=1000}') {
          wx.getStorage({
            key: 'loginInfo',
            success: function (res) {
              let json = {
                openid: res.data.openid,
                cinemaCode: app.globalData.cinemaCode
              };
              let obj1 = md5.md5Sign(json);
              wx.request({
                url: app.globalData.url + '/user/miniLogin',
                data: obj1,
                method: "POST",
                header: {
                  "Content-Type": "application/x-www-form-urlencoded"
                },
                success: function (e) {
                  if (e.data.status == 0) {
                    wx.setStorage({
                      key: 'sessionid',
                      data: e.header['Set-Cookie']
                    })
                    wx.request({
                      url: app.globalData.url + '/userCenter/myTotalCoupons',
                      data: dataInfo,
                      method: "POST",
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        // 'cookie': wx.getStorageSync("sessionid")
                      },
                      success: function (msg) {
                        if (msg.data.status == 0) {
                          wx.hideLoading();
                          for (let i = 0; i < msg.data.data.data.length; i++) {
                            msg.data.data.data[i].startTime = msg.data.data.data[i].startTime.split(" ")[0]
                            msg.data.data.data[i].endTime = msg.data.data.data[i].endTime.split(" ")[0];
                          }
                          that.setData({
                            result: that.data.result.concat(msg.data.data.data),
                            page: msg.data.data.totalPage
                          })
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
                      title: e.data.status,
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

  ask1: function (code) {
    var that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let data = {
      cinemaCode: code,
      pageNo: that.data.pageNo,
      pageSize: that.data.pageSize,
      openid: app.globalData.userInfo.openid
    }
    let dataInfo = md5.md5Sign(data);
    wx.request({
      url: app.globalData.url + '/userCenter/myTotalCoupons',
      data: dataInfo,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      success: function (res) {
        if (res.data.status == 0) {
          wx.hideLoading();
          for (let i = 0; i < res.data.data.data.length; i++) {
            res.data.data.data[i].startTime = res.data.data.data[i].startTime.split(" ")[0]
            res.data.data.data[i].endTime = res.data.data.data[i].endTime.split(" ")[0];
          }
          that.setData({
            result: that.data.result.concat(res.data.data.data),
            page: res.data.data.totalPage,
          })
        } else if (res.data == '{code=notLogin, message=请先登录, data=null, status=1000}') {
          wx.getStorage({
            key: 'loginInfo',
            success: function (res) {
              let json = {
                openid: res.data.openid,
                cinemaCode: app.globalData.cinemaCode
              };
              let obj1 = md5.md5Sign(json);
              wx.request({
                url: app.globalData.url + '/user/miniLogin',
                data: obj1,
                method: "POST",
                header: {
                  "Content-Type": "application/x-www-form-urlencoded"
                },
                success: function (e) {
                  if (e.data.status == 0) {
                    wx.setStorage({
                      key: 'sessionid',
                      data: e.header['Set-Cookie']
                    })
                    wx.request({
                      url: app.globalData.url + '/userCenter/myTotalCoupons',
                      data: dataInfo,
                      method: "POST",
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        // 'cookie': wx.getStorageSync("sessionid")
                      },
                      success: function (msg) {
                        if (msg.data.status == 0) {
                          wx.hideLoading();
                          for (let i = 0; i < msg.data.data.data.length; i++) {
                            msg.data.data.data[i].startTime = msg.data.data.data[i].startTime.split(" ")[0]
                            msg.data.data.data[i].endTime = msg.data.data.data[i].endTime.split(" ")[0];
                          }
                          that.setData({
                            result: that.data.result.concat(msg.data.data.data),
                            page: msg.data.data.totalPage
                          })
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
                      title: e.data.status,
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

  toIndex: function(e) {
    var type = e.currentTarget.dataset.type;
    if (type == 2) {
      wx.switchTab({
        url: '../sell/sell',
      })
    } else {
      wx.switchTab({
        url: '../index/index',
      })
    }
  },

  // 返回首页
  back: function() {
    wx.switchTab({
      url: '../index/index'
    })
  },

  toDetail: function(e) {
    var id = e.currentTarget.dataset.id;
    var couponid = e.currentTarget.dataset.couponid;
    wx.navigateTo({
      url: '../couponDetail/couponDetail?id=' + id + '&&couponid=' + couponid,
    })
  },

  addCoupon: function () {
    this.setData({
      isAdd: true
    })
  },

  closeAdd: function () {
    this.setData({
      isAdd: false
    })
  },

  couponNum: function (e) {
    this.setData({
      couponNum: e.detail.value
    })
  },

  submitAdd: function () {
    var that = this;
    if (that.data.couponNum == '') {
      wx.showToast({
        title: '请输入兑换码',
        icon: 'none',
        mask: true
      })
      return;
    }
    wx.showLoading({
      title: '加载中',
    })
    let data = {
      cinemaCode: app.globalData.cinemaCode,
      openid: app.globalData.userInfo.openid,
      couponCode: that.data.couponNum
    }
    let dataInfo = md5.md5Sign(data);
    wx.request({
      url: app.globalData.url + '/userCenter/bindCoupon',
      data: dataInfo,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      success: function (res) {
        if (res.data.status == 0) {
          wx.hideLoading();
          wx.showToast({
            title: '绑定成功',
          })
          that.setData({
            couponNum: ''
          })
          setTimeout(function(){
            wx.redirectTo({
              url: '/pages/mycoupon/mycoupon',
            })
          },1000)
        } else if (res.data == '{code=notLogin, message=请先登录, data=null, status=1000}') {
          wx.getStorage({
            key: 'loginInfo',
            success: function (res) {
              let json = {
                openid: res.data.openid,
                cinemaCode: app.globalData.cinemaCode
              };
              let obj1 = md5.md5Sign(json);
              wx.request({
                url: app.globalData.url + '/user/miniLogin',
                data: obj1,
                method: "POST",
                header: {
                  "Content-Type": "application/x-www-form-urlencoded"
                },
                success: function (e) {
                  if (e.data.status == 0) {
                    wx.setStorage({
                      key: 'sessionid',
                      data: e.header['Set-Cookie']
                    })
                    wx.request({
                      url: app.globalData.url + '/userCenter/bindCoupon',
                      data: dataInfo,
                      method: "POST",
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded",
                      },
                      success: function (msg) {
                        if (msg.data.status == 0) {
                          wx.hideLoading();
                          wx.showToast({
                            title: '绑定成功',
                          })
                          that.setData({
                            couponNum: ''
                          })
                          setTimeout(function () {
                            wx.redirectTo({
                              url: '/pages/mycoupon/mycoupon',
                            })
                          }, 1000)
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
                    that.setData({
                      couponNum: ''
                    })
                    wx.showToast({
                      title: e.data.status,
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
      that.ask();
    }
  },

  getScanCode: function () {
    let that = this;
    wx.scanCode({
      success: (res) => {
        wx.showLoading({
          title: '加载中',
        })
        let data = {
          cinemaCode: app.globalData.cinemaCode,
          openid: app.globalData.userInfo.openid,
          couponCode: res.result
        }
        let dataInfo = md5.md5Sign(data);
        wx.request({
          url: app.globalData.url + '/userCenter/bindCoupon',
          data: dataInfo,
          method: "POST",
          header: {
            "Content-Type": "application/x-www-form-urlencoded",
          },
          success: function (res) {
            if (res.data.status == 0) {
              wx.hideLoading();
              wx.showToast({
                title: '绑定成功',
              })
              that.setData({
                couponNum: ''
              })
              setTimeout(function () {
                wx.redirectTo({
                  url: '/pages/mycoupon/mycoupon',
                })
              }, 1000)
            } else if (res.data == '{code=notLogin, message=请先登录, data=null, status=1000}') {
              wx.getStorage({
                key: 'loginInfo',
                success: function (res) {
                  let json = {
                    openid: res.data.openid,
                    cinemaCode: app.globalData.cinemaCode
                  };
                  let obj1 = md5.md5Sign(json);
                  wx.request({
                    url: app.globalData.url + '/user/miniLogin',
                    data: obj1,
                    method: "POST",
                    header: {
                      "Content-Type": "application/x-www-form-urlencoded"
                    },
                    success: function (e) {
                      if (e.data.status == 0) {
                        wx.setStorage({
                          key: 'sessionid',
                          data: e.header['Set-Cookie']
                        })
                        wx.request({
                          url: app.globalData.url + '/userCenter/bindCoupon',
                          data: dataInfo,
                          method: "POST",
                          header: {
                            "Content-Type": "application/x-www-form-urlencoded",
                          },
                          success: function (msg) {
                            if (msg.data.status == 0) {
                              wx.hideLoading();
                              wx.showToast({
                                title: '绑定成功',
                              })
                              that.setData({
                                couponNum: ''
                              })
                              setTimeout(function () {
                                wx.redirectTo({
                                  url: '/pages/mycoupon/mycoupon',
                                })
                              }, 1000)
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
                        that.setData({
                          couponNum: ''
                        })
                        wx.showToast({
                          title: e.data.status,
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
      }
    })
  }
})