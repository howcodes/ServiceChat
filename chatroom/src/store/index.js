import Vue from 'vue'
import Vuex from 'vuex'

//仿数据库数据
const userList = require("../../../service/store/userList.json");
const fastReply = require("../../../service/store/fastReply.json");
const productList = require("../../../service/store/product.json");
const messageList = require("../../../service/store/messageList.json")
const robotReply = require("../../../service/store/robotReply.json")
Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    userList: userList,
    fastReply: fastReply,
    productList: productList,
    messageList: messageList,
    robotReply: robotReply
  },
  mutations: {},
  actions: {},
  modules: {}
})