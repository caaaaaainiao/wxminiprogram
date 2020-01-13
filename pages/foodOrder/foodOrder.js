// pages/foodOrder/foodOrder.js
const app = getApp();
const util = require('../../utils/util.js');
const md5 = require('../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    type: 0,
    phone: "",
    type2address: "",
    showBlack: false,
    startChoose: false,
    isReady: 0,
    messageshow: false,
    userMessage: "",
    showReady: false,
    isShow: false,
    isbind: false,
    onbind: true,
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    that.setData({
      goodsOrder: app.globalData.foodsCart,
      type: app.globalData.sendtype,
      type2address: app.globalData.selectScreenName,
      checkAddress: app.globalData.checkAddress,
      price: Number(options.price).toFixed(2)
    })
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        that.setData({
          userInfo: res.data
        })
      },
    })
    wx.setNavigationBarTitle({
      title: app.globalData.cinemaList.cinemaName
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
    var that = this;
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

  // 创建订单
  createGoodsOrder: function() {
    let that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let cartList = that.data.goodsOrder;
    let order = {};
    let merchandiseDTOS = [];
    for (let i = 0; i < cartList.length; i++) {
      merchandiseDTOS.push({
        'merchandiseCode': cartList[i].merchandiseCode,
        'merchandiseCount': cartList[i].count
      })
    }
    if (that.data.type == 0) {
      order.cinemaCode = app.globalData.cinemaCode;
      order.openid = app.globalData.userInfo.openid;
      order.deliveryType = that.data.type;
      order.merchandiseDTOS = JSON.stringify(merchandiseDTOS);
      order.mobile = that.data.phone;
      order.deliveryMemo = that.data.userMessage;
    }
    if (that.data.type == 1) {
      order.cinemaCode = app.globalData.cinemaCode;
      order.openid = app.globalData.userInfo.openid;
      order.deliveryAddress = app.globalData.selectScreenName;
      order.deliveryType = that.data.type;
      order.merchandiseDTOS = JSON.stringify(merchandiseDTOS);
      order.mobile = that.data.phone;
      order.deliveryMemo = that.data.userMessage;
    }
    if (that.data.type == 2) {
      order.cinemaCode = app.globalData.cinemaCode;
      order.openid = app.globalData.userInfo.openid;
      order.deliveryAddress = app.globalData.checkAddress;
      order.deliveryType = that.data.type;
      order.merchandiseDTOS = JSON.stringify(merchandiseDTOS);
      order.mobile = that.data.phone;
      order.deliveryMemo = that.data.userMessage;
    }
    let orderInfo = md5.md5Sign(order)
    wx.request({
      url: app.globalData.url + '/miniMerchandise/createMerchandiseOrder',
      data: orderInfo,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      success: function(res) {
        if (res.data == "{code=notLogin, message=请先登录, data=null, status=1000}") {
          // 登陆过期
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
                      success: function(msg) {
                        wx.hideLoading();
                        if (msg.data.status == 0) {
                          app.globalData.goodsOrder = msg.data.data;
                          wx.navigateTo({
                            url: '../submitOrder/submitOrder',
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
          app.globalData.goodsOrder = res.data.data;
          wx.navigateTo({
            url: '../submitOrder/submitOrder',
          })
          wx.hideLoading()
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

  // 获取手机号
  getPhone: function(e) {
    let that = this;
    let phone = e.detail.value;
    that.setData({
      phone: phone,
    })
  },

  chooseClose: function() {
    this.setData({
      showReady: false
    })
  },

  chooseType: function(e) {
    var that = this;
    var type = e.currentTarget.dataset.type;
    that.setData({
      isReady: type,
    })
  },

  sureChoose: function() {
    this.setData({
      showBlack: true,
      showReady: false
    })
  },

  close: function() {
    this.setData({
      showBlack: false
    })
  },

  setM: function(e) {
    var password = e.detail.value;
    this.setData({
      password: password
    })
  },


  messageshow: function() {
    this.setData({
      messageshow: true
    })
  },

  closeMessageshow: function() {
    this.setData({
      messageshow: false
    })
  },

  setMessage: function(e) {
    var userMessage = e.detail.value;
    var that = this
    that.setData({
      userMessage: userMessage
    })
  },

  // 查看会员协议
  cinemaAgreement: function() {
    let that = this;
    that.setData({
      showMemberCardMessage: true,
      memberCardAgreement: app.globalData.membershipServiceAgreement,
    })
  },
  
  // 关闭会员协议
  close: function() {
    let that = this;
    that.setData({
      showMemberCardMessage: false,
    })
  },
})