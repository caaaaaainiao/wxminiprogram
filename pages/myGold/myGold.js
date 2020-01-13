// pages/myGold.js
const app = getApp();
const util = require('../../utils/util.js');
const md5 = require('../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: 1,
    getPageNo: 1,
    getPageSize: 10,
    usePageNo: 1,
    usePageSize: 10,
    getResult: [],
    useResult: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        that.setData({
          userInfo: res.data
        })
      },
    })
    that.getGold();
    that.getGotRecord();
    wx.setNavigationBarTitle({
      title: '积分换金币'
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

  // 分页加载数据
  searchGotScrollLower: function() {
    let that = this;
    let page = that.data.getPage;
    let getPageNo = that.data.getPageNo + 1;
    if (getPageNo > page) {
      return
    } else {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      let data = {
        type: 1,
        pageNo: getPageNo,
        pageSize: that.data.getPageSize,
        openid: app.globalData.userInfo.openid,
        cinemaCode: app.globalData.cinemaCode
      }
      let dataInfo = md5.md5Sign(data);
      wx.request({
        url: app.globalData.url + '/userCenter/myGoldChangeRecord',
        data: dataInfo,
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
          // 'cookie': wx.getStorageSync("sessionid")
        },
        method: 'POST',
        success: function (res) {
          if (res.data.status == 0) {
            wx.hideLoading();
            that.setData({
              getResult: that.data.getResult.concat(res.data.data.data),
              getPage: res.data.data.totalPage,
              getPageNo: getPageNo
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
                        url: app.globalData.url + '/userCenter/myGoldChangeRecord',
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
                              result: that.data.getResult.concat(msg.data.data.data),
                              getPage: msg.data.data.totalPage,
                              getPageNo: getPageNo
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
  },

  searchUseScrollLower: function () {
    let that = this;
    let page = that.data.usePage;
    let usePageNo = that.data.usePageNo + 1;
    if (usePageNo > page) {
      return
    } else {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      let data = {
        type: 2,
        pageNo: usePageNo,
        pageSize: that.data.usePageSize,
        openid: app.globalData.userInfo.openid,
        cinemaCode: app.globalData.cinemaCode
      }
      let dataInfo = md5.md5Sign(data);
      wx.request({
        url: app.globalData.url + '/userCenter/myGoldChangeRecord',
        data: dataInfo,
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
          // 'cookie': wx.getStorageSync("sessionid")
        },
        method: 'POST',
        success: function (res) {
          if (res.data.status == 0) {
            wx.hideLoading();
            that.setData({
              useResult: that.data.useResult.concat(res.data.data.data),
              usePage: res.data.data.totalPage,
              usePageNo: usePageNo
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
                        url: app.globalData.url + '/userCenter/myGoldChangeRecord',
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
                              useResult: that.data.useResult.concat(msg.data.data.data),
                              usePage: msg.data.data.totalPage,
                              usePageNo: usePageNo
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
  },

  // 查询金币
  getGold: function() {
    let that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let data = {
      openid: app.globalData.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode
    }
    let dataInfo = md5.md5Sign(data);
    wx.request({
      url: app.globalData.url + '/userCenter/myGoldNumber',
      data: dataInfo,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      method: 'POST',
      success: function(res) {
        if (res.data.status == 0) {
          wx.hideLoading();
          that.setData({
            goldNumber: res.data.data.goldNumber,
            expireNumber: res.data.data.expireNumber
          })
        } else if (res.data == "{code=notLogin, message=请先登录, data=null, status=1000}") {
          wx.getStorage({
            key: 'loginInfo',
            success: function(result) {
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
                success: function(e) {
                  if (e.data.status == 0) {
                    if (e.header['Set-Cookie']) {
                      wx.setStorage({
                        key: 'sessionid',
                        data: e.header['Set-Cookie'],
                      })
                    }
                    wx.request({
                      url: app.globalData.url + '/userCenter/myGoldNumber',
                      data: dataInfo,
                      method: "POST",
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        // 'cookie': e.header['Set-Cookie']
                      },
                      success: function(msg) {
                        if (msg.data.status == 0) {
                          wx.hideLoading();
                          that.setData({
                            goldNumber: msg.data.data.goldNumber,
                            expireNumber: msg.data.data.expireNumber
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
            fail: function() {
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

  gotGold: function() {
    let that = this;
    that.setData({
      type: 1
    })
    that.getGotRecord();
  },

  useGold: function() {
    let that = this;
    that.setData({
      type: 2
    })
    that.getUseRecord();
  },

  // 获取记录
  getGotRecord: function() {
    let that = this;
    if (that.data.getPageNo > 1) {
      return
    }
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let data = {
      type: 1,
      pageNo: that.data.pageNo,
      pageSize: that.data.getPageSize,
      openid: app.globalData.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode
    }
    let dataInfo = md5.md5Sign(data);
    wx.request({
      url: app.globalData.url + '/userCenter/myGoldChangeRecord',
      data: dataInfo,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      method: 'POST',
      success: function(res) {
        if (res.data.status == 0) {
          wx.hideLoading();
          that.setData({
            getResult: res.data.data.data,
            getPage: res.data.data.totalPage
          })
        } else if (res.data == "{code=notLogin, message=请先登录, data=null, status=1000}") {
          wx.getStorage({
            key: 'loginInfo',
            success: function(result) {
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
                success: function(e) {
                  if (e.data.status == 0) {
                    if (e.header['Set-Cookie']) {
                      wx.setStorage({
                        key: 'sessionid',
                        data: e.header['Set-Cookie'],
                      })
                    }
                    wx.request({
                      url: app.globalData.url + '/userCenter/myGoldChangeRecord',
                      data: dataInfo,
                      method: "POST",
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        // 'cookie': e.header['Set-Cookie']
                      },
                      success: function(msg) {
                        if (msg.data.status == 0) {
                          wx.hideLoading();
                          that.setData({
                            result: msg.data.data.data,
                            getPage: msg.data.data.totalPage
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
            fail: function() {
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

  getUseRecord: function () {
    let that = this;
    if (that.data.usePageNo > 1) {
      return
    }
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let data = {
      type: 2,
      pageNo: that.data.usePageNo,
      pageSize: that.data.usePageSize,
      openid: app.globalData.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode
    }
    let dataInfo = md5.md5Sign(data);
    wx.request({
      url: app.globalData.url + '/userCenter/myGoldChangeRecord',
      data: dataInfo,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      method: 'POST',
      success: function (res) {
        if (res.data.status == 0) {
          wx.hideLoading();
          that.setData({
            useResult: res.data.data.data,
            usePage: res.data.data.totalPage
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
                      url: app.globalData.url + '/userCenter/myGoldChangeRecord',
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
                            useResult: msg.data.data.data,
                            usePage: msg.data.data.totalPage
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