// gold.js
//获取应用实例
const app = getApp();
const util = require('../../utils/util.js');
const md5 = require('../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    or: false,
    and: false,
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
        let miniUserInfo = {
          cinemaCode: app.globalData.cinemaCode,
          mobile: res.data.userMobile,
          openid: app.globalData.userInfo.openid
        }
        let userInfo = md5.md5Sign(miniUserInfo);
        wx.request({
          url: app.globalData.url + '/user/miniUserInfo',
          data: userInfo,
          method: "POST",
          header: {
            "Content-Type": "application/x-www-form-urlencoded",
            // 'cookie': wx.getStorageSync("sessionid")
          },
          success: function (res) {
            if (res.data.status == 0) {
              that.setData({
                goldNumber: res.data.data.goldNumber
              })
              if (res.header['Set-Cookie']) {
                wx.setStorage({
                  key: 'sessionid',
                  data: res.header['Set-Cookie'],
                })
              }
            }
          }
        })
        that.setData({
          mobile: res.data.userMobile,
          userInfo: res.data
        })
      },
      fail: function (err) {
        let miniUserInfo = {
          cinemaCode: app.globalData.cinemaCode,
          mobile: '',
          openid: ''
        }
        let userInfo = md5.md5Sign(miniUserInfo);
        wx.request({
          url: app.globalData.url + '/user/miniUserInfo',
          data: userInfo,
          method: "POST",
          header: {
            "Content-Type": "application/x-www-form-urlencoded",
            // 'cookie': wx.getStorageSync("sessionid")
          },
          success: function (res) {
            if (res.data.status == 0) {
              that.setData({
                goldNumber: res.data.data.goldNumber
              })
              if (res.header['Set-Cookie']) {
                wx.setStorage({
                  key: 'sessionid',
                  data: res.header['Set-Cookie'],
                })
              }
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
    })
    that.getBanner();
    that.getBanner2();
    that.getRecommend();
    wx.setNavigationBarTitle({
      title: app.globalData.cinemaList.cinemaName
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
    let that = this;
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        let miniUserInfo = {
          cinemaCode: app.globalData.cinemaCode,
          mobile: res.data.userMobile,
          openid: res.data.openid
        }
        let userInfo = md5.md5Sign(miniUserInfo);
        wx.request({
          url: app.globalData.url + '/user/miniUserInfo',
          data: userInfo,
          method: "POST",
          header: {
            "Content-Type": "application/x-www-form-urlencoded",
            // 'cookie': wx.getStorageSync("sessionid")
          },
          success: function (res) {
            if (res.data.status == 0) {
              that.setData({
                goldNumber: res.data.data.goldNumber
              })
              if (res.header['Set-Cookie']) {
                wx.setStorage({
                  key: 'sessionid',
                  data: res.header['Set-Cookie'],
                })
              }
            }
          }
        })
        that.setData({
          mobile: res.data.userMobile,
          userInfo: res.data
        })
      },
      fail: function (err) {
        let miniUserInfo = {
          cinemaCode: app.globalData.cinemaCode,
          mobile: '',
          openid: ''
        }
        let userInfo = md5.md5Sign(miniUserInfo);
        wx.request({
          url: app.globalData.url + '/user/miniUserInfo',
          data: userInfo,
          method: "POST",
          header: {
            "Content-Type": "application/x-www-form-urlencoded",
            // 'cookie': wx.getStorageSync("sessionid")
          },
          success: function (res) {
            if (res.data.status == 0) {
              that.setData({
                goldNumber: res.data.data.goldNumber
              })
              if (res.header['Set-Cookie']) {
                wx.setStorage({
                  key: 'sessionid',
                  data: res.header['Set-Cookie'],
                })
              }
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
    })
    that.getBanner();
    that.getBanner2();
    that.getRecommend();
    let goodsData = {
      cinemaCode: app.globalData.cinemaCode,
      pageNo: that.data.pageNo,
      pageSize: that.data.pageSize
    }
    let dataInfo = md5.md5Sign(goodsData)
    wx.request({
      url: app.globalData.url + '/goldCommodity/getGoldCommodityList',
      data: dataInfo,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
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
              goodsList: goods,
              page: res.data.data.totalPage,
            })
          } else {
            that.setData({
              goodsList: []
            })
          }
        } else {
          wx.hideLoading();
        }
      }
    })
    wx.setNavigationBarTitle({
      title: app.globalData.cinemaList.cinemaName
    });
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {
    this.setData({
      pageNo: 1
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
  // 获取轮播图
  getBanner: function () {
    let that = this;
    let json = {
      cinemaCode: app.globalData.cinemaCode,
      category: 2
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

  getBanner2: function () {
    let that = this;
    // 读取今日大牌图片
    let json = {
      cinemaCode: app.globalData.cinemaCode,
      category: 7
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
            banner2: res.data.data
          })
        }
      }
    })
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
      pageSize: that.data.pageSize
    }
    let dataInfo = md5.md5Sign(data)
    wx.request({
      url: app.globalData.url + '/goldCommodity/getGoldCommodityList',
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
        } else {
          wx.hideLoading();
        }
      }
    })
  },

  // 获取今日大牌
  getRecommend: function () {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let that = this;
    let data = {
      cinemaCode: app.globalData.cinemaCode
    }
    let dataInfo = md5.md5Sign(data)
    wx.request({
      url: app.globalData.url + '/goldCommodity/getTopGoldCommodityList',
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
            recommend: res.data.data
          })
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
                      url: app.globalData.url + '/goldCommodity/getTopGoldCommodityList',
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
                            recommend: msg.data.data
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

  // 跳转签到页面
  sign: function () {
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        if (res.data.memberType == 2) {
          wx.navigateTo({
            url: '../signIn/signIn',
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

  // 跳转到游戏厅
  packege: function () {
    wx.reLaunch({
      url: '../movie/movie',
    })
  },

  // 跳转转盘页面
  rotary: function () {
    let that = this;
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        if (res.data.memberType == 2) {
          wx.showLoading({
            title: '加载中',
            mask: true
          })
          let data = {
            cinemaCode: app.globalData.cinemaCode,
            openid: app.globalData.userInfo.openid
          }
          let dataInfo = md5.md5Sign(data);
          wx.request({
            url: app.globalData.url + '/turnplate/getTurnplateGameRule',
            data: dataInfo,
            method: "POST",
            header: {
              "Content-Type": "application/x-www-form-urlencoded",
              // 'cookie': wx.getStorageSync("sessionid")
            },
            success: function (res) {
              if (res.data.status == 0) {
                wx.hideLoading();
                app.globalData.rotary = res.data.data;
                wx.navigateTo({
                  url: '../rotary/rotary',
                })
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
                            url: app.globalData.url + '/turnplate/getTurnplateGameRule',
                            data: dataInfo,
                            method: "POST",
                            header: {
                              "Content-Type": "application/x-www-form-urlencoded",
                              // 'cookie': wx.getStorageSync("sessionid")
                            },
                            success: function (msg) {
                              wx.hideLoading();
                              if (msg.data.status == 0) {
                                app.globalData.rotary = msg.data.data;
                                wx.navigateTo({
                                  url: '../rotary/rotary',
                                })
                              } else {
                                wx.showToast({
                                  title: msg.data.message,
                                  icon: 'none',
                                  mask: true
                                })
                              }
                            }
                          })
                        } else {
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
                wx.showToast({
                  title: res.data.message,
                  icon: 'none',
                  mask: true
                })
              }
            }
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

  // 跳转兑换金币页面
  exchange: function () {
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        if (res.data.memberType == 2) {
          wx.navigateTo({
            url: '../exchange/exchange',
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

  // 跳转分享页面
  share: function () {
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        if (res.data.memberType == 2) {
          wx.navigateTo({
            url: '../share/share',
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

  // 跳转我的金币页面
  toMyGold: function () {
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        if (res.data.memberType == 2) {
          wx.navigateTo({
            url: '../myGold/myGold',
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
  }
})