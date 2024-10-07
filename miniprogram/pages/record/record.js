// pages/record/record.js
import Toast from '@vant/weapp/toast/toast';
const db =  wx.cloud.database()
const visitorCollection = db.collection('custom_list')
const timeCollection = db.collection('time_Order')
let openid = ""
 // 设置监听器，实时监听数据库中的数据变化
 const _ = db.command
 const that = this

Page({
  /**
   * 页面的初始数据
   */
  data: {
    dataList:[],
    user_openId:'',
    timeList:[]
    // record:[
    //   {
    //     date:"2023.7.6",
    //     time:"12:30-13:00",
    //     name:"高建伟"
    //   },
    //   {
    //     date:"2023.7.6",
    //     time:"12:30-13:00",
    //     name:"高建伟"
    //   }
    // ]
  },
  onClickLeft(){
    wx.redirectTo({
      url: '/pages/home/home',
    })
  },
  cancel(e){//取消预约
    let userId = e.target.dataset.userid;
    let recordId = e.target.dataset.user_order_id;
    let addFreeTime = e.target.dataset.cancel_time;
    let addFreeDate = e.target.dataset.cancel_date;
    console.log('取消人的openid:',userId); // 2
    console.log('时间id',recordId)
    console.log('时间',addFreeTime)
    console.log('日期',addFreeDate)
        visitorCollection.where({
          id:userId,
          _id:recordId
        }).remove().then(res=>{
          wx.showToast({
            title: '预约取消成功！下拉刷新',
            icon:"none",
            duration:1000
          });
          console.log('删除一条数据',res)
          // 添加空闲时间
          timeCollection
          .where({
            date:addFreeDate,
            time:addFreeTime
          })
          .update({
            data:{
              is_free:true
            },
            success(res){
                console.log('新增空闲时间',res)
            },
            fail: err => {
              console.error('数据修改失败', err)
            }
        })
        }).catch(err => {
          console.error("数据删除失败", err);
          wx.showToast({
            title: '预约取消失败！',
            icon:"none",
            duration:1000
          });
        });
        //取消预约后要立刻刷新数据集 下拉刷新
  },

  addVisitor(){//新增数据
    visitorCollection.add({
      data:{
          _id:'xnjsbcd',
          created_time:null,
          visitor:'张三',
          total:21
      },
      success(res){
          console.log(res)
      },
      fail:console.error
  })
  },
// 预约时间过期后自动取消记录


// 1.删除数据库记录
deleteForTimeout(delteId,deleteUserId){
    visitorCollection
    .where({
      _id:delteId,
      id:deleteUserId
    })
    .remove()
    .then(res => {
      // 2.修改空余时间信息
      console.log('删除成功')
    }).catch(err => {
      console.error(err);
    })
},

addFreeTime(cancel_date,cancel_time){
      timeCollection
      .where({
        date:cancel_date,
        time:cancel_time
      })
      .update({
        data:{
          is_free:true
        },
        success(res){
            console.log('新增空闲时间',res)
        },
        fail: err => {
          console.error('数据修改失败', err)
        }
    })
},

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    openid = options.id
    console.log('传递的用户id：',openid)
    // 获取预约记录
    visitorCollection
    .where({
       id:openid
    })
    .get()
    .then(res => {
      var data = res.data;
      //1.当前日期
      var currentDateTime = new Date();
      console.log('现在时间1',currentDateTime)
      for (var i = 0; i < data.length; i++) {
      var item = data[i];
      // console.log('每个用户',item)

      //检查日期
      //2.预约日期
      var dateString = item.date;
      var orderDate = new Date(dateString);
      var year = orderDate.getFullYear();
      var month = orderDate.getMonth() + 1; // 月份从0开始，所以要加1
      var day = orderDate.getDate();

      // 3.预约时间
      var timeString = item.time;

      //4.预约日期+时间
      var dateTimeString = year + "-" + month + "-" + day + " " + timeString;
     console.log('预约dateTime',dateTimeString)

      if (dateTimeString > currentDateTime ) {
         console.log("日期已过期");
        //  deleteForTimeout(item._id,item.id)
        // （1）删除过期记录
        visitorCollection
        .where({
            _id:item._id,
            id:item.id
        })
        .remove()
        .then(res => {
          // 2.修改空余时间信息
          console.log('过期记录删除成功', res)
        }).catch(err => {
          console.error(err);
        })
        //（2）新增空闲时间
        timeCollection
        .where({
          date:dateString,
          time:timeString
        })
        .update({
          data:{
            is_free:true
          },
          success(res){
              console.log('新增空闲时间',res)
          },
          fail: err => {
            console.error('数据修改失败', err)
          }
      })
      }else{
        console.log("日期未过期");
      }
    }
    }).catch(err => {
      console.error(err);
    })
   
    // 重新查询 更新数据
    visitorCollection
    .where({
       id:openid
    })
    .get()
    .then(res => {
         this.setData({
              dataList: res.data
            });
        if(res.data.length === 0){
          wx.showToast({
            title: '无预约记录！',
            icon:'none'
          })
        }
  }).catch(err => {
    console.error(err);
  })


},
toastInfo(){
  var datalist = this.data.dataList;
  console.log('dataList',datalist)
  if(datalist.length === 0){
    wx.showToast({
      title: '无预约记录！',
      icon:'none'
    })
  }
}
,
  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady(){
    // this.toastInfo()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh: function () {
    db.collection("custom_list")
    .where({
      id:openid
   })
    .get()
    .then(res => {
      // console.log(res)
      this.setData({
        dataList: res.data,
        })
    })
    wx.showToast({
      title: '刷新成功',
    })
    wx.stopPullDownRefresh({
      success: (res) => {
      },
    })
  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})