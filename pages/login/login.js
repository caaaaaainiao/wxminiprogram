// pages/login/login.js
const app = getApp()
const util = require('../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    userInfo: null,
    inputPhone: "",
    inputYzm: "",
    yzmText: "获取验证码",
    yzmTime: "60",
    image: null,
    modalHidden: true,
    isshow: false,
    iskey: true,
    canIUse: wx.canIUse('button.open-type.getUserInfo'),
    getInfo: 0,
    index: 0,
    dianji: false,
    show: true,
    text: '请选择注册影院',
    nowCity: [{
      name: "",
      show: ""
    }],
    canGetInfo: 1,
    canGetMobile: 1,
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
          userInfo: res.data
        })
      },
    })
    wx.getStorage({
      key: 'shareInfo',
      success: function(res) {
        that.setData({
          shareInfo: res.data
        })
      },
    })
    wx.getStorage({
      key: 'employeeCode',
      success: function(res) {
        let str = res.data;
        let code = str.indexOf("=");
        if (code != -1) {
          that.setData({
            employeeCode: str.substring(code + 1)
          })
        } else {
          that.setData({
            employeeCode: res.data
          })
        }
      },
    })
    if (!app.globalData.cinemaCode) {
      wx.showModal({
        title: '影院获取失败',
        content: '',
        success: function(res) {
          wx.reLaunch({
            url: '../index/index',
          })
        }
      })
    }
    wx.login({
      success: function(res) {
        that.setData({
          code: res.code
        })
      }
    })
    that.setData({
      cinemaCode: app.globalData.cinemaCode,
      logo: app.globalData.logo
    })
    wx.setNavigationBarTitle({
      title: '用户注册'
    });
    // 声明一个新数组 将市区添加到新数组内
    var arr = [];
    for (let i = 0; i < app.globalData.areaList.length; i++) {
      arr.push(app.globalData.areaList[i].city);
    };
    // 去除重复省市显示返回新数组newArr
    var newArr = arr.filter(function(element, index, self) {
      return self.indexOf(element) == index;
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
    that.setData({
      allCinemas: app.globalData.areaList,
    })
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

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
  /**
   * 显示弹窗
   */
  buttonTap: function() {
    this.setData({
      modalHidden: false
    })
  },

  /**
   * 点击取消
   */
  modalCandel: function() {
    this.setData({
      modalHidden: true
    })
    wx.switchTab({
      url: '../index/index',
    })
  },

  /**
   *  点击确认
   */
  modalConfirm: function() {
    // do something
    this.setData({
      modalHidden: true
    })
    wx.redirectTo({
      url: '../mycoupon/mycoupon?cinemacode=' + this.data.currentCode,
    })
  },

  // 选择城市
  chooseCity: function(e) {
    var that = this;
    var crCity = e.currentTarget.dataset.name;
    that.setData({
      currentCity: crCity
    });
    // 获取存入缓存的数据开始渲染
    var show = [];
    for (let i = 0; i < app.globalData.areaList.length; i++) {
      if (crCity === app.globalData.areaList[i].city) {
        show.push(app.globalData.areaList[i]);
      }
    }
    // 清空列表
    that.setData({
      allCinemas: []
    })
    for (let j = 0; j < show.length; j++) {
      let name = "allCinemas[" + j + "].cinemaName";
      let address = "allCinemas[" + j + "].address";
      let distance = "allCinemas[" + j + "].distance";
      let cinemaCode = "allCinemas[" + j + "].cinemaCode";
      let isSnackDistribution = "allCinemas[" + j + "].isSnackDistribution";
      that.setData({
        [name]: show[j].cinemaName,
        [address]: show[j].address,
        [distance]: show[j].distance,
        [cinemaCode]: show[j].cinemaCode,
        [isSnackDistribution]: show[j].isSnackDistribution,
      })
    };
  },

  // 选择影院
  chooseCinema: function(e) { //选择影院
    var that = this;
    var cinemacode = e.currentTarget.dataset.cinemacode;
    that.setData({
      cinemaCode: cinemacode,
      currentCode: cinemacode,
    })
  },

  // 获取用户信息
  authLogin: function(e) { //获取用户信息
    var that = this;
    if (that.data.canGetInfo == 1) {
      that.setData({
        canGetInfo: 2
      })
      let wxCode = that.data.code
      if (e.detail.errMsg == "getUserInfo:fail auth deny") {
        wx.reLaunch({
          url: '../index/index',
        })
      } else if (e.detail.errMsg == "getUserInfo:ok") {
        that.setData({
          userInfoDetail: e.detail
        });
        wx.setStorage({
          key: 'accredit',
          data: {
            "userInfo": e.detail.userInfo,
            "userInfoDetail": e.detail
          },
          success: function() {
            wx.checkSession({
              success(res) { // 未过期
                // return;
                that.wxLogin();
              },
              fail(err) { // 登录过期
                let encryptedData = e.detail.encryptedData;
                let iv = e.detail.iv;
                let json = {
                  code: wxCode,
                  encryptedData: encryptedData,
                  iv: iv,
                  cinemaCode: that.data.cinemaCode
                };
                let obj1 = util.md5Sign(json);
                wx.request({
                  url: app.globalData.url + '/user/miniLogin',
                  data: obj1,
                  method: "POST",
                  header: {
                    "Content-Type": "application/x-www-form-urlencoded"
                  },
                  success: function(e) {
                    if (e.data.status == 0) {
                      wx.setStorage({
                        key: 'loginInfo',
                        data: e.data.data,
                      })
                      wx.setStorage({
                        key: 'sessionid',
                        data: e.header['Set-Cookie'],
                      })
                      app.globalData.openId = e.data.data.openid;
                      if (e.data.data.memberType == 2) { // 1为未注册 2为已注册
                        wx.setStorage({
                          key: 'loginInfo',
                          data: e.data.data,
                        })
                        app.globalData.userInfo = e.data.data;
                        wx.switchTab({
                          url: '../index/index',
                        })
                      } else { // 显示手机号注册
                        that.setData({
                          getInfo: 1,
                          iskey: false,
                          canGetInfo: 1
                        })
                      }
                    } else {
                      wx.showToast({
                        title: '授权失败，请退出重新授权',
                        icon: 'none',
                        duration: 2000,
                      })
                      that.setData({
                        getInfo: 0,
                        canGetInfo: 1
                      })
                    }
                  },
                  fail: function(e) {
                    wx.showToast({
                      title: '授权失败，请退出重新授权',
                      icon: 'none',
                      duration: 2000,
                    })
                    that.setData({
                      getInfo: 0,
                      canGetInfo: 1
                    })
                  }
                })
              }
            })
          }
        })
      } else {
        wx.showModal({
          title: e.detail.errMsg
        })
      }
    } else {
      return
    }
  },

  // 获取手机号
  getPhoneNumber: function(e) { //获取用户信息
    var that = this;
    if (that.data.canGetMobile == 1) {
      that.setData({
        canGetMobile: 2
      })
      if (!that.data.currentCode) {
        wx.showModal({
          title: '请点击选择影院',
          showCancel: false,
        })
        that.setData({
          canGetMobile: 1
        })
      } else {
        if (e.detail.errMsg == "getPhoneNumber:fail user deny") { // 拒绝
          wx.showToast({
            title: '请先授权',
            icon: "loading",
            duration: 2000
          })
          that.setData({
            canGetMobile: 1
          })
        } else if (e.detail.errMsg == "getPhoneNumber:ok") { // 允许
          that.setData({
            userInfoDetail: e.detail
          })
          that.wxGetPhoneNumber(e.detail);
        } else { // 报错
          wx.showModal({
            title: e.detail.errMsg
          })
          that.setData({
            canGetMobile: 1
          })
        }
      }
    } else {
      return
    }
  },

  // 用户输入手机号注册
  otherPhoneNumber: function() {
    let that = this;
    if (!that.data.currentCode) {
      wx.showToast({
        title: '请选择影院！',
        mask: true,
        icon: 'none'
      })
      return
    } else {
      wx.navigateTo({
        url: '../phoneYZM/phoneYZM?cinemaCode=' + that.data.currentCode,
      })
    }
  },

  wxLogin: function() { // 获取用户信息
    var that = this;
    wx.showLoading({
      title: '正在授权',
      mask: true
    });
    if (that.data.code) {
      wx.getStorage({
        key: 'loginInfo',
        success: function(res) {
          let json = {
            code: that.data.code,
            cinemaCode: that.data.cinemaCode
          };
          let obj1 = util.md5Sign(json);
          wx.request({
            url: app.globalData.url + '/user/miniLogin',
            data: obj1,
            method: "POST",
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            success(e) {
              wx.hideLoading();
              if (e.data.status == 0) {
                let newArr = [];
                let localObj = {};
                for (let i in e.data.data) {
                  let newObj = {};
                  newObj[i] = e.data.data[i]
                  newArr.push(newObj)
                }
                for (let i in newArr) {
                  for (let key in newArr[i]) {
                    if (newArr[i][key] != null) {
                      localObj = Object.assign(res.data, newArr[i])
                    }
                  }
                }
                wx.setStorage({
                  key: 'loginInfo',
                  data: localObj,
                })
                if (e.data.data.memberType == 2) {
                  wx.reLaunch({
                    url: '../index/index',
                  })
                } else {
                  that.setData({
                    getInfo: 1,
                    iskey: false,
                  })
                }
              } else {
                wx.showToast({
                  title: e.data.message,
                  icon: "none"
                })
              }
            }
          })
        },
        // 缓存为空
        fail: function(res) {
          wx.hideLoading();
          let encryptedData = that.data.userInfoDetail.encryptedData;
          let iv = that.data.userInfoDetail.iv;
          let json = {
            code: that.data.code,
            encryptedData: encryptedData,
            iv: iv,
            cinemaCode: that.data.cinemaCode
          };
          let obj1 = util.md5Sign(json);
          wx.request({
            url: app.globalData.url + '/user/miniLogin',
            data: obj1,
            method: "POST",
            header: {
              "Content-Type": "application/x-www-form-urlencoded"
            },
            success: function(e) {
              //个人信息
              if (e.data.status == 0) {
                wx.setStorage({
                  key: 'loginInfo',
                  data: e.data.data,
                })
                wx.setStorage({
                  key: 'sessionid',
                  data: e.header['Set-Cookie'],
                })
                app.globalData.openId = e.data.data.openid;
                if (e.data.data.memberType == 2) { // 1为未注册 2为已注册
                  wx.setStorage({
                    key: 'loginInfo',
                    data: e.data.data,
                  })
                  app.globalData.userInfo = e.data.data;
                  wx.switchTab({
                    url: '../index/index',
                  })
                } else {
                  that.setData({
                    getInfo: 1,
                    iskey: false,
                    canGetInfo: 1
                  })
                }
              } else {
                wx.showModal({
                  title: '授权失败',
                  content: '请返回首页重新进入授权'
                })
                wx.clearStorage();
                that.setData({
                  getInfo: 0,
                  canGetInfo: 1
                })
              }
            },
            fail: function(err) {
              wx.showModal({
                title: '授权失败',
                content: '请返回首页重新进入授权'
              })
              wx.clearStorage();
              that.setData({
                getInfo: 0,
                canGetInfo: 1
              })
            }
          })
        }
      })
    } else {
      wx.hideLoading();
      that.setData({
        canGetInfo: 1
      })
      wx.showToast({
        title: '授权失败请重新授权',
        icon: 'none',
        mask: true
      });
    }
  },

  wxGetPhoneNumber: function(data) { // 获取用户手机号
    var that = this;
    wx.checkSession({
      success() {
        let encryptedData = data.encryptedData;
        let iv = data.iv;
        wx.getStorage({
          key: 'loginInfo',
          success: function(res) {
            let info = res.data;
            let shareUserMobile = '';
            let employeeCode = '';
            if (that.data.shareInfo) {
              shareUserMobile = that.data.shareInfo.shareUserMobile
            }
            if (that.data.employeeCode) {
              employeeCode = that.data.employeeCode
            }
            let json = {
              encryptedData: encryptedData,
              iv: iv,
              cinemaCode: that.data.currentCode,
              sKey: info.sKey,
              openid: info.openid,
              birthday: info.birthday,
              city: info.city,
              country: info.country,
              province: info.province,
              userHeadPic: info.userHeadPic,
              userMobile: info.userMobile,
              userName: info.userName,
              userSex: info.userSex,
              shareUserMobile: shareUserMobile,
              employeeCode: employeeCode
            }
            let obj1 = util.md5Sign(json)
            wx.request({
              url: app.globalData.url + '/user/miniWXRegister',
              data: obj1,
              method: "POST",
              header: {
                "Content-Type": "application/x-www-form-urlencoded",
                // 'cookie': wx.getStorageSync("sessionid")
              },
              success(e) {
                if (e.data.status == 0) {
                  wx.setStorage({
                    key: 'loginInfo',
                    data: e.data.data,
                  })
                  app.globalData.userInfo = e.data.data;
                  if (e.data.data.registerDialog && e.data.data.registerDialog != '') {
                    that.setData({
                      image: e.data.data.registerDialog,
                      modalHidden: false
                    })
                  } else {
                    wx.switchTab({
                      url: '../index/index',
                    })
                  }
                } else {
                  wx.showModal({
                    title: '授权失败',
                    content: '请返回首页重新进入授权或输入手机号注册'
                  })
                  wx.clearStorage();
                  that.setData({
                    getInfo: 0,
                    canGetMobile: 1
                  })
                }
              }
            })
          },
        })
      },
      fail(err) {
        wx.showModal({
          title: '授权超时，请重新授权',
        })
        wx.clearStorage();
        that.setData({
          getInfo: 0,
          canGetMobile: 1
        })
      }
    })
  }
})