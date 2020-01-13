// pages/waitPay/waitPay.js
//获取应用实例
const app = getApp();
const util = require('../../utils/util.js');
const md5 = require('../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderNum: 0,
    order: null,
    minute: "00",
    second: "00",
    showPay: false,
    canClick: 1,
    showM: false,
    password: ""
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    this.setData({
      orderNum: options.orderNum
    })
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        that.setData({
          userInfo: res.data
        })
      },
    })
    that.bindCard();
    wx.setNavigationBarTitle({
      title: app.globalData.cinemaList.cinemaName
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    var that = this;
    wx.showLoading({
      title: '加载中',
    })
    let data = {
      openid: app.globalData.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode
    }
    let dataInfo = md5.md5Sign(data)
    wx.request({
      url: app.globalData.url + '/ticketorder/queryUnPayOrder',
      data: dataInfo,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      success: function(res) {
        if (res.data.status == 0) {
          wx.hideLoading();
          let allPrice = 0;
          if (res.data.data.totalActualPrice) {
            allPrice += res.data.data.totalActualPrice
          }
          if (res.data.data.totalMerActualPrice) {
            allPrice += res.data.data.totalMerActualPrice
          }
          that.setData({
            order: res.data.data,
            allPrice: allPrice.toFixed(2)
          })
          that.leftTime();
        } else if (res.data == '{code=notLogin, message=请先登录, data=null, status=1000}') {
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
                      url: app.globalData.url + '/ticketorder/queryUnPayOrder',
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
                            order: msg.data.data
                          })
                          that.leftTime();
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
            fail: function() {
              wx.hideLoading();
              wx.redirectTo({
                url: '../login/login',
              })
            }
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
    let that = this;
    that.bindCard();
    wx.setNavigationBarTitle({
      title: app.globalData.cinemaList.cinemaName
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
    wx.navigateBack({
      delta: 2
    })
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

  leftTime: function() {
    var that = this;
    var timer = setInterval(function() {
      var nowTime = parseInt(new Date().getTime() / 1000);
      let playTime = new Date(that.data.order.autoUnlockDateTime.replace(/-/g, '/')).getTime() / 1000
      var leftTime = playTime - nowTime;
      var minute = parseInt(leftTime / 60);
      var second = parseInt(leftTime % 60);
      if (minute < 0 || second < 0) {
        clearInterval(timer)
        wx.redirectTo({
          url: '../compare/compare',
        })
        return;
      }
      if (minute < 10) {
        minute = "0" + minute;
      }
      if (second < 10) {
        second = "0" + second;
      }

      that.setData({
        minute: minute,
        second: second
      })
    }, 1000)
    that.setData({
      timer: timer
    })
  },

  close: function() {
    this.setData({
      showPay: false
    })
  },

  // 取消订单
  cancelOrder: function() {
    let that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let data = {
      unifiedOrderNo: that.data.order.unifiedOrderNo,
      openid: app.globalData.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode
    };
    let dataInfo = md5.md5Sign(data);
    wx.request({
      url: app.globalData.url + '/ticketorder/releaseSeat',
      data: dataInfo,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      success: function(res) {
        if (res.data.status == 0) {
          wx.hideLoading();
          clearInterval(that.data.timer)
          wx.hideLoading();
          wx.navigateBack({
            delta: 1
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
                      url: app.globalData.url + '/ticketorder/releaseSeat',
                      data: dataInfo,
                      method: "POST",
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        // 'cookie': e.header['Set-Cookie']
                      },
                      success: function(msg) {
                        if (msg.data.status == 0) {
                          wx.hideLoading();
                          clearInterval(that.data.timer)
                          wx.navigateBack({
                            delta: 1
                          })
                        } else {
                          wx.hideLoading();
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
        }
      }
    })
  },

  // 付款
  toPay: function() {
    let that = this;
    if (that.data.order.payWay == 0) {
      that.pay();
    }
    if (that.data.order.payWay == 1) {
      that.setData({
        showM: true
      })
    }
  },

  // wxPay
  pay: function() {
    let that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let changeActivity = {
      unifiedOrderNo: that.data.order.unifiedOrderNo,
      openid: app.globalData.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode
    }
    let data = md5.md5Sign(changeActivity);
    // 确认订单接口
    wx.request({
      url: app.globalData.url + '/ticketorder/prePayOrder',
      data: data,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      method: 'POST',
      success: function(res) {
        if (res.data.status == 0) {
          wx.hideLoading();
          wx.requestPayment({
            timeStamp: res.data.data.timeStamp,
            nonceStr: res.data.data.nonceStr,
            package: res.data.data.package,
            signType: 'MD5',
            paySign: res.data.data.paySign,
            success(e) {
              if (e.errMsg == "requestPayment:ok") {
                  app.globalData.ticketOrder = null;
                  wx.navigateTo({
                    url: '../success/success?code=' + that.data.order.unifiedOrderNo + '&&name=' + that.data.order.filmName + '&&count=' + that.data.order.ticketNum,
                  })
              }
            }
          })
        } else if (res.data == "{code=notLogin, message=请先登录, data=null, status=1000}") {
          wx.getStorage({
            key: 'loginInfo',
            success: function(res) {
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
                  "Content-Type": "application/x-www-form-urlencoded",
                  'cookie': wx.getStorageSync("sessionid")
                },
                success: function(r) {
                  if (r.data.status == 0) {
                    wx.setStorage({
                      key: 'sessionid',
                      data: r.header['Set-Cookie']
                    })
                    wx.request({
                      url: app.globalData.url + '/ticketorder/prePayOrder',
                      data: data,
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        // 'cookie': wx.getStorageSync("sessionid")
                      },
                      method: 'POST',
                      success: function(e) {
                        if (e.data.status == 0) {
                          wx.hideLoading();
                          wx.requestPayment({
                            timeStamp: e.data.data.timeStamp,
                            nonceStr: e.data.data.nonceStr,
                            package: e.data.data.package,
                            signType: 'MD5',
                            paySign: e.data.data.paySign,
                            success(msg) {
                              if (msg.errMsg == "requestPayment:ok") {
                                  app.globalData.ticketOrder = null;
                                  wx.navigateTo({
                                    url: '../success/success?code=' + that.data.order.unifiedOrderNo + '&&name=' + that.data.order.filmName + '&&count=' + that.data.order.ticketNum,
                                  })
                              }
                            },
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
                  } else {
                    wx.hideLoading();
                    wx.showToast({
                      title: r.data.message,
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
      },
    })
  },

  // 查询绑定的会员卡
  bindCard: function () {
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
      url: app.globalData.url + '/memberCard/queryMemberCard',
      data: dataInfo,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      success: function (res) {
        if (res.data.status == 0) {
          wx.hideLoading();
          if (res.data.data.cardNo != '') {
            that.setData({
              card: res.data.data
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
                      url: app.globalData.url + '/memberCard/queryMemberCard',
                      data: dataInfo,
                      method: "POST",
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        // 'cookie': e.header['Set-Cookie']
                      },
                      success: function (msg) {
                        if (msg.data.status == 0) {
                          wx.hideLoading();
                          if (msg.data.data.cardNo != '') {
                            that.setData({
                              card: msg.data.data
                            })
                          }
                        } else {
                          wx.hideLoading();
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
        }
      }
    })
  },

  setM: function(e) {
    var password = e.detail.value;
    this.setData({
      password: password
    })
  },

  showM: function() {
    if (that.data.card.cardNo == '') {
      wx.showModal({
        title: '支付失败',
        content: "您还没有会员卡，是否前去绑定/开卡？",
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../mycard/mycard',
            })
          }
        }
      })
      return;
    }
    this.setData({
      showM: true
    })
  },

  closeM: function() {
    this.setData({
      showM: false
    })
  },

  // 会员卡支付
  cardPay: function() {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    var that = this;
    if (that.data.password.length == 0) {
      wx.showToast({
        title: '请输入密码',
        icon: 'none',
        duration: 1000,
        mask: true,
      })
      return;
    }
    let data = {
      unifiedOrderNo: that.data.order.unifiedOrderNo,
      mobile: that.data.order.mobile,
      cardNo: that.data.card.cardNo,
      cardPassword: that.data.password,
      openid: app.globalData.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode
    }
    let dataInfo = md5.md5Sign(data);
    wx.request({
      url: app.globalData.url + '/ticketorder/cardPayOrder',
      data: dataInfo,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      method: 'POST',
      success: function(res) {
        if (res.data.status == 0) {
            app.globalData.ticketOrder = null;
            wx.navigateTo({
              url: '../success/success?code=' + that.data.order.unifiedOrderNo + '&&name=' + that.data.order.filmName + '&&count=' + that.data.order.ticketNum,
            })
        } else if (res.data == "{code=notLogin, message=请先登录, data=null, status=1000}") {
          wx.getStorage({
            key: 'loginInfo',
            success: function(res) {
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
                success: function(r) {
                  if (r.data.status == 0) {
                    wx.setStorage({
                      key: 'sessionid',
                      data: r.header['Set-Cookie']
                    })
                    wx.request({
                      url: app.globalData.url + '/ticketorder/cardPayOrder',
                      data: dataInfo,
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        // 'cookie': wx.getStorageSync("sessionid")
                      },
                      method: 'POST',
                      success: function(e) {
                        if (e.data.status == 0) {
                            app.globalData.ticketOrder = null;
                          wx.navigateTo({
                            url: '../success/success?code=' + that.data.order.unifiedOrderNo + '&&name=' + that.data.order.filmName + '&&count=' + that.data.order.ticketNum,
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
                  } else {
                    wx.hideLoading();
                    wx.showToast({
                      title: r.data.message,
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
      },
    })
  }
})