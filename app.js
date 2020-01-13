var utilMd5 = require('utils/md5.js');
App({


  onLaunch: function() {
    this.autoUpdate()
  },


  onShow: function(options) {
    //  console.log("show")
  },


  onHide: function() {
    // console.log("hide")
  },

  autoUpdate: function () {
    console.log(new Date())
    var self = this
    // 获取小程序更新机制兼容
    if (wx.canIUse('getUpdateManager')) {
      const updateManager = wx.getUpdateManager()
      //1. 检查小程序是否有新版本发布
      updateManager.onCheckForUpdate(function (res) {
        // 请求完新版本信息的回调
        if (res.hasUpdate) {
          //2. 小程序有新版本，则静默下载新版本，做好更新准备
          updateManager.onUpdateReady(function () {
            console.log(new Date())
            wx.showModal({
              title: '更新提示',
              content: '新版本已经准备好，是否重启应用？',
              showCancel: false,
              success: function (res) {
                if (res.confirm) {
                  //3. 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                  updateManager.applyUpdate()
                }
              }
            })
          })
          updateManager.onUpdateFailed(function () {
            // 新的版本下载失败
            wx.showModal({
              title: '已经有新版本了',
              content: '新版本已经上线，请您删除当前小程序，重新搜索打开',
            })
          })
        }
      })
    } else {
      // 如果希望用户在最新版本的客户端上体验您的小程序，可以这样子提示
      wx.showModal({
        title: '提示',
        content: '当前微信版本过低，无法使用该功能，请升级到最新微信版本后重试。'
      })
    }
  },


  onError: function(msg) {
    // console.log("error")
  },
  usermessage: {
    // AppId: 'wxab0c444c7c9cae2c',
    // secret: '1909d4d557027514094f3662f14ee4ec',
    AppId: 'wxff8cfccdf6734c60', // 万画筒
    secret: '581bb7d485228b8e7723cf7a9a624ed6', // 万画筒
    access_token: ''
  },
  globalData: {
    firstcode: null,
    moviearea: '',
    userInfo: null,
    openId: null,
    phone: null,
    cinemaList: null,
    cinemaNo: 0,
    movieList: null,
    movieId: null,
    movieIndex: null,
    screenPlanList: null,
    url: "https://test.legendpicture.com/mini",
    // url: "https://wonder.legendpicture.com/mini",
    
    // kai
    // url: "http://192.168.31.124:8080",
    // zhuang
    // url: "http://192.168.101.12:8080",
    // gong
    // url: "http://192.168.1.122:8080",
    // zhou
    // url: "http://192.168.31.222:8088",
    // gang
    // url: "http://192.168.101.11:8080",
    SocketUrl: "",
    goodsList: null,
    type2address: "",
    sellfeatureAppNo: "",
    seatOrder: null,
    movieRoom: null,
    roomNum: 0,
    acivityUrl: "",
    cardList: null,
    card: null,
    sellMovielist: null,
    seat: null,
    moviesListDate: null,
    offerDescription: null,
    ticketCoupons: null,
    goodsOrder: null,
  },
  createMD5: function(apiname, nowtime) {
    var sign = utilMd5.hexMD5("HLBW2018SHAPPLET" + apiname + "SH076WZ80D98X5G2" + nowtime);
    return sign;
  },

})