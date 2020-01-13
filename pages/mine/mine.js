// pages/mine/mine.js
//获取应用实例
const app = getApp();
const util = require('../../utils/util.js');
const md5 = require('../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    progress: false,
    count: null,
    banner: [],
    couponsCount: 0, // 优惠券
    giftCount: 0, // 奖品
    goodsCount: 0, // 小食
    ticketCount: 0, // 影票
    lookedFilmCount: 0, // 看过的电影
    wantedFilmCount: 0, // 想看的电影
    support: false
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    // that.setData({
    //   isOpenMember: app.globalData.isOpenMember
    // })
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        that.setData({
          userInfo: res.data
        })
        if (res.data.memberType == 2) {
          that.getDataNumber();
        }
      },
    })
    that.getBanner();
    that.setData({
      supportPhone: app.globalData.technicalSupport
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
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        that.setData({
          userInfo: res.data
        })
        if (res.data.memberType == 2) {
          that.getDataNumber();
        }
      },
    });
    that.getBanner();
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

  // 读取背景图
  getBanner: function () {
    let that = this;
    // 读取页面背景图片
    let json = {
      cinemaCode: app.globalData.cinemaCode,
      category: 3
    };
    let obj1 = md5.md5Sign(json);
    wx.request({
      url: app.globalData.url + '/banner/getBannerByCategory',
      data: obj1,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      success(res) {
        if (res.data.status == 0) {
          that.setData({
            banner: res.data.data
          })
        }
      }
    })
  },

  // 获取用户资源数量
  getDataNumber: function () {
    let that = this;
    let data = {
      cinemaCode: app.globalData.cinemaCode,
      openid: app.globalData.userInfo.openid
    }
    let dataInfo = md5.md5Sign(data);
    wx.request({
      url: app.globalData.url + '/userCenter/myDataNumber',
      data: dataInfo,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      success(res) {
        if (res.data.status == 0) {
          that.setData({
            ticketCount: res.data.data.filmTicketNumber,
            goodsCount: res.data.data.merTicketNumber,
            couponsCount: res.data.data.couponNumber,
            giftCount: res.data.data.physicPrizeNumber,
            wantedFilmCount: res.data.data.wantNumber,
            lookedFilmCount: res.data.data.lookedNumber
          })
        } else {
          wx.hideLoading();
        }
      }
    })
  },


  myTicket: function() {
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        if (res.data.memberType == 2) {
          wx.navigateTo({
            url: '../myticket/myticket',
          })
        } else {
          wx.navigateTo({
            url: '../login/login'
          })
        }
      },
      fail: function() {
        wx.navigateTo({
          url: '../login/login',
        })
      }
    })
  },

  // 点击头像登录
  login: function () {
    wx.navigateTo({
      url: '../login/login',
    })
  },

  myFood: function() {
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        if (res.data.memberType == 2) {
          wx.navigateTo({
            url: '../myfood/myfood',
          })
        } else {
          wx.navigateTo({
            url: '../login/login'
          })
        }
      },
      fail: function() {
        wx.navigateTo({
          url: '../login/login',
        })
      }
    })
  },
  myCoupon: function() {
    var that = this;
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        if (res.data.memberType == 2) {
          wx.navigateTo({
            url: '../mycoupon/mycoupon',
          })
        } else {
          wx.navigateTo({
            url: '../login/login'
          })
        }
      },
      fail: function() {
        wx.navigateTo({
          url: '../login/login',
        })
      }
    })
  },
  myPrize: function() {
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        if (res.data.memberType == 2) {
          wx.navigateTo({
            url: '../myprize/myprize',
          })
        } else {
          wx.navigateTo({
            url: '../login/login'
          })
        }
      },
      fail: function() {
        wx.navigateTo({
          url: '../login/login',
        })
      }
    })
  },
  toCommon: function() {
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        if (res.data.memberType == 2) {
          wx.navigateTo({
            url: '../common/common',
          })
        } else {
          wx.navigateTo({
            url: '../common/common',
          })
        }
      },
      fail: function() {
        wx.navigateTo({
          url: '../login/login',
        })
      }
    })
  },
  toActivity: function() {
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        if (res.data.memberType == 2) {
          wx.navigateTo({
            url: '../hotActivity/hotActivity',
          })
        } else {
          wx.navigateTo({
            url: '../login/login'
          })
        }
      },
      fail: function() {
        wx.navigateTo({
          url: '../login/login',
        })
      }
    })
  },
  toSeenMovie: function() {
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        if (res.data.memberType == 2) {
          wx.navigateTo({
            url: '../seenMovie/seenMovie',
          })
        } else {
          wx.navigateTo({
            url: '../login/login'
          })
        }
      },
      fail: function() {
        wx.navigateTo({
          url: '../login/login',
        })
      }
    })
  },
  toWantsee: function() {
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        if (res.data.memberType == 2) {
          wx.navigateTo({
            url: '../wantsee/wantsee',
          })
        } else {
          wx.navigateTo({
            url: '../login/login'
          })
        }
      },
      fail: function() {
        wx.navigateTo({
          url: '../login/login',
        })
      }
    })
  },
  toCinemaDetail: function () {
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        if (res.data.memberType == 2) {
          wx.navigateTo({
            url: '../cinemaDetail/cinemaDetail',
          })
        } else {
          wx.navigateTo({
            url: '../login/login'
          })
        }
      },
      fail: function () {
        wx.navigateTo({
          url: '../login/login',
        })
      }
    })
  },
  toMycard: function() {
    if (this.data.isOpenMember == 0){
      wx.showToast({
        title: '暂未开通',
        icon:'none'
      })
      return
    }
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        if (res.data.memberType == 2) {
          wx.navigateTo({
            url: '../mycard/mycard',
          })
        } else {
          wx.navigateTo({
            url: '../login/login'
          })
        }
      },
      fail: function() {
        wx.navigateTo({
          url: '../login/login',
        })
      }
    })
  },

  toEquityCard: function () {
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        if (res.data.memberType == 2) {
          wx.navigateTo({
            url: '../equityCard/equityCard',
          })
        } else {
          wx.navigateTo({
            url: '../login/login'
          })
        }
      },
      fail: function () {
        wx.navigateTo({
          url: '../login/login',
        })
      }
    })
  },

  bannerRouter: function (e) {
    let that = this;
    let type = e.currentTarget.dataset.type;
    let goal = e.currentTarget.dataset.goal;
    if (type && type == 2) { //跳转到影片列表
      wx.navigateTo({
        url: '../movieDetail/movieDetail?filmCode=' + goal,
      })
    }
    if (type && type == 3) { //跳转到金币商品
      wx.navigateTo({
        url: '../mallDetail/mallDetail?id=' + goal,
      })
    }
  },

  showModal: function () {
    let that = this;
    that.setData({
      support: true
    })
  },

  closeM: function () {
    let that = this;
    that.setData({
      support: false
    })
  },

  phone: function (e) {
    var phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone,
    })
  }
})