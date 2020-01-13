// pages/movieDetail/movieDetail.js
const app = getApp();
const util = require('../../utils/util.js');
const md5 = require('../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    isWant: '0', //想看的电影所需参数
    isLooked: '3', // 看过电影所需参数
    isAll: false,
    movie: null,
    canTap: "1",
    comments: null,
    watchRecord: "1",
    wantStatus: '1',
    lookedStatus: '1',
    show: false,
    human: 0,
    photoNum: 0,
    pageNo: 0,
    pageSize: 10,
    comments: []
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
          mobile: res.data.userMobile,
          userInfo: res.data
        })
      },
    })
    that.setData({
      filmCode: options.filmCode
    })
    wx.setNavigationBarTitle({
      title: app.globalData.cinemaList.cinemaName
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    let that = this;
    that.getStatus();
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
  manage: function(event) {
    var that = this;
    var movie = event;
    // movie.startPlay = movie.startPlay.substring(0,10);
    if (typeof(movie.photos) == "string") {
      movie.photos = movie.photos.split(",");
    }

    // console.log(movie)
    that.setData({
      movie: movie
    })
  },
  seeAll: function() { //查看全部介绍
    var that = this;
    if (!that.data.isAll) {
      that.setData({
        isAll: true
      })
    } else {
      that.setData({
        isAll: false
      })
    }
  },
  wantSee: function() { //想看按钮
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    var that = this;
    if (that.data.wantStatus == 1) {
      that.setData({
        wantStatus: 2
      })
    } else {
      that.setData({
        wantStatus: 1
      })
    }
    let wantLook = {
      filmCode: that.data.filmCode,
      wantStatus: that.data.wantStatus,
      openid: app.globalData.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode
    }
    let filmLook = md5.md5Sign(wantLook);
    wx.request({
      url: app.globalData.url + '/film/wantLook',
      data: filmLook,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      success: function (res) {
        if (res.data.status == 0) {
          wx.hideLoading()
        } else {
          wx.hideLoading();
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      }
    })
  },
  toCompare: function() {
    let that = this;
    app.globalData.checkfilmcode = that.data.movie.filmCode;
    wx.navigateTo({
      url: '../compare/compare?filmCode',
    })
  },
  toComments: function() {
    var id = app.globalData.movieList[app.globalData.movieIndex].id;
    wx.navigateTo({
      url: '../compare/compare?id=' + id,
    })
  },

  // 放大图片
  magnifying: function (e) {
    let that = this;
    wx.previewImage({
      current: e.currentTarget.dataset.src, // 当前显示图片的http链接
      urls: that.data.photoList // 需要预览的图片http链接列表
    })
  },

  magnifyingThose: function (e) {
    let that = this;
    wx.previewImage({
      current: e.currentTarget.dataset.src, // 当前显示图片的http链接
      urls: that.data.those // 需要预览的图片http链接列表
    })
  },

  hidehb: function () {
    this.setData({
      show: false
    })
  },

  getStatus: function () {
    let that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    let filmDetail = {
      filmCode: that.data.filmCode,
      openid: app.globalData.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode
    }
    let filmInfo = md5.md5Sign(filmDetail);
    wx.request({
      url: app.globalData.url + '/film/queryFilmDetail',
      data: filmInfo,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      success: function (res) {
        wx.hideLoading();
        if (res.data.status == 0) {
          if (!res.data.data.wantStatus) {
            that.setData({
              wantStatus: 1
            })
          } else {
            that.setData({
              wantStatus: res.data.data.wantStatus
            })
          }
          if (!res.data.data.lookedStatus) {
            that.setData({
              lookedStatus: 1
            })
          } else {
            that.setData({
              lookedStatus: res.data.data.lookedStatus
            })
          }
          let photoList = [];
          let photo = res.data.data.stagePhoto;
          if (photo == '') { // 剧照为空
            that.setData({
              photoList: photoList,
              photoNum: photoList.length
            })
          } else {
            if (photo.indexOf(",") == -1) { // 只有一张剧照
              photoList.push(photo);
              that.setData({
                photoList: photoList,
                photoNum: photoList.length
              })
            } else { // 多张剧照
              photoList = photo.split(",");
              let newArray = photoList.filter(value => Object.keys(value).length !== 0);
              that.setData({
                photoList: newArray,
                photoNum: newArray.length
              })
            }
          }
          let those = [];
          for (let i = 0; i < res.data.data.directorList.length; i++) {
            those.push(res.data.data.directorList[i].picture)
          }
          for (let i = 0; i < res.data.data.castList.length; i++) {
            those.push(res.data.data.castList[i].picture)
          }
          that.setData({
            movie: res.data.data,
            human: res.data.data.castList.length + res.data.data.directorList.length,
            those: those
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
        pageNo: pageNo + 1,
      });
      that.getComments();
    }
  },

  getComments: function () {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    var that = this;
    let data = {
      filmCode: that.data.filmCode,
      openid: app.globalData.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode,
      pageNo: that.data.pageNo,
      pageSize: that.data.pageSize
    }
    let dataInfo = md5.md5Sign(data);
    wx.request({
      url: app.globalData.url + '/film/getCommentList',
      data: dataInfo,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      success: function (res) {
        if (res.data.status == 0) {
          wx.hideLoading()
          that.setData({
            comments: that.data.comments.concat(res.data.data.data),
            page: res.data.data.totalPage,
            length: res.data.data.totalCount,
          })
        } else {
          wx.hideLoading();
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      }
    })
  },

  praiseComment: function (e) {
    var that = this;
    let id = e.currentTarget.dataset.id;
    let status = e.currentTarget.dataset.status;
    let comments = that.data.comments;
    let num = 0;
    if (status == 1) {
      num = 2
    }
    if (status == 2) {
      num = 1
    }
    let data = {
      commentId: id,
      thumbStatus: num,
      openid: app.globalData.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode,
    }
    let dataInfo = md5.md5Sign(data);
    wx.request({
      url: app.globalData.url + '/film/commentThumb',
      data: dataInfo,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
      },
      success: function (res) {
        if (res.data.status == 0) {
          for (let i = 0;i < comments.length;i ++) {
            if (id == comments[i].commentId) {
              if (status == 1) {
                comments[i].status = 2;
                comments[i].thumbNumber += 1
              }
              if (status == 2) {
                comments[i].status = 1;
                comments[i].thumbNumber -= 1
              }
            }
          }
          that.setData({
            comments: comments
          })
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none'
          })
        }
      }
    })
  }
})