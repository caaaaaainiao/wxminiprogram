// pages/myprize/myprize.js
//获取应用实例
const app = getApp();
const util = require('../../utils/util.js');
const md5 = require('../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    result: [],
    pageNo: 1,
    pageSize: 10,
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
    that.ask();
    wx.setNavigationBarTitle({
      title: '我的奖品'
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
    let that = this;
    wx.setNavigationBarTitle({
      title: '我的奖品'
    });
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

  lingqu: function(e) {
    var that = this;
    var prizeId = e.currentTarget.dataset.id
    that.setData({
      userPrize: true,
      prizeId: prizeId
    })
  },

  // 关闭兑换窗口
  useClose: function () {
    this.setData({
      userPrize: false
    })
  },

  // 获取核销码
  getCode: function (e) {
    let code = e.detail.value;
    this.setData({
      code: code
    })
  },

  ask: function() {
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
      url: app.globalData.url + '/userCenter/myPhysicalAwards',
      data: dataInfo,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      success: function (res) {
        if (res.data.status == 0) {
          wx.hideLoading();
          if (res.data.data.data.length > 0) {
            that.setData({
              result: that.data.result.concat(res.data.data.data),
              page: res.data.data.totalPage,
            })
          }
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
                      url: app.globalData.url + '/userCenter/myPhysicalAwards',
                      data: dataInfo,
                      method: "POST",
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        // 'cookie': wx.getStorageSync("sessionid")
                      },
                      success: function (msg) {
                        if (msg.data.status == 0) {
                          wx.hideLoading();
                          if (msg.data.data.data.length > 0) {
                            that.setData({
                              result: that.data.result.concat(msg.data.data.data),
                              page: msg.data.data.totalPage
                            })
                          }
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

  // 核销
  exchange: function () {
    let that = this;
    if (!that.data.code) {
      return;
    }
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let data = {
      openid: app.globalData.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode,
      prizeId: that.data.prizeId,
      verifyCode: that.data.code
    }
    let dataInfo = md5.md5Sign(data);
    wx.request({
      url: app.globalData.url + '/physicPrize/exchangePrize',
      data: dataInfo,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      success: function (res) {
        if (res.data.status == 0) {
          wx.hideLoading();
          wx.showToast({
            title: '核销成功！',
            mask: true
          })
          that.setData({
            userPrize: false
          })
          setTimeout(function () {
            let data = {
              openid: app.globalData.userInfo.openid,
              cinemaCode: app.globalData.cinemaCode,
              pageNo: 1,
              pageSize: that.data.pageSize
            }
            let dataInfo = md5.md5Sign(data);
            wx.request({
              url: app.globalData.url + '/userCenter/myPhysicalAwards',
              data: dataInfo,
              method: "POST",
              header: {
                "Content-Type": "application/x-www-form-urlencoded",
                // 'cookie': wx.getStorageSync("sessionid")
              },
              success: function (res) {
                if (res.data.status == 0) {
                  wx.hideLoading();
                  if (res.data.data.data.length > 0) {
                    that.setData({
                      result: res.data.data.data,
                      page: res.data.data.totalPage,
                    })
                  }
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
                              url: app.globalData.url + '/userCenter/myPhysicalAwards',
                              data: dataInfo,
                              method: "POST",
                              header: {
                                "Content-Type": "application/x-www-form-urlencoded",
                                // 'cookie': wx.getStorageSync("sessionid")
                              },
                              success: function (msg) {
                                if (msg.data.status == 0) {
                                  wx.hideLoading();
                                  if (msg.data.data.data.length > 0) {
                                    that.setData({
                                      result: msg.data.data.data,
                                      page: msg.data.data.totalPage
                                    })
                                  }
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
          }, 2000)
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
                      url: app.globalData.url + '/physicPrize/exchangePrize',
                      data: dataInfo,
                      method: "POST",
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        // 'cookie': wx.getStorageSync("sessionid")
                      },
                      success: function (msg) {
                        if (msg.data.status == 0) {
                          wx.hideLoading();
                          wx.showToast({
                            title: '核销成功！',
                            mask: true
                          })
                          that.setData({
                            userPrize: false
                          })
                          setTimeout(function () {
                            let data = {
                              openid: app.globalData.userInfo.openid,
                              cinemaCode: app.globalData.cinemaCode,
                              pageNo: 1,
                              pageSize: that.data.pageSize
                            }
                            let dataInfo = md5.md5Sign(data);
                            wx.request({
                              url: app.globalData.url + '/userCenter/myPhysicalAwards',
                              data: dataInfo,
                              method: "POST",
                              header: {
                                "Content-Type": "application/x-www-form-urlencoded",
                                // 'cookie': wx.getStorageSync("sessionid")
                              },
                              success: function (res) {
                                if (res.data.status == 0) {
                                  wx.hideLoading();
                                  if (res.data.data.data.length > 0) {
                                    that.setData({
                                      result: that.data.result.concat(res.data.data.data),
                                      page: res.data.data.totalPage,
                                    })
                                  }
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
                                              url: app.globalData.url + '/userCenter/myPhysicalAwards',
                                              data: dataInfo,
                                              method: "POST",
                                              header: {
                                                "Content-Type": "application/x-www-form-urlencoded",
                                                // 'cookie': wx.getStorageSync("sessionid")
                                              },
                                              success: function (msg) {
                                                if (msg.data.status == 0) {
                                                  wx.hideLoading();
                                                  if (msg.data.data.data.length > 0) {
                                                    that.setData({
                                                      result: that.data.result.concat(msg.data.data.data),
                                                      page: msg.data.data.totalPage
                                                    })
                                                  }
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
                          }, 2000)
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

  // 详情
  toDetail: function (e) {
    let id = e.currentTarget.dataset.id;
    let status = e.currentTarget.dataset.status;
    wx.navigateTo({
      url: '../goodsOrderDetail/goodsOrderDetail?id=' + id,
    })
  },

  toLog: function (e) {
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '../logistics/logistics?id=' + id,
    })
  }
})