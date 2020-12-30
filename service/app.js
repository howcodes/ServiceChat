// 引入express，并获得express的实例
const express = require('express');
const path = require("path")
const app = express()
const axios = require("axios");
const http = require('http');
const userList = require("../service/store/userList.json")
const robotReply = require("../service/store/robotReply.json")

// 用http模块创建一个服务并把express的实例挂载上去
const server = http.Server(app);
// 引入socket.io并立即实例化，把server挂载上去
const io = require('socket.io')(server);

//记录所有已经登录的用户
let users = []
//随机生成指定范围数字
function randomNum(minNum, maxNum) {
  switch (arguments.length) {
    case 1:
      return parseInt(Math.random() * minNum + 1, 10);
      break;
    case 2:
      return parseInt(Math.random() * (maxNum - minNum + 1) + minNum, 10);
      break;
    default:
      return 0;
      break;
  }
}
app.use('/chatroom', express.static(path.join(__dirname, '/chatroom')))
io.on('connection', socket => {
  //发送信息给机器人
  socket.on("sendToRobot", data => {
    let welCome = robotReply.filter(
      (x) => x.Answer.indexOf(data.Content) !== -1
    );
    socket.emit("reviceFromRobot", {
      content: welCome.length > 0 ? welCome[0] : "非常对不起哦，不知道怎么回答这个问题呢，我会努力学习的。",
      flag: welCome.length > 0 ? true : false
    })
    socket.emit("changOrShowMsg", data)
  })
  //发送消息
  socket.on("sendMsg", data => {
    //设置用户未读
    users.map(x => {
      if (x.SendId === data.SendId) {
        x.SessionContent = data.Content;
        x.UnRead = 1;
        return x;
      }
    })
    let sender = users.filter(x => x.SendId === data.SendId);
    let revicer = users.filter(x => x.SendId === data.ReviceId);
    if (sender.length < 0) {
      socket.emit("offLineTip", {
        msg: "您已掉线，请重新连接"
      });
      return;
    }
    if (revicer.length < 0) {
      socket.emit("offLineTip", {
        msg: "对方已离线"
      });
      return;
    }
    data.State = 1;
    socket.to(data.OutTradeNo).emit("reviceMsg", data);
    socket.emit("changOrShowMsg", data)
  })
  //修改信息阅读状态
  socket.on("changeMsgRead", data => {
    users.map(x => {
      if (x.OutTradeNo === data) {
        x.UnRead = 0;
        x.IsSelect = true;
        return x;
      } else {
        x.IsSelect = false;
        return x;
      }
    })
  })
  // 加入聊天
  socket.on("joinChat", data => {
    let serviceList = null;
    let index = 0;
    if (!data.IsService) {
      serviceList = users.filter(x => x.IsService == true);
      let serviceCount = serviceList.length;
      for (let i = serviceCount - 1; i >= 0; i--) {
        let item = serviceList[i];
        let number = users.filter(x => x.ReviceId === item.SendId).length;
        let num = userList.filter(x => x.id == item.SendId)[0].receptNum;
        if (number >= num) {
          serviceList.splice(i, 1);
        }
      }
      if (serviceCount > 0 && serviceList.length <= 0) {
        socket.emit("joinError", {
          msg: "当前咨询人数较多，请稍后再试"
        });
        return;
      } else if (serviceList.length > 0) {
        //随机分配客服
        index = randomNum(0, serviceList.length - 1)
        socket.emit("joinTip", {
          ReviceName: serviceList[index].SendName,
          ReviceId: serviceList[index].SendId,
          ReviceOutTradeNo: serviceList[index].OutTradeNo
        });
        //让会员加入房间
        socket.join(serviceList[index].OutTradeNo);
      } else {
        socket.emit("joinError", {
          msg: "暂无客服在线"
        });
        return;
      }
    } else {
      socket.join(socket.id);
    }
    //若该用户已登陆，将旧设备登陆的用户强制下线
    let oldUser = users.filter(x => x.SendId === data.SendId);
    if (oldUser.length > 0) {
      socket.to(oldUser[0].OutTradeNo).emit("squeezeOut", {
        noCode: oldUser[0].NoCode
      });
    }
    //存在用户信息时将旧记录删除并且重新记录
    users = users.filter(x => x.SendId !== data.SendId);
    let user = {
      SendId: data.SendId,
      SendName: data.SendName,
      ReviceId: serviceList ? serviceList[index].SendId : data.ReviceId,
      ReviceName: serviceList ? serviceList[index].SendName : data.ReviceName,
      NoCode: data.NoCode,
      OutTradeNo: socket.id,
      Room: data.IsService ? socket.io : serviceList[index].OutTradeNo,
      IsService: data.IsService,
      IsSelect: false,
      SessionContent: data.SendName + "加入会话",
      UnRead: 0,
      CloseSession: false,
    };
    users.push(user)

    // 把登录成功的sendId记录下来
    socket.SendId = data.SendId
    io.emit("joinSuccess", {
      user,
      users
    })
  })
  //客服手动离线
  socket.on("offLine", data => {
    //把客服和会员从users列表中删除
    users = users.filter(x => (x.OutTradeNo != socket.io && x.ReviceId != data.SendId));
    io.emit("offSuccess", {
      Users: users,
      SendId: data.SendId,
      NoCode: data.NoCode
    });
  })
  //客服关闭会话
  socket.on("closeSeesion", data => {
    //将该会员从users列表删除
    users = users.filter(x => (x.SendId != data.SendId));
    socket.to(data.OutTradeNo).emit("closeSessionSuccess", {
      Users: users,
      SendId: data.SendId
    });
    socket.emit("closeSessionSuccess", {
      Users: users,
      SendId: data.SendId
    });
  })
  // 用户断开连接的功能
  socket.on("disconnect", () => {
    //获取客服房间的OutTradeNo
    let serviceOutTradeNo = "";
    let user = users.filter(x => x.OutTradeNo === socket.id);
    if (user.length > 0) {
      if (!user[0].IsService) {
        serviceOutTradeNo = users.filter(x => x.SendId === user[0].ReviceId)[0].OutTradeNo;
      } else {
        serviceOutTradeNo = user[0].OutTradeNo;
      }
    }
    //将该会员从users列表删除
    if (socket.SendId && socket.SendId > 0) {
      users = users.filter(x => (x.OutTradeNo != socket.id && x.ReviceId != socket.SendId));
    }
    //会员离线
    if (user.length > 0 && !user[0].IsService && serviceOutTradeNo) {
      socket.to(serviceOutTradeNo).emit('customerDisconnect', {
        SendId: socket.SendId,
        Users: users
      })
    }
    //客服离线
    else if (user.length > 0 && user[0].IsService && serviceOutTradeNo) {
      io.in(serviceOutTradeNo).emit('serviceDisconnect', {
        SendId: socket.SendId,
        Users: users
      });
    }
  })
});

server.listen(3100, function () {
  console.log('服务端启动成功！端口3100');
});