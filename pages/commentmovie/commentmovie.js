// pages/commentmovie/commentmovie.js
//获取应用实例
const app = getApp();
const util = require('../../utils/util.js');
const md5 = require('../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    text: [{
        text: "好看到炸裂!",
        select: false
      },
      {
        text: "非常温暖感人,推荐!",
        select: false
      },
      {
        text: "见仁见智.",
        select: false
      },
      {
        text: "给导演加鸡腿.",
        select: false
      },
      {
        text: "剧情不错!",
        select: false
      },
      {
        text: "值回票价.",
        select: false
      },
      {
        text: "演员太美,舔屏!",
        select: false
      },
      {
        text: "演技满分!",
        select: false
      },
    ],
    stars: [0, 1, 2, 3, 4],
    normalSrc: '/images/nostar.png',
    selectedSrc: '/images/star.png',
    halfSrc: '/images/halfstar.png',
    score: 0,
    key: 0,
    comment: ''
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    this.setData({
      filmCode: options.code
    })
    wx.getStorage({
      key: 'loginInfo',
      success: function (res) {
        that.setData({
          userInfo: res.data
        })
      },
    })
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
  inputText: function(e) {
    this.setData({
      comment: e.detail.value
    })
  },
  select: function(e) {
    let that = this;
    let text = that.data.text;
    let index = e.currentTarget.dataset.index;
    let comment = that.data.comment;
    let value = '';
    value = text[index].text;
    that.setData({
      comment: comment + value
    })
  },
  submit: function() {
    let that = this;
    if (that.data.comment.trim() == '') {
      wx.showToast({
        title: '还没有评论哦',
        icon: 'none',
        mask: true
      })
      return
    }
    wx.showLoading({
      title: '加载中',
      mask: true,
    })
    let data = {
      cinemaCode: app.globalData.cinemaCode,
      openid: app.globalData.userInfo.openid,
      comment: that.data.comment,
      score: that.data.score,
      filmCode: that.data.filmCode
    }
    let dataInfo = md5.md5Sign(data);
    wx.request({
      url: app.globalData.url + '/film/commentFilm',
      data: dataInfo,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      success(res) {
        if (res.data.status == 0) {
          wx.hideLoading();
          wx.showToast({
            title: '评论成功！',
            icon: 'success',
            mask: true
          })
          // setTimeout(function() {
          //   wx.navigateBack({})
          // },2000)
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
  selectLeft: function (e) {
    var key = e.currentTarget.dataset.key;
    if (this.data.key == 0.5 && e.currentTarget.dataset.key == 0.5) {
      //只有一颗星的时候,再次点击,变为0颗
      key = 0;
    }
    this.setData({
      key: key,
      score: key * 2,
      num: Math.round(key) - 1
    })
  },

  selectRight: function (e) {
    var key = e.currentTarget.dataset.key;
    this.setData({
      key: key,
      score: key * 2,
      num: Math.round(key) - 1
    })
  },
})