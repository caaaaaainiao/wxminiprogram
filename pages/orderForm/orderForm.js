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
    phone: '',
    timer: '',
    unlockTime: "",
    showM: false,
    messageshow: false,
    userMessage: "",
    autoUnlockDatetime: '',
    isShow: false,
    couponsCode: null,
    sessionCode: '',
    price: 0,
    buyNum: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    let  ticketOrder = app.globalData.ticketOrder;
    that.setData({
      movieName: options.filmName,
      count: ticketOrder.ticketNum,
      date: options.time,
      cinemaName: app.globalData.cinemaList.cinemaName,
      hallName: options.screenName,
      seatArr: options.seatArr,
      endTime: options.endTime,
      beginTime: options.beginTime,
      ticketPrice: options.price,
      ticketOrder: ticketOrder,
      price: ticketOrder.totalActualPrice,
      allPrice: Number(ticketOrder.totalActualPrice).toFixed(2),
      memberPrice: app.globalData.memberPrice * ticketOrder.ticketNum,
      allMemberPrice: Number(app.globalData.memberPrice * ticketOrder.ticketNum).toFixed(2)
    })
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
    let that = this;
    that.leftTime();
    that.getFoodCombo(app.globalData.ticketOrder.unifiedOrderNo)
  },

  /**
   * 生命周期函数--监听页面显示z
   */
  onShow: function() {
    wx.hideLoading();
  },

  // 倒计时
  leftTime: function() {
    var that = this;
    that.setData({
      timer: setInterval(function() {
        var nowTime = parseInt(new Date().getTime());
        var date = new Date(app.globalData.ticketOrder.autoUnlockDatetime.replace(/-/g, '/')).getTime();
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
    let that = this;
    wx.navigateBack({
      delta: 1
    })
    app.globalData.ticketOrder = null;
    clearInterval(this.data.timer)
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

  // 获取推荐套餐
  getFoodCombo: function(orderNo) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let that = this;
    let data = {
      unifiedOrderNo: orderNo,
      openid: app.globalData.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode
    };
    let dataInfo = md5.md5Sign(data);
    wx.request({
      url: app.globalData.url + '/ticketorder/queryRecommendMerCombo',
      data: dataInfo,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      success: function (res) {
        if (res.data.status == 0) {
          wx.hideLoading();
          for (let i = 0; i < res.data.data.length; i++) {
            res.data.data[i].count = 0;
            };
          that.setData({
            foodCombo: res.data.data
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
                      url: app.globalData.url + '/ticketorder/queryRecommendMerCombo',
                      data: dataInfo,
                      method: "POST",
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        // 'cookie': e.header['Set-Cookie']
                      },
                      success: function (msg) {
                        if (msg.data.status == 0) {
                          wx.hideLoading();
                          for (let i = 0; i < msg.data.data.length; i++) {
                            msg.data.data[i].count = 0;
                          };
                          that.setData({
                            foodCombo: msg.data.data
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

  // 增加数量
  add: function(e) {
    var that = this;
    var comboList = that.data.foodCombo;
    var buyNum = that.data.buyNum;
    let cartGoods = [];
    var id = e.currentTarget.dataset.id;
    for (let i = 0; i < comboList.length; i++) {
      if (comboList[i].merchandiseSet == id) {
        comboList[i].count ++;
        buyNum ++
      }
      if (that.data.foodCombo[i].count > 0) {
        cartGoods.push(that.data.foodCombo[i])
      }
    }
    that.setData({
      foodCombo: comboList,
      buyNum: buyNum,
      cartGoods: cartGoods
    })
    that.calculate();
  },

  // 减少数量
  minus: function(e) {
    var that = this;
    var comboList = that.data.foodCombo;
    var buyNum = that.data.buyNum;
    let cartGoods = [];
    var id = e.currentTarget.dataset.id;
    for (let i = 0; i < comboList.length; i++) {
      if (comboList[i].merchandiseSet == id) {
        comboList[i].count --;
        buyNum --
        if (comboList[i].count < 1) {
          comboList[i].count = 0;
        }
        if (buyNum < 1) {
          buyNum = 0;
        }
      }
      if (that.data.foodCombo[i].count > 0) {
        cartGoods.push(that.data.foodCombo[i])
      }
    }
    that.setData({
      foodCombo: comboList,
      buyNum: buyNum,
      cartGoods: cartGoods
    })
    that.calculate();
  },

  //计算价格
  calculate: function() { 
    var that = this;
    let goodsList = that.data.foodCombo;
    let foodPrice = 0;
    let cartGoods = that.data.cartGoods;
    if (cartGoods.length > 0) {
      for (let i = 0; i < cartGoods.length; i++) {
        if (cartGoods[i].count > 0) {
          foodPrice += Number(cartGoods[i].originalPrice) * Number(cartGoods[i].count)
        }
      }
    }
    that.setData({
      allPrice: (Number(foodPrice) + Number(that.data.price)).toFixed(2),
      allMemberPrice: (Number(foodPrice) + Number(that.data.memberPrice)).toFixed(2)
    })
  },

  // 创建订单
  createOrder: function () {
    let that = this;
    let buyNum = that.data.buyNum;
    let goodList = that.data.cartGoods;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
      let order = {};
      if (buyNum > 0) {
        let merchandiseDTOS = [];
        for (let i = 0; i < goodList.length; i++) {
          merchandiseDTOS.push({
            'merchandiseCode': goodList[i].merchandiseSet,
            'merchandiseCount': goodList[i].count
          })
        }
        order.merchandiseDTOS = JSON.stringify(merchandiseDTOS);
      } else {
        order.merchandiseDTOS = '';
      }
      order.cinemaCode = app.globalData.cinemaCode;
      order.deliveryType = "0";
      order.mobile = that.data.phone;
      order.unifiedOrderNo = that.data.ticketOrder.unifiedOrderNo;
      order.openid = app.globalData.userInfo.openid;
      order.cinemaCode = app.globalData.cinemaCode;
      let orderInfo = md5.md5Sign(order)
      wx.request({
        url: app.globalData.url + '/miniMerchandise/createMerchandiseOrder',
        data: orderInfo,
        method: "POST",
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
          // 'cookie': wx.getStorageSync("sessionid")
        },
        success: function (res) {
          if (res.data == "{code=notLogin, message=请先登录, data=null, status=1000}") {
            // 登陆过期
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
                      if (e.header['Set-Cookie']) {
                        wx.setStorage({
                          key: 'sessionid',
                          data: e.header['Set-Cookie'],
                        })
                      }
                      wx.request({
                        url: app.globalData.url + '/miniMerchandise/createMerchandiseOrder',
                        data: orderInfo,
                        method: "POST",
                        header: {
                          "Content-Type": "application/x-www-form-urlencoded",
                          // 'cookie': e.header['Set-Cookie']
                        },
                        success: function (msg) {
                          wx.hideLoading();
                          if (msg.data.status == 0) {
                            app.globalData.goodsOrder = msg.data.data;
                            wx.navigateTo({
                              url: '../submitOrder/submitOrder?name=' + that.data.movieName + '&&time=' + that.data.date + '&&seatArr=' + that.data.seatArr + '&&screenName=' + that.data.hallName + '&&beginTime=' + that.data.beginTime + '&&endTime=' + that.data.endTime + '&&unlockTime=' + that.data.unlockTime + '&&count=' + that.data.count,
                            })
                          } else {
                            wx.showToast({
                              title: msg.data.message,
                              icon: 'none'
                            })
                          }
                        }
                      })
                    }
                  }
                })
              },
            })
          } else if (res.data.status == 0) {
            wx.navigateTo({
              url: '../submitOrder/submitOrder?name=' + that.data.movieName + '&&time=' + that.data.date + '&&seatArr=' + that.data.seatArr + '&&screenName=' + that.data.hallName + '&&beginTime=' + that.data.beginTime + '&&endTime=' + that.data.endTime + '&&unlockTime=' + that.data.unlockTime + '&&count=' + that.data.count,
            })
            wx.hideLoading()
            app.globalData.goodsOrder = res.data.data;
          } else {
            wx.hideLoading()
            wx.showToast({
              title: res.data.message,
              icon: 'none'
            })
          }
        }
      })
  },

  changePhone: function(e) {
    var phone = e.detail.value;
    this.setData({
      phone: phone
    })
  },


  messageshow: function() {
    this.setData({
      messageshow: true
    })
  },

  // 查看会员协议
  cinemaAgreement: function () {
    let that = this;
    that.setData({
      showMemberCardMessage: true,
      memberCardAgreement: app.globalData.membershipServiceAgreement,
    })
  },

  // 关闭会员协议
  close: function () {
    let that = this;
    that.setData({
      showMemberCardMessage: false,
    })
  },
})