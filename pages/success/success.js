// pages/success/success.js
//获取应用实例
const app = getApp();
const util = require('../../utils/util.js');
const md5 = require('../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    orderNum: 0,
    order: null,
    banner: "",
    movieName: null,
    count: null,
    date: null,
    seat: null,
    printNo: null,
    nowTime: null,
    verifyCode: null,
    banner: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    this.setData({
      orderNum: options.code,
      movieName: options.name,
      count: options.count,
      goodsOrder: app.globalData.goodsOrder
    });
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        that.setData({
          userInfo: res.data
        })
      },
    })
    this.getBanner();
    wx.setNavigationBarTitle({
      title: app.globalData.cinemaList.cinemaName
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    var that = this;
  },
  look: function(e) {
    let that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    setTimeout(function(){
      wx.hideLoading();
      wx.navigateTo({
        url: '../orderDetail/orderDetail?orderNum=' + that.data.orderNum,
      })
    },2000)
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
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
    wx.navigateBack({
      delta: 2
    })
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
  getBanner: function() { //获取轮播图
    var that = this;
    // 读取页面背景图片
    let json = {
      cinemaCode: app.globalData.cinemaCode,
      category: 4
    };
    let obj1 = md5.md5Sign(json);
    wx.request({
      url: app.globalData.url + '/banner/getBannerByCategory',
      data: obj1,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        'cookie': wx.getStorageSync("sessionid")
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