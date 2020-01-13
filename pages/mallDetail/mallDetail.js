// pages/mallDetail.js
const app = getApp();
const util = require('../../utils/util.js');
const md5 = require('../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    btn: 0, // 兑换按钮
    index: -1, //兑换方式
    chooseAdd: false, // 下拉按钮样式
    isShow: false, // 门店列表
    region: ['省','市','区'],
    mail: false,
    invite: false,
    mailName: '',
    mailPhone: '',
    mailAddress: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let that = this;
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        if (res.data.memberType == 2) {
          that.setData({
            userInfo: res.data
          })
        }
      }
    })
    if (options.cinemaCode) {
      app.globalData.cinemaCode = options.cinemaCode;
    }
    that.setData({
      id: options.id
    })
    wx.setNavigationBarTitle({
      title: "商品详情"
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
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let data = {
      cinemaCode: app.globalData.cinemaCode,
      id: that.data.id,
      // openid: app.globalData.userInfo.openid
    }
    let dataInfo = md5.md5Sign(data)
    wx.request({
      url: app.globalData.url + '/goldCommodity/getGoldCommodityById',
      data: dataInfo,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      success: function (res) {
        if (res.data.status == 0) {
          wx.hideLoading();
          if (res.data.data.details) {
            let nodes = res.data.data.details.replace(/\<img/gi, '<img class="rich-img" ');
            nodes += '<div style="height: 50px;width: 100%;"></div>'
            that.setData({
              goodsInfo: res.data.data,
              nodes: nodes
            })
          } else {
            that.setData({
              goodsInfo: res.data.data
            })
          }
          if (res.data.data.pickUpWay == 1) {
            that.setData({
              invite: true
            })
          }
          if (res.data.data.pickUpWay == 2) {
            that.setData({
              mail: true
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
                      url: app.globalData.url + '/goldCommodity/getGoldCommodityById',
                      data: dataInfo,
                      method: "POST",
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        // 'cookie': e.header['Set-Cookie']
                      },
                      success: function (msg) {
                        if (msg.data.status == 0) {
                          wx.hideLoading();
                          if (msg.data.data.details) {
                            let nodes = msg.data.data.details.replace(/\<img/gi, '<img class="rich-img" ');
                            nodes += '<div style="height: 50px;width: 100%;"></div>'
                            that.setData({
                              goodsInfo: msg.data.data,
                              nodes: nodes
                            })
                          } else {
                            that.setData({
                              goodsInfo: msg.data.data
                            })
                          }
                          if (msg.data.data.pickUpWay == 1) {
                            that.setData({
                              invite: true
                            })
                          }
                          if (msg.data.data.pickUpWay == 2) {
                            that.setData({
                              mail: true
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
    return {
      title: this.data.goodsInfo.name,
      path: '/pages/mallDetail/mallDetail?shareUserMobile=' + this.data.userInfo.userMobile + '&&id=' + this.data.id + '&&cinemaCode=' + app.globalData.cinemaCode,
      imageUrl: this.data.goodsInfo.imageUrl
    }
    // if (app.globalData.miniShareTitle && app.globalData.miniShareTitle != '') {
    //   if (app.globalData.miniSharePosters && app.globalData.miniSharePosters != '') {
    //     return {
    //       title: app.globalData.miniShareTitle,
    //       path: '/pages/index/index?shareUserMobile=' + this.data.userInfo.userMobile,
    //       imageUrl: app.globalData.miniSharePosters
    //     }
    //   } else {
    //     return {
    //       title: app.globalData.miniShareTitle,
    //       path: '/pages/index/index?shareUserMobile=' + this.data.userInfo.userMobile
    //     }
    //   }
    // } else if (app.globalData.miniSharePosters && app.globalData.miniSharePosters != '') {
    //   if (app.globalData.miniShareTitle && app.globalData.miniShareTitle != '') {
    //     return {
    //       title: app.globalData.cinemaList.cinemaName,
    //       path: '/pages/index/index?shareUserMobile=' + this.data.userInfo.userMobile,
    //       imageUrl: app.globalData.miniSharePosters
    //     }
    //   } else {
    //     return {
    //       title: app.globalData.miniShareTitle,
    //       path: '/pages/index/index?shareUserMobile=' + this.data.userInfo.userMobile,
    //       imageUrl: app.globalData.miniSharePosters
    //     }
    //   }
    // } else {
    //   return {
    //     title: app.globalData.cinemaList.cinemaName,
    //     path: '/pages/index/index?shareUserMobile=' + this.data.userInfo.userMobile
    //   }
    // }
  },

  change: function () {
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
            id: that.data.goodsInfo.id,
            cinemaCode: app.globalData.cinemaCode,
            openid: res.data.openid
          }
          let dataInfo = md5.md5Sign(data)
          wx.request({
            url: app.globalData.url + '/goldCommodity/getUseCinemaById',
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
                  location: res.data.data,
                  btn: 1
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
                            url: app.globalData.url + '/goldCommodity/getUseCinemaById',
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
                                  location: res.data.data,
                                  btn: 1
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

  // 确认兑换方式
  store: function () {
    let that = this;
    if (that.data.index == '-1') {
      that.setData({
        storeDisabled: 0
      })
    } else {
      that.setData({
        btn: 2,
      })
    }
  },

  // 确认兑换地址
  address: function () {
    let that = this;
    if (!that.data.optionName || !that.data.optionAddress) {
      that.setData({
        addressDisabled: 0
      })
      return;
    }
    wx.showModal({
      title: '提示',
      content: '请确认您的兑换影院地址',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '加载中',
            mask: true
          })
          let data = {
            cinemaCode: app.globalData.cinemaCode,
            exchangeCinemaCode: that.data.code,
            id: that.data.goodsInfo.id,
            openid: app.globalData.userInfo.openid,
            pickUpWay: 1
          }
          let dataInfo = md5.md5Sign(data)
          wx.request({
            url: app.globalData.url + '/goldCommodity/confirmGoldCommodityOrder',
            data: dataInfo,
            method: "POST",
            header: {
              "Content-Type": "application/x-www-form-urlencoded",
              // 'cookie': wx.getStorageSync("sessionid")
            },
            success: function (res) {
              if (res.data.status == 0) {
                wx.hideLoading();
                app.globalData.goodsOrder = res.data.data;
                app.globalData.pickUpWay = 1;
                that.setData({
                  btn: 0,
                  isShow: !that.data.isShow
                });
                wx.navigateTo({
                  url: '../orderGoods/orderGoods',
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
                            url: app.globalData.url + '/goldCommodity/confirmGoldCommodityOrder',
                            data: dataInfo,
                            method: "POST",
                            header: {
                              "Content-Type": "application/x-www-form-urlencoded",
                              // 'cookie': e.header['Set-Cookie']
                            },
                            success: function (msg) {
                              if (msg.data.status == 0) {
                                wx.hideLoading();
                                app.globalData.goodsOrder = res.data.data;
                                app.globalData.pickUpWay = 1;
                                that.setData({
                                  btn: 0,
                                  isShow: !that.data.isShow
                                });
                                wx.navigateTo({
                                  url: '../orderGoods/orderGoods',
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
        } else if (res.cancel) {
          return
        }
      }
    })
  },

  // 关闭弹窗
  close:function () {
    let that = this;
    that.setData({
      btn: 0,
      isShow: false
    })
  },

  // 选择兑换方式
  check: function (e) {
    let that = this;
    let index = e.currentTarget.dataset.index;
    let price = that.data.price;
    for (let i = 0; i < price.length; i++) {
      price[i].select = 0;
    }
    price[index].select = 1;
    that.setData({
      price: price,
      index: index,
      storeDisabled: 1
    })
  },

  // 显示门店列表
  showAddress: function () {
    let that = this;
    that.setData({
      chooseAdd: !that.data.chooseAdd,
      isShow: !that.data.isShow
    })
  },

  // 选择门店
  chooseAddress: function (e) {
    let that = this;
    let code = e.currentTarget.dataset.code;
    let name = e.currentTarget.dataset.name;
    let address = e.currentTarget.dataset.address;
    that.setData({
      addressDisabled: 1,
      code: code,
      optionName: name,
      optionAddress: address
    });
  },

  bindRegionChange: function (e) {
    this.setData({
      region: e.detail.value
    })
  },

  getName: function (e) {
    this.setData({
      mailName: e.detail.value
    })
  },

  getPhone: function (e) {
    this.setData({
      mailPhone: e.detail.value
    })
  },

  getAddress: function (e) {
    this.setData({
      mailAddress: e.detail.value
    })
  },

  mailChange: function () {
    let that = this;
    let region = that.data.region.join(",");
    if (region == '省,市,区') {
      wx.showToast({
        title: '请选择省市区！',
        mask: true,
        icon: 'none'
      })
      return
    }
    if (that.data.mailAddress == '') {
      wx.showToast({
        title: '请填写具体地址！',
        mask: true,
        icon: 'none'
      })
      return
    }
    if (that.data.mailName == '') {
      wx.showToast({
        title: '请填写收件人姓名！',
        mask: true,
        icon: 'none'
      })
      return
    }
    if (that.data.mailPhone == '') {
      wx.showToast({
        title: '请填写联系电话！',
        mask: true,
        icon: 'none'
      })
      return
    }
    wx.showModal({
      title: '提示',
      content: '请确认您的邮寄地址地址',
      success(res) {
        if (res.confirm) {
          wx.showLoading({
            title: '加载中',
            mask: true
          })
          let data = {
            cinemaCode: app.globalData.cinemaCode,
            name: that.data.mailName,
            mobile: that.data.mailPhone,
            rangeInfo: region,
            addressDetail: that.data.mailAddress,
            id: that.data.goodsInfo.id,
            openid: app.globalData.userInfo.openid,
            pickUpWay: 2
          }
          let dataInfo = md5.md5Sign(data)
          wx.request({
            url: app.globalData.url + '/goldCommodity/confirmGoldCommodityOrder',
            data: dataInfo,
            method: "POST",
            header: {
              "Content-Type": "application/x-www-form-urlencoded",
              // 'cookie': wx.getStorageSync("sessionid")
            },
            success: function (res) {
              if (res.data.status == 0) {
                wx.hideLoading();
                app.globalData.goodsOrder = res.data.data
                app.globalData.goodsOrder.userMobile = that.data.mailPhone;
                app.globalData.goodsOrder.name = that.data.mailName;
                app.globalData.goodsOrder.address = that.data.mailAddress;
                app.globalData.goodsOrder.region = that.data.region;
                app.globalData.pickUpWay = 2;
                that.setData({
                  btn: 0,
                  isShow: !that.data.isShow
                });
                wx.navigateTo({
                  url: '../orderGoods/orderGoods',
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
                            url: app.globalData.url + '/goldCommodity/confirmGoldCommodityOrder',
                            data: dataInfo,
                            method: "POST",
                            header: {
                              "Content-Type": "application/x-www-form-urlencoded",
                              // 'cookie': e.header['Set-Cookie']
                            },
                            success: function (msg) {
                              if (msg.data.status == 0) {
                                wx.hideLoading();
                                app.globalData.goodsOrder = res.data.data
                                app.globalData.goodsOrder.userMobile = that.data.mailPhone;
                                app.globalData.goodsOrder.name = that.data.mailName;
                                app.globalData.goodsOrder.address = that.data.mailAddress;
                                app.globalData.goodsOrder.region = that.data.region;
                                app.globalData.pickUpWay = 1;
                                that.setData({
                                  btn: 0,
                                  isShow: !that.data.isShow
                                });
                                wx.navigateTo({
                                  url: '../orderGoods/orderGoods',
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
        } else if (res.cancel) {
          return
        }
      }
    })
  },

  getLocation: function () {
    let that = this;
    const latitude = that.data.goodsInfo.cinemaInfo.latitude;
    const longitude = that.data.goodsInfo.cinemaInfo.longitude;
    wx.openLocation({
      latitude,
      longitude,
      scale: 18,
      name: that.data.goodsInfo.cinemaInfo.cinemaName,
      address: that.data.goodsInfo.cinemaInfo.address
    })
  },

  phone: function (e) {
    var phone = e.currentTarget.dataset.phone;
    wx.makePhoneCall({
      phoneNumber: phone,
    })
  }
})