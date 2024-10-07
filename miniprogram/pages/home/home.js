import Toast from '@vant/weapp/toast/toast';

let app = getApp();
const db = wx.cloud.database()
const timeCollection = db.collection('time_Order')
const visistorCollection =db.collection('custom_list')
let yyr = ""
let lxfs = ""
let lfr = ""
let yyrs = ""
let cgrq = null
let judge = null
let unionid = null
let openid =null
Page({
  data: {
    checked:false,
    array: [],
    selected:[],
    show: false,
    calendar:false,
    acknowledge: ["1、本馆开放时间： 周三、周五14点-17点；周六8点-12点、14点-17点。", "2、在开放时间参观，不收取任何费用。非开放时间参观只接待学校公务接待，其他类型参观须提前协商并额外支付工作人员费用（10人以下，100元/次；10人-20人，200元/次；20人-30人，300元/次）。",
      "3、参观时请勿触摸展品或设备设施，不要损坏公物；如有损毁，须照价赔偿并承担相应的法律责任。",
      "4、在参观期间，安全责任由参观个人或团队自行承担。",
      "5、请至少提前 1天 预约参观，因参观团队数量较多超过30人，请安排分批参观。请准时参观，若参观时间有变，请及时联系管理人员崔瑶或取消参观。",
      "6、非洲博物馆、中非交流博物馆暂不提供非普通话讲解。",
      "7、未尽事宜，请联系博物馆管理员崔瑶，联系方式：18958490058。"
    ],
    notice:"欢迎参观浙江师范大学非洲博物馆、中非交流博物馆",
    date:"",
    now_date:"",
    endDate: "",
    previousDate: "",
    maxDate: "",
    minDate: "",
    week:""
  },
  tabShow() {
    this.setData({
      show: true,
    })

  },
  tabClose() {
    this.setData({
      show: false
    })
  },
  getDate() {
    var date = new Date();
    var y = date.getFullYear();
    var m = (date.getMonth() + 1).toString().padStart(2, '0');
    var d = date.getDate().toString().padStart(2, '0');
    var w = date.getDay();
    this.setData({
      date: y + "-" + m + "-" + d,
      week:w
    })
  },
  getNowDate() {
    var date = new Date();
    var y = date.getFullYear();
    var m = (date.getMonth() + 1).toString().padStart(2, '0');
    var d = date.getDate().toString().padStart(2, '0');
    var nowDate = y + "/" + m + "/" + d;
    this.setData({
      now_date: y + "-" + m + "-" + d,
      minDate: Date.parse(nowDate)
    })
  },
  getEndDate() {
    var date = new Date();
    var year = date.getFullYear();
    // var month  = date.getMonth()+1;
    // var day = date.getDate();
    var month = (date.getMonth() + 1).toString().padStart(2, '0');
    var day = date.getDate().toString().padStart(2, '0');

    // 将日期增加7天
    // date.setDate(day + 6);
    // 考虑月份和年份变化
    // if (date.getMonth() < month) {
    //   date.setMonth(date.getMonth() + 1);
    //   if (date.getFullYear() < year) {
    //     date.setFullYear(date.getFullYear() + 1);
    //   }
    // } else if (date.getFullYear() < year) {
    //   date.setFullYear(date.getFullYear() + 1);
    // }
    // var endDate0 = new Date(edYear, edMonth - 1, edDay); // 构造日期对象

    var sdate = year+"-"+month+"-"+day;
    var startDate = new Date(sdate); // 指定日期
    var endDate = new Date(startDate.getTime() + 6 * 24 * 60 * 60 * 1000);
    var edYear = endDate.getFullYear();
    var edMonth = (endDate.getMonth() + 1).toString().padStart(2, '0');
    var edDay = endDate.getDate().toString().padStart(2, '0');
    this.setData({
      endDate: edYear + "-" + edMonth + "-" + edDay,
      maxDate:Date.parse(edYear + '/' + edMonth + '/' + edDay)
    })
  },
  getPreviousDate() {
    var date = new Date();
    date.setDate(date.getDate() - 1);
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var day = date.getDate();
  
    // 考虑月份和年份的变化
    if (day === 0) {
      date.setDate(0);
      month = date.getMonth() + 1;
      day = date.getDate();
    }
    if (month === 0) {
      month = 12;
      year -= 1;
    }
    var previousDate = year + "-" + month + "-" + day;
    this.setData({
      previousDate: previousDate
    });
  },
  selectTime(event){
    if(this.data.array.length==0){
      return;
    }
    var index = event.detail.value;
    var newArray = this.data.array;
    var newSelected = this.data.selected;
    if(newSelected.length>=2){
      wx.showToast({
        title: '！最多只能选择2个时间段',
        icon:'none'
      })
      return;
    }
    newSelected.push(newArray[index]);
    newArray.splice(index,1);
    this.setData({
      array:newArray,
      selected:newSelected
    })
  },
  concelTime(event){
    var time = event.currentTarget.dataset.item;
    var newSelected = this.data.selected;
    var newArray = this.data.array;
    for(var i = 0;i<newSelected.length;i++){
      if(newSelected[i]==time){
        newSelected.splice(i,1);
        break;
      }
    }
    newArray.push(time);
    newArray.sort();
    this.setData({
      array:newArray,
      selected:newSelected
    })
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getNowDate();
    this.getDate();
    this.getEndDate();
    this.getPreviousDate();
    console.log("最终的日期为"+this.data.maxDate)
    console.log("现在的日期为"+this.data.now_date)
    cgrq = this.data.date
    console.log(this.data.endDate.toString())
    //删除前一天的数据
    timeCollection.where({
        date:this.data.previousDate.toString()
      }).remove().then(res => {
        console.log(res);
      })
      //如果没添加，则添加新增一天的数据
      timeCollection.where({
        date: this.data.endDate.toString()
      }).get().then(res => {
        if (res.data.length === 0) {
          var date=["08:00-08:30","08:30-09:00","09:00-09:30","09:30-10:00","10:00-10:30","10:30-11:00","11:00-11:30","12:00-12:30","12:30-13:00","13:00-13:30","13:30-14:00","14:00-14:30","14:30-15:00","15:00-15:30","15:30-16:00","16:00-16:30","16:30-17:00"]
          for (var i = 0; i < 17; i++) {
            timeCollection.add({
              data: {
                date:this.data.endDate.toString(),
                time: date[i],
                is_free:true,
                // _openid:"oXkIL5HNnJA1EppqXKklXmea3PgU"
              }
            }).then(res => {
              console.log("数据插入成功");
            }).catch(err => {
              console.error("数据插入失败", err);
            });
          }
        } else {
          console.log("已存在 enddate 的数据，无需插入");
        }
      }).catch(err => {
        console.error("数据库查询失败", err);
      });
      //选择空闲时间添加到选择中
    timeCollection.where({
      date: cgrq.toString(),
      is_free: true
    }).get().then(res => {
      // 获取到数据后将数据存入 time 数组
      const data = res.data;
      const time = data.map(item => item.time); // 假设时间字段为 "time"
      this.setData({
        // judge:res.data
        array: time,
      })
    })

//获取openid并存储在openid中
    wx.cloud.callFunction({
      name: 'get_Openid1',
      data: {},
      success: res => {
        // 获取到用户的openid
        openid = res.result.openid;
        console.log('用户的openid', res.result.openid)
      },
      fail: err => {
        console.error('调用云函数失败', err);
      },
      complete: () => {
        console.log('云函数调用完成');
      }
    });
  },
onReady(){
  if( app.globalData.first_time == true){
    console.log(app.globalData.first_time)
    this.tabShow();
    app.globalData.first_time = false
  }
},

  onDisplay() {
    this.setData({ calendar: true });
  },
  onClose(event) {
    this.setData({ calendar: false });
  },
  onChange1(event) {
    yyr = event.detail.value;
    // console.log(yyr)
  },
  onChange2(event) {
    lxfs = event.detail.value;
    console.log(lxfs);
  },
  onChange3(event) {
    lfr = event.detail.value;
    console.log(lfr);
  },
  onChange4(event) {
    yyrs = event.detail.value;
    if(yyrs>30){
      wx.showToast({
        title: '人数要少于30',
        icon: 'none',
        duration: 1000
      });
      yyrs=""
    }
    console.log(yyrs);
  },
  formatDate(date) {
    date = new Date(date);
    return `${date.getFullYear()}-${date.getMonth() + 1}-${date.getDate()}`;
  },
  onChange5(event) {
    cgrq = this.formatDate(event.detail),
    this.setData({
      calendar: false,
      date: this.formatDate(event.detail),
    });
    timeCollection.where({
      date: cgrq.toString(),
      is_free: true
    }).get().then(res => {
      // 获取到数据后将数据存入 time 数组
      const data = res.data;
      const time = data.map(item => item.time); // 假设时间字段为 "time"
      this.setData({
        // judge:res.data
        array: time,
        selected:[]
      })
    })
    console.log(cgrq);
  },
  onClick1(event){
    console.log('点击一次')
    judge=true
    //记得添加参观时间的判断
    while(yyr==""||lfr==""||yyrs==""||this.data.selected.length==0||lxfs==""||this.data.checked==false){
      judge=false
      if(yyr==""){
        wx.showToast({
          title: '预约人不可为空',
          icon: 'none',
          duration: 1000
        });
        break;
      }

      if(lxfs==""){
        wx.showToast({
          title: '联系方式不可为空',
          icon: 'none',
          duration: 1000
        });
        break;
      }

      if(lfr==""){
        wx.showToast({
          title: '来访人不可为空',
          icon: 'none',
          duration: 1000
        });
        break;
      }
      if(yyrs==""){
        wx.showToast({
          title: '预约人数为空或者大于30',
          icon: 'none',
          duration: 1000
        });
        break;
      }
      if(this.data.selected.length==0){
        wx.showToast({
          title: '预约时间不可为空',
          icon: 'none',
          duration: 1000
        });
        break;
      }
      if(this.data.checked==false){
        wx.showToast({
          title: '请先阅读协议！',
          icon: 'none',
          duration: 1000
        });
        break;
      }
    }
   
    if(judge==true){
      var time_choose="";
      for (var i = 0; i < this.data.selected.length; i++) {
        timeCollection.where({
          time: this.data.selected[i].toString(),
          date: cgrq.toString()
        }).update({
          data: {
            is_free: false
          }
        }).then(res => {
          console.log("数据更新成功");
        }).catch(err => {
          console.error("数据更新失败", err);
        });
            
        visistorCollection.add({
          data: {
            visitor:yyr,
            phone: lxfs,
            unit:lfr,
            total:yyrs,
            // time:time_choose,
            time: this.data.selected[i].toString(),
            date:cgrq.toString(),
            created_time:this.data.now_date.toString(),
            id:openid,
            has_reviewed:false//审核情况
          }
        }).then(res => {
          console.log("数据插入成功");
          wx.showToast({
            title: '预约成功！',
            icon:"none",
            duration:1000
          });
        }).catch(err => {
          console.error("数据插入失败", err);
          wx.showToast({
            title: '预约失败！',
            icon:"none",
            duration:1000
          });
        });
      }
   // 清空输入内容
    this.setData({
      inputContent: ''
    });
    
    // 刷新页面
    wx.redirectTo({
      url: '/pages/home/home'
    });
    }
  },
  toRecord(){
    // 页面A
    wx.redirectTo({
      url: '/pages/record/record?id=' + openid
    })
  },
  onChange(event) {
        this.setData({
          checked: event.detail,
        });
      },
})