// pages/rotary.js
const app = getApp();
const util = require('../../utils/util.js');
const md5 = require('../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    index: 1, //当前转盘的位置
    isRun: false, // 是否已经点击抽奖按钮
    speed: 200, // 旋转的速度
    resultPrizeLevel: 3, // 奖品等级
    id: null, // 奖品的索引值
    winning: false, // 中奖提示
    prizeShow: false, // 我的奖品
    userPrize: false, // 使用奖品
    prizeList: [],
    pageNo: 1,
    pageSize: 10,
    prizeInfo: {
      firstPrize: {
        prizePicture: 'http://wanht.oss-cn-hangzhou.aliyuncs.com/images/activity/2019-11/20191116110202c23b88.png',
        prizeName: '谢谢参与',
        prizeLevel: 0
      },
      secondPrize: {
        prizePicture: 'http://wanht.oss-cn-hangzhou.aliyuncs.com/images/activity/2019-11/20191116110202c23b88.png',
        prizeName: '谢谢参与',
        prizeLevel: 0
      },
      thirdPrize: {
        prizePicture: 'http://wanht.oss-cn-hangzhou.aliyuncs.com/images/activity/2019-11/20191116110202c23b88.png',
        prizeName: '谢谢参与',
        prizeLevel: 0
      },
      fourthPrize: {
        prizePicture: 'http://wanht.oss-cn-hangzhou.aliyuncs.com/images/activity/2019-11/20191116110202c23b88.png',
        prizeName: '谢谢参与',
        prizeLevel: 0
      },
      fifthPrize: {
        prizePicture: 'http://wanht.oss-cn-hangzhou.aliyuncs.com/images/activity/2019-11/20191116110202c23b88.png',
        prizeName: '谢谢参与',
        prizeLevel: 0
      },
      sixthPrize: {
        prizePicture: 'http://wanht.oss-cn-hangzhou.aliyuncs.com/images/activity/2019-11/20191116110202c23b88.png',
        prizeName: '谢谢参与',
        prizeLevel: 0
      },
      seventhPrize: {
        prizePicture: 'http://wanht.oss-cn-hangzhou.aliyuncs.com/images/activity/2019-11/20191116110202c23b88.png',
        prizeName: '谢谢参与',
        prizeLevel: 0
      },
      eighthPrize: {
        prizePicture: 'http://wanht.oss-cn-hangzhou.aliyuncs.com/images/activity/2019-11/20191116110202c23b88.png',
        prizeName: '谢谢参与',
        prizeLevel: 0
      }
    },
    prizeList: [ // 我的奖品
    ]
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that =this;
    let prize = app.globalData.rotary
    that.setData({
      prize: prize
    })
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        that.setData({
          userInfo: res.data
        })
      },
    })
    let prizeInfo = [];
    for (let i = 0; i < prize.prizeInfoVOList.length;i ++) {
      if (prize.prizeInfoVOList[i].prizeLevel == 1) {
        prizeInfo.firstPrize = prize.prizeInfoVOList[i]
      } else if (prize.prizeInfoVOList[i].prizeLevel == 2) {
        prizeInfo.secondPrize = prize.prizeInfoVOList[i]
      } else if (prize.prizeInfoVOList[i].prizeLevel == 3) {
        prizeInfo.thirdPrize = prize.prizeInfoVOList[i]
      } else if (prize.prizeInfoVOList[i].prizeLevel == 4) {
        prizeInfo.fourthPrize = prize.prizeInfoVOList[i]
      } else if (prize.prizeInfoVOList[i].prizeLevel == 5) {
        prizeInfo.fifthPrize = prize.prizeInfoVOList[i]
      } else if (prize.prizeInfoVOList[i].prizeLevel == 6) {
        prizeInfo.sixthPrize = prize.prizeInfoVOList[i]
      } else if (prize.prizeInfoVOList[i].prizeLevel == 7) {
        prizeInfo.seventhPrize = prize.prizeInfoVOList[i]
      } else if (prize.prizeInfoVOList[i].prizeLevel == 8) {
        prizeInfo.eighthPrize = prize.prizeInfoVOList[i]
      }
    }
    let newPrize = Object.assign(that.data.prizeInfo, prizeInfo)
    that.setData({
      prizeInfo: newPrize
    })
    wx.setNavigationBarTitle({
      title: '抽奖'
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
  // 抽奖规则展示
  rule: function () {
    let that = this;
    that.setData({
      rule: true
    })
  },

  // 关闭规则
  close: function() {
    let that = this;
    that.setData({
      rule: false
    })
  },

  // 开始抽奖
  start: function () {
    let that = this;
    // 如果已经点击抽奖了
    if (that.data.isRun == true) {
      return
    } else {
      that.setData({
        isRun: true
      })
    }
    // wx.showLoading({
    //   title: '加载中',
    //   mask: true
    // })
    // 清空已获得的奖品
    that.setData({
      drawPrize: null
    })
    let data = {
      openid: app.globalData.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode
    }
    let dataInfo = md5.md5Sign(data);
    wx.request({
      url: app.globalData.url + '/turnplate/drawPrize',
      data: dataInfo,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      success: function (res) {
        if (res.data.status == 0) {
          that.setData({
            resultPrizeLevel: res.data.data.prizeLevel
          })
          // wx.hideLoading();
          // 重置起始位置
          that.setData({
            index: 1
          })
          // 声明一个空数组用来存放相同等级的奖品
          let arr = [];
          for (let i = 0; i < that.data.prize.prizeInfoVOList.length; i++) {
            if (that.data.prize.prizeInfoVOList[i].prizeLevel == res.data.data.prizeLevel) {
              arr.push(that.data.prize.prizeInfoVOList[i])
            }
          }
          // 随机获取其中的某个奖品
          let arr_index = Math.floor((Math.random() * arr.length));
          // 获取到随机奖品的索引值
          let id = that.data.prize.prizeInfoVOList.indexOf(arr[arr_index])
          that.setData({
            id: res.data.data.prizeLevel
          })
          // 生成一个转的圈数
          let turns = Math.round((Math.random() + 6));
          // 获取总步数(圈数加上奖品等级-1)
          let level_index = 0;
          if (res.data.data.prizeLevel == 1) {
            level_index = 1
          } else if (res.data.data.prizeLevel == 2) {
            level_index = 3
          } else if (res.data.data.prizeLevel == 3) {
            level_index = 5
          } else if (res.data.data.prizeLevel == 4) {
            level_index = 7
          } else if (res.data.data.prizeLevel == 5) {
            level_index = 8
          } else if (res.data.data.prizeLevel == 6) {
            level_index = 2
          } else if (res.data.data.prizeLevel == 7) {
            level_index = 4
          } else {
            level_index = 6
          }
          let count = turns * 8 + level_index - 1;
          // 初始化步数
          let num = 0;
          // 初始化速度
          let speed = 400;
          // 计时器开始抽奖
          let timer = setInterval(function () {
            num++;
            that.setData({
              index: ++that.data.index
            });
            if (that.data.index > 8) {
              that.setData({
                index: 1
              })
            }
            // 当步数与随机数相等就停止转盘
            if (num >= count - 6) {
              clearInterval(timer)
              let endTimer = setInterval(function(){
                num++;
                that.setData({
                  index: ++that.data.index
                });
                if (that.data.index > 8) {
                  that.setData({
                    index: 1
                  })
                }
                if (num >= count) {
                  clearInterval(endTimer)
                  setTimeout(function(){
                    that.setData({
                      isRun: false,
                      winning: true,
                      drawPrize: arr[arr_index]
                    })
                  },1000)
                }
              },500)
            }
          }, 100)
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
                      url: app.globalData.url + '/turnplate/drawPrize',
                      data: dataInfo,
                      method: "POST",
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        // 'cookie': wx.getStorageSync("sessionid")
                      },
                      success: function (msg) {
                        if (msg.data.status == 0) {
                          that.setData({
                            resultPrizeLevel: msg.data.data.prizeLevel
                          })
                          // wx.hideLoading();
                          // 重置起始位置
                          that.setData({
                            index: 1
                          })
                          // 声明一个空数组用来存放相同等级的奖品
                          let arr = [];
                          for (let i = 0; i < that.data.prize.prizeInfoVOList.length; i++) {
                            if (that.data.prize.prizeInfoVOList[i].prizeLevel == msg.data.data.prizeLevel) {
                              arr.push(that.data.prize.prizeInfoVOList[i])
                            }
                          }
                          // 随机获取其中的某个奖品
                          let arr_index = Math.floor((Math.random() * arr.length));
                          // 获取到随机奖品的索引值
                          let id = that.data.prize.prizeInfoVOList.indexOf(arr[arr_index])
                          that.setData({
                            id: res.data.data.prizeLevel
                          })
                          // 生成一个转的圈数
                          let turns = Math.round((Math.random() + 6));
                          // 获取总步数(圈数加上奖品等级-1)
                          let level_index = 0;
                          if (msg.data.data.prizeLevel == 1) {
                            level_index = 1
                          } else if (msg.data.data.prizeLevel == 2) {
                            level_index = 3
                          } else if (msg.data.data.prizeLevel == 3) {
                            level_index = 5
                          } else if (msg.data.data.prizeLevel == 4) {
                            level_index = 7
                          } else if (msg.data.data.prizeLevel == 5) {
                            level_index = 8
                          } else if (msg.data.data.prizeLevel == 6) {
                            level_index = 2
                          } else if (msg.data.data.prizeLevel == 7) {
                            level_index = 4
                          } else {
                            level_index = 6
                          }
                          let count = turns * 8 + level_index - 1;
                          // 初始化步数
                          let num = 0;
                          // 初始化速度
                          let speed = 400;
                          // 计时器开始抽奖
                          let timer = setInterval(function () {
                            num++;
                            that.setData({
                              index: ++that.data.index
                            });
                            if (that.data.index > 8) {
                              that.setData({
                                index: 1
                              })
                            }
                            // 当步数与随机数相等就停止转盘
                            if (num >= count - 6) {
                              clearInterval(timer)
                              let endTimer = setInterval(function () {
                                num++;
                                that.setData({
                                  index: ++that.data.index
                                });
                                if (that.data.index > 8) {
                                  that.setData({
                                    index: 1
                                  })
                                }
                                if (num >= count) {
                                  clearInterval(endTimer)
                                  setTimeout(function () {
                                    that.setData({
                                      isRun: false,
                                      winning: true,
                                      drawPrize: arr[arr_index]
                                    })
                                  }, 1000)
                                }
                              }, 500)
                            }
                          }, 100)
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
  },

  // 关闭中奖提示
  got: function () {
    let that = this;
    that.setData({
      winning: false
    })
  },

  // 查看我的奖品
  check: function () {
    let that = this;
    let data = {
      openid: app.globalData.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode,
      pageNo: that.data.pageNo,
      pageSize: that.data.pageSize
    }
    let dataInfo = md5.md5Sign(data);
    wx.request({
      url: app.globalData.url + '/turnplate/getMyPrizeList',
      data: dataInfo,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      success: function (res) {
        if (res.data.status == 0) {
          if (res.data.data.data.length > 0) {
            that.setData({
              prizeList: that.data.prizeList.concat(res.data.data.data),
              page: res.data.data.totalPage,
              prizeShow: true
            })
          } else {
            that.setData({
              prizeShow: true
            })
          }
        } else if (res.data == '{code=notLogin, message=请先登录, data=null, status=1000}') {
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
                success: function (e) {
                  if (e.data.status == 0) {
                    wx.setStorage({
                      key: 'sessionid',
                      data: e.header['Set-Cookie']
                    })
                    wx.request({
                      url: app.globalData.url + '/turnplate/getMyPrizeList',
                      data: dataInfo,
                      method: "POST",
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        // 'cookie': wx.getStorageSync("sessionid")
                      },
                      success: function (msg) {
                        if (msg.data.status == 0) {
                          if (msg.data.data.data.length > 0) {
                            that.setData({
                              prizeList: that.data.prizeList.concat(res.data.data.data),
                              page: msg.data.data.totalPage,
                              prizeShow: true
                            })
                          } else {
                            that.setData({
                              prizeShow: true
                            })
                          }
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
  },

  // 关闭查看奖品
  cancel: function () {
    let that = this;
    that.setData({
      prizeShow: false,
      prizeList: []
    })
  },

  // 使用奖品
  use: function (e) {
    let that = this;
    wx.showLoading({
      title: '加载中',
      icon: 'none',
      mask: true
    })
    let id = e.currentTarget.dataset.id;
    let status = e.currentTarget.dataset.status;
    let type = e.currentTarget.dataset.type;
    if (type == 1 && status == 1) { // 奖品为优惠券且未使用
      wx.hideLoading();
      wx.reLaunch({
        url: '../index/index',
      })
    } else if (type == 2 && status == 1) {  // 奖品为实物且未使用
      wx.hideLoading();
      that.setData({
        id: id,
        userPrize: true
      })
    } else {
      wx.hideLoading();
      return;
    }
    
  },

  // 关闭使用面板
  useClose: function () {
    let that = this;
    that.setData({
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

  // 核销奖品
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
      prizeId: that.data.id,
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
          that.check();
          that.setData({
            userPrize: false
          })
        } else if (res.data == '{code=notLogin, message=请先登录, data=null, status=1000}') {
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
                success: function (e) {
                  if (e.data.status == 0) {
                    wx.setStorage({
                      key: 'sessionid',
                      data: e.header['Set-Cookie']
                    })
                    wx.request({
                      url: app.globalData.url + '/physicPrize/exchangePrize',
                      data: dataInfo,
                      method: "POST",
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        // 'cookie': wx.getStorageSync("sessionid")
                      },
                      success: function (msg) {
                        if (msg.data.status == 0) {
                          wx.hideLoading();
                          wx.showToast({
                            title: '核销成功！',
                            mask: true
                          })
                          that.check();
                          that.setData({
                            userPrize: false
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
  
  searchScrollLower: function () {
    let that = this;
    let pageNo = that.data.pageNo;
    let page = that.data.page;
    if (pageNo + 1 > page) {
      return
    } else {
      that.setData({
        pageNo: pageNo + 1, //每次触发上拉事件，把pageNo+1  
      });
      that.check();
    }
  }
})