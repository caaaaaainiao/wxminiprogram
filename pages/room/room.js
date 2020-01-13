// pages/room/room.js

//获取应用实例
const app = getApp();
var relineTime = 1;
var index = 0;
const util = require('../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    height: 324,
    screenText: [],
    movie: null,
    cinema: "",
    userInfo: null,
    text: "",
    gifts: null,
    showGifts: false,
    showGift: false,
    prizeId: "",
    giftNum: 0,
    showPrize: false,
    prizeList: null,
    showGift2: false,
    endTime: "00:00",
    leftTime: "0",
    content: "",
    unload: false,
    timer: '',
    heartJson: {
      messageType: "5",
      header: '',
      nickName: '',
      messageContent: '',
      prizeId: ""
    }
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    let that = this;
    that.setData({
      roomName: options.roomname,
      endTimestamp: options.endTimestamp,
      filmName: options.filmName,
      screenName: options.screenName,
      filmPoster: options.filmPoster
    })
    this.getGifts();
    this.leftTime();

    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        that.setData({
          userInfo: res.data,
        })
        let miniUserInfo = {
          openid: res.data.openid,
          cinemaCode: app.globalData.cinemaCode,
          mobile: res.data.userMobile
        }
        let userInfo = util.md5Sign(miniUserInfo);
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
              that.setData({
                role: msg.data.data.userRole
              })
              var SocketUrl = app.globalData.SocketUrl;
              var url = SocketUrl + '/socket/chat/' + msg.data.data.userRole + '/' + that.data.roomName + '/' + res.data.userMobile;
              wx.connectSocket({ //建立连接
                url: url,
                header: {
                  'content-type': 'application/json',
                  'Authorization': null
                },
                // protocols: ['TCP'],
                method: "GET",
                success: function (res) {
                  // console.log("ok")
                },
                fail: function (res) {
                  wx.showModal({
                    title: '聊天室连接失败',
                    content: '',
                    success: function (res) {
                      wx.navigateBack()
                    }
                  })
                }
              })
              if (msg.header['Set-Cookie']) {
                wx.setStorage({
                  key: 'sessionid',
                  data: msg.header['Set-Cookie'],
                })
              }
            }
          }
        })
      },
      fail: function(res) {
        console.log(res)
      }
    })
    this.heart();
    var windowHeight = wx.getSystemInfoSync().windowHeight;
    var contentHeight = windowHeight - 279;
    this.setData({
      height: contentHeight,
      movie: app.globalData.movieRoom,
      cinema: app.globalData.cinemaList.cinemaName,
    })


    wx.onSocketOpen(function() {
      console.log("已连接")
    })
    wx.onSocketClose(function() {
      console.log("close")
      if (!that.data.unload) {
        that.reline();
      }
    })
    wx.onSocketError(function(res) {
      // console.log("连接已断开")
      console.log(res)
      wx.showModal({
        title: '聊天室连接错误',
        content: '聊天室连接出现错误，请退出重进',
        success: function(res) {
          wx.navigateBack()
        },
      })
    })

    // 接受发言的消息
    wx.onSocketMessage(function(res) {
      var message = JSON.parse(res.data)
      if (message.messageType == 1) { //发言消息
        var screen = that.data.screenText;
        var rowNum = parseInt(screen.length * Math.random());
        var id = index++;
        // console.log(id)
        var row = {};
        row.text = message.content;
        row.id = id;
        row.img = message.header;
        row.roll = message.role;
        row.time = 0.5;
        if (message.phoneOrOpenid == that.data.userInfo.mobilePhone) {
          row.self = true
        }
        if (screen[rowNum].words.length > 0) {
          rowNum = parseInt(screen.length * Math.random());
          row.time = 1;
        }
        screen[rowNum].words.push(row);
        that.setData({
          screenText: screen
        })
        setTimeout(function() {
          var screen2 = that.data.screenText;
          for (var i = 0; i < screen2.length; i++) {
            for (var j = 0; j < screen2[i].words.length; j++) {
              if (screen2[i].words[j].id == id) {
                screen2[i].words.splice(screen2[i].words[j], 1)
              }
            }
          }
          that.setData({
            screenText: screen2
          })
        }, 12000)
      } else if (message.messageType == 2) { //管理员发送红包
        var id = message.prizeId;
        var content = message.content;
        var giftNum = 0;
        let index = id.indexOf("_");
        let str = id.slice(0,index);
        for (var i = 0; i < that.data.gifts.length; i++) {
          if (that.data.gifts[i].id == str) {
            giftNum = that.data.gifts[i].singleNumber
          }
        }
        that.setData({
          showGift: true,
          showGift2: true,
          content: content,
          prizeId: message.prizeId,
          giftNum: giftNum
        })
      } else if (message.messageType == 22) { //实时奖品数量变化
        console.log(message)
        that.setData({
          giftNum: message.content
        })
      } else if (message.messageType == 3) { //奖品已领取
        that.setData({
          showGift: false
        })
        wx.showToast({
          title: '领取成功',
        })
      } else if (message.messageType == -3) { //奖品领完了
        wx.showModal({
          title: '奖品已领完',
          content: '',
          showCancel: false,
        })
        that.setData({
          showGift: false,
          showGift2: false,
        })
      } else if (message.messageType == -2) { //房间结束
        wx.showToast({
          title: '房间已关闭',
          icon: "loading",
          duration: 2000
        })
        setTimeout(function() {
          wx.switchTab({
            url: '../movie/movie',
          })
        }, 2000)
      } else if (message.messageType == -1) { //房间未开启
        wx.showToast({
          title: '房间未开启',
          icon: "loading",
          duration: 2000
        })
        setTimeout(function() {
          wx.switchTab({
            url: '../movie/movie',
          })
        }, 2000)
      } else if (message.messageType == 0) { //其他地方登陆
        wx.showModal({
          title: '',
          content: '当前账号在其他地方进入了该聊天室',
          success(res) {
            if (res.confirm) {
              wx.switchTab({
                url: '../movie/movie',
              })
            }
          }
        })
      } else if (message.messageType == -12) {
        console.log(message)
        wx.showModal({
          title: '发送失败',
          content: '奖品库存不足',
        })
      } else if (message.messageType == -11) {
        console.log(message)
        wx.showModal({
          title: '发送失败',
          content: '该房间达到发送上限',
        })
      }
    })

    // that.getTime();
    wx.setNavigationBarTitle({
      title: app.globalData.cinemaList.cinemaName
    });
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {
    var that = this;
    that.setAisle();

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    // wx.setNavigationBarTitle({
    //   title: app.globalData.cinemaList.cinemaName
    // });
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
    clearInterval(this.data.timer)
    clearInterval(this.data.heartTime)
    this.setData({
      unload: true
    })
    wx.closeSocket()
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
  setAisle: function() {
    var that = this;
    var ch = that.data.height;
    var screen = that.data.screenText;
    var aisleNum = parseInt((ch - 15) / 50);
    for (var i = 0; i < aisleNum; i++) {
      var row = {};
      row.words = [];
      screen.push(row);
    }
    that.setData({
      screenText: screen
    })
    // console.log(screen)
  },

  // 发送信息
  send: function() { //文字信息
    var that = this;
    if (that.data.text == "") {
      wx.showModal({
        title: '发送失败',
        content: '信息不能为空',
      })
      return;
    }
    var json = {
      messageType: "1",
      header: that.data.userInfo.userHeadPic,
      nickName: that.data.userInfo.userName,
      messageContent: that.data.text,
      prizeId: ""
    };
    // console.log(json)
    wx.sendSocketMessage({
      data: JSON.stringify(json),
      success: function(res) {
        // console.log(res)
        that.setData({
          text: ""
        })
      },
      fail: function() {
        wx.showModal({
          title: '发送失败',
          content: '信息发送失败',
          success: function(res) {
            // wx.navigateBack()
          }
        })
      }

    })
    return;
  },
  setText: function(e) {
    var text = e.detail.value;
    this.setData({
      text: text
    })
  },
  getGifts: function() {
    var that = this;
    var nowtime = new Date().getTime();
    var pageNo = that.data.pageNo;
    let json = {
      openid: app.globalData.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode
    };
    let obj1 = util.md5Sign(json);
    wx.request({
      url: app.globalData.url + '/chatroom/getRoomGift',
      data: obj1,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      success: function(res) {
        if (res.data.status == 0) {
          that.setData({
            gifts: res.data.data
          })
        }
      }
    })
  },
  sendgifts: function() {
    this.getGifts();
    this.setData({
      showGifts: true
    })
  },
  close: function() {
    this.setData({
      showGifts: false
    })
  },
  sendGift: function(e) { //发放
    var that = this;
    wx.showModal({
      title: '提示',
      content: '是否确认发放',
      success: function (res) {
        if (res.confirm) {
          var index = e.currentTarget.dataset.index;
          var id = e.currentTarget.dataset.id;
          var content = e.currentTarget.dataset.type;
          var prizeId = id;
          var json = {
            messageType: "2",
            header: that.data.userInfo.userHeadPic,
            nickName: that.data.userInfo.userName,
            messageContent: content.toString(),
            prizeId: prizeId,
          };
          wx.sendSocketMessage({
            data: JSON.stringify(json),
            success: function (res) {
              console.log(res)
              that.setData({
                showGifts: false
              })
            },
            fail: function () {
              wx.showModal({
                title: '发送失败',
                content: '红包发送失败',
              })
            }
          })
        }
      }
    })
    //////////////////////////////////////////////////////
    // if (that.data.gifts.gift[index].remaingroupNumber == 0) {
    //   wx.showToast({
    //     title: '房间发放上限',
    //   })
    // } else {
    //   wx.showModal({
    //     title: '提示',
    //     content: '是否确认发放',
    //     success: function(res) {
    //       if (res.confirm) {
    //         var id = e.currentTarget.dataset.id;
    //         var content = e.currentTarget.dataset.type;
    //         var nowtime = new Date().getTime();
    //         var prizeId = id + "_" + nowtime;
    //         console.log(e)
    //         var json = {
    //           messageType: "2",
    //           header: that.data.userInfo.userHeadPic,
    //           nickName: that.data.userInfo.userName,
    //           messageContent: content.toString(),
    //           prizeId: prizeId,
    //         };
    //         wx.sendSocketMessage({
    //           data: JSON.stringify(json),
    //           success: function(res) {
    //             that.setData({
    //               showGifts: false
    //             })
    //           },
    //           fail: function() {
    //             wx.showModal({
    //               title: '发送失败',
    //               content: '红包发送失败',
    //             })
    //           }

    //         })
    //       }
    //     }
    //   })
    // }
  },
  tapRed: function() { //领取红包
    var that = this;
    var json = {
      messageType: "21",
      header: that.data.userInfo.userHeadPic,
      nickName: that.data.userInfo.userName,
      messageContent: that.data.content,
      prizeId: that.data.prizeId
    };
    that.setData({
      showGift: false
    })
    if (that.data.role == 2) {
      wx.showModal({
        title: '抢包失败',
        content: '管理员不可以抢红包哦',
      })
    } else {
      console.log(json)
      wx.sendSocketMessage({
        data: JSON.stringify(json),
        success: function(res) {
          console.log(res)
          console.log('领取了')
        },
        fail: function() {
          wx.showModal({
            title: '抢包失败',
            content: '领取红包失败，连接断开'
          })
        }
      })
    }
  },
  closeGift: function() {
    this.setData({
      showGift: false
    })
  },

  // 发送心跳检测是否连接
  heart: function() {
    let that = this;
    that.setData({
      heartTime: setInterval(function() {
        wx.sendSocketMessage({
          data: JSON.stringify(that.data.heartJson),
          success: function(res) {
            // console.log('心跳')
          },
          fail: function() {
            that.reline()
          }
        })
      }, 10000)
    })
  },
  // 查看我的礼品
  getPrize: function() {
    var that = this;
    let json = {
      roomName: that.data.roomName,
      openid: app.globalData.userInfo.openid,
      cinemaCode: app.globalData.cinemaCode
    };
    let obj1 = util.md5Sign(json);
    wx.request({
      url: app.globalData.url + '/chatroom/getMyRoomGit',
      method: 'POST',
      data: obj1,
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      success: function(res) {
        console.log(res)
        if (res.data.status == 0) {
          var prizeList = res.data.data
          that.setData({
            showPrize: true,
            prizeList: prizeList
          })
        }
      }
    })
  },
  closePrzie: function() {
    this.setData({
      showPrize: false
    })
  },
  　
  leftTime: function() { //计时器
    var that = this;
    let newTime = that.data.endTimestamp - new Date().getTime();
    that.setData({
      timer: setInterval(function() {
        var str = "";
        var minute = parseInt(newTime / 1000 / 60)
        var second = parseInt(newTime / 1000 % 60)
        newTime -= 1000;
        // if (minute > 61) {
        //   clearInterval(that.data.timer)
        //   wx.showToast({
        //     title: '房间未开启',
        //     icon: "loading",
        //     duration: 300,
        //   })
        //   setTimeout(function() {
        //     wx.switchTab({
        //       url: '../movie/movie',
        //     })
        //   }, 400)
        //   return;
        // }
        if (minute < 0) {
          clearInterval(that.data.timer)
          wx.showToast({
            title: '房间已关闭',
            icon: "loading",
            duration: 300,
          })
          setTimeout(function() {
            wx.switchTab({
              url: '../movie/movie',
            })
          }, 400)
          return;
        }
        if (minute < 10) {
          minute = "0" + minute;
        }
        if (second < 10) {
          second = "0" + second;
        }
        str = minute + ":" + second;

        that.setData({
          endTime: str
        })
        // console.log(str)
      }, 1000)
    })
  },

  reline: function() {
    var that = this;
    wx.showLoading({
      title: '重新连接第' + relineTime + '次',
    })
    if (relineTime > 10) {
      wx.showModal({
        title: '重连失败',
        content: '聊天室连接已断开，请退出重进',
        success: function(res) {
          wx.navigateBack()
        }
      })
      return;
    }
    wx.getStorage({
      key: 'loginInfo',
      success: function(res) {
        let miniUserInfo = {
          openid: res.data.openid,
          cinemaCode: app.globalData.cinemaCode,
          mobile: res.data.userMobile
        }
        let userInfo = util.md5Sign(miniUserInfo);
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
              that.setData({
                role: msg.data.data.userRole
              })
              var SocketUrl = app.globalData.SocketUrl
              wx.connectSocket({ //建立连接
                url: SocketUrl + '/socket/chat/' + msg.data.data.userRole + '/' + that.data.roomName + '/' + res.data.userMobile,
                data: {},
                header: {
                  'content-type': 'application/json',
                  'Authorization': null
                },
                method: "GET",
                success: function (res) {
                  wx.hideLoading();
                },
                fail: function (res) {
                  wx.hideLoading();
                  relineTime++;
                  that.reline();
                }
              })
              if (msg.header['Set-Cookie']) {
                wx.setStorage({
                  key: 'sessionid',
                  data: msg.header['Set-Cookie'],
                })
              }
            }
          }
        })
      },
    })

  }
})