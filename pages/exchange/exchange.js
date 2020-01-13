// pages/exchange.js
const app = getApp();
const util = require('../../utils/util.js');
const md5 = require('../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    num: 1,
    pageNo: 1,
    pageSize: 10,
    goodsList: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        that.setData({
          userInfo: res.data
        })
      },
    })
    that.getBanner();
    that.getIntegral();
    that.getCommodity();
    that.binding();
    wx.setNavigationBarTitle({
      title: '积分换金币'
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

  // 获取轮播图
  getBanner: function () {
    let that = this;
    let json = {
      cinemaCode: app.globalData.cinemaCode,
      category: 10,
      openid: app.globalData.userInfo.openid
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

  // 查询兑换比例
  getIntegral: function () {
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
      url: app.globalData.url + '/acquireGold/getIntegral',
      data: dataInfo,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      method: 'POST',
      success: function (res) {
        if (res.data.status == 0) {
          wx.hideLoading();
          if (res.data.data) {
            that.setData({
              firstGold: res.data.data,
              gold: res.data.data
            })
          } else {
            wx.showToast({
              title: '暂无兑换比例',
              mask: true,
              icon: 'none'
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
                      url: app.globalData.url + '/acquireGold/getIntegral',
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
                            gold: msg.data.data,
                            firstGold: msg.data.data
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

  // 获取输入的积分
  importIntegral(e) {
    let that = this;
    let num = e.detail.value;
    let firstGold = that.data.firstGold
    that.setData({
      gold: num * firstGold,
      num: num
    })
  },

  // 查询是否绑定了会员卡
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
          that.setData({
            cardInfo: res.data.data
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
                          that.setData({
                            cardInfo: msg.data.data
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

  //  点击兑换按钮
  showCard: function () {
    let that = this;
    if (that.data.num == '') {
      wx.showToast({
        title: '请输入要兑换的积分！',
        mask: true,
        icon: 'none'
      })
      return;
    }
    if (that.data.cardInfo.cardNo == '' || !that.data.cardInfo.cardNo) {
      wx.showToast({
        title: '请绑定会员卡！',
        mask: true,
        icon: 'none'
      })
    } else {
      that.setData({
        passwordModle: true
      })
    }
  },

  // 关闭密码框
  closeModle: function () {
    this.setData({
      passwordModle: false
    })
  },

  // 获取密码
  getpassword2: function (e) {
    this.setData({
      cardword: e.detail.value,
    })
  },



  // 兑换
  change: function () {
    let that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    if (!that.data.cardword || that.data.cardword == '') {
      wx.showToast({
        title: '请输入会员卡密码！',
        mask: true,
        icon: 'none'
      })
      return;
    }
    let data = {
      cinemaCode: app.globalData.cinemaCode,
      score: that.data.num,
      cardPassWord: that.data.cardword,
      openid: app.globalData.userInfo.openid
    }
    let dataInfo = md5.md5Sign(data)
    wx.request({
      url: app.globalData.url + '/acquireGold/integrateConvertGold',
      data: dataInfo,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      method: 'POST',
      success: function (res) {
        if (res.data.status == 0) {
          wx.hideLoading();
          wx.showToast({
            title: '兑换成功！',
            mask: true
          })
          that.setData({
            passwordModle: false
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
                      url: app.globalData.url + '/acquireGold/integrateConvertGold',
                      data: dataInfo,
                      method: "POST",
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        // 'cookie': e.header['Set-Cookie']
                      },
                      success: function (msg) {
                        if (msg.data.status == 0) {
                          wx.hideLoading();
                          wx.showToast({
                            title: '兑换成功！',
                            mask: true
                          })
                          that.setData({
                            passwordModle: false
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

  // 获取推荐商品
  getCommodity: function () {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let that = this;
    let data = {
      cinemaCode: app.globalData.cinemaCode,
      pageNo: that.data.pageNo,
      pageSize: that.data.pageSize,
      openid: app.globalData.userInfo.openid
    }
    let dataInfo = md5.md5Sign(data)
    wx.request({
      url: app.globalData.url + '/goldCommodity/getRecommendCommodity',
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
            let goods = res.data.data.data;
            for (let i = 0; i < goods.length; i++) {
              if (goods[i].money && goods[i].gold) {
                goods[i].and = true;
              }
            }
            that.setData({
              goodsList: that.data.goodsList.concat(goods),
              page: res.data.data.totalPage,
            })
          }
        } else if (res.data == '{code=notLogin, message=请先登录, data=null, status=1000}') {
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
                      url: app.globalData.url + '/goldCommodity/getRecommendCommodity',
                      data: dataInfo,
                      method: "POST",
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        // 'cookie': e.header['Set-Cookie']
                      },
                      success: function (msg) {
                        if (msg.data.status == 0) {
                          wx.hideLoading();
                          if (msg.data.data.data.length > 0) {
                            let goods = msg.data.data.data;
                            for (let i = 0; i < goods.length; i++) {
                              if (goods[i].money && goods[i].gold) {
                                goods[i].and = true;
                              }
                            }
                            that.setData({
                              goodsList: that.data.goodsList.concat(goods),
                              page: msg.data.data.totalPage,
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

  // 兑换奖品
  check: function (e) {
    let that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let id = e.currentTarget.dataset.id;
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        if (res.data.memberType == 2) {
          wx.navigateTo({
            url: '../mallDetail/mallDetail?id=' + id,
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

  // 查看明细
  toDetail: function () {
    wx.navigateTo({
      url: '../exchangeDetail/exchangeDetail',
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
        pageNo: pageNo + 1, //每次触发上拉事件，把searchPageNum+1  
      });
      that.getCommodity();
    }
  }
})