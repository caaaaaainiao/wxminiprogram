// pages/sell/sell.js
const app = getApp()
const util = require('../../utils/util.js');
const md5 = require('../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    movieList: null,
    sendtype: 3, //类型
    setMessage: false,
    startChoose: false,
    detailStr: "",
    index: 0,
    multiArray: [
      ['请选择', '1排', '2排', '3排', '4排', '5排', '6排', '7排', '8排', '9排', '10排', '11排', '12排', '13排', '14排', '15排', '16排', '17排', '18排', '19排', '20排', '21排', '22排', '23排', '24排', '25排', '26排', '27排', '28排', '29排', '30排', '31排', '32排', '33排', '34排', '35排', '36排', '37排', '38排', '39排', '40排' ],
      ['请选择', '1座', '2座', '3座', '4座', '5座', '6座', '7座', '8座', '9座', '10座', '11座', '12座', '13座', '14座', '15座', '16座', '17座', '18座', '19座', '20座', '21座', '22座', '23座', '24座', '25座', '26座', '27座', '28座', '29座', '30座', '31座', '32座', '33座', '34座', '35座', '36座', '37座', '38座', '39座', '40座']
    ],
    multiIndex: [0, 0],
  },


  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
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
          success: function(res) {
            if (res.data.status == 0) {
              app.globalData.logo = res.data.data.logo;
              that.setData({
                goldNumber: res.data.data.goldNumber,
                balance: res.data.data.balance
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
      fail: function(err) {
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
          success: function(res) {
            if (res.data.status == 0) {
              app.globalData.logo = res.data.data.logo
              that.setData({
                goldNumber: res.data.data.goldNumber,
                balance: res.data.data.balance
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
    // that.binding();
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
    let that = this;
    wx.showTabBar({});
    that.setData({
      startChoose: false,
      show: false

    })
    if (app.globalData.lookcinemaname == undefined) {
      app.globalData.lookcinemaname = app.globalData.areaList[0].cinemaName
    }
    var lookcinemaname = app.globalData.lookcinemaname
    that.setData({
      lookcinemaname: lookcinemaname
    })
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        let miniUserInfo = {
          cinemaCode: app.globalData.cinemaCode,
          mobile: res.data.userMobile,
          openid: res.data.openid
        }
        that.setData({
          mobile: res.data.userMobile,
          userInfo: res.data
        })
        let userInfo = md5.md5Sign(miniUserInfo);
        wx.request({
          url: app.globalData.url + '/user/miniUserInfo',
          data: userInfo,
          method: "POST",
          header: {
            "Content-Type": "application/x-www-form-urlencoded",
            // 'cookie': wx.getStorageSync("sessionid")
          },
          success: function(res) {
            if (res.data.status == 0) {
              app.globalData.logo = res.data.data.logo;
              that.setData({
                goldNumber: res.data.data.goldNumber,
                balance: res.data.data.balance,
                setType: res.data.data.snackDispatcherStatus
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
      },
      fail: function(err) {
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
          success: function(res) {
            if (res.data.status == 0) {
              app.globalData.logo = res.data.data.logo
              that.setData({
                goldNumber: res.data.data.goldNumber,
                balance: res.data.data.balance,
                setType: res.data.data.snackDispatcherStatus
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
  onShareAppMessage: function() {
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
  // 点击头像注册
  login: function() {
    wx.navigateTo({
      url: '../login/login',
    })
  },

  // 查询用户已绑定的会员卡
  binding: function() {
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
          that.setData({
            cardInfo: res.data.data
          })
          app.globalData.ticketingSystemType = res.data.data.ticketingSystemType;
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
                          that.setData({
                            cardInfo: msg.data.data
                          })
                          app.globalData.ticketingSystemType = msg.data.data.ticketingSystemType;
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

  toCard: function() {
    var that = this;
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

  toGold: function() {
    wx.reLaunch({
      url: '../gold/gold',
    })
  },

  chooseType: function(e) {
    var sendType = e.currentTarget.dataset.type;
    var that = this;
    app.globalData.sendtype = sendType;
    that.setData({
      sendtype: sendType
    })
    wx.showTabBar()
  },

  close: function() {
    var that = this;
    if (that.data.screenList) {
      that.data.screenList.foodcheck = false
    }
    app.globalData.sendtype = 3;
    that.setData({
      startChoose: false,
      sendtype: 3,
      step: 1,
      detailStr: "",
      movieList: that.data.movieList,
      screenList: that.data.screenList,
      isOk: false
    })
    wx.showTabBar()
  },

  start: function() {
    var that = this;
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        if (res.data.memberType != 2) {
          wx.navigateTo({
            url: '../login/login',
          })
        }
      },
      fail: function() {
        wx.navigateTo({
          url: '../login/login',
        })
      }
    })
    if (that.data.sendtype == 3) {
      wx.showToast({
        title: '请选择取餐方式~',
        icon: 'none'
      })
      return;
    }
    // wx.showLoading({
    //   title: '加载中',
    //   mask: true
    // })
    let cinemaCode = {
      openid: app.globalData.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode
    }
    let orderFood = md5.md5Sign(cinemaCode);
    // 是否在点餐时间段内
    wx.request({
      url: app.globalData.url + '/miniMerchandise/merchandiseFood',
      data: orderFood,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      success: function(res) {
        if (res.data.status == 0) {
          wx.hideLoading();
          if (res.data.data.merchandiseCanFood == 1) {
            // 接口调取成功并且在时间段内
            if (that.data.sendtype == 0) {
              wx.navigateTo({
                url: '../sellDetail/sellDetail?sendType=' + that.data.sendtype,
              })
            } else if (that.data.sendtype == 1) {
              if (res.data.data.snackDispatcherStatus == 1) {
                that.setData({
                  startChoose: true
                })
                that.getAllScreen()
                wx.hideTabBar();
              } else {
                wx.showToast({
                  title: '暂不支持送餐功能~',
                  icon: 'none'
                })
              }
            } else if (that.data.sendtype == 2) {
              if (res.data.data.snackDispatcherStatus == 3) {
                that.setData({
                  show: true
                })
                that.foundSeat()
                wx.hideTabBar();
              } else {
                wx.showToast({
                  title: '暂不支持送餐功能~',
                  icon: 'none'
                })
              }
            }
          } else {
            // 不在时间段内
            wx.showToast({
              title: '该时间段不能点餐~',
              icon: 'none'
            })
          }
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

  // 获取所有影厅
  getAllScreen: function() {
    // wx.showLoading({
    //   title: '加载中',
    //   mask: true
    // })
    let that = this;
    let session = {
      openid: app.globalData.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode
    }
    let sessionInfo = md5.md5Sign(session);
    wx.request({
      url: app.globalData.url + '/miniMerchandise/queryScreen',
      data: sessionInfo,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        if (res.data.status == 0) {
          wx.hideLoading();
          that.setData({
            screenList: res.data.data
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

  // 获取所选影厅
  getScreen: function(e) {
    let that = this;
    let screenList = that.data.screenList;
    let index = e.currentTarget.dataset.index;
    app.globalData.selectScreenName = e.currentTarget.dataset.name;
    for (let i = 0; i < screenList.length; i++) {
      screenList[i].foodcheck = false;
    }
    screenList[index].foodcheck = true;
    that.setData({
      screenList: screenList,
      isOk: true
    })
  },


  // 确认选择影片场次影厅
  sureChoose: function() {
    let that = this;
    let screenList = that.data.screenList;
    for (let i = 0; i < screenList.length; i++) {
      if (screenList[i].foodcheck == true) {
        wx.navigateTo({
          url: '../sellDetail/sellDetail?sendType=' + that.data.sendtype,
        })
      }
    }
  },

  closeCheck: function() {
    this.setData({
      show: false,
      noTicket: false,
      hasTicket: false
    })
    wx.showTabBar({})
  },

  changeScreen: function(e) {
    this.setData({
      index: e.detail.value
    })
  },

  changeSeat: function (e) {
    this.setData({
      multiIndex: e.detail.value
    })
  },

  foundSeat: function () {
    let that = this;
    let session = {
      openid: app.globalData.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode
    }
    let sessionInfo = md5.md5Sign(session);
    wx.request({
      url: app.globalData.url + '/miniMerchandise/merchandiseToSeat',
      data: sessionInfo,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        if (res.data.status == 0) {
          wx.hideLoading();
          if (res.data.data.isBuyTicket == 0) {
            let session = {
              openid: app.globalData.userInfo.openid,
              cinemaCode: app.globalData.cinemaCode
            }
            let sessionInfo = md5.md5Sign(session);
            wx.request({
              url: app.globalData.url + '/miniMerchandise/queryScreen',
              data: sessionInfo,
              method: "POST",
              header: {
                "Content-Type": "application/x-www-form-urlencoded"
              },
              success: function (res) {
                if (res.data.status == 0) {
                  wx.hideLoading();
                  res.data.data.unshift({screenName: '请选择'})
                  that.setData({
                    checkScreenList: res.data.data
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
            that.setData({
              noTicket: true
            })
          } else if (res.data.data.isBuyTicket == 1) {
            let seatSeatName = res.data.data.seatName.split(",");
            that.setData({
              hasTicket: true,
              seatFilmName: res.data.data.filmName,
              seatSessionTime: res.data.data.sessionTime,
              seatScreenName: res.data.data.screenName,
              seatSeatName: seatSeatName
            })
          }
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

  chooseSeat: function (e) {
    let that = this;
    let index = e.currentTarget.dataset.index
    that.setData({
      seatIndex: index
    })
  },

  chooseOther: function () {
    let that = this;
    let session = {
      openid: app.globalData.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode
    }
    let sessionInfo = md5.md5Sign(session);
    wx.request({
      url: app.globalData.url + '/miniMerchandise/queryScreen',
      data: sessionInfo,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function (res) {
        if (res.data.status == 0) {
          wx.hideLoading();
          res.data.data.unshift({ screenName: '请选择' })
          that.setData({
            checkScreenList: res.data.data
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
    that.setData({
      noTicket: true,
      hasTicket: false
    })
  },

  // 自行选座确认
  checkSeat: function () {
    let that = this;
    let screenName = that.data.checkScreenList[that.data.index].screenName;
    let row = that.data.multiArray[0][that.data.multiIndex[0]];
    let colum = that.data.multiArray[1][that.data.multiIndex[1]];
    if (screenName == '请选择' || row == '请选择' || colum == '请选择') {
      wx.showToast({
        title: '请选择影厅及座位！',
        icon: 'none',
        mask: true
      })
    } else {
      let address = '';
      address += screenName + row + colum;
      app.globalData.checkAddress = address;
      wx.navigateTo({
        url: '../sellDetail/sellDetail?sendType=' + that.data.sendtype,
      })
    }
  },

  // 智能匹配
  checkSeat2: function () {
    let that = this;
    let seatName = that.data.seatSeatName[that.data.seatIndex];
    if (seatName) {
      let address = '';
      address += that.data.seatScreenName + seatName;
      app.globalData.checkAddress = address;
      wx.navigateTo({
        url: '../sellDetail/sellDetail?sendType=' + that.data.sendtype,
      })
    } else {
      wx.showToast({
        title: '请选择座位！',
        mask: true,
        icon: 'none'
      })
    }
  }
})