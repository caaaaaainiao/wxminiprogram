//index.js
//获取应用实例
const app = getApp();
const util = require('../../utils/util.js');
const md5 = require('../../utils/md5.js');
Page({
  data: {
    FlimList: [],
    FilmCodes: [],
    list: null,
    moviearea: '', //当前影院名称
    movieList: null, //当前影院放映影片
    userInfo: null, //个人信息
    currentCity: '', //当前所在城市
    isFirst: false,
    cinemaList: null, //当前影院
    isChoose: false, //选择影院
    nowCity: [{
      name: "",
      show: ""
    }],
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    text: "授权访问当前地址",
    zchb: "",
    onLoad: false,
    sza: [],
    all: true,
    mobile: '',
    showNav: false,
    timestamp: '',
    showComment: false,
    text1: [{
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
        text: "给导演加鸡腿!",
        select: false
      },
      {
        text: "剧情不错!",
        select: false
      }
    ],
    comment: '',
    stars: [0, 1, 2, 3, 4],
    evaluate: ['很差','极差','一般','不错','优秀'],
    normalSrc: '/images/nostar.png',
    selectedSrc: '/images/star.png',
    halfSrc: '/images/halfstar.png',
    key: 0,
    score: 0
  },
  //  小程序进入 检查授权信息 登录 历史位置影院列表 引导等
  //授权信息
  formSubmit: function(e) {
    console.log('form发生了submit事件，携带数据为：', e.detail.value)
  },
  onLoad: function(options) {
    var that = this;
    if (Object.keys(options).length != 0) {
      var scene = decodeURIComponent(options.scene)
      if (scene.indexOf("employeeCode") == "-1") {
        wx.setStorage({
          key: 'shareInfo',
          data: options,
        })
      } else {
        wx.setStorage({
          key: 'employeeCode',
          data: scene,
        })
      }
    }
    wx.getStorage({
      key: 'userInfo',
      success: function(res) {
        app.globalData.userInfo = res.data
      },
    })
  },

  // 点击头像注册
  login: function() {
    wx.navigateTo({
      url: '../login/login',
    })
  },
  // 获取影片信息
  getFilm: function(cinemaCode) {
    let that = this;
    let sessionFilms = {
      cinemaCode: cinemaCode
    }
    let filmInfo = md5.md5Sign(sessionFilms);
    wx.request({
      url: app.globalData.url + '/film/querySessionFilms',
      data: filmInfo,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      success: function(res) {
        if (res.data.status == 0) {
          that.setData({
            movieList: res.data.data,
          })
          app.globalData.movieList = res.data.data;
        } else {
          // 获取影片失败
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            mask: true
          })
        }
      }
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
      cinemaCode: app.globalData.cinemaCode
    }
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        data.openid = res.data.openid
      }
    })
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
          if (res.data.data) {
            app.globalData.ticketingSystemType = res.data.data.ticketingSystemType;
          }
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
                          if (msg.data.data) {
                            app.globalData.ticketingSystemType = msg.data.data.ticketingSystemType;
                          }
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

  // 移除第一次进入引导
  removeBlack: function() {
    this.setData({
      isFirst: false
    })
    wx.showTabBar({})
    wx.setStorage({
      key: "firstUse",
      data: "点过了"
    })
  },
  // 影片详情
  toDetails: function(e) {
    app.globalData.checkfilmcode = e.currentTarget.dataset.id
    app.globalData.movieIndex = e.currentTarget.dataset.index;
    wx.setStorage({
      key: 'movieList',
      data: app.globalData.movieList,
    })
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        if (res.data.memberType == 2) {
          wx.navigateTo({
            url: '../movieDetail/movieDetail?filmCode=' + e.currentTarget.dataset.id, //跳转到影片列表
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
  // 比价购票
  buy: function(e) {
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    app.globalData.checkfilmcode = e.currentTarget.dataset.id
    wx.setStorage({
      key: 'movieList',
      data: app.globalData.movieList,
    })
    app.globalData.movieIndex = e.currentTarget.dataset.index;
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        wx.hideLoading();
        if (res.data.memberType == '2') {
          wx.navigateTo({
            url: '../compare/compare', //跳转到影片列表
          })
        } else {
          wx.navigateTo({
            url: '../login/login'
          })
        }
      },
      fail: function() {
        wx.hideLoading();
        wx.navigateTo({
          url: '../login/login',
        })
      }
    })
  },
  getMovies: function() {
    var that = this;
    this.setData({
      isChoose: false
    })
  },
  chooseCity: function(e) {
    var that = this;
    var crCity = e.currentTarget.dataset.name;
    that.setData({
      currentCity: crCity
    });
    // 获取存入缓存的数据开始渲染
    var show = [];
    for (let i = 0; i < that.data.areaList.length; i++) {
      if (crCity === that.data.areaList[i].city) {
        show.push(that.data.areaList[i]);
      }
    }
    // 清空列表
    that.setData({
      cinemaList: []
    })
    for (let j = 0; j < show.length; j++) {
      let name = "cinemaList[" + j + "].cinemaName";
      let address = "cinemaList[" + j + "].address";
      let distance = "cinemaList[" + j + "].distance";
      let cinemaCode = "cinemaList[" + j + "].cinemaCode";
      that.setData({
        [name]: show[j].cinemaName,
        [address]: show[j].address,
        [distance]: show[j].distance,
        [cinemaCode]: show[j].cinemaCode,
      })
    };
  },
  showCity: function() { //展示城市
    let that = this;
    // 由距离远近进行排序 增加一个开关选择是否显示所有影院
    let cinemaList = that.data.areaList;
    if (that.data.all == true) {
      that.setData({
        cinemaList: cinemaList,
        all: !that.data.all,
      })
    }
  },
  chooseCinema: function(e) { //选择影院
    var that = this
    wx.showTabBar({});
    app.globalData.lookcinemaadd = e.currentTarget.dataset.address;
    app.globalData.isCanRefund = e.currentTarget.dataset.iscanrefound;
    app.globalData.isOpenMember = e.currentTarget.dataset.isopenmember;
    var cinemacode = e.currentTarget.dataset.cinemacode;
    app.globalData.lookcinemaname = e.currentTarget.dataset.cinemaname;
    app.globalData.miniSharePosters = e.currentTarget.dataset.miniSharePosters;
    app.globalData.miniShareTitle = e.currentTarget.dataset.miniShareTitle;
    app.globalData.longitude = e.currentTarget.dataset.longitude;
    app.globalData.latitude = e.currentTarget.dataset.latitude;
    for (var i = 0; i < that.data.areaList.length; i++) {
      if (that.data.areaList[i].cinemaCode == cinemacode) {
        app.globalData.cinemaList = that.data.areaList[i]
      }
    }
    app.globalData.cinemaNo = e.currentTarget.dataset.index;
    app.globalData.cinemaCode = e.currentTarget.dataset.cinemacode;
    app.globalData.moviearea = e.currentTarget.dataset.cinemaname;
    that.setData({
      moviearea: app.globalData.moviearea,
      isChoose: false,
      cinemaCode: e.currentTarget.dataset.cinemacode
    })
    that.getFilm(e.currentTarget.dataset.cinemacode);
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        that.setData({
          userInfo: res.data, //用户信息
        })
        app.globalData.getUsename = that.data.userInfo.nickName;
        app.globalData.getAvatarUrl = that.data.userInfo.avatarUrl;
        let miniUserInfo = {
          cinemaCode: e.currentTarget.dataset.cinemacode,
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
              app.globalData.buyTicketHint = res.data.data.buyTicketHint;
              app.globalData.membershipServiceAgreement = res.data.data.membershipServiceAgreement;
              app.globalData.ticketingSystemType = res.data.data.ticketingSystemType;
              app.globalData.technicalSupport = res.data.data.technicalSupport;
              that.setData({
                goldNumber: res.data.data.goldNumber,
                balance: res.data.data.balance,
                rechargeMemo: res.data.data.rechargeMemo,
                goldActivityMemo: res.data.data.goldActivityMemo
              })
              if (res.data.data.miniBannerVO) {
                that.setData({
                  miniBannerVO: res.data.data.miniBannerVO.imageUrl
                })
              }
              if (res.data.data.commentTipsVO) {
                that.setData({
                  commentTipsVO: res.data.data.commentTipsVO,
                  showComment: true
                })
              }
              if (res.data.data.miniSharePosters && res.data.data.miniSharePosters != '') {
                that.setData({
                  miniSharePosters: res.data.data.miniSharePosters
                })
                app.globalData.miniSharePosters = res.data.data.miniSharePosters
              }
              if (res.data.data.miniShareTitle && res.data.data.miniShareTitle != '') {
                that.setData({
                  miniShareTitle: res.data.data.miniShareTitle
                })
                app.globalData.miniShareTitle = res.data.data.miniShareTitle
              }
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
          mobile: res.data.userMobile
        })
      },
      fail: function(err) {
        let miniUserInfo = {
          cinemaCode: e.currentTarget.dataset.cinemacode,
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
              app.globalData.logo = res.data.data.logo;
              app.globalData.buyTicketHint = res.data.data.buyTicketHint;
              app.globalData.membershipServiceAgreement = res.data.data.membershipServiceAgreement;
              app.globalData.ticketingSystemType = res.data.data.ticketingSystemType;
              app.globalData.technicalSupport = res.data.data.technicalSupport;
              that.setData({
                goldNumber: res.data.data.goldNumber,
                balance: res.data.data.balance,
                rechargeMemo: res.data.data.rechargeMemo,
                goldActivityMemo: res.data.data.goldActivityMemo
              })
              if (res.data.data.miniBannerVO) {
                that.setData({
                  miniBannerVO: res.data.data.miniBannerVO.imageUrl
                })
              }
              if (res.data.data.commentTipsVO) {
                that.setData({
                  commentTipsVO: res.data.data.commentTipsVO,
                  showComment: true
                })
              }
              if (res.data.data.miniSharePosters && res.data.data.miniSharePosters != '') {
                that.setData({
                  miniSharePosters: res.data.data.miniSharePosters
                })
                app.globalData.miniSharePosters = res.data.data.miniSharePosters
              }
              if (res.data.data.miniShareTitle && res.data.data.miniShareTitle != '') {
                that.setData({
                  miniShareTitle: res.data.data.miniShareTitle
                })
                app.globalData.miniShareTitle = res.data.data.miniShareTitle
              }
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
      title: that.data.moviearea
    })
  },
  startChoose: function() {
    wx.hideTabBar();
    this.setData({
      isChoose: true
    })
    this.showCity();
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this;
    wx.showTabBar()
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        that.setData({
          userInfo: res.data, //用户信息
        })
        app.globalData.userInfo = res.data
        app.globalData.getUsename = that.data.userInfo.nickName;
        app.globalData.getAvatarUrl = that.data.userInfo.avatarUrl;
        if (!that.data.cinemaCode) {
          return
        }
        let miniUserInfo = {
          cinemaCode: that.data.cinemaCode,
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
              app.globalData.buyTicketHint = res.data.data.buyTicketHint;
              app.globalData.membershipServiceAgreement = res.data.data.membershipServiceAgreement;
              app.globalData.ticketingSystemType = res.data.data.ticketingSystemType;
              app.globalData.technicalSupport = res.data.data.technicalSupport;
              that.setData({
                goldNumber: res.data.data.goldNumber,
                balance: res.data.data.balance,
                rechargeMemo: res.data.data.rechargeMemo,
                goldActivityMemo: res.data.data.goldActivityMemo
              })
              if (res.data.data.miniBannerVO) {
                that.setData({
                  miniBannerVO: res.data.data.miniBannerVO.imageUrl
                })
              }
              if (res.data.data.commentTipsVO) {
                that.setData({
                  commentTipsVO: res.data.data.commentTipsVO,
                  showComment: true
                })
              }
              if (res.data.data.miniSharePosters && res.data.data.miniSharePosters != '') {
                that.setData({
                  miniSharePosters: res.data.data.miniSharePosters
                })
                app.globalData.miniSharePosters = res.data.data.miniSharePosters
              }
              if (res.data.data.miniShareTitle && res.data.data.miniShareTitle != '') {
                that.setData({
                  miniShareTitle: res.data.data.miniShareTitle
                })
                app.globalData.miniShareTitle = res.data.data.miniShareTitle
              }
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
          mobile: res.data.userMobile
        })
      },
      fail: function(err) {
        let miniUserInfo = {
          cinemaCode: that.data.cinemaCode,
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
              app.globalData.logo = res.data.data.logo;
              app.globalData.buyTicketHint = res.data.data.buyTicketHint;
              app.globalData.membershipServiceAgreement = res.data.data.membershipServiceAgreement;
              app.globalData.ticketingSystemType = res.data.data.ticketingSystemType;
              app.globalData.technicalSupport = res.data.data.technicalSupport;
              that.setData({
                goldNumber: res.data.data.goldNumber,
                balance: res.data.data.balance,
                rechargeMemo: res.data.data.rechargeMemo,
                goldActivityMemo: res.data.data.goldActivityMemo
              })
              if (res.data.data.miniBannerVO) {
                that.setData({
                  miniBannerVO: res.data.data.miniBannerVO.imageUrl
                })
              }
              if (res.data.data.commentTipsVO) {
                that.setData({
                  commentTipsVO: res.data.data.commentTipsVO,
                  showComment: true
                })
              }
              if (res.data.data.miniSharePosters && res.data.data.miniSharePosters != '') {
                that.setData({
                  miniSharePosters: res.data.data.miniSharePosters
                })
                app.globalData.miniSharePosters = res.data.data.miniSharePosters
              }
              if (res.data.data.miniShareTitle && res.data.data.miniShareTitle != '') {
                that.setData({
                  miniShareTitle: res.data.data.miniShareTitle
                })
                app.globalData.miniShareTitle = res.data.data.miniShareTitle
              }
              if (res.header['Set-Cookie']) {
                wx.setStorage({
                  key: 'sessionid',
                  data: res.header['Set-Cookie'],
                })
              }
            }
          }
        })
      }
    })
    // that.binding();
    if (app.globalData.cinemaCode) {
      that.getFilm(app.globalData.cinemaCode);
    }
    wx.setNavigationBarTitle({
      title: that.data.moviearea
    })
  },

  onReady: function() {
    let that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
    })
    // 获取所有影院
    wx.getLocation({
      success: function(res) {
        var userLat = res.latitude;
        var userLng = res.longitude;
        let queryCinema = {
          miniAppId: app.usermessage.AppId,
          longitude: userLng,
          latitude: userLat
        }
        let query = md5.md5Sign(queryCinema)
        wx.request({
          url: app.globalData.url + '/cinema/queryCinema',
          data: query,
          method: "POST",
          header: {
            "Content-Type": "application/x-www-form-urlencoded",
            // 'cookie': wx.getStorageSync("sessionid")
          },
          success: function(res) {
            wx.hideLoading();
            if (res.data.status == 0) {
              that.setData({
                areaList: res.data.data,
                moviearea: res.data.data[0].cinemaName,
                cinemaCode: res.data.data[0].cinemaCode,
              })
              app.globalData.areaList = res.data.data;
              app.globalData.cinemaCode = res.data.data[0].cinemaCode;
              app.globalData.cinemaList = res.data.data[0];
              app.globalData.longitude = res.data.data[0].longitude;
              app.globalData.latitude = res.data.data[0].latitude;
              wx.setNavigationBarTitle({
                title: res.data.data[0].cinemaName
              });
              that.getFilm(res.data.data[0].cinemaCode);
              var arr = [];
              for (let i = 0; i < res.data.data.length; i++) {
                arr.push(res.data.data[i].city);
              };
              // 去除重复省市显示返回新数组newArr
              var newArr = arr.filter(function(element, index, self) {
                return self.indexOf(element) === index;
              });
              // 将数据赋值到nowCity中显示
              for (var j = 0; j < newArr.length; j++) {
                var name = "nowCity[" + j + "].name";
                var show = "nowCity[" + j + "].show";
                that.setData({
                  [name]: newArr[j],
                  [show]: newArr[j]
                })
              };
              wx.getStorage({
                key: 'loginInfo',
                success: function(res) {
                  let miniUserInfo = {
                    cinemaCode: that.data.cinemaCode,
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
                        app.globalData.buyTicketHint = res.data.data.buyTicketHint;
                        app.globalData.membershipServiceAgreement = res.data.data.membershipServiceAgreement;
                        app.globalData.ticketingSystemType = res.data.data.ticketingSystemType;
                        app.globalData.technicalSupport = res.data.data.technicalSupport;
                        that.setData({
                          goldNumber: res.data.data.goldNumber,
                          balance: res.data.data.balance,
                          rechargeMemo: res.data.data.rechargeMemo,
                          goldActivityMemo: res.data.data.goldActivityMemo,
                        })
                        if (res.data.data.miniBannerVO) {
                          that.setData({
                            miniBannerVO: res.data.data.miniBannerVO.imageUrl
                          })
                        }
                        if (res.data.data.commentTipsVO) {
                          that.setData({
                            commentTipsVO: res.data.data.commentTipsVO,
                            showComment: true
                          })
                        }
                        if (res.data.data.miniSharePosters && res.data.data.miniSharePosters != '') {
                          that.setData({
                            miniSharePosters: res.data.data.miniSharePosters
                          })
                          app.globalData.miniSharePosters = res.data.data.miniSharePosters
                        }
                        if (res.data.data.miniShareTitle && res.data.data.miniShareTitle != '') {
                          that.setData({
                            miniShareTitle: res.data.data.miniShareTitle
                          })
                          app.globalData.miniShareTitle = res.data.data.miniShareTitle
                        }
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
                    showNav: true
                  })
                },
                fail: function(err) {
                  let miniUserInfo = {
                    cinemaCode: that.data.cinemaCode,
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
                        app.globalData.logo = res.data.data.logo;
                        app.globalData.buyTicketHint = res.data.data.buyTicketHint;
                        app.globalData.membershipServiceAgreement = res.data.data.membershipServiceAgreement;
                        app.globalData.ticketingSystemType = res.data.data.ticketingSystemType;
                        app.globalData.technicalSupport = res.data.data.technicalSupport;
                        that.setData({
                          goldNumber: res.data.data.goldNumber,
                          balance: res.data.data.balance,
                          rechargeMemo: res.data.data.rechargeMemo,
                          goldActivityMemo: res.data.data.goldActivityMemo
                        })
                        if (res.data.data.miniBannerVO) {
                          that.setData({
                            miniBannerVO: res.data.data.miniBannerVO.imageUrl
                          })
                        }
                        if (res.data.data.commentTipsVO) {
                          that.setData({
                            commentTipsVO: res.data.data.commentTipsVO,
                            showComment: true
                          })
                        }
                        if (res.data.data.miniSharePosters && res.data.data.miniSharePosters != '') {
                          that.setData({
                            miniSharePosters: res.data.data.miniSharePosters
                          })
                          app.globalData.miniSharePosters = res.data.data.miniSharePosters
                        }
                        if (res.data.data.miniShareTitle && res.data.data.miniShareTitle != '') {
                          that.setData({
                            miniShareTitle: res.data.data.miniShareTitle
                          })
                          app.globalData.miniShareTitle = res.data.data.miniShareTitle
                        }
                        if (res.header['Set-Cookie']) {
                          wx.setStorage({
                            key: 'sessionid',
                            data: res.header['Set-Cookie'],
                          })
                        }
                      }
                    }
                  })
                }
              })
            } else if (res.data == '{code=notLogin, message=请先登录, data=null, status=1000}') {
              wx.getStorage({
                key: 'loginInfo',
                success: function(res) {
                  let json = {
                    openid: res.data.openid,
                    cinemaCode: that.data.cinemaCode
                  };
                  let obj1 = md5.md5Sign(json);
                  wx.request({
                    url: app.globalData.url + '/user/miniLogin',
                    data: obj1,
                    method: "POST",
                    header: {
                      "Content-Type": "application/x-www-form-urlencoded"
                    },
                    success: function(e) {
                      if (e.data.status == 0) {
                        wx.request({
                          url: app.globalData.url + '/user/miniUserInfo',
                          data: userInfo,
                          method: "POST",
                          header: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            // 'cookie': wx.getStorageSync("sessionid")
                          },
                          success: function(msg) {
                            if (msg.data.status == 0) {
                              app.globalData.logo = res.data.data.logo;
                              app.globalData.buyTicketHint = res.data.data.buyTicketHint;
                              app.globalData.membershipServiceAgreement = res.data.data.membershipServiceAgreement;
                              app.globalData.ticketingSystemType = res.data.data.ticketingSystemType;
                              app.globalData.technicalSupport = res.data.data.technicalSupport;
                              that.setData({
                                goldNumber: msg.data.data.goldNumber,
                                balance: msg.data.data.balance,
                                rechargeMemo: msg.data.data.rechargeMemo,
                                goldActivityMemo: msg.data.data.goldActivityMemo
                              })
                              if (msg.data.data.miniBannerVO) {
                                that.setData({
                                  miniBannerVO: msg.data.data.miniBannerVO.imageUrl
                                })
                              }
                              if (msg.data.data.commentTipsVO) {
                                that.setData({
                                  commentTipsVO: msg.data.data.commentTipsVO,
                                  showComment: true
                                })
                              }
                              if (msg.data.data.miniSharePosters && msg.data.data.miniSharePosters != '') {
                                that.setData({
                                  miniSharePosters: msg.data.data.miniSharePosters
                                })
                                app.globalData.miniSharePosters = msg.data.data.miniSharePosters
                              }
                              if (msg.data.data.miniShareTitle && msg.data.data.miniShareTitle != '') {
                                that.setData({
                                  miniShareTitle: msg.data.data.miniShareTitle
                                })
                                app.globalData.miniShareTitle = msg.data.data.miniShareTitle
                              }
                              if (msg.header['Set-Cookie']) {
                                wx.setStorage({
                                  key: 'sessionid',
                                  data: msg.header['Set-Cookie'],
                                })
                              }
                            }
                          }
                        })
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
          },
          fail: function(err) {
            wx.hideLoading();
            wx.showToast({
              title: '网络状况不佳',
              mask: true,
              icon: 'none'
            })
          }
        })
      },
      fail: function(res) {
        wx.showToast({
          title: '地理位置获取失败',
          icon: 'none',
          mask: true
        })
        var userLat = "30.2084";
        var userLng = "120.21201";
        let queryCinema = {
          miniAppId: app.usermessage.AppId,
          longitude: userLng,
          latitude: userLat
        }
        let query = md5.md5Sign(queryCinema)
        wx.request({
          url: app.globalData.url + '/cinema/queryCinema',
          data: query,
          method: "POST",
          header: {
            "Content-Type": "application/x-www-form-urlencoded",
            // 'cookie': wx.getStorageSync("sessionid")
          },
          success: function(res) {
            wx.hideLoading();
            if (res.data.status == 0) {
              that.setData({
                areaList: res.data.data,
                moviearea: res.data.data[0].cinemaName,
                cinemaCode: res.data.data[0].cinemaCode,
              })
              app.globalData.areaList = res.data.data;
              app.globalData.cinemaCode = res.data.data[0].cinemaCode;
              app.globalData.cinemaList = res.data.data[0];
              app.globalData.longitude = res.data.data[0].longitude;
              app.globalData.latitude = res.data.data[0].latitude;
              wx.setNavigationBarTitle({
                title: res.data.data[0].cinemaName
              });
              that.getFilm(res.data.data[0].cinemaCode);
              var arr = [];
              for (let i = 0; i < res.data.data.length; i++) {
                arr.push(res.data.data[i].city);
              };
              // 去除重复省市显示返回新数组newArr
              var newArr = arr.filter(function(element, index, self) {
                return self.indexOf(element) === index;
              });
              // 将数据赋值到nowCity中显示
              for (var j = 0; j < newArr.length; j++) {
                var name = "nowCity[" + j + "].name";
                var show = "nowCity[" + j + "].show";
                that.setData({
                  [name]: newArr[j],
                  [show]: newArr[j]
                })
              };
              wx.getStorage({
                key: 'loginInfo',
                success: function(res) {
                  let miniUserInfo = {
                    cinemaCode: that.data.cinemaCode,
                    mobile: res.data.userMobile
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
                        app.globalData.buyTicketHint = res.data.data.buyTicketHint;
                        app.globalData.membershipServiceAgreement = res.data.data.membershipServiceAgreement;
                        app.globalData.ticketingSystemType = res.data.data.ticketingSystemType;
                        app.globalData.technicalSupport = res.data.data.technicalSupport;
                        that.setData({
                          goldNumber: res.data.data.goldNumber,
                          balance: res.data.data.balance,
                          rechargeMemo: res.data.data.rechargeMemo,
                          goldActivityMemo: res.data.data.goldActivityMemo
                        })
                        if (res.data.data.miniBannerVO) {
                          that.setData({
                            miniBannerVO: res.data.data.miniBannerVO.imageUrl
                          })
                        }
                        if (res.data.data.commentTipsVO) {
                          that.setData({
                            commentTipsVO: res.data.data.commentTipsVO,
                            showComment: true
                          })
                        }
                        if (res.data.data.miniSharePosters && res.data.data.miniSharePosters != '') {
                          that.setData({
                            miniSharePosters: res.data.data.miniSharePosters
                          })
                          app.globalData.miniSharePosters = res.data.data.miniSharePosters
                        }
                        if (res.data.data.miniShareTitle && res.data.data.miniShareTitle != '') {
                          that.setData({
                            miniShareTitle: res.data.data.miniShareTitle
                          })
                          app.globalData.miniShareTitle = res.data.data.miniShareTitle
                        }
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
                    showNav: true
                  })
                },
                fail: function(err) {
                  let miniUserInfo = {
                    cinemaCode: that.data.cinemaCode,
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
                        app.globalData.logo = res.data.data.logo;
                        app.globalData.buyTicketHint = res.data.data.buyTicketHint;
                        app.globalData.membershipServiceAgreement = res.data.data.membershipServiceAgreement;
                        app.globalData.ticketingSystemType = res.data.data.ticketingSystemType;
                        app.globalData.technicalSupport = res.data.data.technicalSupport;
                        that.setData({
                          goldNumber: res.data.data.goldNumber,
                          balance: res.data.data.balance,
                          rechargeMemo: res.data.data.rechargeMemo,
                          goldActivityMemo: res.data.data.goldActivityMemo
                        })
                        if (res.data.data.miniBannerVO) {
                          that.setData({
                            miniBannerVO: res.data.data.miniBannerVO.imageUrl
                          })
                        }
                        if (res.data.data.commentTipsVO) {
                          that.setData({
                            commentTipsVO: res.data.data.commentTipsVO,
                            showComment: true
                          })
                        }
                        if (res.data.data.miniSharePosters && res.data.data.miniSharePosters != '') {
                          that.setData({
                            miniSharePosters: res.data.data.miniSharePosters
                          })
                          app.globalData.miniSharePosters = res.data.data.miniSharePosters
                        }
                        if (res.data.data.miniShareTitle && res.data.data.miniShareTitle != '') {
                          that.setData({
                            miniShareTitle: res.data.data.miniShareTitle
                          })
                          app.globalData.miniShareTitle = res.data.data.miniShareTitle
                        }
                        if (res.header['Set-Cookie']) {
                          wx.setStorage({
                            key: 'sessionid',
                            data: res.header['Set-Cookie'],
                          })
                        }
                      }
                    }
                  })
                }
              })
            } else if (res.data == '{code=notLogin, message=请先登录, data=null, status=1000}') {
              // 登陆过期
              wx.getStorage({
                key: 'loginInfo',
                success: function(res) {
                  let json = {
                    openid: res.data.openid,
                    cinemaCode: that.data.cinemaCode
                  };
                  let obj1 = md5.md5Sign(json);
                  wx.request({
                    url: app.globalData.url + '/user/miniLogin',
                    data: obj1,
                    method: "POST",
                    header: {
                      "Content-Type": "application/x-www-form-urlencoded"
                    },
                    success: function(e) {
                      if (e.data.status == 0) {
                        wx.request({
                          url: app.globalData.url + '/user/miniUserInfo',
                          data: userInfo,
                          method: "POST",
                          header: {
                            "Content-Type": "application/x-www-form-urlencoded",
                            // 'cookie': wx.getStorageSync("sessionid")
                          },
                          success: function(msg) {
                            if (msg.data.status == 0) {
                              app.globalData.logo = res.data.data.logo;
                              app.globalData.buyTicketHint = res.data.data.buyTicketHint;
                              app.globalData.membershipServiceAgreement = res.data.data.membershipServiceAgreement;
                              app.globalData.ticketingSystemType = res.data.data.ticketingSystemType;
                              app.globalData.technicalSupport = res.data.data.technicalSupport;
                              that.setData({
                                goldNumber: msg.data.data.goldNumber,
                                balance: msg.data.data.balance,
                                rechargeMemo: msg.data.data.rechargeMemo,
                                goldActivityMemo: msg.data.data.goldActivityMemo
                              })
                              if (msg.data.data.miniBannerVO) {
                                that.setData({
                                  miniBannerVO: msg.data.data.miniBannerVO.imageUrl
                                })
                              }
                              if (msg.data.data.commentTipsVO) {
                                that.setData({
                                  commentTipsVO: msg.data.data.commentTipsVO,
                                  showComment: true
                                })
                              }
                              if (msg.data.data.miniSharePosters && msg.data.data.miniSharePosters != '') {
                                that.setData({
                                  miniSharePosters: msg.data.data.miniSharePosters
                                })
                                app.globalData.miniSharePosters = msg.data.data.miniSharePosters
                              }
                              if (msg.data.data.miniShareTitle && msg.data.data.miniShareTitle != '') {
                                that.setData({
                                  miniShareTitle: msg.data.data.miniShareTitle
                                })
                                app.globalData.miniShareTitle = res.data.data.miniShareTitle
                              }
                              if (msg.header['Set-Cookie']) {
                                wx.setStorage({
                                  key: 'sessionid',
                                  data: msg.header['Set-Cookie'],
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
                      }
                    }
                  })
                },
                fail: function() {
                  wx.hideLoading();
                }
              })
            } else {
              wx.showToast({
                title: res.data.message,
                icon: 'none',
                mask: true
              })
            }
          },
          fail: function(err) {
            wx.hideLoading();
            wx.showToast({
              title: '网络状况不佳',
              mask: true,
              icon: 'none'
            })
          }
        })
      }
    })
  },

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

  hidehb: function() {
    this.setData({
      miniBannerVO: null
    })
  },

  selectComment: function(e) {
    let that = this;
    let text = that.data.text1;
    let index = e.currentTarget.dataset.index;
    let comment = that.data.comment;
    let value = '';
    value = text[index].text;
    that.setData({
      text1: text,
      comment: comment + value
    })
  },

  getComment: function(e) {
    this.setData({
      comment: e.detail.value
    })
  },

  hideComment: function() {
    this.setData({
      showComment: false
    })
  },

  closeNav: function() {
    this.setData({
      showNav: true
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

  submitComment: function () {
    let that = this;
    if (that.data.comment == '') {
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
      filmCode: that.data.commentTipsVO.filmCode
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
          that.setData({
            showComment: false,
            score: 0,
            comment: ''
          })
        } else {
          wx.hideLoading();
        }
      }
    })
  }
})