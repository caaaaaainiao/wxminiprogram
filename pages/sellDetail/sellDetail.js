// pages/sellDetail/sellDetail.js

const app = getApp();
const util = require('../../utils/util.js');
const md5 = require('../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    location: "",
    isScroll: false,
    navActive: "0",
    lastActive: 0,
    topArr: [],
    parentTop: null,
    chooseType: "0",
    goodsList: null,
    banner: [],
    totalNum: 0,
    totalPrice: 0,
    toalPrice: 0,
    type: 0,
    marActivity: null,
    waitActivity: null,
    isBind: false,
    merOrder: null,
    cinemaList: [], //影院信息列表
    fullCar: true,
    buyNum: 0,
    showReady: false,
    isReady: 1,
    cartGoods: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    wx.showToast({
      title: '加载中',
      icon: 'loading',
      mask: true,
      duration: 1000
    })
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        that.setData({
          userInfo: res.data
        })
      },
    })
    that.setData({
      type: options.sendType,
    })
    wx.setNavigationBarTitle({
      title: app.globalData.cinemaList.cinemaName
    });
    that.getBanner();
    setTimeout(function(){
      that.getAllGoods();
    },10)
  },
  chooseClose: function() {
    this.setData({
      showReady: false
    })
  },
  // 获取轮播图
  getBanner: function() {
    let that = this;
    // wx.showLoading({
    //   title: '加载中',
    //   mask: true
    // })
    let banner = {
      cinemaCode: app.globalData.cinemaCode,
      category: 1
    };
    let goodsBanner = md5.md5Sign(banner);
    wx.request({
      url: app.globalData.url + '/banner/getBannerByCategory',
      data: goodsBanner,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      success(res) {
        // wx.hideLoading();
        if (res.data.status == 0) {
          that.setData({
            banner: res.data.data
          })
        }
      }
    })
  },

  chooseReadyType: function(e) {
    console.log(e)
    var that = this;
    var type = e.currentTarget.dataset.type;
    that.setData({
      isReady: type,
    })
    app.globalData.isReady = type
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
    this.setData({
      fullCar: true
    });
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

  // 跳转至下个页面
  router: function() {
    app.globalData.foodsCart = this.data.cartGoods;
    wx.navigateTo({
      url: '../foodOrder/foodOrder?price=' + this.data.toalPrice,
    })
  },

  // 右侧滑动导航
  // scroll: function (e) {
  //   let that = this;
  //   let scrollTop = e.detail.scrollTop;
  //   // let scrollArr = that.data.heightArr;
  //   for (let i = 0;i < scrollArr.length;i ++) {
  //     if (scrollTop < scrollArr[i]) {
  //       return
  //     }
  //   }
  // },

  // 列表左侧导航
  chooseType: function(e) {
    var that = this;
    var index = e.currentTarget.dataset.index;
    var id = e.currentTarget.dataset.id
    this.setData({
      navActive: index,
      toView: id,
    })
  },

  // 获取所有卖品
  getAllGoods: function() {
    let that = this;
    // wx.showLoading({
    //   title: '加载中',
    //   mask: true
    // })
    let merchandise = {
      openid: app.globalData.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode
    }
    let merchandiseInfo = md5.md5Sign(merchandise);
    wx.request({
      url: app.globalData.url + '/miniMerchandise/queryMerchandise',
      data: merchandiseInfo,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      success: function(res) {
        // wx.hideLoading();
        if (res.data.status == 0) {
          if (res.data.data.length > 0) {
            for (let i = 0; i < res.data.data.length; i++) {
              for (let j = 0; j < res.data.data[i].merchandises.length; j++) {
                res.data.data[i].merchandises[j].count = 0;
              };
            };
            that.setData({
              goodsList: res.data.data
            });
          } else {
            wx.showToast({
              title: '暂无商品出售',
              icon: 'none'
            });
          };
        };
      }
    })
  },

  // 获取单件商品详情
  picDetail: function(e) {
    let that = this;
    let code = e.currentTarget.dataset.id;
    let goodList = that.data.goodsList;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    
    let data = {
      openid: app.globalData.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode,
      merchandiseCode: code
    }
    let dataInfo = md5.md5Sign(data);
    wx.request({
      url: app.globalData.url + '/miniMerchandise/queryMerchandiseDetail',
      data: dataInfo,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      success(res) {
        if (res.data.status == 0) {
          wx.hideLoading();
          for (let i = 0; i < goodList.length; i ++) {
            for (let j = 0; j < goodList[i].merchandises.length; j ++) {
              if (goodList[i].merchandises[j].merchandiseCode == res.data.data.merchandiseCode) {
                res.data.data.count = goodList[i].merchandises[j].count
              }
            }
          }
          that.setData({
            isShow: true,
            picInfo: res.data.data
          })
        } else if (res.data == '{code=notLogin, message=请先登录, data=null, status=1000}') {
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
                      url: app.globalData.url + '/miniMerchandise/queryMerchandiseDetail',
                      data: dataInfo,
                      method: "POST",
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        // 'cookie': e.header['Set-Cookie']
                      },
                      success: function(msg) {
                        if (msg.data.status == 0) {
                          wx.hideLoading();
                          res.data.data.count = 0;
                          that.setData({
                            isShow: true,
                            picInfo: msg.data.data
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

  // 关闭商品详情
  closeShow: function() {
    this.setData({
      isShow: false
    })
  },

  showcart: function() {
    let that = this;
    if (that.data.buyNum > 0) {
      let cartGoods = [];
      for (let i = 0; i < that.data.goodsList.length; i++) {
        for (let j = 0; j < that.data.goodsList[i].merchandises.length; j++) {
          if (that.data.goodsList[i].merchandises[j].count > 0) {
            cartGoods.push(that.data.goodsList[i].merchandises[j])
          }
        }
      }
      this.setData({
        fullCar: false,
        cartGoods: cartGoods,
        goodsList: that.data.goodsList
      });
      return;
    }
    wx.showToast({
      title: '还没有选择商品哦~',
      icon: "none",
      mask: true,
      duration: 2000
    });
  },

  hidecart: function() {
    this.setData({
      fullCar: true
    })
  },

  // 清空购物车
  emptyCart: function() {
    let that = this;
    var goodList = that.data.goodsList;
    for (let i = 0; i < goodList.length; i++) {
      for (let j = 0; j < goodList[i].merchandises.length; j++) {
        goodList[i].merchandises[j].count = 0;
      }
    }
    that.setData({
      fullCar: true,
      buyNum: 0,
      cartGoods: [],
      goodsList: goodList,
      toalPrice: 0
    });
  },

  // 增加商品数量
  add: function(e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var goodList = that.data.goodsList;
    let cartGoods = that.data.cartGoods;
    var buyNum = that.data.buyNum;
    for (let i = 0; i < goodList.length; i++) {
      for (let j = 0; j < goodList[i].merchandises.length; j++) {
        if (id == goodList[i].merchandises[j].merchandiseCode) {
          goodList[i].merchandises[j].count++;
          buyNum++;
        }
      }
    }
    if (cartGoods.length > 0) {
      for (let i = 0; i < cartGoods.length; i++) {
        if (id == cartGoods[i].merchandiseCode) {
          cartGoods[i].count++;
        }
      }
    }
    that.setData({
      goodsList: goodList,
      buyNum: buyNum,
      cartGoods: cartGoods
    })
    that.toalPrice();
  },

  // 增加详情商品数量
  addDetail: function(e) {
    let that = this;
    let picDetail = that.data.picInfo;
    picDetail.count = Number(picDetail.count) + 1;
    that.setData({
      picInfo: picDetail
    })
    that.add(e);
  },

  // 减少商品数量
  minus: function(e) {
    var that = this;
    var id = e.currentTarget.dataset.id;
    var goodList = that.data.goodsList;
    let cartGoods = that.data.cartGoods;
    var buyNum = that.data.buyNum;
    for (let i = 0; i < goodList.length; i++) {
      for (let j = 0; j < goodList[i].merchandises.length; j++) {
        if (id == goodList[i].merchandises[j].merchandiseCode) {
          goodList[i].merchandises[j].count--;
          buyNum--;
        }
        if (goodList[i].merchandises[j].count < 1) {
          goodList[i].merchandises[j].count = 0
        }
        if (buyNum < 1) {
          buyNum = 0
        }
      }
    }
    if (cartGoods.length > 0) {
      for (let i = 0; i < cartGoods.length; i++) {
        if (id == cartGoods[i].merchandiseCode) {
          cartGoods[i].count --;
          if (cartGoods[i].count < 1) {
            cartGoods[i].count = 0
          }
        }
        if (cartGoods[i].count == 0) {
          cartGoods.splice(i, 1);
        }
      }
    }
    if (cartGoods.length == 0) {
      that.setData({
        fullCar: true
      })
    }
    that.setData({
      goodsList: goodList,
      buyNum: buyNum,
      cartGoods: cartGoods
    })
    that.toalPrice();
  },

  // 减少详情商品数量
  minusDetail: function(e) {
    let that = this;
    let picDetail = that.data.picInfo;
    picDetail.count = Number(picDetail.count) - 1;
    if (picDetail.count < 1) {
      picDetail.count = 0
    }
    that.setData({
      picInfo: picDetail
    })
    that.minus(e);
  },

  // 计算已选商品价格
  toalPrice: function() {
    let that = this;
    let goodList = that.data.goodsList;
    let buyNum = that.data.buyNum;
    let price = 0;
    if (buyNum > 0) {
      for (let i = 0; i < goodList.length; i++) {
        for (let j = 0; j < goodList[i].merchandises.length; j++) {
          if (goodList[i].merchandises[j].count > 0) {
            price += (goodList[i].merchandises[j].count * goodList[i].merchandises[j].standardPrice);
          }
        }
      }
      that.setData({
        toalPrice: price
      })
    } else {
      that.setData({
        toalPrice: 0
      })
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