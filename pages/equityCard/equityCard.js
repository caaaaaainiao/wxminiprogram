// pages/mycard/mycard.js
//获取应用实例
const app = getApp();
const util = require('../../utils/util.js');
const md5 = require('../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    time: false,
    isMember: true,
    type: 1, //1 充值 2解绑
    swiperIndex: "0",
    userInfo: null,
    phone: null,
    cardnum: "",
    cardmm: "",
    index: -1,
    orderNumber: 0,
    activity: [],
    show: false,
    isShow: true,
    disabled: 1,
    showM: false,
    passwordModle: false,
    recommendedCode: '',
    bingCode: '',
    jump: 2,
    myMemberCard: false,
    myEquityCard: true,
    equityCardShow: 0,
    descShow: true,
    showEquityCardMessage: false,
    equityCardIndex: 0,
    isContinue: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    var that = this;
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        that.setData({
          userInfo: res.data,
          logo: app.globalData.logo
        })
      },
    })
    // wx.setNavigationBarTitle({
    //   title: '会员卡'
    // });
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
    let that = this;
    that.getMyCard();
    that.setData({
      ticketingSystemType: app.globalData.ticketingSystemType
    })
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
  // 查询用户已绑定的会员卡
  binding: function () {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let that = this;
    let data = {
      cinemaCode: app.globalData.cinemaCode,
      openid: app.globalData.userInfo.openid
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
              show: true
            })
          }
          that.setData({
            cardInfo: res.data.data,
            memberCardImage: res.data.data.cardPicture
          })
          if (res.data.data.cardNo != '') {
            that.rechargeRule();
          }
          app.globalData.ticketingSystemType = res.data.data.ticketingSystemType;
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
                              show: true
                            })
                          }
                          that.setData({
                            cardInfo: msg.data.data,
                            memberCardImage: msg.data.data.cardPicture
                          })
                          if (msg.data.data.cardNo != '') {
                            that.rechargeRule();
                          }
                          app.globalData.ticketingSystemType = msg.data.data.ticketingSystemType;
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

  // 查询充值规则
  rechargeRule: function () {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let that = this;
    let data = {
      cardNo: that.data.cardInfo.cardNo,
      cinemaCode: app.globalData.cinemaCode,
      openid: app.globalData.userInfo.openid
    }
    let dataInfo = md5.md5Sign(data)
    wx.request({
      url: app.globalData.url + '/memberCard/queryMemberCardRechargeRules',
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
            rechargeRule: res.data.data
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
                      url: app.globalData.url + '/memberCard/queryMemberCardRechargeRules',
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
                            rechargeRule: res.data.data
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

  swiperChange: function (e) {
    // console.log(e.detail)
    var that = this;
    if (e.detail.current == 0) {
      that.setData({
        type: 1
      })
    } else if (e.detail.current == 1) {
      that.setData({
        type: 2
      })
    }
  },
  changeTap: function (e) {
    var that = this;
    var type = e.currentTarget.dataset.type;
    if (type == 1) {
      that.setData({
        type: 1,
        swiperIndex: 0
      })
    } else if (type == 2) {
      that.setData({
        type: 2,
        swiperIndex: 1
      })
    }
  },

  // 获取手机号码
  onInput: function (e) {
    this.setData({
      cardnum: e.detail.value
    })
  },

  // 获取密码
  onInput2: function (e) {
    this.setData({
      cardmm: e.detail.value
    })
  },

  // 绑定会员卡
  bang: function () {
    let that = this;
    if (app.globalData.isOpenMember == 0) {
      wx.showToast({
        title: '暂不支持会员卡',
      })
      return
    }
    if (!that.data.cardmm && !that.data.cardnum) {
      wx.showToast({
        title: '请输入卡号和密码！',
        icon: 'none',
        duration: 2000
      });
      return;
    }
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let data = {
      cinemaCode: app.globalData.cinemaCode,
      cardNo: that.data.cardnum,
      cardPassWord: that.data.cardmm,
      openid: app.globalData.userInfo.openid,
      employeeCode: that.data.bindCode
    }
    let dataInfo = md5.md5Sign(data);
    wx.request({
      url: app.globalData.url + '/memberCard/loginMemberCard',
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
            cardInfo: res.data.data
          })
          if (res.data.data.ticketingSystemType == 8 || res.data.data.ticketingSystemType == 16 || res.data.data.ticketingSystemType == 32) {
            if (res.data.data.cardNo != '') {
              that.setData({
                show: true
              })
            }
          }
          wx.showToast({
            title: '绑定成功！',
            mask: true
          })
          that.rechargeRule()
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
                      url: app.globalData.url + '/memberCard/loginMemberCard',
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
                            cardInfo: msg.data.data
                          })
                          if (msg.data.data.ticketingSystemType == 8 || msg.data.data.ticketingSystemType == 16 || msg.data.data.ticketingSystemType == 32) {
                            if (msg.data.data.cardNo != '') {
                              that.setData({
                                show: true
                              })
                            }
                          }
                          wx.showToast({
                            title: '绑定成功！',
                            mask: true
                          })
                          that.rechargeRule()
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
  // 选择充值金额
  chooseMoney: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var rule = that.data.rechargeRule;
    for (var i = 0; i < rule.length; i++) {
      rule[i].select = 0;
    }
    rule[index].select = 1;
    that.setData({
      rechargeRule: rule,
      ruleCode: rule[index].ruleCode
    })
  },

  // 获取充值码
  getCode: function (e) {
    let that = this;
    let code = e.detail.value.replace(/\s*/g, "");
    that.setData({
      recommendedCode: code
    })
  },

  getBindCode: function (e) {
    let that = this;
    let code = e.detail.value.replace(/\s*/g, "");
    that.setData({
      bingCode: code
    })
  },

  // 充值
  recharge: function () {
    let that = this;
    if (!that.data.ruleCode) {
      wx.showToast({
        title: '请选择充值金额！',
        mask: true,
        icon: 'none'
      })
      return;
    }
    if (app.globalData.ticketingSystemType == 4) {
      that.setData({
        passwordModle: true
      })
    } else {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      let data = {
        cinemaCode: app.globalData.cinemaCode,
        cardNo: that.data.cardInfo.cardNo,
        cardPassWord: that.data.cardmm,
        ruleCode: that.data.ruleCode,
        employeeCode: that.data.recommendedCode,
        openid: app.globalData.userInfo.openid
      }
      let dataInfo = md5.md5Sign(data);
      wx.request({
        url: app.globalData.url + '/memberCard/cardChargePay',
        data: dataInfo,
        method: "POST",
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
          // 'cookie': wx.getStorageSync("sessionid")
        },
        success: function (res) {
          if (res.data.status == 0) {
            wx.hideLoading();
            wx.requestPayment({
              timeStamp: res.data.data.timeStamp,
              nonceStr: res.data.data.nonceStr,
              package: res.data.data.package,
              signType: 'MD5',
              paySign: res.data.data.paySign,
              success(e) {
                wx.hideLoading();
                if (e.errMsg == "requestPayment:ok") {
                  that.data.ruleCode = null;
                  wx.showToast({
                    title: '支付成功！',
                    mask: true
                  })
                }
              },
              fail() {
                wx.hideLoading();
              }
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
                        url: app.globalData.url + '/memberCard/cardChargePay',
                        data: dataInfo,
                        method: "POST",
                        header: {
                          "Content-Type": "application/x-www-form-urlencoded",
                          // 'cookie': e.header['Set-Cookie']
                        },
                        success: function (msg) {
                          if (msg.data.status == 0) {
                            wx.hideLoading();
                            wx.requestPayment({
                              timeStamp: msg.data.data.timeStamp,
                              nonceStr: msg.data.data.nonceStr,
                              package: msg.data.data.package,
                              signType: 'MD5',
                              paySign: msg.data.data.paySign,
                              success(e) {
                                wx.hideLoading();
                                if (e.errMsg == "requestPayment:ok") {
                                  wx.showToast({
                                    title: '支付成功！',
                                    mask: true
                                  })
                                }
                              },
                              fail() {
                                wx.hideLoading();
                              }
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
    }
  },

  // 解绑
  untying: function () {
    var that = this;
    wx.showModal({
      title: '提示',
      content: '请联系影城工作人员解绑',
      showCancel: false,
    })
  },

  // 查看充值记录
  record: function () {
    let that = this;
    that.data.ruleCode = null;
    wx.navigateTo({
      url: '../cardRecord/cardRecord?cardNo=' + that.data.cardInfo.cardNo,
    })
  },

  // 开卡
  openCard: function () {
    let that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    wx.navigateTo({
      url: '../openCard/openCard',
    })
  },

  refresh: function () {
    let that = this;
    if (app.globalData.ticketingSystemType == 2 || app.globalData.ticketingSystemType == 8 || app.globalData.ticketingSystemType == 16 || app.globalData.ticketingSystemType == 32) {
      that.setData({
        showM: true,
        disabled: 0,
      })
    } else {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      let data = {
        cinemaCode: app.globalData.cinemaCode,
        cardNo: that.data.cardInfo.cardNo,
        openid: app.globalData.userInfo.openid
      }
      let dataInfo = md5.md5Sign(data);
      wx.request({
        url: app.globalData.url + '/memberCard/queryMemberCardInfo',
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
              cardInfo: res.data.data
            })
            wx.showToast({
              title: '刷新成功！',
              mask: true,
              icon: 'none'
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
                        url: app.globalData.url + '/memberCard/queryMemberCardInfo',
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
                              cardInfo: msg.data.data
                            })
                            wx.showToast({
                              title: '刷新成功！',
                              mask: true,
                              icon: 'none'
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
    }
  },

  // 获取密码
  getpassword: function (e) {
    this.setData({
      refreshbalance: e.detail.value,
    })
  },
  getpassword2: function (e) {
    this.setData({
      cardword: e.detail.value,
    })
  },

  // 关闭输入密码窗口
  closeM: function () {
    this.setData({
      showM: false,
      disabled: 1,
    })
  },
  closeModle: function () {
    this.setData({
      passwordModle: false,
      disabled: 1,
    })
  },

  // 满天星充值
  topUp: function () {
    let that = this;
    if (that.data.cardword == '' || !that.data.cardword) {
      wx.showToast({
        title: '请输入密码！',
        icon: 'none',
        duration: 1000,
        mask: true,
      })
    } else {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      let data = {
        cinemaCode: app.globalData.cinemaCode,
        cardNo: that.data.cardInfo.cardNo,
        cardPassWord: that.data.cardword,
        ruleCode: that.data.ruleCode,
        employeeCode: that.data.recommendedCode,
        openid: app.globalData.userInfo.openid
      }
      let dataInfo = md5.md5Sign(data);
      wx.request({
        url: app.globalData.url + '/memberCard/cardChargePay',
        data: dataInfo,
        method: "POST",
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
          // 'cookie': wx.getStorageSync("sessionid")
        },
        success: function (res) {
          if (res.data.status == 0) {
            wx.hideLoading();
            wx.requestPayment({
              timeStamp: res.data.data.timeStamp,
              nonceStr: res.data.data.nonceStr,
              package: res.data.data.package,
              signType: 'MD5',
              paySign: res.data.data.paySign,
              success(e) {
                wx.hideLoading();
                if (e.errMsg == "requestPayment:ok") {
                  that.data.ruleCode = null;
                  wx.showToast({
                    title: '支付成功！',
                    mask: true
                  })
                }
              },
              fail() {
                wx.hideLoading();
              }
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
                        url: app.globalData.url + '/memberCard/cardChargePay',
                        data: dataInfo,
                        method: "POST",
                        header: {
                          "Content-Type": "application/x-www-form-urlencoded",
                          // 'cookie': e.header['Set-Cookie']
                        },
                        success: function (msg) {
                          if (msg.data.status == 0) {
                            wx.hideLoading();
                            wx.requestPayment({
                              timeStamp: msg.data.data.timeStamp,
                              nonceStr: msg.data.data.nonceStr,
                              package: msg.data.data.package,
                              signType: 'MD5',
                              paySign: msg.data.data.paySign,
                              success(e) {
                                wx.hideLoading();
                                if (e.errMsg == "requestPayment:ok") {
                                  wx.showToast({
                                    title: '支付成功！',
                                    mask: true
                                  })
                                }
                              },
                              fail() {
                                wx.hideLoading();
                              }
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
    }
  },

  // 查询最新余额
  query: function () {
    let that = this;
    if (that.data.refreshbalance == '' || !that.data.refreshbalance) {
      wx.showToast({
        title: '请输入密码！',
        icon: 'none',
        duration: 1000,
        mask: true,
      })
    } else {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      let data = {
        cinemaCode: app.globalData.cinemaCode,
        cardNo: that.data.cardInfo.cardNo,
        cardPassWord: that.data.refreshbalance,
        openid: app.globalData.userInfo.openid
      }
      let dataInfo = md5.md5Sign(data);
      wx.request({
        url: app.globalData.url + '/memberCard/queryMemberCardInfo',
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
              cardInfo: res.data.data,
              showM: false
            })
            wx.showToast({
              title: '刷新成功！',
              mask: true,
              icon: 'none'
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
                        url: app.globalData.url + '/memberCard/queryMemberCardInfo',
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
                              cardInfo: msg.data.data,
                              showM: false
                            })
                            wx.showToast({
                              title: '刷新成功！',
                              mask: true,
                              icon: 'none'
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
    }
  },

  // 跳转到会员卡列表
  showMemberCard: function () {
    let that = this;
    that.binding();
    that.setData({
      jump: 1,
      myMemberCard: true,
      myEquityCard: false
    })
  },

  // 跳转到权益卡列表
  showEquityCard: function () {
    let that = this;
    that.setData({
      jump: 2,
      myEquityCard: true,
      myMemberCard: false
    })
  },

  // 查询已有权益卡
  getMyCard: function () {
    let that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let data = {
      cinemaCode: app.globalData.cinemaCode,
      openid: app.globalData.userInfo.openid
    }
    let dataInfo = md5.md5Sign(data)
    wx.request({
      url: app.globalData.url + '/benefitCard/myCard',
      data: dataInfo,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      method: 'POST',
      success: function (res) {
        if (res.data.status == 0) {
          wx.hideLoading();
          if (res.data.data.length > 0) {
            let isContinue = [];
            for (let i = 0;i < res.data.data.length;i ++) {
              isContinue.push(res.data.data[i].benefitCard.id)
            }
            that.setData({
              equityCardShow: 1,
              equityCard: res.data.data,
              nowCard: res.data.data[0],
              isContinue: isContinue
            })
          } else {
            that.getAllCard();
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
                      url: app.globalData.url + '/benefitCard/myCard',
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
                            let isContinue = [];
                            for (let i = 0; i < msg.data.data.length; i++) {
                              isContinue.push(msg.data.data[i].benefitCard.id)
                            }
                            that.setData({
                              equityCardShow: 1,
                              equityCard: msg.data.data,
                              nowCard: msg.data.data[0],
                              isContinue: isContinue
                            })
                          } else {
                            that.getAllCard();
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

  // 获取所有权益卡
  getAllCard: function () {
    let that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let data = {
      cinemaCode: app.globalData.cinemaCode,
      openid: app.globalData.userInfo.openid
    }
    let dataInfo = md5.md5Sign(data)
    wx.request({
      url: app.globalData.url + '/benefitCard/index',
      data: dataInfo,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      method: 'POST',
      success: function (res) {
        if (res.data.status == 0) {
          wx.hideLoading();
          if (res.data.data.equityCardList.length == 0) {
            wx.showToast({
              title: '暂无权益卡',
              icon: 'none',
              mask: true
            })
          } else {
            for (let i = 0; i < res.data.data.equityCardList.length;i ++) {
              for (let k = 0; k <that.data.isContinue.length; k ++) {
                if (res.data.data.equityCardList[i].id == that.data.isContinue[k]) {
                  res.data.data.equityCardList[i].isContinue = true
                }
              }
            }
            that.setData({
              equityCardShow: 0,
              equityCardAgreement: res.data.data.equityCardAgreement,
              equityCard: res.data.data.equityCardList,
              nowCard: res.data.data.equityCardList[0],
              id: res.data.data.equityCardList[0].id
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
                      url: app.globalData.url + '/benefitCard/index',
                      data: dataInfo,
                      method: "POST",
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        // 'cookie': e.header['Set-Cookie']
                      },
                      success: function (msg) {
                        if (msg.data.status == 0) {
                          wx.hideLoading();
                          if (msg.data.data.equityCardList.length == 0) {
                            wx.showToast({
                              title: '暂无权益卡',
                              icon: 'none',
                              mask: true
                            })
                          } else {
                            for (let i = 0; i < msg.data.data.equityCardList.length; i++) {
                              for (let k = 0; k < that.data.isContinue.length; k++) {
                                if (msg.data.data.equityCardList[i].id == that.data.isContinue[k]) {
                                  msg.data.data.equityCardList[i].isContinue = true
                                }
                              }
                            }
                            that.setData({
                              equityCardShow: 0,
                              equityCardAgreement: msg.data.data.equityCardAgreement,
                              equityCard: msg.data.data.equityCardList,
                              nowCard: msg.data.data.equityCardList[0],
                              id: msg.data.data.equityCardList[0].id
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

  // 选择权益卡
  chooseCard: function (e) {
    let that = this;
    let index = e.currentTarget.dataset.index;
    let id = e.currentTarget.dataset.id;
    let equityCard = that.data.equityCard;
    that.setData({
      nowCard: equityCard[index],
      id: id
    })
  },

  // 切换已有的权益卡
  changeCard: function (e) {
    let that = this;
    let equityCardIndex = e.detail.current;
    let equityCard = that.data.equityCard;
    that.setData({
      nowCard: equityCard[equityCardIndex],
      equityCardIndex: equityCardIndex
    })
  },

  // 显示权益卡权益
  showMessage: function () {
    let that = this;
    if (!that.data.equityCardAgreement) {
      return
    } else {
      that.setData({
        showEquityCardMessage: true
      })
    }
  },

  // 关闭规则
  close: function () {
    let that = this;
    that.setData({
      showEquityCardMessage: false
    })
  },

  // 开新卡
  newCard: function () {
    let that = this;
    that.getAllCard();
  },

  // 开卡
  openEquityCard: function () {
    let that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let data = {
      cinemaCode: app.globalData.cinemaCode,
      benefitId: that.data.id,
      openid: app.globalData.userInfo.openid
    }
    let dataInfo = md5.md5Sign(data)
    wx.request({
      url: app.globalData.url + '/benefitCard/pay',
      data: dataInfo,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      method: 'POST',
      success: function (res) {
        if (res.data.status == 0) {
          wx.hideLoading();
          wx.requestPayment({
            timeStamp: res.data.data.timeStamp,
            nonceStr: res.data.data.nonceStr,
            package: res.data.data.package,
            signType: 'MD5',
            paySign: res.data.data.paySign,
            success(e) {
              wx.hideLoading();
              that.getMyCard();
            },
            fail() {
              wx.hideLoading();
            }
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
                      url: app.globalData.url + '/benefitCard/index',
                      data: dataInfo,
                      method: "POST",
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        // 'cookie': e.header['Set-Cookie']
                      },
                      success: function (msg) {
                        if (msg.data.status == 0) {
                          wx.hideLoading();
                          wx.requestPayment({
                            timeStamp: msg.data.data.timeStamp,
                            nonceStr: msg.data.data.nonceStr,
                            package: msg.data.data.package,
                            signType: 'MD5',
                            paySign: msg.data.data.paySign,
                            success(e) {
                              wx.hideLoading();
                              that.getMyCard();
                            },
                            fail() {
                              wx.hideLoading();
                            }
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
  },

  // 权益卡购买记录
  equityRecord: function () {
    wx.navigateTo({
      url: '../equityCardRecord/equityCardRecord',
    })
  }
})