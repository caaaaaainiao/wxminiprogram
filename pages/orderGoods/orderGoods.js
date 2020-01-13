// pages/orderGoods.js
const app = getApp();
const util = require('../../utils/util.js');
const md5 = require('../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    mail: false,
    invite: false,
    messageshow: false,
    userMessage: "",
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    if (app.globalData.pickUpWay == 1) {
      that.setData({
        invite: true
      })
    }
    if (app.globalData.pickUpWay == 2) {
      that.setData({
        mail: true
      })
    }
    that.setData({
      infomation: app.globalData.goodsOrder,
      phoneNumber: app.globalData.goodsOrder.userMobile
    });
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        that.setData({
          userInfo: res.data
        })
      },
    })
    wx.setNavigationBarTitle({
      title: "确认订单"
    });
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

  // 修改手机号
  changePhone: function (e) {
    let that = this;
    that.setData({
      phoneNumber: e.detail.value
    })
  },

  // 支付并跳转
  pay: function () {
    let that = this;
    if (!that.data.phoneNumber) {
      wx.showToast({
        title: '请输入手机号',
        mask: true,
        icon: 'none'
      })
      return;
    }
    if (!that.data.infomation.money) {
      wx.showModal({
        title: '提示',
        content: '请确认兑换该商品',
        success(res) {
          if (res.confirm) {
            wx.showLoading({
              title: '加载中',
              mask: true
            })
            let data = {};
            if (app.globalData.pickUpWay == 1) {
              data = {
                openid: app.globalData.userInfo.openid,
                cinemaCode: app.globalData.cinemaCode,
                exchangeCinemaCode: that.data.infomation.cinemaCode,
                id: that.data.infomation.commodityId,
                mobile: that.data.phoneNumber,
                pickUpWay: 1,
                remark: that.data.userMessage
              }
            }
            if (app.globalData.pickUpWay == 2) {
              data = {
                openid: app.globalData.userInfo.openid,
                cinemaCode: app.globalData.cinemaCode,
                id: that.data.infomation.commodityId,
                name: app.globalData.goodsOrder.name,
                mobile: app.globalData.goodsOrder.userMobile,
                rangeInfo: app.globalData.goodsOrder.region,
                addressDetail: app.globalData.goodsOrder.address,
                pickUpWay: 2,
                remark: that.data.userMessage
              }
            }
            let dataInfo = md5.md5Sign(data)
            wx.request({
              url: app.globalData.url + '/goldCommodity/createGoldCommodityOrder',
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
                    winning: true,
                    prizeId: res.data.data
                  })
                } else {
                  wx.showToast({
                    title: res.data.message,
                    icon: 'none',
                    mask: true
                  })
                }
              }
            })
          } else if (res.cancel) {
            return
          }
        }
      })
    } else {
      let data = {};
      if (app.globalData.pickUpWay == 1) {
        data = {
          openid: app.globalData.userInfo.openid,
          cinemaCode: app.globalData.cinemaCode,
          exchangeCinemaCode: that.data.infomation.cinemaCode,
          id: that.data.infomation.commodityId,
          mobile: that.data.phoneNumber,
          pickUpWay: 1,
          remark: that.data.userMessage
        }
      }
      if (app.globalData.pickUpWay == 2) {
        data = {
          openid: app.globalData.userInfo.openid,
          cinemaCode: app.globalData.cinemaCode,
          id: that.data.infomation.commodityId,
          name: app.globalData.goodsOrder.name,
          mobile: app.globalData.goodsOrder.userMobile,
          rangeInfo: app.globalData.goodsOrder.region,
          addressDetail: app.globalData.goodsOrder.address,
          pickUpWay: 2,
          remark: that.data.userMessage
        }
      }
      let dataInfo = md5.md5Sign(data)
      wx.request({
        url: app.globalData.url + '/goldCommodity/goldCommodityWxPay',
        data: dataInfo,
        method: "POST",
        header: {
          "Content-Type": "application/x-www-form-urlencoded",
          // 'cookie': wx.getStorageSync("sessionid")
        },
        success: function (res) {
          if (res.data.status == 0) {
            wx.requestPayment({
              timeStamp: res.data.data.timeStamp,
              nonceStr: res.data.data.nonceStr,
              package: res.data.data.package,
              signType: 'MD5',
              paySign: res.data.data.paySign,
              success(e) {
                wx.hideLoading();
                if (e.errMsg == "requestPayment:ok") {
                  that.setData({
                    winning: true
                  })
                }
              },
              fail() {
                wx.hideLoading();
              }
            })
          } else {
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

  // 关闭领取窗口
  winningClose: function () {
    this.setData({
      winning: false
    })
    wx.reLaunch({
      url: '../gold/gold',
    })
  },

  // 点击领取
  got: function () {
    let that = this;
    wx.redirectTo({
      url: '../myprize/myprize',
    })
    // if (!that.data.infomation.money) {
    //   this.setData({
    //     userPrize: true,
    //     winning: false
    //   })
    // } else {
    //   wx.redirectTo({
    //     url: '../myprize/myprize',
    //   })
    // }
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

  // 使用优惠券
  use: function () {
    wx.reLaunch({
      url: '../index/index',
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
          setTimeout(function(){
            wx.reLaunch({
              url: '../index/index',
            })
          },2000)
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

  messageshow: function () {
    this.setData({
      messageshow: true
    })
  },

  closeMessageshow: function () {
    this.setData({
      messageshow: false
    })
  },

  setMessage: function (e) {
    var userMessage = e.detail.value;
    var that = this;
    that.setData({
      userMessage: userMessage
    })
  },
})