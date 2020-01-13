// pages/compare/compare.js
const app = getApp();
const util = require('../../utils/util.js');
const md5 = require('../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    moviesList: null,
    swiperIndex: 0, // 顶部电影索引
    movieId: null,
    cinemaCode: null,
    screenPlanList: null,
    select: 0, // 电影日期索引
    orderNum: 0,
    showTask: false,
    showTip: 0,
    moviearea: null,
    isLoading: true,
    moviesListDate: null,
    isShow: false,
    index: 0,
    selectedIndex: 0, // 比价索引
    buyNum: 4,
    enter: 1
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        that.setData({
          userInfo: res.data
        })
      },
    })
    wx.setNavigationBarTitle({
      title: app.globalData.cinemaList.cinemaName
    });
    that.setData({
      logo: app.globalData.logo,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    var that = this;
    that.setData({
      checkfilmcode: app.globalData.checkfilmcode,
      swiperIndex: app.globalData.movieIndex,
    });
    that.ask(app.globalData.checkfilmcode);
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this;
    that.setData({
      moviesList: app.globalData.movieList
    })
    that.foundOrder();
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

  /**b
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
  swiperChange(e) { //切换电影
    let that = this;
    if (that.data.enter == 1) {
      return;
    }
    that.setData({
      swiperIndex: e.detail.current,
      checkfilmcode: that.data.moviesList[e.detail.current].filmCode,
      select: 0,
      enter: 0
    })
    app.globalData.movieIndex = e.detail.current;
    setTimeout(function() {
      wx.hideLoading();
    }, 500)
    that.ask(that.data.moviesList[e.detail.current].filmCode);
  },
  dayChange: function(e) { //切换日期
    var day = e.currentTarget.dataset.index;
    this.setData({
      select: day
    })
  },

  buyMoer: function(e) {
    let that = this;
    // wx.showLoading({
    //   title: '加载中',
    //   mask: true
    // })
    that.setData({
      buyNum: e.target.dataset.typecode
    })
    if (e.target.dataset.typecode == 1) {
      var i = that.data.select;
      var swiperIndex = that.data.swiperIndex;
      var index = that.data.selectedIndex;
      var time = that.data.movieDateList[i].key;
      var beginTime = that.data.movieDateList[i].value[index].playTime;
      var endTime = that.data.movieDateList[i].value[index].overTime;
      var screenName = that.data.movieDateList[i].value[index].screenName;
      var screenCode = that.data.movieDateList[i].value[index].screenCode;
      var sessionCode = that.data.movieDateList[i].value[index].sessionCode;
      var format = that.data.movieDateList[i].value[index].format;
      var price = that.data.movieDateList[i].value[index].price;
      var desc = that.data.movieDateList[i].value[index].activityDesc;
      var movieName = that.data.moviesList[swiperIndex].filmName;
      let plateList = that.data.movieDateList[i].value[index].comparePricesList;
      for (let i = 0; i < plateList.length; i++) {
        if (plateList[i].plateType == 1) {
          app.globalData.memberPrice = plateList[i].platePrice
        }
      }
      wx.hideLoading();
      if (desc) {
        wx.navigateTo({
          url: '../chooseSeats/chooseSeats?screenCode=' + screenCode + '&&beginTime=' + beginTime + '&&time=' + time + '&&screenName=' + screenName + '&&sessionCode=' + sessionCode + '&&movieName=' + movieName + '&&price=' + price + '&&format=' + format + '&&endTime=' + endTime + '&&desc=' + desc,
        })
      } else {
        wx.navigateTo({
          url: '../chooseSeats/chooseSeats?screenCode=' + screenCode + '&&beginTime=' + beginTime + '&&time=' + time + '&&screenName=' + screenName + '&&sessionCode=' + sessionCode + '&&movieName=' + movieName + '&&price=' + price + '&&format=' + format + '&&endTime=' + endTime,
        })
      }
    }
  },

  ask: function(code) { //请求数据
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    var that = this;
    let film = {
      cinemaCode: app.globalData.cinemaCode,
      filmCode: code,
      openid: app.globalData.userInfo.openid
    }
    let filmInfo = md5.md5Sign(film);
    wx.request({
      url: app.globalData.url + '/session/getSessionByCinemaAndFilm',
      data: filmInfo,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.status == 0) {
          that.setData({
            movieInfo: res.data.data
          })
          let movieDateList = [];
          for (let key in res.data.data.sessionMap) {
            movieDateList.push({ key: key, value: res.data.data.sessionMap[key]})
          }
          let activityList = [];
          for (let key in res.data.data.activityMap) {
            activityList.push({ key: key, value: res.data.data.activityMap[key] })
          }
          that.setData({
            movieDateList: movieDateList,
            activityList: activityList,
            enter: 0
          })
        }
      }
    })
  },

  buy: function(e) {
    var that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    var screenCode = e.currentTarget.dataset.screencode;
    var sessionCode = e.currentTarget.dataset.sessioncode;
    var i = that.data.select;
    var swiperIndex = that.data.swiperIndex;
    var index = e.currentTarget.dataset.index;
    var time = that.data.movieDateList[i].key;
    var beginTime = that.data.movieDateList[i].value[index].playTime;
    var endTime = that.data.movieDateList[i].value[index].overTime;
    var screenName = that.data.movieDateList[i].value[index].screenName;
    var format = that.data.movieDateList[i].value[index].format;
    var price = that.data.movieDateList[i].value[index].price;
    var desc = that.data.movieDateList[i].value[index].activityDesc;
    var movieName = that.data.moviesList[swiperIndex].filmName;
    let plateList = that.data.movieDateList[i].value[index].comparePricesList;
    for (let i = 0;i < plateList.length;i ++) {
      if (plateList[i].plateType == 1) {
        app.globalData.memberPrice = plateList[i].platePrice
      }
    }
    wx.hideLoading();
    if (desc) {
      wx.navigateTo({
        url: '../chooseSeats/chooseSeats?screenCode=' + screenCode + '&&beginTime=' + beginTime + '&&time=' + time + '&&screenName=' + screenName + '&&sessionCode=' + sessionCode + '&&movieName=' + movieName + '&&price=' + price + '&&format=' + format + '&&endTime=' + endTime + '&&desc=' + desc,
      })
    } else {
      wx.navigateTo({
        url: '../chooseSeats/chooseSeats?screenCode=' + screenCode + '&&beginTime=' + beginTime + '&&time=' + time + '&&screenName=' + screenName + '&&sessionCode=' + sessionCode + '&&movieName=' + movieName + '&&price=' + price + '&&format=' + format + '&&endTime=' + endTime,
      })
    }

  },

  hideTip: function() {
    this.setData({
      buyNum: 4
    })
  },

  checkSession: function(e) { //选择比价
    var that = this;
    that.setData({
      selectedIndex: e.currentTarget.dataset.index
    })
  },

  // 查询是否有未完成的订单
  foundOrder: function () {
    let that = this;
    let data = {
      cinemaCode: app.globalData.cinemaCode,
      openid: app.globalData.userInfo.openid
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
      success: function (res) {
        if (res.data.status == 0) {
          wx.hideLoading();
          if (res.data.data && res.data.data != 0) {
            that.setData({
              showTask: true,
              order: res.data.data
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
                      url: app.globalData.url + '/ticketorder/queryUnPayOrder',
                      data: dataInfo,
                      method: "POST",
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        // 'cookie': e.header['Set-Cookie']
                      },
                      success: function (msg) {
                        if (msg.data.status == 0) {
                          wx.hideLoading();
                          if (msg.data.data && msg.data.data != 0) {
                            that.setData({
                              showTask: true,
                              order: msg.data.data
                            })
                          }
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
            fail: function () {
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

  cancel: function() {
    var that = this;
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
      success: function (res) {
        if (res.data.status == 0) {
          wx.hideLoading();
          that.setData({
            showTask: false
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
                      url: app.globalData.url + '/ticketorder/releaseSeat',
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
                            showTask: false
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

  sure: function() {
    var that = this;
    that.setData({
      showTask: false
    })
    wx.navigateTo({
      url: '../waitPay/waitPay?orderNum=' + that.data.order.unifiedOrderNo,
    })
  },

  toDetail: function(e) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    var that = this
    if (that.data.swiperIndex == e.currentTarget.dataset.index) {
      wx.hideLoading();
      app.globalData.movieIndex = that.data.swiperIndex;
      wx.navigateTo({
        url: '../movieDetail/movieDetail?filmCode=' + e.currentTarget.dataset.moviecode,
      })
    } else {
      wx.hideLoading();
      that.setData({
        swiperIndex: e.currentTarget.dataset.index
      })
    }
  }
})