// pages/movie/movie.js
//获取应用实例
const app = getApp();
const md5 = require('../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    roomList: [],
    banner: []
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        that.setData({
          mobile: res.data.userMobile,
          userInfo: res.data
        })
      },
    })
    wx.setNavigationBarTitle({
      title: app.globalData.cinemaList.cinemaName
    });
    let json = {
      cinemaCode:app.globalData.cinemaCode
    };
    let obj1 = md5.md5Sign(json);
    wx.request({
      url: app.globalData.url + '/chatroom/getRoomByCinemaCode',
      data: obj1,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      success (res) {
        if (res.data.status == 0) {
          let room = res.data.data;
          that.setData({
            roomList: room
          })
        }
      }
    })
    let json1 = {
      cinemaCode: app.globalData.cinemaCode,
      category: 5
    }
    let obj2 = md5.md5Sign(json1);
    wx.request({
      url: app.globalData.url + '/banner/getBannerByCategory',
      data: obj2,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      success(res) {
        console.log(res)
        if (res.data.status == 0) {
          that.setData({
            banner: res.data.data
          })
        }
      }
    })
  },
  roomin: function(e) {
    var that = this
    var index = e.currentTarget.dataset.index;
    app.globalData.movieRoom = that.data.roomList[index];
    app.globalData.SocketUrl = that.data.roomList[index].socketUrl;
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        if (res.data.userMobile && res.data.memberType == 2) {
          wx.navigateTo({
            url: '../room/room?roomname=' + that.data.roomList[index].roomName + "&endTimestamp=" + that.data.roomList[index].endTimestamp + '&screenName=' + that.data.roomList[index].screenName + '&filmName=' + that.data.roomList[index].filmName + '&filmPoster=' + that.data.roomList[index].filmPoster,
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
    wx.setNavigationBarTitle({
      title: app.globalData.cinemaList.cinemaName
    });
    let json = {
      cinemaCode: app.globalData.cinemaCode
    };
    let obj1 = md5.md5Sign(json);
    wx.request({
      url: app.globalData.url + '/chatroom/getRoomByCinemaCode',
      data: obj1,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      success(res) {
        if (res.data.status == 0) {
          let room = res.data.data;
          that.setData({
            roomList: room
          })
        }
      }
    })
    let json1 = {
      cinemaCode: app.globalData.cinemaCode,
      category: 5
    }
    let obj2 = md5.md5Sign(json1);
    wx.request({
      url: app.globalData.url + '/banner/getBannerByCategory',
      data: obj2,
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
  bannerTap: function(e) {
    var index = e.currentTarget.dataset.index;
    var banner = this.data.banner;
    var num = banner[index].playType;
    if (num == 1 || num == 3) {
      var url = banner[index].redirectUrl;
      if (url != "") {
        app.globalData.acivityUrl = url;
        wx.navigateTo({
          url: '../acivityUrl/acivityUrl',
        })
      }
    } else if (num == 2 && banner[index].dxMovie != null) {
      var id = banner[index].dxMovie.id;
      var movieList = app.globalData.movieList;
      for (var i = 0; i < movieList.length; i++) {
        if (movieList[i].id == id) {
          app.globalData.movieIndex = i;
          wx.navigateTo({
            url: '../movieDetail/movieDetail',
          })
        }
      }
    }
  },
  getNowTimeMovie: function() {
    var that = this
    wx.showLoading({
      title: '加载中',
    })
    wx.request({
      url: app.globalData.url + '/Api/chatRoom/getRooms',
      // url: app.globalData.url + '/Api/chatRoom/getRooms',
      method: "POST",
      data: {
        cinemaCode: app.globalData.cinemaCode
      },
      header: {
        // 'content-type': 'application/json' // 默认值
        "Content-Type": "application/x-www-form-urlencoded"
      },
      success: function(res) {
        wx.hideLoading()
        // that.data.FlimList.push(res)
        that.setData({
          MovieList: res.data
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
  }
})