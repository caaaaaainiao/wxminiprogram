var canOnePointMove = false
var arr = []
var key = true
var num = 0
let interval1

var onePoint = {

  x: 0,

  y: 0

}

var twoPoint = {

  x1: 0,

  y1: 0,

  x2: 0,

  y2: 0

}
//获取应用实例
const app = getApp();
const util = require('../../utils/util.js');
const md5 = require('../../utils/md5.js');
Page({

  /**
   * 页面的初始数据
   */
  data: {
    text: null,
    posLeft1: 0, // 初始距离
    pace: 1, // 滚动速度
    screenCode: null,
    featureAppNo: null,
    seats: null,
    scale: 1,
    translateX: 0,
    translateY: 0,
    date: "",
    seatNum: 0,
    seatArr: [],
    price: 0,
    totalPrice: 0, // 座位总价
    seatNumber: [],
    nowlist: null,
    activityPriceNum: 0, //参与特价个数
    activityId: 0,
    orderNum: "",
    isClick: false,
    rowNumMr: -20,
    screenName: "",
    price: '',
    seatx: 50,
    seaty: 50,
    seats: '',
    rows: '',
    rownum: [],
    isshow: false,
    marquee: 50,
    windowWidth: 0,
    maxScroll: 0
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function(options) {
    var that = this;
    wx.showLoading({
      title: '加载中',
      mask: true
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
      screenCode: options.screenCode,
      featureAppNo: options.sessionCode,
      filmName: options.movieName,
      price: options.price,
      format: options.format,
      time: options.time,
      beginTime: options.beginTime,
      endTime: options.endTime,
      screenName: options.screenName,
      location: app.globalData.cinemaList.cinemaName
    })
    let film = {
      cinemaCode: app.globalData.cinemaCode,
      screenCode: options.screenCode,
      sessionCode: options.sessionCode,
      openid: app.globalData.userInfo.openid
    }
    let filmInfo = md5.md5Sign(film);
    wx.request({
      url: app.globalData.url + '/screenseat/queryScreenSeats',
      data: filmInfo,
      method: "POST",
      header: {
        "Content-Type": "application/x-www-form-urlencoded",
        // 'cookie': wx.getStorageSync("sessionid")
      },
      success: function(res) {
        wx.hideLoading();
        if (res.data.status == 0) {
          if (res.data.data.rowList.length > 0) {
            let rows = res.data.data.rowList;
            that.setData({
              rows: res.data.data.rowList
            })
            var maxColumn = 0; // 计算最大列
            for (var i = 0; i < rows.length; i++) {
              if (rows[i]) {
                if (rows[i].seatList.length > maxColumn) {
                  maxColumn = rows[i].seatList.length
                }
              }
            }
            var scale = 650 / (maxColumn * 64 - 8);
            that.setData({
              scale: scale
            })
            that.setRowNum();
          } else {
            wx.showToast({
              title: '暂无座位',
              icon: 'none'
            });
            setTimeout(function() {
              wx.navigateBack({
                delta: 1
              })
            }, 2000)
          }
        } else if (res.data == '{code=notLogin, message=请先登录, data=null, status=1000}') {
          wx.getStorage({
            key: 'loginInfo',
            success: function(res) {
              let json = {
                openid: res.data.openid,
                cinemaCode: app.globalData.cinemaCode
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
                    wx.setStorage({
                      key: 'sessionid',
                      data: e.header['Set-Cookie']
                    })
                    wx.request({
                      url: app.globalData.url + '/screenseat/queryScreenSeats',
                      data: filmInfo,
                      method: "POST",
                      header: {
                        "Content-Type": "application/x-www-form-urlencoded",
                        // 'cookie': wx.getStorageSync("sessionid")
                      },
                      success: function(msg) {
                        if (msg.data.status == 0) {
                          if (msg.data.data.rowList.length > 0) {
                            let rows = msg.data.data.rowList;
                            that.setData({
                              rows: msg.data.data.rowList
                            })
                            var maxColumn = 0; // 计算最大列
                            for (var i = 0; i < rows.length; i++) {
                              if (rows[i]) {
                                if (rows[i].seatList.length > maxColumn) {
                                  maxColumn = rows[i].seatList.length
                                }
                              }
                            }
                            var scale = 650 / (maxColumn * 64 - 8);
                            that.setData({
                              scale: scale
                            })
                            that.setRowNum();
                          } else {
                            wx.showToast({
                              title: '暂无座位',
                              icon: 'none'
                            });
                            setTimeout(function() {
                              wx.navigateBack({
                                delta: 1
                              })
                            }, 2000)
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
          })
        } else {
          wx.showToast({
            title: res.data.message,
            icon: 'none',
            mask: true
          })
          setTimeout(function() {
            wx.navigateBack({
              delta: 1
            })
          }, 2000)
        }
      }
    })
    wx.setNavigationBarTitle({
      title: app.globalData.cinemaList.cinemaName
    });
    if (options.desc) {
      that.setData({
        text: options.desc
      })
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function() {},

  setRowNum: function() {
    var that = this;
    var seats = that.data.rows;
    var rownums = that.data.rownum;
    for (var i = 0; i < seats.length; i++) {
      if (seats[i] && seats[i].rowNum) {
        var rownum = seats[i].rowNum;
        rownums[i] = rownum;
      } else {
        rownums[i] = "";
      }
    }
    that.setData({
      rownum: rownums
    })
  },
  choose: function(e) { //选座
    var that = this;
    var oArr = []
    var rows = that.data.rows;
    var code = e.currentTarget.dataset.code;
    var seatNum = that.data.seatNum;
    var status = e.currentTarget.dataset.status;
    var checkNum = 0;
    if (canOnePointMove) {
      return;
    }
    if (status == "sell") {
      return;
    }
    for (let i = 0; i < rows.length; i++) {
      if (rows[i]) {
        for (let j = 0; j < rows[i].seatList.length; j++) {
          let k = j - 1;
          let g = j + 1;
          if (rows[i].seatList[j] != null && rows[i].seatList[j].seatCode == code) {
            if (rows[i].seatList[j].isSelect) {
              rows[i].seatList[j].isSelect = false;
              checkNum--;
              if (rows[i].seatList[j].seatType == 'L') {
                rows[i].seatList[g].isSelect = false;
                checkNum--;
              };
              if (rows[i].seatList[j].seatType == 'R') {
                rows[i].seatList[k].isSelect = false;
                checkNum--;
              }
            } else {
              if (rows[i].seatList[j].seatType == 'L') {
                rows[i].seatList[g].isSelect = true;
                checkNum++;
              };
              if (rows[i].seatList[j].seatType == 'R') {
                rows[i].seatList[k].isSelect = true;
                checkNum++;
              }
              rows[i].seatList[j].isSelect = true;
              checkNum++;
            }
          }
        }
      }
    }
    seatNum = seatNum + checkNum;
    if (seatNum > 4) {
      for (var i = 0; i < rows.length; i++) {
        if (rows[i]) {
          for (var j = 0; j < rows[i].seatList.length; j++) {
            let g = j + 1;
            let k = j - 1;
            if (rows[i].seatList[j] != null && rows[i].seatList[j].seatCode == code) {
              rows[i].seatList[j].isSelect = false;
              seatNum--;
              if (rows[i].seatList[j].seatType == "L") {
                rows[i].seatList[g].isSelect = false;
                seatNum--;
              }
              if (rows[i].seatList[j].seatType == "R") {
                rows[i].seatList[k].isSelect = false;
                seatNum--;
              }
            }
          }
        }
      }
      wx.showModal({
        title: '选座失败',
        content: '一次最多购买4张票',
      })
    }
    that.setData({
      rows: rows,
      seatNum: seatNum
    })
    that.dealseat();
    ///////////////////////
    for (let i = 0; i < rows.length; i++) { //将null座位转化成相同格式
      if (rows[i]) {
        for (let j = 0; j < rows[i].seatList.length; j++) {
          if (!rows[i].seatList[j]) {
            rows[i].seatList[j] = {
              rowNum: rows[i].rowNum,
              columnNum: '0',
              seatStatus: "null"
            }
          }
        }
      }
    }
    // console.log(rows)
    // console.log(seatNum)
    for (let k in rows) { //如果座位已选中进行判断
      if (rows[k]) {
        for (let z in rows[k].seatList) {
          if (rows[k].seatList[z].isSelect) { //判断座位被选中
            if (rows[k].seatList[z - (-1)] && rows[k].seatList[z - 1]) {
              if (rows[k].seatList[z - 1].seatStatus == "Available" && !rows[k].seatList[z - 1].isSelect && rows[k].seatList[z - (-1)].seatStatus == "Available" && rows[k].seatList[z - (-1)].isSelect) { //左1空 右1勾选 
                if (!rows[k].seatList[z - 2]) {
                  if (!rows[k].seatList[z - 2] || rows[k].seatList[z - 2].seatStatus == 'null') {
                    console.log('左1空右1勾 左2无')
                    oArr.push('2')
                    break
                  }
                }
                if (rows[k].seatList[z - (-2)] && rows[k].seatList[z - (-2)].seatStatus != 'null'){
                  if (rows[k].seatList[z - 2].seatStatus == 'Sold' || rows[k].seatList[z - 2].seatStatus == 'Locked' || rows[k].seatList[z - 2].isSelect) {
                    console.log('左1空右1勾 左2选 且右2不无')
                    oArr.push('2')
                    break
                  }
                }
                
              }
              if (rows[k].seatList[z - (-1)].seatStatus == "Available" && !rows[k].seatList[z - (-1)].isSelect && rows[k].seatList[z - 1].seatStatus == "Available" && rows[k].seatList[z - 1].isSelect) { //右1空 左1勾选 
                if (!rows[k].seatList[z - (-2)]) {
                  if (!rows[k].seatList[z - (-2)] || rows[k].seatList[z - (-2)].seatStatus == 'null') {
                    console.log('右1空左1勾 右2无')
                    oArr.push('2')
                    break
                  }
                }
                if (rows[k].seatList[z - 2] && rows[k].seatList[z - 2].seatStatus != 'null') {
                  if (rows[k].seatList[z - (-2)].seatStatus == 'Sold' || rows[k].seatList[z - (-2)].seatStatus == 'Locked' || rows[k].seatList[z - (-2)].isSelect) {
                    console.log('右1空左1勾 右2选 且左2不无')
                    oArr.push('2')
                    break
                  }
                }

              }
              if (rows[k].seatList[z - (-1)].seatStatus == "Available" && !rows[k].seatList[z - (-1)].isSelect && rows[k].seatList[z - 1].seatStatus == "Available" && !rows[k].seatList[z - 1].isSelect) { //左1 和右1都为空
                if (rows[k].seatList[z - (-2)]) {
                  if (rows[k].seatList[z - (-2)].seatStatus == 'Sold' || rows[k].seatList[z - (-2)].seatStatus == 'Locked' || rows[k].seatList[z - (-2)].isSelect) { //右2选中
                    console.log('左1右1空 右2选')
                    oArr.push('2')
                    break
                  }
                }
                if (rows[k].seatList[z - 2]) {
                  if (rows[k].seatList[z - 2].seatStatus == 'Sold' || rows[k].seatList[z - 2].seatStatus == 'Locked' || rows[k].seatList[z - 2].isSelect) { //左2选中
                    console.log('左1右1空 左2选')
                    oArr.push('2')
                    break
                  }
                }
                if (!rows[k].seatList[z - 2] || rows[k].seatList[z - 2].seatStatus == 'null') {
                  console.log('左1右1空 左2无')
                  oArr.push('2')
                  break
                }
                if (!rows[k].seatList[z - (-2)] || rows[k].seatList[z - (-2)].seatStatus == 'null') {
                  console.log('左1右1空 右2无')
                  oArr.push('2')
                  break
                }
              }
            }
            ///////////////
            // if (rows[k].seatList[z - (-2)]) {
            //   if (rows[k].seatList[z - (-2)].seatStatus == 'Sold' || rows[k].seatList[z - (-2)].seatStatus == 'Locked' ||
            //     rows[k].seatList[z - (-2)].isSelect
            //   ) { //判断已选座位右边第二个为已售 已锁座 已选择状态   
            //     if (rows[k].seatList[z - 1]) {
            //       if (!rows[k].seatList[z - 1] || rows[k].seatList[z - 1].seatStatus == 'null') { //判断已选座位左边第一个为无
            //         console.log('左1无 右2选')
            //         break
            //       }
            //     }
            //   }
            // }
            ///////////
            /////////////
            // if (rows[k].seatList[z - 2]) {
            //   if (rows[k].seatList[z - 2].seatStatus == 'Sold' || rows[k].seatList[z - 2].seatStatus == 'Locked' ||
            //     rows[k].seatList[z - 2].isSelect
            //   ) { //判断已选座位右边第二个为已售 已锁座 已选择状态    
            //     if (rows[k].seatList[z - (-1)]) {
            //       if (!rows[k].seatList[z - (-1)] || rows[k].seatList[z - (-1)].seatStatus == 'null') { //判断已选座位右边第一个为已售 已锁座 已选择状态 
            //         console.log('右1无 左2选')
            //         break
            //       }
            //     }
            //   }
            // }
            //////////////////
            /////////////////
            // if (rows[k].seatList[z - 2]) {
            //   if (rows[k].seatList[z - 2].seatStatus == 'Sold' || rows[k].seatList[z - 2].seatStatus == 'Locked' || rows[k].seatList[z - 2].isSelect) { //判断已选座位左边第二个为已售 已锁座 已选择状态
            //     if (rows[k].seatList[z - 1]) {
            //       if (rows[k].seatList[z - 1].seatStatus == 'Sold' || rows[k].seatList[z - 1].seatStatus == 'Locked' || rows[k].seatList[z - 1].isSelect) { //判断已选座位左边第一个为已售 已锁座 已选择状态
            //         console.log('左1选 左2选')
            //         break
            //       }
            //     }
            //   }
            // }
            //////////////////
            //////////////////
            // if (rows[k].seatList[z - (-2)]) {
            //   if (rows[k].seatList[z - (-2)].seatStatus == 'Sold' || rows[k].seatList[z - (-2)].seatStatus == 'Locked' || rows[k].seatList[z - (-2)].isSelect) { //判断已选座位左边第二个为已售 已锁座 已选择状态
            //     if (rows[k].seatList[z - 1]) {
            //       if (rows[k].seatList[z - 1].seatStatus == 'Sold' || rows[k].seatList[z - 1].seatStatus == 'Locked' || rows[k].seatList[z - 1].isSelect) { //判断已选座位左边第一个为已售 已锁座 已选择状态
            //         console.log('左1选 右2选')
            //         break
            //       }
            //     }
            //   }
            // }
            //////////////////
            ///////////////////
            // if (rows[k].seatList[z - 2]) {
            //   if (rows[k].seatList[z - 2].seatStatus == 'Sold' || rows[k].seatList[z - 2].seatStatus == 'Locked' || rows[k].seatList[z - 2].isSelect) { //判断已选座位左边第二个为已售 已锁座 已选择状态
            //     if (rows[k].seatList[z - (-1)]) {
            //       if (rows[k].seatList[z - (-1)].seatStatus == 'Sold' || rows[k].seatList[z - (-1)].seatStatus == 'Locked' || rows[k].seatList[z - (-1)].isSelect) { //判断已选座位左边第一个为已售 已锁座 已选择状态
            //         console.log('右1选 左2选')
            //         break
            //       }
            //     }
            //   }
            // }
            ///////////////
            ///////////////
            // if (rows[k].seatList[z - (-2)]) {
            //   if (rows[k].seatList[z - (-2)].seatStatus == 'Sold' || rows[k].seatList[z - (-2)].seatStatus == 'Locked' ||
            //     rows[k].seatList[z - (-2)].isSelect
            //   ) { //判断已选座位右边第二个为已售 已锁座 已选择状态    
            //     if (rows[k].seatList[z - (-1)]) {
            //       if (rows[k].seatList[z - (-1)].seatStatus == 'Sold' || rows[k].seatList[z - (-1)].seatStatus == 'Locked' ||
            //         rows[k].seatList[z - (-1)].isSelect) { //判断已选座位右边第一个为已售 已锁座 已选择状态 
            //         console.log('右1选 右2选')
            //         break
            //       }
            //     }
            //   }
            // }
            /////////////////
            /////////////////
            if (!rows[k].seatList[z - 1] || rows[k].seatList[z - 1].seatStatus == 'null') { //判断已选中座位前一排
              if (rows[k].seatList[z - 2]) {
                ///////////////////////////////
                // if (rows[k].seatList[z - (-2)]) {
                //   if (rows[k].seatList[z - (-2)].seatStatus == 'Sold' || rows[k].seatList[z - (-2)].seatStatus == 'Locked' ||
                //     rows[k].seatList[z - (-2)].isSelect
                //   ) { //判断已选座位右边第二个为已售 已锁座 已选择状态    
                //     if (rows[k].seatList[z - (-1)]) {
                //       if (rows[k].seatList[z - (-1)].seatStatus == "Available" && !rows[k].seatList[z - (-1)].isSelect) { //判断已选座位右边第一个为空座位
                //         console.log('右1空 右2选')
                //         oArr.push('2')
                //         break
                //       }
                //     }
                //   }
                // }
                /////////////
                //////////////
                // if (!rows[k].seatList[z - 2] || rows[k].seatList[z - 2].seatStatus == 'null') {
                //   console.log('左1空 左2空')
                //   break
                // }
                //////////////
              }
            }
            ///////////////
            ////////////////
            if (!rows[k].seatList[z - (-1)] || rows[k].seatList[z - (-1)].seatStatus == 'null') { //判断已选中座位后一排
              if (rows[k].seatList[z - (-2)]) {
                //////////////////////////
                // if (rows[k].seatList[z - 2]) {
                //   if (rows[k].seatList[z - 2].seatStatus == 'Sold' || rows[k].seatList[z - 2].seatStatus == 'Locked' || rows[k].seatList[z - 2].isSelect) { //判断已选座位左边第二个为已售 已锁座 已选择状态
                //     if (rows[k].seatList[z - 1]) {
                //       if (rows[k].seatList[z - 1].seatStatus == "Available" && !rows[k].seatList[z - 1].isSelect) { //判断已选座位左边第一个为空座位
                //         console.log('左1空 左2选')
                //         oArr.push('2')
                //         break
                //       }
                //     }
                //   }
                // }
                /////////////////
                ////////////////
                // if (!rows[k].seatList[z - (-2)] || rows[k].seatList[z - (-2)].seatStatus == 'null') {
                //   console.log('右1空 右2空')
                //   break
                // }
                //////////////////
              }
            }
            ////////////////
            ////////////////
            // if (!rows[k].seatList[z - 2] || rows[k].seatList[z - 2].seatStatus == 'null') { //判断左边第二排
            //   if (rows[k].seatList[z - 1]) {
            //     if (rows[k].seatList[z - 1].seatStatus == "Available" && !rows[k].seatList[z - 1].isSelect) { //判断已选座位左边第一个为空座位
            //       console.log('左1空 左2无')
            //       oArr.push('2')
            //       break
            //     }
            //   }
            // }
            ////////////////
            ////////////////
            // if (!rows[k].seatList[z - (-2)] || rows[k].seatList[z - (-2)].seatStatus == 'null') { //判断右边第二排
            //   if (rows[k].seatList[z - (-1)]) {
            //     if (rows[k].seatList[z - (-1)].seatStatus == "Available" && !rows[k].seatList[z - (-1)].isSelect) { //判断已选座位右边第一个为空座位
            //       console.log('右1空 右2无')
            //       oArr.push('2')
            //       break
            //     }
            //   }
            // }
            /////////////////
            //////////////////
            // if (rows[k].seatList[z - 2]) {
            //   if (rows[k].seatList[z - 2].seatStatus == 'Sold' || rows[k].seatList[z - 2].seatStatus == 'Locked' || rows[k].seatList[z - 2].isSelect) { //判断已选座位左边第二个为已售 已锁座 已选择状态
            //     if (rows[k].seatList[z - 1]) {
            //       if (rows[k].seatList[z - 1].seatStatus == "Available" && !rows[k].seatList[z - 1].isSelect) { //判断已选座位左边第一个为空座位
            //         console.log('左1空 左2选')
            //         oArr.push('2')
            //         break
            //       }
            //     }
            //   }
            // }
            /////////////
            /////////////
            // if (rows[k].seatList[z - (-2)]) {
            //   if (rows[k].seatList[z - (-2)].seatStatus == 'Sold' || rows[k].seatList[z - (-2)].seatStatus == 'Locked' ||
            //     rows[k].seatList[z - (-2)].isSelect
            //   ) { //判断已选座位右边第二个为已售 已锁座 已选择状态    
            //     if (rows[k].seatList[z - (-1)]) {
            //       if (rows[k].seatList[z - (-1)].seatStatus == "Available" && !rows[k].seatList[z - (-1)].isSelect) { //判断已选座位右边第一个为空座位
            //         console.log('右1空 右2选')
            //         oArr.push('2')
            //         break
            //       }
            //     }
            //   }
            // }
            ////////////////
            // else {
            //   console.log('9')
            //   oArr.push('0')
            // }
          }
        }
      }
    }
    console.log(oArr)
    that.setData({
      oArr: oArr
    })
    //////////////////////////
  },
  dealseat: function() {
    var that = this;
    var rows = that.data.rows;
    var seatArr = [];
    var seatNumber = [];
    for (var i = 0; i < rows.length; i++) {
      if (rows[i]) {
        for (var j = 0; j < rows[i].seatList.length; j++) {
          if (rows[i].seatList[j] != null && rows[i].seatList[j].isSelect) {
            seatArr.push([rows[i].seatList[j].rowNum + '排' + rows[i].seatList[j].columnNum + '座'])
            seatNumber.push({
              "seatCode": rows[i].seatList[j].seatCode
            })
          }
        }
      }
    }
    that.setData({
      seatArr: seatArr,
      seatNumber: seatNumber
    })
    that.setData({
      totalPrice: (seatArr.length * that.data.price).toFixed(2),
    })
  },
  sureSeat: function() {
    let that = this;
    if (that.data.seatArr.length == 0) {
      wx.showModal({
        title: '',
        content: '还没选座位哦',
      })
      return;
    }
    var oArr = that.data.oArr
    // console.log(oArr)
    for (let i in oArr) {
      if (oArr[i] == '2') {
        // wx.showToast({
        //   title: '选座不能留有空位',
        //   icon: 'none'
        // })
        that.setData({
          isshow: true
        })
        setTimeout(function() {
          that.setData({
            isshow: false
          })
        }, 2000)
        return
      }
    }
    let month = new Date().getMonth() + 1;
    let day = new Date().getDate();
    let reg = /[\u4e00-\u9fa5]/g;
    let today = that.data.time.replace(reg, "").split('-');
    let seatDTOList = [];
    let film = {
      cinemaCode: app.globalData.cinemaCode,
      sessionCode: that.data.featureAppNo,
      ticketNum: that.data.seatNum,
      seatJson: JSON.stringify(that.data.seatNumber),
      openid: app.globalData.userInfo.openid
    }
    let filmInfo = md5.md5Sign(film);
    wx.showModal({
      title: '您购买的是' + today[0] + '月' + today[1] + '日的电影',
      content: app.globalData.buyTicketHint,
      success(res) {
        if (res.cancel) {
          wx.navigateBack({
            delta: 1
          })
        } else {
          wx.showLoading({
            title: '加载中',
            mask: true
          })
          wx.request({
            url: app.globalData.url + '/ticketorder/lockSeat',
            data: filmInfo,
            method: "POST",
            header: {
              "Content-Type": "application/x-www-form-urlencoded",
              // 'cookie': wx.getStorageSync("sessionid")
            },
            success: function(res) {
              wx.hideLoading();
              if (res.data.status == 0) {
                app.globalData.ticketOrder = res.data.data
                wx.navigateTo({
                  url: '../orderForm/orderForm?filmName=' + that.data.filmName + '&&time=' + that.data.time + '&&seatArr=' + that.data.seatArr + '&&screenName=' + that.data.screenName + '&&beginTime=' + that.data.beginTime + '&&endTime=' + that.data.endTime + '&&price=' + that.data.totalPrice,
                })
              } else if (res.data == "{code=notLogin, message=请先登录, data=null, status=1000}") {
                wx.getStorage({
                  key: 'loginInfo',
                  success: function(res) {
                    let json = {
                      openid: res.data.openid,
                      cinemaCode: app.globalData.cinemaCode
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
                          wx.setStorage({
                            key: 'sessionid',
                            data: e.header['Set-Cookie']
                          })
                          wx.request({
                            url: app.globalData.url + '/ticketorder/lockSeat',
                            data: filmInfo,
                            method: "POST",
                            header: {
                              "Content-Type": "application/x-www-form-urlencoded",
                              // 'cookie': wx.getStorageSync("sessionid")
                            },
                            success: function(msg) {
                              if (msg.data.status == 0) {
                                app.globalData.ticketOrder = msg.data.data
                                wx.navigateTo({
                                  url: '../orderForm/orderForm?filmName=' + that.data.filmName + '&&time=' + that.data.time + '&&seatArr=' + that.data.seatArr + '&&screenName=' + that.data.screenName + '&&beginTime=' + that.data.beginTime + '&&endTime=' + that.data.endTime + '&&price=' + that.data.totalPrice,
                                })
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
                })
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
      }
    })
    return;
    var oArr = that.data.oArr
    for (let i in oArr) {
      if (oArr[i] == '2') {
        that.setData({
          isshow: true
        })
        setTimeout(function() {
          that.setData({
            isshow: false
          })
        }, 2000)
        return
      }
    }
  },
  // 暂时不要更换场次按钮
  // change: function() {
  //   wx.navigateBack({})
  // },
  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function() {
    let that = this;
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function() {
    clearInterval(interval1);
  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function() {
    clearInterval(interval1);
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
  // // 缩放，平移
  touchstart: function(e) {

    var that = this

    if (e.touches.length < 2) {

      canOnePointMove = true

      onePoint.x = e.touches[0].pageX * 2

      onePoint.y = e.touches[0].pageY * 2

    } else {

      twoPoint.x1 = e.touches[0].pageX * 2

      twoPoint.y1 = e.touches[0].pageY * 2

      twoPoint.x2 = e.touches[1].pageX * 2

      twoPoint.y2 = e.touches[1].pageY * 2

    }

  },
  touchmove: function(e) {

    var that = this

    if (e.touches.length < 2 && canOnePointMove) {

      var onePointDiffX = (e.touches[0].pageX * 2 - onePoint.x) / 2

      var onePointDiffY = (e.touches[0].pageY * 2 - onePoint.y) / 2

      that.setData({

        translateX: onePointDiffX + that.data.translateX,

        translateY: onePointDiffY + that.data.translateY

      })

      onePoint.x = e.touches[0].pageX * 2

      onePoint.y = e.touches[0].pageY * 2



    } else if (e.touches.length > 1) {

      var preTwoPoint = JSON.parse(JSON.stringify(twoPoint))

      twoPoint.x1 = e.touches[0].pageX * 2

      twoPoint.y1 = e.touches[0].pageY * 2

      twoPoint.x2 = e.touches[1].pageX * 2

      twoPoint.y2 = e.touches[1].pageY * 2

      // 计算角度，旋转(优先)

      // var perAngle = Math.atan((preTwoPoint.y1 - preTwoPoint.y2) / (preTwoPoint.x1 - preTwoPoint.x2)) * 180 / Math.PI

      // var curAngle = Math.atan((twoPoint.y1 - twoPoint.y2) / (twoPoint.x1 - twoPoint.x2)) * 180 / Math.PI

      // if (Math.abs(perAngle - curAngle) > 1) {

      //   // that.setData({

      //   //   msg: '旋转',

      //   //   rotate: that.data.rotate + (curAngle - perAngle)

      //   // })

      // } else {

      // 计算距离，缩放

      var preDistance = Math.sqrt(Math.pow((preTwoPoint.x1 - preTwoPoint.x2), 2) + Math.pow((preTwoPoint.y1 - preTwoPoint.y2), 2))

      var curDistance = Math.sqrt(Math.pow((twoPoint.x1 - twoPoint.x2), 2) + Math.pow((twoPoint.y1 - twoPoint.y2), 2))
      var scaleNum = that.data.scale + (curDistance - preDistance) * 0.005;
      if (scaleNum < 0.3) {
        scaleNum = 0.3
      }
      that.setData({

        // msg: '缩放',

        scale: scaleNum

      })

      // }

    }
    // that.checkLeft();
  },

  touchend: function(e) {

    var that = this

    canOnePointMove = false

  },
})