// pages/orderForm/orderForm.js
//获取应用实例
const app = getApp();
const util = require('../../utils/util.js');
const md5 = require('../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    showPay: false,
    seatOrder: null,
    date: null,
    ticketName: '电影票优惠券',
    seatCoupon: 0, // 电影票优惠券
    foodCoupon: 0,
    formids: 0,
    seatCouponList: null, //电影票优惠券列表
    foodCouponList: null,
    foodPrice: 0,
    phone: '',
    timer: '',
    singleSurplusFilm: '',
    // canClick: 1,
    marActivity: null, //参与活动id
    seatsJson: null,
    unlockTime: "",
    showM: false,
    password: "",
    merTicketId: "",
    seatTicketId: "",
    chooseType: 0,
    messageshow: false,
    userMessage: "",
    movieName: '',
    count: '',
    autoUnlockDatetime: '',
    comboList: null,
    refreshments: 0, // 小食价格
    allPrice: 0, // 总价
    orderCode: '', // 锁座订单号
    isShow: false,
    couponsCode: null,
    reductionPrice: null,
    beginTicket: 0,
    codeArr: [], // 第一张优惠券编码
    priceArr: [], // 第一张优惠券价格
    orderNum: null, // 订单号
    card: null, // 会员卡
    cardNo: null,
    levelCode: null,
    sessionCode: '',
    tradeNo: null, // 交易号
    deductAmount: 0, //支付金额
    printNo: null, // 出票号
    payway: null, //支付方式 2-会员卡，1-微信
    disabled: 1,
    ticketPrice: 0,
    merPrice: 0,
    isOpenMember: true, // 是否开通会员卡
    canShow: true, // 是否能调用onshow方法
    // waitActivity: null,//可參與活動
    navTab: ['可用券', '不可用券'],
    currentTicketTab: 0,
    currentMerTab: 0,
    canuseTicketCoupon: true,
    unCanuseTicketCoupon: false,
    canuseMerCoupon: true,
    unCanuseMerCoupon: false,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    if (options.name && options.count) {
      that.setData({
        name: options.name,
        movieCount: options.count,
        date: options.time,
        cinemaName: app.globalData.cinemaList.cinemaName,
        hallName: options.screenName,
        seatArr: options.seatArr,
        endTime: options.endTime,
        beginTime: options.beginTime,
      })
    }
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        that.setData({
          phone: res.data.userMobile,
          userInfo: res.data
        })
      },
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    var that = this;
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this;
    if (that.data.canShow == true) {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      that.setData({
        merOrder: app.globalData.goodsOrder,
        goodsOrder: app.globalData.goodsOrder,
        payway: 1
      })
      if (app.globalData.ticketOrder) {
        that.setData({
          ticketOrder: app.globalData.ticketOrder,
          wxFee: app.globalData.ticketOrder.totalPlatHandFee,
          memberPayFee: app.globalData.ticketOrder.totalMemberPlatHandFee
        })
      }
      let unifiedOrderNo = ''
      if (that.data.merOrder && !that.data.ticketOrder) {
        unifiedOrderNo = that.data.merOrder.unifiedOrderNo
      } else if (that.data.ticketOrder) {
        unifiedOrderNo = that.data.ticketOrder.unifiedOrderNo
      }
      that.setData({
        unifiedOrderNo: unifiedOrderNo
      })
      if (unifiedOrderNo == '' || !unifiedOrderNo) {
        return
      }
      let changeActivity = {
        unifiedOrderNo: unifiedOrderNo,
        openid: app.globalData.userInfo.openid,
        cinemaCode: app.globalData.cinemaCode
      }
      let data = md5.md5Sign(changeActivity);
      wx.request({
        url: app.globalData.url + '/ticketorder/countOrderDiscount',
        data: data,
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        method: 'POST',
        success: function(res) {
          if (res.data.status == 0) {
            let orderPrice = 0;
            let originalPrice = 0;
            if (res.data.data.ticketOrderActivityVO) {
              if (res.data.data.ticketOrderActivityVO.coupons.length > 0) {
                for (let i = 0; i < res.data.data.ticketOrderActivityVO.coupons.length; i++) {
                  res.data.data.ticketOrderActivityVO.coupons[i].startTime = res.data.data.ticketOrderActivityVO.coupons[i].startTime.split(" ")[0]
                  res.data.data.ticketOrderActivityVO.coupons[i].endTime = res.data.data.ticketOrderActivityVO.coupons[i].endTime.split(" ")[0];
                }
              }
              orderPrice += res.data.data.ticketOrderActivityVO.totalActualPrice;
              originalPrice += res.data.data.ticketOrderActivityVO.totalOriginalPrice;
              that.setData({
                singleSurplusFilm: res.data.data.ticketOrderActivityVO.singleSurplus,
                ticketPrice: res.data.data.ticketOrderActivityVO.totalActualPrice
              })
            }
            if (res.data.data.merOrderActivityVO) {
              if (res.data.data.merOrderActivityVO.coupons.length > 0) {
                for (let i = 0; i < res.data.data.merOrderActivityVO.coupons.length; i++) {
                  res.data.data.merOrderActivityVO.coupons[i].startTime = res.data.data.merOrderActivityVO.coupons[i].startTime.split(" ")[0]
                  res.data.data.merOrderActivityVO.coupons[i].endTime = res.data.data.merOrderActivityVO.coupons[i].endTime.split(" ")[0];
                }
              }
              orderPrice += res.data.data.merOrderActivityVO.totalActualPrice;
              originalPrice += res.data.data.merOrderActivityVO.totalOriginalPrice;
              that.setData({
                merPrice: res.data.data.merOrderActivityVO.totalActualPrice
              })
            }
            that.setData({
              orderPrice: orderPrice.toFixed(2),
              originalPrice: originalPrice.toFixed(2)
            })
            that.setData({
              ticketOrder: res.data.data.ticketOrderActivityVO,
              merOrder: res.data.data.merOrderActivityVO
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
                  success: function(e) {
                    if (e.data.status == 0) {
                      wx.setStorage({
                        key: 'sessionid',
                        data: e.header['Set-Cookie']
                      })
                      wx.request({
                        url: app.globalData.url + '/ticketorder/countOrderDiscount',
                        data: data,
                        header: {
                          "Content-Type": "application/x-www-form-urlencoded",
                        },
                        method: 'POST',
                        success: function(res) {
                          if (res.data.status == 0) {
                            let orderPrice = 0;
                            let originalPrice = 0;
                            if (res.data.data.ticketOrderActivityVO) {
                              if (res.data.data.ticketOrderActivityVO.coupons.length > 0) {
                                for (let i = 0; i < res.data.data.ticketOrderActivityVO.coupons.length; i++) {
                                  res.data.data.ticketOrderActivityVO.coupons[i].startTime = res.data.data.ticketOrderActivityVO.coupons[i].startTime.split(" ")[0]
                                  res.data.data.ticketOrderActivityVO.coupons[i].endTime = res.data.data.ticketOrderActivityVO.coupons[i].endTime.split(" ")[0];
                                }
                              }
                              orderPrice += res.data.data.ticketOrderActivityVO.totalActualPrice;
                              originalPrice += res.data.data.ticketOrderActivityVO.totalOriginalPrice;
                              that.setData({
                                singleSurplusFilm: res.data.data.ticketOrderActivityVO.singleSurplus,
                                ticketPrice: res.data.data.ticketOrderActivityVO.totalActualPrice
                              })
                            }
                            if (res.data.data.merOrderActivityVO) {
                              if (res.data.data.merOrderActivityVO.coupons.length > 0) {
                                for (let i = 0; i < res.data.data.merOrderActivityVO.coupons.length; i++) {
                                  res.data.data.merOrderActivityVO.coupons[i].startTime = res.data.data.merOrderActivityVO.coupons[i].startTime.split(" ")[0]
                                  res.data.data.merOrderActivityVO.coupons[i].endTime = res.data.data.merOrderActivityVO.coupons[i].endTime.split(" ")[0];
                                }
                              }
                              orderPrice += res.data.data.merOrderActivityVO.totalActualPrice;
                              originalPrice += res.data.data.merOrderActivityVO.totalOriginalPrice;
                            }
                            that.setData({
                              merPrice: res.data.data.merOrderActivityVO.totalActualPrice
                            })
                            that.setData({
                              orderPrice: orderPrice.toFixed(2),
                              originalPrice: originalPrice.toFixed(2)
                            })
                            that.setData({
                              ticketOrder: res.data.data.ticketOrderActivityVO,
                              merOrder: res.data.data.merOrderActivityVO
                            })
                          }
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
      if (that.data.ticketOrder) {
        that.leftTime()
      }
      that.bindCard();
    }
  },

  leftTime: function() {
    var that = this;
    let date = new Date(that.data.ticketOrder.autoUnlockDatetime.replace(/-/g, '/')).getTime()
    that.setData({
      timer: setInterval(function() {
        var nowTime = parseInt(new Date().getTime());
        var leftTime = parseInt((date - nowTime) / 1000);
        var str = "";
        var minute = parseInt(leftTime / 60);
        var second = parseInt(leftTime % 60);
        if (minute == 0 && second < 1) {
          clearInterval(that.data.timer)
          wx.switchTab({
            url: '../index/index',
          })
          return;
        }
        if (minute < 10) {
          minute = "0" + minute;
        }
        if (second < 10) {
          second = "0" + second;
        }
        str = minute + ":" + second;
        that.setData({
          unlockTime: str
        })
      }, 1000)
    })
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
    clearInterval(this.data.timer)
    this.setData({
      canShow: false
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

  // 查询绑定的会员卡
  bindCard: function() {
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
      success: function(res) {
        if (res.data.status == 0) {
          wx.hideLoading();
          if (res.data.data.cardNo != '') {
            that.setData({
              card: res.data.data
            })
            that.cardway();
          }
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
                      url: app.globalData.url + '/memberCard/queryMemberCard',
                      data: dataInfo,
                      method: "POST",
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        // 'cookie': e.header['Set-Cookie']
                      },
                      success: function(msg) {
                        if (msg.data.status == 0) {
                          wx.hideLoading();
                          if (msg.data.data.cardNo != '') {
                            that.setData({
                              card: msg.data.data
                            })
                            that.cardway();
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

  // 选择会员卡支付
  cardway: function() {
    let that = this;
    if (that.data.payway == 2) {
      return
    }
    that.setData({
      payway: 2,
    });
    if (that.data.card == null) {
      wx.showModal({
        title: '',
        content: "您还没有会员卡，是否前去绑定/开卡？",
        success: function(res) {
          if (res.confirm) {
            wx.navigateTo({
              url: '../mycard/mycard',
            })
          } else if (res.cancel) {
            that.setData({
              payway: 1,
            })
          }
        }
      })
      return;
    } else {
      wx.showLoading({
        title: '加载中',
        mask: true
      })
      let card = that.data.card;
      if (card) {
        that.setData({
          cardNo: card.cardNo,
        })
      }
      let changeActivity = {
        unifiedOrderNo: that.data.unifiedOrderNo,
        payWay: 1,
        cardNo: card.cardNo,
        openid: app.globalData.userInfo.openid,
        cinemaCode: app.globalData.cinemaCode
      }
      let activityInfo = md5.md5Sign(changeActivity);
      wx.request({
        url: app.globalData.url + '/ticketorder/changeActivityOrCoupon',
        data: activityInfo,
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
          // 'cookie': wx.getStorageSync("sessionid")
        },
        method: 'POST',
        success: function(res) {
          wx.hideLoading();
          if (res.data.status == 0) {
            if (res.data.data.ticketOrderActivityVO && res.data.data.ticketOrderActivityVO.coupons.length > 0) {
              for (let i = 0; i < res.data.data.ticketOrderActivityVO.coupons.length; i++) {
                res.data.data.ticketOrderActivityVO.coupons[i].startTime = res.data.data.ticketOrderActivityVO.coupons[i].startTime.split(" ")[0]
                res.data.data.ticketOrderActivityVO.coupons[i].endTime = res.data.data.ticketOrderActivityVO.coupons[i].endTime.split(" ")[0];
              }
            }
            if (res.data.data.merOrderActivityVO && res.data.data.merOrderActivityVO.coupons.length > 0) {
              for (let i = 0; i < res.data.data.merOrderActivityVO.coupons.length; i++) {
                res.data.data.merOrderActivityVO.coupons[i].startTime = res.data.data.merOrderActivityVO.coupons[i].startTime.split(" ")[0]
                res.data.data.merOrderActivityVO.coupons[i].endTime = res.data.data.merOrderActivityVO.coupons[i].endTime.split(" ")[0];
              }
            }
            that.setData({
              ticketOrder: res.data.data.ticketOrderActivityVO,
              merOrder: res.data.data.merOrderActivityVO
            })
            let orderPrice = 0;
            let originalPrice = 0;
            if (res.data.data.ticketOrderActivityVO) {
              orderPrice += res.data.data.ticketOrderActivityVO.totalActualPrice;
              originalPrice += res.data.data.ticketOrderActivityVO.totalOriginalPrice
              that.setData({
                singleSurplusFilm: res.data.data.ticketOrderActivityVO.singleSurplus
              })
            }
            if (res.data.data.merOrderActivityVO) {
              orderPrice += res.data.data.merOrderActivityVO.totalActualPrice;
              originalPrice += res.data.data.merOrderActivityVO.totalOriginalPrice
            }
            that.setData({
              orderPrice: orderPrice.toFixed(2),
              originalPrice: originalPrice.toFixed(2)
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
                  success: function(e) {
                    if (e.data.status == 0) {
                      wx.setStorage({
                        key: 'sessionid',
                        data: e.header['Set-Cookie']
                      })
                      wx.request({
                        url: app.globalData.url + '/ticketorder/changeActivityOrCoupon',
                        data: data,
                        header: {
                          "Content-Type": "application/x-www-form-urlencoded",
                          // 'cookie': wx.getStorageSync("sessionid")
                        },
                        method: 'POST',
                        success: function(res) {
                          if (res.data.status == 0) {
                            if (res.data.data.ticketOrderActivityVO && res.data.data.ticketOrderActivityVO.coupons.length > 0) {
                              for (let i = 0; i < res.data.data.ticketOrderActivityVO.coupons.length; i++) {
                                res.data.data.ticketOrderActivityVO.coupons[i].startTime = res.data.data.ticketOrderActivityVO.coupons[i].startTime.split(" ")[0]
                                res.data.data.ticketOrderActivityVO.coupons[i].endTime = res.data.data.ticketOrderActivityVO.coupons[i].endTime.split(" ")[0];
                              }
                            }
                            if (res.data.data.merOrderActivityVO && res.data.data.merOrderActivityVO.coupons.length > 0) {
                              for (let i = 0; i < res.data.data.merOrderActivityVO.coupons.length; i++) {
                                res.data.data.merOrderActivityVO.coupons[i].startTime = res.data.data.merOrderActivityVO.coupons[i].startTime.split(" ")[0]
                                res.data.data.merOrderActivityVO.coupons[i].endTime = res.data.data.merOrderActivityVO.coupons[i].endTime.split(" ")[0];
                              }
                            }
                            that.setData({
                              ticketOrder: res.data.data.ticketOrderActivityVO,
                              merOrder: res.data.data.merOrderActivityVO
                            })
                            let orderPrice = 0;
                            let originalPrice = 0;
                            if (res.data.data.ticketOrderActivityVO) {
                              orderPrice += res.data.data.ticketOrderActivityVO.totalActualPrice;
                              originalPrice += res.data.data.ticketOrderActivityVO.totalOriginalPrice;
                              that.setData({
                                singleSurplusFilm: res.data.data.ticketOrderActivityVO.singleSurplus
                              })
                            }
                            if (res.data.data.merOrderActivityVO) {
                              orderPrice += res.data.data.merOrderActivityVO.totalActualPrice;
                              originalPrice += res.data.data.merOrderActivityVO.totalOriginalPrice;
                            }
                            that.setData({
                              orderPrice: orderPrice.toFixed(2),
                              originalPrice: originalPrice.toFixed(2)
                            })
                          }
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
              },
            })
          } else {
            wx.hideLoading();
            wx.showToast({
              title: res.data.message,
              icon: 'none',
              mask: true
            })
            setTimeout(function(){
              that.wxway();
            },1500)
          }
        }
      })
    }
  },

  // 选择微信支付
  wxway: function() {
    let that = this;
    if (that.data.payway == 1) {
      return;
    }
    that.setData({
      payway: 1,
    });
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let changeActivity = {
      unifiedOrderNo: that.data.unifiedOrderNo,
      payWay: "0",
      openid: app.globalData.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode
    }
    let activityInfo = md5.md5Sign(changeActivity);
    wx.request({
      url: app.globalData.url + '/ticketorder/changeActivityOrCoupon',
      data: activityInfo,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: 'POST',
      success: function(res) {
        wx.hideLoading();
        if (res.data.status == 0) {
          if (res.data.data.ticketOrderActivityVO && res.data.data.ticketOrderActivityVO.coupons.length > 0) {
            for (let i = 0; i < res.data.data.ticketOrderActivityVO.coupons.length; i++) {
              res.data.data.ticketOrderActivityVO.coupons[i].startTime = res.data.data.ticketOrderActivityVO.coupons[i].startTime.split(" ")[0]
              res.data.data.ticketOrderActivityVO.coupons[i].endTime = res.data.data.ticketOrderActivityVO.coupons[i].endTime.split(" ")[0];
            }
          }
          if (res.data.data.merOrderActivityVO && res.data.data.merOrderActivityVO.coupons.length > 0) {
            for (let i = 0; i < res.data.data.merOrderActivityVO.coupons.length; i++) {
              res.data.data.merOrderActivityVO.coupons[i].startTime = res.data.data.merOrderActivityVO.coupons[i].startTime.split(" ")[0]
              res.data.data.merOrderActivityVO.coupons[i].endTime = res.data.data.merOrderActivityVO.coupons[i].endTime.split(" ")[0];
            }
          }
          that.setData({
            ticketOrder: res.data.data.ticketOrderActivityVO,
            merOrder: res.data.data.merOrderActivityVO
          })
          let orderPrice = 0;
          let originalPrice = 0;
          if (res.data.data.ticketOrderActivityVO) {
            orderPrice += res.data.data.ticketOrderActivityVO.totalActualPrice;
            originalPrice += res.data.data.ticketOrderActivityVO.totalOriginalPrice;
            that.setData({
              singleSurplusFilm: res.data.data.ticketOrderActivityVO.singleSurplus
            })
          }
          if (res.data.data.merOrderActivityVO) {
            orderPrice += res.data.data.merOrderActivityVO.totalActualPrice;
            originalPrice += res.data.data.merOrderActivityVO.totalOriginalPrice;
          }
          that.setData({
            orderPrice: orderPrice.toFixed(2),
            originalPrice: originalPrice.toFixed(2)
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
                success: function(e) {
                  if (e.data.status == 0) {
                    wx.setStorage({
                      key: 'sessionid',
                      data: e.header['Set-Cookie']
                    })
                    wx.request({
                      url: app.globalData.url + '/ticketorder/changeActivityOrCoupon',
                      data: activityInfo,
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        // 'cookie': wx.getStorageSync("sessionid")
                      },
                      method: 'POST',
                      success: function(res) {
                        if (res.data.status == 0) {
                          if (res.data.data.ticketOrderActivityVO && res.data.data.ticketOrderActivityVO.coupons.length > 0) {
                            for (let i = 0; i < res.data.data.ticketOrderActivityVO.coupons.length; i++) {
                              res.data.data.ticketOrderActivityVO.coupons[i].startTime = res.data.data.ticketOrderActivityVO.coupons[i].startTime.split(" ")[0]
                              res.data.data.ticketOrderActivityVO.coupons[i].endTime = res.data.data.ticketOrderActivityVO.coupons[i].endTime.split(" ")[0];
                            }
                          }
                          if (res.data.data.merOrderActivityVO && res.data.data.merOrderActivityVO.coupons.length > 0) {
                            for (let i = 0; i < res.data.data.merOrderActivityVO.coupons.length; i++) {
                              res.data.data.merOrderActivityVO.coupons[i].startTime = res.data.data.merOrderActivityVO.coupons[i].startTime.split(" ")[0]
                              res.data.data.merOrderActivityVO.coupons[i].endTime = res.data.data.merOrderActivityVO.coupons[i].endTime.split(" ")[0];
                            }
                          }
                          that.setData({
                            ticketOrder: res.data.data.ticketOrderActivityVO,
                            merOrder: res.data.data.merOrderActivityVO
                          })
                          let orderPrice = 0;
                          let originalPrice = 0;
                          if (res.data.data.ticketOrderActivityVO) {
                            orderPrice += res.data.data.ticketOrderActivityVO.totalActualPrice;
                            originalPrice += res.data.data.ticketOrderActivityVO.totalOriginalPrice;
                            that.setData({
                              singleSurplusFilm: res.data.data.ticketOrderActivityVO.singleSurplus
                            })
                          }
                          if (res.data.data.merOrderActivityVO) {
                            orderPrice += res.data.data.merOrderActivityVO.totalActualPrice;
                            originalPrice += res.data.data.merOrderActivityVO.totalOriginalPrice;
                          }
                          that.setData({
                            orderPrice: orderPrice.toFixed(2),
                            originalPrice: originalPrice.toFixed(2)
                          })
                        }
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

  manage: function() {
    var that = this;
    if (that.data.comboList != null) {
      for (var i = 0; i < that.data.comboList.length; i++) {
        that.data.comboList[i].buyNum = 0;
      }
    }
    that.setData({
      comboList: that.data.comboList,
      price: that.data.price,
      allPrice: parseFloat(that.data.allPrice).toFixed(2),
    })
    if (that.data.ticketOrder) {
      that.leftTime();
    }
  },

  calculate: function() { //计算价格
    var that = this;
    var json = [];
    let refreshments = 0;
    for (var i = 0; i < that.data.comboList.length; i++) {
      if (that.data.comboList[i].buyNum > 0) {
        var row = {};
        row.packageSettlePrice = that.data.comboList[i].packageSettlePrice;
        row.number = that.data.comboList[i].buyNum;
        json.push(row)
      }
    }
    if (json.length == 0) {
      that.setData({
        refreshments: 0,
        allPrice: parseFloat(that.data.allPrice).toFixed(2),
      })
    } else {
      for (let i = 0; i < json.length; i++) {
        refreshments += (json[i].number) * (json[i].packageSettlePrice)
      }
      that.setData({
        refreshments: refreshments,
        allPrice: parseFloat(refreshments + Number(that.data.price)).toFixed(2),
      })
    }
  },

  choosePay: function() {
    let that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let changeActivity = {
      unifiedOrderNo: that.data.unifiedOrderNo,
      singleSurplusFilm: that.data.singleSurplusFilm,
      openid: app.globalData.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode
    }
    let data = md5.md5Sign(changeActivity);
    wx.request({
      url: app.globalData.url + '/ticketorder/submitDiscount',
      data: data,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      method: 'POST',
      success: function(res) {
        if (res.data.status == 0) {
          wx.hideLoading();
          if (that.data.payway == 2) {
            let price = 0;
            if (that.data.ticketOrder) {
              // if (that.data.ticketOrder.totalActualPrice == 0) {
              //   wx.showModal({
              //     title: '提示',
              //     content: '会员卡不支持影票或卖品0元支付，请选择其他支付方式',
              //     showCancel: false,
              //     success(res) {
              //       that.setData({
              //         showM: false
              //       })
              //     }
              //   })
              //   return;
              // }
              price += Number(that.data.ticketOrder.totalActualPrice)
            }
            if (that.data.merOrder) {
              // if (that.data.merOrder.totalActualPrice == 0) {
              //   wx.showModal({
              //     title: '提示',
              //     content: '会员卡不支持影票或卖品0元支付，请选择其他支付方式',
              //     showCancel: false,
              //     success(res) {
              //       that.setData({
              //         showM: false
              //       })
              //     }
              //   })
              //   return;
              // }
              price += Number(that.data.merOrder.totalActualPrice)
            }
            that.setData({
              showM: true
            })
          } else {
            that.pay();
          }
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
                      url: app.globalData.url + '/ticketorder/submitDiscount',
                      data: data,
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded",
                      },
                      method: 'POST',
                      success: function(e) {
                        if (e.data.status == 0) {
                          if (that.data.payway == 2) {
                            that.setData({
                              showM: true
                            })
                          } else {
                            that.pay();
                          }
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

  pay: function() {
    let that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let changeActivity = {
      unifiedOrderNo: that.data.unifiedOrderNo,
      openid: app.globalData.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode
    }
    let data = md5.md5Sign(changeActivity);
    // 预支付接口
    wx.request({
      url: app.globalData.url + '/ticketorder/prePayOrder',
      data: data,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      method: 'POST',
      success: function(res) {
        if (res.data.status == 0) {
          if (res.data.data) {
            if (Array.isArray(res.data.data)) {
              //返回空数组
              wx.hideLoading();
              wx.showToast({
                title: '支付成功！',
                mask: true
              })
              setTimeout(function() {
                // 如果不存在影票订单
                if (!app.globalData.ticketOrder) {
                  wx.navigateTo({
                    url: '../foodSuccess/foodSuccess?code=' + that.data.unifiedOrderNo,
                  })
                } else {
                  app.globalData.ticketOrder = null;
                  wx.navigateTo({
                    url: '../success/success?code=' + that.data.unifiedOrderNo + '&&name=' + that.data.name + '&&count=' + that.data.movieCount,
                  })
                }
              }, 2000)
            } else if (!Array.isArray(res.data.data)) {
              // 返回非空数组
              that.setData({
                canShow: false
              })
              wx.requestPayment({
                timeStamp: res.data.data.timeStamp,
                nonceStr: res.data.data.nonceStr,
                package: res.data.data.package,
                signType: 'MD5',
                paySign: res.data.data.paySign,
                success(e) {
                  wx.hideLoading();
                  if (e.errMsg == "requestPayment:ok") {
                    // 如果不存在影票订单
                    if (!app.globalData.ticketOrder) {
                      wx.navigateTo({
                        url: '../foodSuccess/foodSuccess?code=' + that.data.unifiedOrderNo,
                      })
                    } else {
                      app.globalData.ticketOrder = null;
                      wx.navigateTo({
                        url: '../success/success?code=' + that.data.unifiedOrderNo + '&&name=' + that.data.name + '&&count=' + that.data.movieCount,
                      })
                    }
                  }
                },
                fail(err) {
                  wx.hideLoading();
                  if (app.globalData.ticketOrder) {
                    wx.navigateTo({
                      url: '../waitPay/waitPay?orderNum=' + that.data.unifiedOrderNo,
                    })
                  } else {
                    wx.navigateBack({
                      delta: 1
                    })
                  }
                }
              })
            }
          } else {
            // 返回的结果为null
            wx.hideLoading();
            wx.showToast({
              title: '支付成功！',
              mask: true
            })
            setTimeout(function() {
              // 如果不存在影票订单
              if (!app.globalData.ticketOrder) {
                wx.navigateTo({
                  url: '../foodSuccess/foodSuccess?code=' + that.data.unifiedOrderNo,
                })
              } else {
                app.globalData.ticketOrder = null;
                wx.navigateTo({
                  url: '../success/success?code=' + that.data.unifiedOrderNo + '&&name=' + that.data.name + '&&count=' + that.data.movieCount,
                })
              }
            }, 2000)
          }
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
                      url: app.globalData.url + '/ticketorder/prePayOrder',
                      data: data,
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded",
                      },
                      method: 'POST',
                      success: function(e) {
                        if (e.data.status == 0) {
                          if (e.data.data) {
                            if (Array.isArray(e.data.data)) {
                              wx.hideLoading();
                              wx.showToast({
                                title: '支付成功！',
                                mask: true
                              })
                              setTimeout(function() {
                                // 如果不存在影票订单
                                if (!app.globalData.ticketOrder) {
                                  wx.navigateTo({
                                    url: '../foodSuccess/foodSuccess?code=' + that.data.unifiedOrderNo,
                                  })
                                } else {
                                  app.globalData.ticketOrder = null;
                                  wx.navigateTo({
                                    url: '../success/success?code=' + that.data.unifiedOrderNo + '&&name=' + that.data.name + '&&count=' + that.data.movieCount,
                                  })
                                }
                              }, 2000)
                            } else if (!Array.isArray(e.data.data)) {
                              that.setData({
                                canShow: false
                              })
                              wx.requestPayment({
                                timeStamp: e.data.data.timeStamp,
                                nonceStr: e.data.data.nonceStr,
                                package: e.data.data.package,
                                signType: 'MD5',
                                paySign: e.data.data.paySign,
                                success(msg) {
                                  wx.hideLoading();
                                  if (msg.errMsg == "requestPayment:ok") {
                                    // 如果不存在影票订单
                                    if (!app.globalData.ticketOrder) {
                                      wx.navigateTo({
                                        url: '../foodSuccess/foodSuccess?code=' + that.data.unifiedOrderNo,
                                      })
                                    } else {
                                      app.globalData.ticketOrder = null;
                                      wx.navigateTo({
                                        url: '../success/success?code=' + that.data.unifiedOrderNo + '&&name=' + that.data.name + '&&count=' + that.data.movieCount,
                                      })
                                    }
                                  }
                                },
                                fail() {
                                  wx.hideLoading();
                                  if (app.globalData.ticketOrder) {
                                    wx.navigateTo({
                                      url: '../waitPay/waitPay?orderNum=' + that.data.unifiedOrderNo,
                                    })
                                  } else {
                                    wx.navigateBack({
                                      delta: 1
                                    })
                                  }
                                }
                              })
                            }
                          } else {
                            wx.hideLoading();
                            wx.showToast({
                              title: '支付成功！',
                              mask: true
                            })
                            setTimeout(function() {
                              // 如果不存在影票订单
                              if (!app.globalData.ticketOrder) {
                                wx.navigateTo({
                                  url: '../foodSuccess/foodSuccess?code=' + that.data.unifiedOrderNo,
                                })
                              } else {
                                app.globalData.ticketOrder = null;
                                wx.navigateTo({
                                  url: '../success/success?code=' + that.data.unifiedOrderNo + '&&name=' + that.data.name + '&&count=' + that.data.movieCount,
                                })
                              }
                            }, 2000)
                          }
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

  close: function() {
    this.setData({
      showPay: false
    })
  },

  // 会员卡密码确认
  pay2: function() {
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
      unifiedOrderNo: that.data.unifiedOrderNo,
      mobile: that.data.phone,
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
          that.setData({
            canShow: false
          })
          // 如果不存在影票订单
          if (!app.globalData.ticketOrder) {
            wx.navigateTo({
              url: '../foodSuccess/foodSuccess?code=' + that.data.unifiedOrderNo,
            })
          } else {
            app.globalData.ticketOrder = null;
            wx.navigateTo({
              url: '../success/success?code=' + that.data.unifiedOrderNo + '&&name=' + that.data.name + '&&count=' + that.data.movieCount,
            })
          }
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
                          that.setData({
                            canShow: false
                          })
                          // 如果不存在影票订单
                          if (!app.globalData.ticketOrder) {
                            wx.navigateTo({
                              url: '../foodSuccess/foodSuccess?code=' + that.data.unifiedOrderNo,
                            })
                          } else {
                            app.globalData.ticketOrder = null;
                            wx.navigateTo({
                              url: '../success/success?code=' + that.data.unifiedOrderNo + '&&name=' + that.data.name + '&&count=' + that.data.movieCount,
                            })
                          }
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
        } else if (res.data.status == '-2') {
          wx.hideLoading();
          wx.showModal({
            title: '卖品购买失败',
            content: res.data.message,
            showCancel: false,
            success(res) {
              if (res.confirm) {
                app.globalData.ticketOrder = null;
                wx.navigateTo({
                  url: '../success/success?code=' + that.data.unifiedOrderNo + '&&name=' + that.data.name + '&&count=' + that.data.movieCount,
                })
              }
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
      },
    })
  },

  setM: function(e) {
    var password = e.detail.value;
    this.setData({
      password: password
    })
  },

  showM: function() {
    let that = this;
    if (that.data.card == null) {
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
    } else {
      let card = that.data.card;
      if (card) {
        that.setData({
          showM: true,
          cardNo: card.cardNo,
          levelCode: card.levelCode,
        })
      }
    }
  },
  closeM: function() {
    this.setData({
      showM: false,
      isShow: false,
    })
  },

  // 选择影票优惠券界面
  setType1: function() {
    let that = this;
    that.setData({
      chooseType: 1
    });
  },
  setType2: function() {
    this.setData({
      chooseType: 2
    })
  },
  //选择影票优惠活动界面
  setType3: function() {
    let that = this;
    that.setData({
      chooseType: 3
    });
  },
  //选择影票权益卡界面
  setType4: function() {
    let that = this;
    that.setData({
      chooseType: 4
    });
  },
  //选择影票优惠活动
  setActive: function(e) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let that = this
    let id = e.currentTarget.dataset.id
    let singleSurplus = e.currentTarget.dataset.code
    that.setData({
      singleSurplusFilm: singleSurplus
    })
    let changeActivity = {
      unifiedOrderNo: that.data.unifiedOrderNo,
      activityFilmId: id,
      singleSurplusFilm: singleSurplus,
      openid: app.globalData.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode
    }
    let data = md5.md5Sign(changeActivity);
    wx.request({
      url: app.globalData.url + '/ticketorder/changeActivityOrCoupon',
      data: data,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      method: 'POST',
      success: function(res) {
        if (res.data.status == 0) {
          wx.hideLoading();
          res.data.data.ticketOrderActivityVO.activities = that.data.ticketOrder.activities;
          res.data.data.ticketOrderActivityVO.benefitCards = that.data.ticketOrder.benefitCards;
          res.data.data.ticketOrderActivityVO.haveActivity = that.data.ticketOrder.haveActivity;
          res.data.data.ticketOrderActivityVO.haveBenefit = that.data.ticketOrder.haveBenefit;
          if (res.data.data.ticketOrderActivityVO) {
            if (res.data.data.ticketOrderActivityVO.coupons.length > 0) {
              for (let i = 0; i < res.data.data.ticketOrderActivityVO.coupons.length; i++) {
                res.data.data.ticketOrderActivityVO.coupons[i].startTime = res.data.data.ticketOrderActivityVO.coupons[i].startTime.split(" ")[0]
                res.data.data.ticketOrderActivityVO.coupons[i].endTime = res.data.data.ticketOrderActivityVO.coupons[i].endTime.split(" ")[0];
              }
            }
            that.setData({
              ticketPrice: res.data.data.ticketOrderActivityVO.totalActualPrice
            })
          }
          if (res.data.data.merOrderActivityVO) {
            that.setData({
              merPrice: res.data.data.merOrderActivityVO.totalActualPrice
            })
          }
          that.setData({
            ticketOrder: res.data.data.ticketOrderActivityVO,
            orderPrice: Number(that.data.ticketPrice + that.data.merPrice).toFixed(2)
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
                success: function(e) {
                  if (e.data.status == 0) {
                    wx.setStorage({
                      key: 'sessionid',
                      data: e.header['Set-Cookie']
                    })
                    wx.request({
                      url: app.globalData.url + '/ticketorder/changeActivityOrCoupon',
                      data: data,
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        // 'cookie': wx.getStorageSync("sessionid")
                      },
                      method: 'POST',
                      success: function(res) {
                        if (res.data.status == 0) {
                          wx.hideLoading();
                          res.data.data.ticketOrderActivityVO.activities = that.data.ticketOrder.activities;
                          res.data.data.ticketOrderActivityVO.benefitCards = that.data.ticketOrder.benefitCards;
                          res.data.data.ticketOrderActivityVO.haveActivity = that.data.ticketOrder.haveActivity;
                          res.data.data.ticketOrderActivityVO.haveBenefit = that.data.ticketOrder.haveBenefit;
                          if (res.data.data.ticketOrderActivityVO) {
                            if (res.data.data.ticketOrderActivityVO.coupons.length > 0) {
                              for (let i = 0; i < res.data.data.ticketOrderActivityVO.coupons.length; i++) {
                                res.data.data.ticketOrderActivityVO.coupons[i].startTime = res.data.data.ticketOrderActivityVO.coupons[i].startTime.split(" ")[0]
                                res.data.data.ticketOrderActivityVO.coupons[i].endTime = res.data.data.ticketOrderActivityVO.coupons[i].endTime.split(" ")[0];
                              }
                            }
                            that.setData({
                              ticketPrice: res.data.data.ticketOrderActivityVO.totalActualPrice
                            })
                          }
                          if (res.data.data.merOrderActivityVO) {
                            that.setData({
                              merPrice: res.data.data.merOrderActivityVO.totalActualPrice
                            })
                          }
                          that.setData({
                            ticketOrder: res.data.data.ticketOrderActivityVO,
                            orderPrice: Number(that.data.ticketPrice + that.data.merPrice).toFixed(2)
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
      },
    })
  },
  //选择影票权益卡
  setBenefit: function(e) {
    let that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let id = e.currentTarget.dataset.id
    let singleSurplus = e.currentTarget.dataset.code
    that.setData({
      singleSurplusFilm: singleSurplus
    })
    let changeActivity = {
      unifiedOrderNo: that.data.unifiedOrderNo,
      benifitFilmId: id,
      singleSurplusFilm: singleSurplus,
      openid: app.globalData.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode
    }
    let data = md5.md5Sign(changeActivity);
    wx.request({
      url: app.globalData.url + '/ticketorder/changeActivityOrCoupon',
      data: data,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      method: 'POST',
      success: function(res) {
        if (res.data.status == 0) {
          wx.hideLoading();
          res.data.data.ticketOrderActivityVO.activities = that.data.ticketOrder.activities
          res.data.data.ticketOrderActivityVO.benefitCards = that.data.ticketOrder.benefitCards
          res.data.data.ticketOrderActivityVO.haveActivity = that.data.ticketOrder.haveActivity
          res.data.data.ticketOrderActivityVO.haveBenefit = that.data.ticketOrder.haveBenefit
          if (res.data.data.ticketOrderActivityVO) {
            if (res.data.data.ticketOrderActivityVO.coupons.length > 0) {
              for (let i = 0; i < res.data.data.ticketOrderActivityVO.coupons.length; i++) {
                res.data.data.ticketOrderActivityVO.coupons[i].startTime = res.data.data.ticketOrderActivityVO.coupons[i].startTime.split(" ")[0]
                res.data.data.ticketOrderActivityVO.coupons[i].endTime = res.data.data.ticketOrderActivityVO.coupons[i].endTime.split(" ")[0];
              }
            }
            that.setData({
              ticketPrice: res.data.data.ticketOrderActivityVO.totalActualPrice
            })
          }
          if (res.data.data.merOrderActivityVO) {
            that.setData({
              merPrice: res.data.data.merOrderActivityVO.totalActualPrice
            })
          }
          that.setData({
            ticketOrder: res.data.data.ticketOrderActivityVO,
            orderPrice: Number(that.data.ticketPrice + that.data.merPrice).toFixed(2)
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
                success: function(e) {
                  if (e.data.status == 0) {
                    wx.setStorage({
                      key: 'sessionid',
                      data: e.header['Set-Cookie']
                    })
                    wx.request({
                      url: app.globalData.url + '/ticketorder/changeActivityOrCoupon',
                      data: data,
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        // 'cookie': wx.getStorageSync("sessionid")
                      },
                      method: 'POST',
                      success: function(res) {
                        if (res.data.status == 0) {
                          wx.hideLoading();
                          res.data.data.ticketOrderActivityVO.activities = that.data.ticketOrder.activities
                          res.data.data.ticketOrderActivityVO.benefitCards = that.data.ticketOrder.benefitCards
                          res.data.data.ticketOrderActivityVO.haveActivity = that.data.ticketOrder.haveActivity
                          res.data.data.ticketOrderActivityVO.haveBenefit = that.data.ticketOrder.haveBenefit
                          if (res.data.data.ticketOrderActivityVO) {
                            if (res.data.data.ticketOrderActivityVO.coupons.length > 0) {
                              for (let i = 0; i < res.data.data.ticketOrderActivityVO.coupons.length; i++) {
                                res.data.data.ticketOrderActivityVO.coupons[i].startTime = res.data.data.ticketOrderActivityVO.coupons[i].startTime.split(" ")[0]
                                res.data.data.ticketOrderActivityVO.coupons[i].endTime = res.data.data.ticketOrderActivityVO.coupons[i].endTime.split(" ")[0];
                              }
                            }
                            that.setData({
                              ticketPrice: res.data.data.ticketOrderActivityVO.totalActualPrice
                            })
                          }
                          if (res.data.data.merOrderActivityVO) {
                            that.setData({
                              merPrice: res.data.data.merOrderActivityVO.totalActualPrice
                            })
                          }
                          that.setData({
                            ticketOrder: res.data.data.ticketOrderActivityVO,
                            orderPrice: Number(that.data.ticketPrice + that.data.merPrice).toFixed(2)
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
      },
    })
  },
  // 选择影票优惠券
  setSeatCoupon: function(e) {
    let that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let id = e.currentTarget.dataset.id
    let changeActivity = {
      unifiedOrderNo: that.data.unifiedOrderNo,
      userCouponFilmId: id,
      openid: app.globalData.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode
    }
    let data = md5.md5Sign(changeActivity);
    wx.request({
      url: app.globalData.url + '/ticketorder/changeActivityOrCoupon',
      data: data,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      method: 'POST',
      success: function(res) {
        wx.hideLoading();
        if (res.data.status == 0) {
          res.data.data.ticketOrderActivityVO.activities = that.data.ticketOrder.activities
          res.data.data.ticketOrderActivityVO.benefitCards = that.data.ticketOrder.benefitCards
          res.data.data.ticketOrderActivityVO.haveActivity = that.data.ticketOrder.haveActivity
          res.data.data.ticketOrderActivityVO.haveBenefit = that.data.ticketOrder.haveBenefit
          res.data.data.ticketOrderActivityVO.haveCoupon = that.data.ticketOrder.haveCoupon
          res.data.data.ticketOrderActivityVO.coupons = that.data.ticketOrder.coupons
          if (res.data.data.ticketOrderActivityVO) {
            if (res.data.data.ticketOrderActivityVO.coupons.length > 0) {
              for (let i = 0; i < res.data.data.ticketOrderActivityVO.coupons.length; i++) {
                res.data.data.ticketOrderActivityVO.coupons[i].startTime = res.data.data.ticketOrderActivityVO.coupons[i].startTime.split(" ")[0]
                res.data.data.ticketOrderActivityVO.coupons[i].endTime = res.data.data.ticketOrderActivityVO.coupons[i].endTime.split(" ")[0];
              }
            }
            that.setData({
              ticketPrice: res.data.data.ticketOrderActivityVO.totalActualPrice
            })
          }
          if (res.data.data.merOrderActivityVO) {
            that.setData({
              merPrice: res.data.data.merOrderActivityVO.totalActualPrice
            })
          }
          that.setData({
            ticketOrder: res.data.data.ticketOrderActivityVO,
            orderPrice: Number(that.data.ticketPrice + that.data.merPrice).toFixed(2)
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
                success: function(e) {
                  if (e.data.status == 0) {
                    wx.setStorage({
                      key: 'sessionid',
                      data: e.header['Set-Cookie']
                    })
                    wx.request({
                      url: app.globalData.url + '/ticketorder/changeActivityOrCoupon',
                      data: data,
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        // 'cookie': wx.getStorageSync("sessionid")
                      },
                      method: 'POST',
                      success: function(res) {
                        if (res.data.status == 0) {
                          res.data.data.ticketOrderActivityVO.activities = that.data.ticketOrder.activities
                          res.data.data.ticketOrderActivityVO.benefitCards = that.data.ticketOrder.benefitCards
                          res.data.data.ticketOrderActivityVO.haveActivity = that.data.ticketOrder.haveActivity
                          res.data.data.ticketOrderActivityVO.haveBenefit = that.data.ticketOrder.haveBenefit
                          if (res.data.data.ticketOrderActivityVO) {
                            if (res.data.data.ticketOrderActivityVO.coupons.length > 0) {
                              for (let i = 0; i < res.data.data.ticketOrderActivityVO.coupons.length; i++) {
                                res.data.data.ticketOrderActivityVO.coupons[i].startTime = res.data.data.ticketOrderActivityVO.coupons[i].startTime.split(" ")[0]
                                res.data.data.ticketOrderActivityVO.coupons[i].endTime = res.data.data.ticketOrderActivityVO.coupons[i].endTime.split(" ")[0];
                              }
                            }
                            that.setData({
                              ticketPrice: res.data.data.ticketOrderActivityVO.totalActualPrice
                            })
                          }
                          if (res.data.data.merOrderActivityVO) {
                            that.setData({
                              merPrice: res.data.data.merOrderActivityVO.totalActualPrice
                            })
                          }
                          that.setData({
                            ticketOrder: res.data.data.ticketOrderActivityVO,
                            orderPrice: Number(that.data.ticketPrice + that.data.merPrice).toFixed(2)
                          })
                        }
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


  // 选择卖品优惠券界面
  setType7: function() {
    let that = this;
    that.setData({
      chooseType: 7
    });
  },
  //选择卖品优惠活动界面
  setType8: function() {
    let that = this;
    that.setData({
      chooseType: 8
    });
  },
  //选择卖品权益卡界面
  setType9: function() {
    let that = this;
    that.setData({
      chooseType: 9
    });
  },

  // 开通权益卡
  openEquityCard: function() {
    wx.showModal({
      title: '',
      content: "您还没有权益卡，是否前去开卡？",
      success: function(res) {
        if (res.confirm) {
          wx.navigateTo({
            url: '../equityCard/equityCard',
          })
        }
      }
    })
  },
  //选择卖品优惠活动
  setMerActive: function(e) {
    let that = this
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let id = e.currentTarget.dataset.id
    let changeActivity = {
      unifiedOrderNo: that.data.unifiedOrderNo,
      activityMerId: id,
      openid: app.globalData.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode
    }
    let data = md5.md5Sign(changeActivity);
    wx.request({
      url: app.globalData.url + '/ticketorder/changeActivityOrCoupon',
      data: data,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      method: 'POST',
      success: function(res) {
        wx.hideLoading()
        if (res.data.status == 0) {
          res.data.data.merOrderActivityVO.activities = that.data.merOrder.activities
          res.data.data.merOrderActivityVO.benefitCards = that.data.merOrder.benefitCards
          res.data.data.merOrderActivityVO.haveActivity = that.data.merOrder.haveActivity
          res.data.data.merOrderActivityVO.haveBenefit = that.data.merOrder.haveBenefit
          if (res.data.data.ticketOrderActivityVO) {
            that.setData({
              ticketPrice: res.data.data.ticketOrderActivityVO.totalActualPrice
            })
          }
          if (res.data.data.merOrderActivityVO) {
            if (res.data.data.merOrderActivityVO.coupons.length > 0) {
              for (let i = 0; i < res.data.data.merOrderActivityVO.coupons.length; i++) {
                res.data.data.merOrderActivityVO.coupons[i].startTime = res.data.data.merOrderActivityVO.coupons[i].startTime.split(" ")[0]
                res.data.data.merOrderActivityVO.coupons[i].endTime = res.data.data.merOrderActivityVO.coupons[i].endTime.split(" ")[0];
              }
            }
            that.setData({
              merPrice: res.data.data.merOrderActivityVO.totalActualPrice
            })
          }
          that.setData({
            merOrder: res.data.data.merOrderActivityVO,
            orderPrice: Number(that.data.ticketPrice + that.data.merPrice).toFixed(2)
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
                success: function(e) {
                  if (e.data.status == 0) {
                    wx.setStorage({
                      key: 'sessionid',
                      data: e.header['Set-Cookie']
                    })
                    wx.request({
                      url: app.globalData.url + '/ticketorder/changeActivityOrCoupon',
                      data: data,
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        // 'cookie': wx.getStorageSync("sessionid")
                      },
                      method: 'POST',
                      success: function(res) {
                        if (res.data.status == 0) {
                          res.data.data.merOrderActivityVO.activities = that.data.merOrder.activities
                          res.data.data.merOrderActivityVO.benefitCards = that.data.merOrder.benefitCards
                          res.data.data.merOrderActivityVO.haveActivity = that.data.merOrder.haveActivity
                          res.data.data.merOrderActivityVO.haveBenefit = that.data.merOrder.haveBenefit
                          if (res.data.data.ticketOrderActivityVO) {
                            that.setData({
                              ticketPrice: res.data.data.ticketOrderActivityVO.totalActualPrice
                            })
                          }
                          if (res.data.data.merOrderActivityVO) {
                            if (res.data.data.merOrderActivityVO.coupons.length > 0) {
                              for (let i = 0; i < res.data.data.merOrderActivityVO.coupons.length; i++) {
                                res.data.data.merOrderActivityVO.coupons[i].startTime = res.data.data.merOrderActivityVO.coupons[i].startTime.split(" ")[0]
                                res.data.data.merOrderActivityVO.coupons[i].endTime = res.data.data.merOrderActivityVO.coupons[i].endTime.split(" ")[0];
                              }
                            }
                            that.setData({
                              merPrice: res.data.data.merOrderActivityVO.totalActualPrice
                            })
                          }
                          that.setData({
                            merOrder: res.data.data.merOrderActivityVO,
                            orderPrice: Number(that.data.ticketPrice + that.data.merPrice).toFixed(2)
                          })
                        }
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
  //选择卖品·权益卡
  setMerBenefit: function(e) {
    let that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let id = e.currentTarget.dataset.id
    let changeActivity = {
      unifiedOrderNo: that.data.unifiedOrderNo,
      benifitMerId: id,
      openid: app.globalData.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode
    }
    let data = md5.md5Sign(changeActivity);
    wx.request({
      url: app.globalData.url + '/ticketorder/changeActivityOrCoupon',
      data: data,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      method: 'POST',
      success: function(res) {
        wx.hideLoading()
        if (res.data.status == 0) {
          res.data.data.merOrderActivityVO.activities = that.data.merOrder.activities
          res.data.data.merOrderActivityVO.benefitCards = that.data.merOrder.benefitCards
          res.data.data.merOrderActivityVO.haveActivity = that.data.merOrder.haveActivity
          res.data.data.merOrderActivityVO.haveBenefit = that.data.merOrder.haveBenefit
          if (res.data.data.ticketOrderActivityVO) {
            that.setData({
              ticketPrice: res.data.data.ticketOrderActivityVO.totalActualPrice
            })
          }
          if (res.data.data.merOrderActivityVO) {
            if (res.data.data.merOrderActivityVO.coupons.length > 0) {
              for (let i = 0; i < res.data.data.merOrderActivityVO.coupons.length; i++) {
                res.data.data.merOrderActivityVO.coupons[i].startTime = res.data.data.merOrderActivityVO.coupons[i].startTime.split(" ")[0]
                res.data.data.merOrderActivityVO.coupons[i].endTime = res.data.data.merOrderActivityVO.coupons[i].endTime.split(" ")[0];
              }
            }
            that.setData({
              merPrice: res.data.data.merOrderActivityVO.totalActualPrice
            })
          }
          that.setData({
            merOrder: res.data.data.merOrderActivityVO,
            orderPrice: Number(that.data.ticketPrice + that.data.merPrice).toFixed(2)
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
                success: function(e) {
                  if (e.data.status == 0) {
                    wx.setStorage({
                      key: 'sessionid',
                      data: e.header['Set-Cookie']
                    })
                    wx.request({
                      url: app.globalData.url + '/ticketorder/changeActivityOrCoupon',
                      data: data,
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        // 'cookie': wx.getStorageSync("sessionid")
                      },
                      method: 'POST',
                      success: function(res) {
                        if (res.data.status == 0) {
                          res.data.data.merOrderActivityVO.activities = that.data.merOrder.activities
                          res.data.data.merOrderActivityVO.benefitCards = that.data.merOrder.benefitCards
                          res.data.data.merOrderActivityVO.haveActivity = that.data.merOrder.haveActivity
                          res.data.data.merOrderActivityVO.haveBenefit = that.data.merOrder.haveBenefit
                          if (res.data.data.ticketOrderActivityVO) {
                            that.setData({
                              ticketPrice: res.data.data.ticketOrderActivityVO.totalActualPrice
                            })
                          }
                          if (res.data.data.merOrderActivityVO) {
                            if (res.data.data.merOrderActivityVO.coupons.length > 0) {
                              for (let i = 0; i < res.data.data.merOrderActivityVO.coupons.length; i++) {
                                res.data.data.merOrderActivityVO.coupons[i].startTime = res.data.data.merOrderActivityVO.coupons[i].startTime.split(" ")[0]
                                res.data.data.merOrderActivityVO.coupons[i].endTime = res.data.data.merOrderActivityVO.coupons[i].endTime.split(" ")[0];
                              }
                            }
                            that.setData({
                              merPrice: res.data.data.merOrderActivityVO.totalActualPrice
                            })
                          }
                          that.setData({
                            merOrder: res.data.data.merOrderActivityVO,
                            orderPrice: Number(that.data.ticketPrice + that.data.merPrice).toFixed(2)
                          })
                        }
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
  // 选择卖品优惠券
  setMerCoupon: function(e) {
    let that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let id = e.currentTarget.dataset.id
    let changeActivity = {
      unifiedOrderNo: that.data.unifiedOrderNo,
      userCouponMerId: id,
      openid: app.globalData.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode
    }
    let data = md5.md5Sign(changeActivity);
    wx.request({
      url: app.globalData.url + '/ticketorder/changeActivityOrCoupon',
      data: data,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      method: 'POST',
      success: function(res) {
        wx.hideLoading();
        if (res.data.status == 0) {
          res.data.data.merOrderActivityVO.activities = that.data.merOrder.activities
          res.data.data.merOrderActivityVO.benefitCards = that.data.merOrder.benefitCards
          res.data.data.merOrderActivityVO.haveActivity = that.data.merOrder.haveActivity
          res.data.data.merOrderActivityVO.haveBenefit = that.data.merOrder.haveBenefit
          res.data.data.merOrderActivityVO.haveCoupon = that.data.merOrder.haveCoupon
          res.data.data.merOrderActivityVO.coupons = that.data.merOrder.coupons
          if (res.data.data.ticketOrderActivityVO) {
            that.setData({
              ticketPrice: res.data.data.ticketOrderActivityVO.totalActualPrice
            })
          }
          if (res.data.data.merOrderActivityVO) {
            if (res.data.data.merOrderActivityVO.coupons.length > 0) {
              for (let i = 0; i < res.data.data.merOrderActivityVO.coupons.length; i++) {
                res.data.data.merOrderActivityVO.coupons[i].startTime = res.data.data.merOrderActivityVO.coupons[i].startTime.split(" ")[0]
                res.data.data.merOrderActivityVO.coupons[i].endTime = res.data.data.merOrderActivityVO.coupons[i].endTime.split(" ")[0];
              }
            }
            that.setData({
              merPrice: res.data.data.merOrderActivityVO.totalActualPrice
            })
          }
          that.setData({
            merOrder: res.data.data.merOrderActivityVO,
            orderPrice: Number(that.data.ticketPrice + that.data.merPrice).toFixed(2)
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
                success: function(e) {
                  if (e.data.status == 0) {
                    wx.setStorage({
                      key: 'sessionid',
                      data: e.header['Set-Cookie']
                    })
                    wx.request({
                      url: app.globalData.url + '/ticketorder/changeActivityOrCoupon',
                      data: data,
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        // 'cookie': wx.getStorageSync("sessionid")
                      },
                      method: 'POST',
                      success: function(res) {
                        if (res.data.status == 0) {
                          res.data.data.merOrderActivityVO.activities = that.data.merOrder.activities
                          res.data.data.merOrderActivityVO.benefitCards = that.data.merOrder.benefitCards
                          res.data.data.merOrderActivityVO.haveActivity = that.data.merOrder.haveActivity
                          res.data.data.merOrderActivityVO.haveBenefit = that.data.merOrder.haveBenefit
                          res.data.data.merOrderActivityVO.haveCoupon = that.data.merOrder.haveCoupon
                          res.data.data.merOrderActivityVO.coupons = that.data.merOrder.coupons
                          if (res.data.data.ticketOrderActivityVO) {
                            that.setData({
                              ticketPrice: res.data.data.ticketOrderActivityVO.totalActualPrice
                            })
                          }
                          if (res.data.data.merOrderActivityVO) {
                            if (res.data.data.merOrderActivityVO.coupons.length > 0) {
                              for (let i = 0; i < res.data.data.merOrderActivityVO.coupons.length; i++) {
                                res.data.data.merOrderActivityVO.coupons[i].startTime = res.data.data.merOrderActivityVO.coupons[i].startTime.split(" ")[0]
                                res.data.data.merOrderActivityVO.coupons[i].endTime = res.data.data.merOrderActivityVO.coupons[i].endTime.split(" ")[0];
                              }
                            }
                            that.setData({
                              merPrice: res.data.data.merOrderActivityVO.totalActualPrice
                            })
                          }
                          that.setData({
                            merOrder: res.data.data.merOrderActivityVO,
                            orderPrice: Number(that.data.ticketPrice + that.data.merPrice).toFixed(2)
                          })
                        }
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
  setFoodCoupon: function(e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    that.setData({
      merTicketId: id
    })
    that.calculate();
  },
  closeChoose: function() {
    let that = this;
    that.setData({
      chooseType: 0
    })
  },
  messageshow: function() {
    this.setData({
      messageshow: true
    })
  },
  btnShowExchange2: function() {
    this.setData({
      isShow: !this.data.isShow
    })
  },
  closeMessageshow: function() {
    this.setData({
      messageshow: false
    })
  },
  setMessage: function(e) {
    var userMessage = e.detail.value;
    this.setData({
      userMessage: userMessage
    })
  },
  formSubmit: function(e) {
    this.setData({
      formids: e.detail.formId
    })
  },

  currentTicketTab: function (e) {
    if (this.data.currentTicketTab == e.currentTarget.dataset.idx) {
      return;
    }
    if (e.currentTarget.dataset.idx == 0) {
      this.setData({
        canuseTicketCoupon: true,
        unCanuseTicketCoupon: false
      })
    }
    if (e.currentTarget.dataset.idx == 1) {
      this.setData({
        canuseTicketCoupon: false,
        unCanuseTicketCoupon: true
      })
    }
    this.setData({
      currentTicketTab: e.currentTarget.dataset.idx
    })
  },

  currentMerTab: function (e) {
    if (this.data.currentMerTab == e.currentTarget.dataset.idx) {
      return;
    }
    if (e.currentTarget.dataset.idx == 0) {
      this.setData({
        canuseMerCoupon: true,
        unCanuseMerCoupon: false
      })
    }
    if (e.currentTarget.dataset.idx == 1) {
      this.setData({
        canuseMerCoupon: false,
        unCanuseMerCoupon: true
      })
    }
    this.setData({
      currentMerTab: e.currentTarget.dataset.idx
    })
  },

  seeTicketAll: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    let ticketOrder = that.data.ticketOrder;
    // for (let i = 0; i < ticketOrder.coupons.length; i++) {
    //   ticketOrder.coupons[i].coupon.select = false;
    // }
    ticketOrder.coupons[index].coupon.select = !ticketOrder.coupons[index].coupon.select;
    that.setData({
      ticketOrder: ticketOrder
    })
  },

  seeMerAll: function (e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    let merOrder = that.data.merOrder;
    merOrder.coupons[index].coupon.select = !merOrder.coupons[index].coupon.select;
    // for (let i = 0; i < merOrder.coupons.length; i++) {
    //   merOrder.coupons[i].coupon.select = false;
    // }
    that.setData({
      merOrder: merOrder
    })
  },
})