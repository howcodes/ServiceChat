<template>
  <div v-cloak>
    <!--顾客窗口开始-->
    <div v-if="!sender.isService">
      <!--聊天内容窗口-->
      <div class="chatBox">
        <div id="ChatContent" class="chatContent">
          <div v-if="lastSession">
            <div class="moreSession" v-on:click="loadMore">加载更多</div>
          </div>
          <div v-else :key="index">
            <div class="moreSession">已加载全部</div>
          </div>
          <template v-for="(item, index) in conversition">
            <div
              :key="index"
              v-if="item.SendId == sender.id && item.Identity == 2"
            >
              <div class="myselfDiv">
                <div v-if="item.State == 0">
                  <van-loading
                    v-if="item.Type == 1"
                    type="spinner"
                    class="myselfImageLoad"
                    size="24px"
                  ></van-loading>
                  <van-loading
                    v-else
                    :key="index"
                    type="spinner"
                    class="myselfLoad"
                    size="24px"
                  >
                  </van-loading>
                </div>
                <div v-else-if="item.State == -1">
                  <span v-if="item.Type == 1" class="sendImageError">!</span>
                  <span :key="index" v-else class="sendError">!</span>
                </div>
                <div v-if="item.Type == 0" class="myselfContent">
                  {{ item.Content }}
                </div>
                <div v-else-if="item.Type == 2" class="myselfContent">
                  <img v-bind:src="item.Content" />
                </div>
                <img
                  v-else-if="item.Type == 1"
                  class="mineSendImage"
                  @load="loadOverImg"
                  preview="1"
                  v-bind:src="item.Content"
                />
                <div
                  v-else-if="item.Type == 3"
                  class="myOtherContent"
                  style="padding: 0.1rem"
                  v-on:click="toUrl(item.Content)"
                >
                  <div class="goods-wrap">
                    <div class="goods-thum">
                      <img :src="item.Thumbnail" />
                    </div>
                    <div class="goods-detail">
                      <p class="goods-title" :title="item.Title">
                        {{ item.Title }}
                      </p>
                      <p class="goods-abstract" :title="item.Description">
                        {{ item.Description }}
                      </p>
                      <p class="goods-label" :title="item.Label">
                        <span class="rmb-icon"></span>{{ item.Label }}
                      </p>
                    </div>
                    <div
                      v-if="item.noSend"
                      class="sendCard"
                      v-on:click.stop="sendCard(item)"
                    >
                      发给客服
                    </div>
                    <div
                      v-else-if="item.noSend == false"
                      class="sendCard"
                      style="background: #eee"
                    >
                      已发送
                    </div>
                  </div>
                </div>
                <div class="myselfImage">
                  <img v-bind:src="myselfImage" />
                </div>
              </div>
              <div style="clear: both"></div>
            </div>
            <div :key="index" v-else-if="item.Identity == 1">
              <div class="customerServiceDiv">
                <div class="customerServiceImage">
                  <img v-bind:src="customerServiceImage" />
                </div>
                <div
                  v-if="item.Type == 0"
                  class="otherContent"
                  v-html="item.Content"
                ></div>
                <div v-else-if="item.Type == 2" class="otherContent">
                  <img v-bind:src="item.Content" />
                </div>
                <img
                  v-else-if="item.Type == 1"
                  class="yourSendImage"
                  v-bind:src="item.Content"
                  @load="loadOverImg"
                  preview="1"
                />
                <div
                  v-else-if="item.Type == 3"
                  class="otherContent"
                  style="padding: 0.1rem"
                >
                  <a :href="item.Content" target="_blank">
                    <div class="goods-wrap">
                      <div class="goods-thum">
                        <img :src="item.Thumbnail" />
                      </div>
                      <div class="goods-detail">
                        <p class="goods-title" :title="item.Title">
                          {{ item.Title }}
                        </p>
                        <p class="goods-abstract" :title="item.Description">
                          {{ item.Description }}
                        </p>
                        <p class="goods-label" :title="item.Label">
                          <span class="rmb-icon"></span>{{ item.Label }}
                        </p>
                      </div>
                    </div>
                  </a>
                </div>
                <div
                  v-else-if="
                    item.Type == '4' &&
                    item.Content.IsParent &&
                    item.Content.ReplyLink
                  "
                  class="otherContent"
                >
                  <p>{{ item.Content.Reply }}</p>
                  <div
                    v-for="(link, index2) in item.Content.ReplyLink"
                    :key="index2"
                    style="color: #da2339; padding: 5px 0"
                    v-on:click="linkReply(link.Answer, link.Reply)"
                  >
                    {{ index2 + 1 }}.{{ link.Answer }}
                  </div>
                </div>
                <div
                  v-else-if="item.Type == '4'"
                  v-html="item.Content.Reply"
                  class="otherContent test"
                ></div>
              </div>
              <div style="clear: both"></div>
            </div>
            <div :key="index" v-else-if="item.Identity == 3">
              <div class="otherDiv">
                <span>{{ item.Content }}</span>
              </div>
            </div>
          </template>
        </div>
      </div>
      <!--底部浮动内容-->
      <div id="floatDiv" class="floatDiv">
        <div class="inputBox">
          <div
            v-show="!sender.onlineState"
            id="toPeopleService"
            class="robotServices"
            v-on:click="callPeople"
          >
            <img src="../assets/Images/service/客服.png" />
            <div class="robotFont">转人工</div>
          </div>
          <div :class="!sender.onlineState ? 'inputDiv' : 'inputDiv2'">
            <input
              class="inputContent"
              type="text"
              v-model="sendInfo"
              v-on:focus="openMore('input')"
            />
          </div>
          <div v-show="!sender.onlineState">
            <div v-show="sendInfo.length > 0">
              <div class="sendToRobot" v-on:click="sendToRobot">发送</div>
            </div>
            <div v-show="sendInfo.length <= 0">
              <div class="openMore" v-on:click="openMore('tool')">
                <img src="../assets/Images/service/加号.png" />
              </div>
            </div>
          </div>
          <div v-show="sender.onlineState" style="display: flex">
            <div class="sendExpression" v-on:click="openMore('expression')">
              <img src="../assets/Images/service/笑脸.png" />
            </div>
            <div v-show="sendInfo.length > 0">
              <div class="sendToPeople" v-on:click="toSend(sendInfo, 2, 0)">
                发送
              </div>
            </div>
            <div v-show="sendInfo.length <= 0">
              <div class="openMore" v-on:click="openMore('tool')">
                <img src="../assets/Images/service/加号.png" />
              </div>
            </div>
          </div>
        </div>
        <section v-if="moreTool && sender.onlineState" class="moreTool">
          <ul class="toolUl">
            <template v-for="(item, index) in toolBox">
              <li :key="index">
                <div
                  class="item"
                  v-on:click="index == 1 ? (showComment = true) : ''"
                >
                  <div class="toolIcon">
                    <img class="toolImage" v-bind:src="item.image" />
                    <input
                      v-if="index == 0"
                      class="FileImage"
                      name="customer"
                      type="file"
                      value=""
                      v-on:change="sendImage"
                    />
                  </div>
                </div>
                <span class="totalName">{{ item.name }}</span>
              </li>
            </template>
          </ul>
        </section>
        <section
          v-else-if="moreTool && !sender.onlineState"
          class="moreTool"
          style="height: 1.3rem"
        >
          <ul class="toolUl">
            <template v-for="(item, index) in robotToolBox">
              <li :key="index">
                <div class="item" v-on:click="showMessage = true">
                  <div class="toolIcon">
                    <img class="toolImage" v-bind:src="item.image" />
                  </div>
                </div>
                <span class="totalName">{{ item.name }}</span>
              </li>
            </template>
          </ul>
        </section>
        <div v-show="expressionShow" class="expressionShow">
          <div class="face">
            <ul>
              <template v-for="(item, index) in expressions">
                <li :key="index">
                  <img
                    class="customerSendExpression"
                    v-bind:src="item.image"
                    v-bind:title="item.title"
                    v-on:click="toSend(item.image, 2, 2)"
                  />
                </li>
              </template>
            </ul>
          </div>
        </div>
        <van-popup
          v-model="showComment"
          bind:close="onCloseComment"
          position="bottom"
        >
          <div class="showComment" style="height: 5rem">
            <div class="commentTitle" style="display: block">
              请对本次服务进行评价
            </div>
            <div class="commentStart">
              <template v-for="(item, index) in start">
                <div :key="index" class="startImage">
                  <img
                    v-if="!item.state"
                    v-bind:src="item.offstart"
                    v-on:click="changeLevel(item, index)"
                  />
                  <img
                    v-else
                    v-bind:src="item.onstart"
                    v-on:click="changeLevel(item, index)"
                  />
                </div>
              </template>
            </div>
            <div class="isSolve">
              <div style="margin-top: 0.05rem">{{ thisQuestion }}</div>
              <template v-for="(item, index) in solveState">
                <button
                  :key="index"
                  class="tablSelect"
                  v-bind:class="{ activeSelect: item.state }"
                  v-on:click="onClickSelect(index)"
                >
                  {{ item.name }}
                </button>
              </template>
            </div>
            <div class="submitDiv">
              <div
                class="submitBtn"
                v-bind:class="{ activeBtn: level > 0 && solveResult != -1 }"
                v-on:click="sumbitComment"
              >
                提交
              </div>
            </div>
          </div>
        </van-popup>
        <van-popup
          v-model="showMessage"
          bind:close="showMessage=false"
          position="bottom"
        >
          <div class="showComment">
            <div class="commentTitle">
              <span
                v-bind:class="{ messageActive: messageType }"
                class="messageTopBtn"
                v-on:click="changeMessageType(true)"
                >请您留言</span
              >
              <span
                v-bind:class="{ messageActive: !messageType }"
                class="messageTopBtn"
                v-on:click="changeMessageType(false)"
                >留言记录</span
              >
            </div>
            <div v-show="messageType">
              <div class="messageTip">
                {{ messageTip }}
              </div>
              <textarea
                v-model="customerMessage"
                :placeholder="messageTip2"
                maxlength="200"
                id="remark"
                class="textarea"
              ></textarea>
              <div class="submitDiv" style="margin-top: 0.5rem">
                <div
                  class="submitBtn"
                  v-bind:class="{ activeBtn: customerMessage.length > 0 }"
                  v-on:click="sumbitMessage"
                >
                  提交
                </div>
              </div>
            </div>
            <div v-show="!messageType" class="messageRecord">
              <div
                v-for="(item, index) in messageList"
                :key="index"
                class="messageDiv"
              >
                <div class="messageTime">{{ item.CreateTime }}</div>
                <div class="messageContent">
                  <div class="messageDetail">{{ item.Message }}</div>
                  <div class="messageState" v-if="item.State == 0">待回复</div>
                  <div
                    class="messageState"
                    v-else-if="item.State == 4"
                    v-on:click="item.State = 3"
                  >
                    ∧收起
                  </div>
                  <div
                    class="messageState"
                    style="background: #da2339"
                    v-else
                    v-on:click="seeMessageDetail(item)"
                  >
                    查看详情
                  </div>
                </div>
                <div v-if="item.State == 4" style="text-align: left">
                  <div>客服：{{ item.SolverName }}</div>
                  <div>{{ item.Reply }}</div>
                </div>
              </div>
            </div>
          </div>
        </van-popup>
      </div>
    </div>
    <!--顾客窗口结束-->

    <!--客服窗口开始-->
    <div v-else class="qqBox">
      <!--接收信息提示音-->
      <audio
        src="../assets/Mp3/msgTip.mp3"
        preload="auto"
        id="tipMusic"
        hidden="hidden"
      ></audio>
      <!--查看商品详情-->
      <div
        v-if="showProductDetail"
        class="productBox"
        v-on:click="onCloseProduct"
      >
        <div class="productDetail" v-on:click.stop="">
          <img class="productImg" :src="productDetail.DefaultPictureUrl" />
          <div class="product_inf">
            <div class="product_price">{{ productDetail.Cash }}元</div>
            <div class="row_align_center">
              <span class="product_name">{{ productDetail.Name }}</span>
            </div>
            <div class="colum">
              <span class="font_gray">规格：{{ productDetail.Unit }}</span>
              <span class="font_gray"
                >销量：{{
                  productDetail.ProductSaleQuantity
                    ? productDetail.ProductSaleQuantity
                    : "暂无数据"
                }}</span
              >
            </div>
          </div>
          <div class="more_info">
            <div>参数</div>
            <div class="info_detail">
              <div
                v-for="(item, index) in productDetail.ProductAttributes"
                :key="index"
              >
                <div>{{ item.Text }}:{{ item.Value }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div v-if="loginAgain" class="loginAgain"></div>
      <!--头部-->
      <div class="BoxHead">
        <div class="headImg">
          <img src="../assets/Images/service/serviceImg.png" />
        </div>
        <div v-if="!changeUserName" class="internetName">
          客服:{{ sender.name }}
        </div>
        <input v-else v-model="temporaryUserName" style="margin-top: 14px" />
        <div
          v-if="!changeUserName"
          class="internetName changeNameBtn"
          v-on:click="changeUserName = true"
        >
          修改
        </div>
        <div v-else class="internetName changeNameBtn" v-on:click="changName()">
          保存
        </div>
        <div
          v-if="!changeReceptNumber"
          class="internetName"
          style="margin-left: 10px"
        >
          接待人数:{{ sender.receptNum }}
        </div>
        <input
          v-else
          type="number"
          v-model="temporaryReceptNumber"
          style="margin-top: 14px; width: 50px; margin-left: 10px"
        />
        <div
          v-if="!changeReceptNumber"
          class="internetName changeNameBtn"
          v-on:click="changeReceptNumber = true"
        >
          修改
        </div>
        <div
          v-else
          class="internetName changeNameBtn"
          v-on:click="changNumber()"
        >
          保存
        </div>
        <div
          v-show="showLoginBtn"
          class="internetName"
          style="margin-left: 20px"
        >
          在线状态
        </div>
        <div v-show="showLoginBtn" style="margin-top: 13px; margin-left: 5px">
          <van-switch
            :value="sender.onlineState"
            active-color="#25AEF3"
            inactive-color="#F1F3F4"
            size="24px"
            id="onLine"
            v-on:click="changeOnLine"
          />
        </div>
        <div
          v-show="showLoginBtn"
          class="internetName"
          style="margin-left: 5px"
        >
          {{ sender.onlineState ? "在线" : "离线" }}
        </div>
      </div>
      <!--内容-->
      <div class="context">
        <!--左边内容-->
        <div class="conLeft">
          <ul v-show="currentHasPeople && sender.onlineState">
            <div class="sessionType" v-on:click="onlineShow = !onlineShow">
              <span v-show="onlineShow">▼</span>
              <span v-show="!onlineShow">▲</span>
              在线会话
            </div>
            <li
              :key="index"
              v-show="onlineShow && item.ReviceId == sender.id"
              style="cursor: pointer"
              v-for="(item, index) in currentSessionPeople"
              v-on:click="selectSession(item, 1)"
              :class="{ isSelect: item.IsSelect }"
              v-on:mouseenter="item.CloseSession = true"
              v-on:mouseleave="item.CloseSession = false"
            >
              <div class="liLeft">
                <img src="../assets/Images/service/customerImg.png" />
              </div>
              <div class="liRight">
                <span class="intername">{{ item.SendName }}</span>
                <span class="infor">{{ item.SessionContent }}</span>
                <div v-show="item.UnRead > 0" class="un_read">
                  {{ item.UnRead > 99 ? "99+" : item.UnRead }}
                </div>
                <span
                  class="closeSession"
                  v-show="item.CloseSession"
                  v-on:click.stop="closeSeesion(item)"
                  >×关闭</span
                >
              </div>
            </li>
          </ul>
          <ul v-show="offLineSessionPeople.length > 0">
            <div class="sessionType" v-on:click="offlineShow = !offlineShow">
              <span v-show="offlineShow">▼</span>
              <span v-show="!offlineShow">▲</span>
              离线会话
            </div>
            <li
              :key="index"
              v-show="offlineShow && item.ReviceId == sender.id"
              style="cursor: pointer"
              v-for="(item, index) in offLineSessionPeople"
              v-on:click="selectSession(item, 0)"
              :class="{ isSelect: item.IsSelect }"
              v-on:mouseenter="item.CloseSession = true"
              v-on:mouseleave="item.CloseSession = false"
            >
              <div class="liLeft">
                <img src="../assets/Images/service/offLineImg.png" />
              </div>
              <div class="liRight">
                <span class="intername">{{ item.SendName }}</span>
                <span class="infor">{{ item.SessionContent }}</span>
                <div v-show="item.UnRead > 0" class="un_read">
                  {{ item.UnRead > 99 ? "99+" : item.UnRead }}
                </div>
                <span
                  class="closeSession"
                  v-show="item.CloseSession"
                  v-on:click="removeOffLine(item, $event)"
                  >×关闭</span
                >
              </div>
            </li>
          </ul>
          <div v-show="!currentHasPeople" class="noPeople">
            <img src="../assets/Images/service/noPeple.png" />
            <div style="text-align: center">正等待被撩...</div>
          </div>
        </div>
        <!--暂无会话-->
        <div v-show="!isSelectSession" class="conRight">
          <div class="layout-empty">
            <div class="layout-empty-conatiner">
              <img
                style="width: 100px; height: auto"
                src="../assets/Images/service/noSession.png"
              />
              <span>没有会话内容</span>
              <span style="color: #bdc3d1"
                >当客户接入后，从左侧客户列表中选择客户开始会话</span
              >
            </div>
          </div>
        </div>
        <!--会话窗口-->
        <div v-show="isSelectSession" class="conRight">
          <!--会话头部-->
          <div class="Righthead">
            <div class="headName">{{ revicer.name }}</div>
          </div>
          <!--聊天内容-->
          <div v-if="isSelectSession" class="RightCont" id="RightCont">
            <div v-if="lastSession">
              <div class="moreSession pcMoreSession" v-on:click="loadMore">
                加载更多
              </div>
            </div>
            <div v-else>
              <div class="moreSession pcMoreSession">已加载全部</div>
            </div>
            <template
              v-for="(item, index) in conversition.filter(
                (x) =>
                  (x.SendId == sender.id && x.ReviceId == revicer.id) ||
                  (x.ReviceId == sender.id && x.SendId == revicer.id)
              )"
            >
              <div :key="index" v-if="item.Identity == 1">
                <div class="myselfDiv">
                  <div v-if="item.State == 0">
                    <van-loading
                      v-if="item.Type == 1"
                      type="spinner"
                      class="myselfImageLoad"
                      size="24px"
                    ></van-loading>
                    <van-loading
                      v-else
                      type="spinner"
                      class="myselfLoad"
                      size="24px"
                    ></van-loading>
                  </div>
                  <div v-else-if="item.State == -1">
                    <span v-if="item.Type == 1" class="sendImageError">!</span>
                    <span v-else class="sendError">!</span>
                  </div>
                  <div v-if="item.Type == 0" class="news">
                    <img
                      class="jiao"
                      src="../assets/Images/service/radio.jpg"
                    />
                    {{ item.Content }}
                  </div>
                  <div v-else-if="item.Type == 2" class="news">
                    <img
                      class="jiao"
                      src="../assets/Images/service/radio.jpg"
                    />
                    <img v-bind:src="item.Content" />
                  </div>
                  <img
                    v-else-if="item.Type == 1"
                    style="margin-right: -15px"
                    class="yourSendImage"
                    v-bind:src="item.Content"
                    @load="loadOverImg"
                    preview="1"
                  />
                  <div v-else-if="item.Type == 3" class="news">
                    <img
                      class="jiao"
                      src="../assets/Images/service/radio.jpg"
                    />
                    <div class="goods-wrap" v-on:click="openCard(item.Content)">
                      <div class="goods-thum">
                        <img :src="item.Thumbnail" />
                      </div>
                      <div class="goods-detail">
                        <p class="goods-title" :title="item.Title">
                          {{ item.Title }}
                        </p>
                        <p class="goods-abstract" :title="item.Description">
                          {{ item.Description }}
                        </p>
                        <p class="goods-label" :title="item.Label">
                          <span class="rmb-icon"></span>{{ item.Label }}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div class="nesHead">
                    <img v-bind:src="customerServiceImage" />
                  </div>
                </div>
                <div style="clear: both"></div>
              </div>
              <div
                :key="index"
                v-else-if="item.SendId == revicer.id && item.Identity == 2"
              >
                <div v-if="item.State == 1" class="customerServiceDiv">
                  <div class="answerHead">
                    <img v-bind:src="myselfImage" />
                  </div>
                  <div v-if="item.Type == 0" class="answers">
                    <img
                      class="jiao"
                      src="../assets/Images/service/other_radio.jpg"
                    />
                    {{ item.Content }}
                  </div>
                  <div v-else-if="item.Type == 2" class="answers">
                    <img
                      class="jiao"
                      src="../assets/Images/service/other_radio.jpg"
                    />
                    <img v-bind:src="item.Content" />
                  </div>
                  <img
                    v-else-if="item.Type == 1"
                    class="yourSendImage"
                    style="margin-left: 0"
                    v-bind:src="item.Content"
                    @load="loadOverImg"
                    preview="1"
                  />
                  <div v-else-if="item.Type == 3" class="cardAnswers">
                    <img
                      class="jiao"
                      src="../assets/Images/service/other_radio.jpg"
                    />
                    <div class="goods-wrap" v-on:click="openCard(item.Content)">
                      <div class="goods-thum">
                        <img :src="item.Thumbnail" />
                      </div>
                      <div class="goods-detail">
                        <p class="goods-title" :title="item.Title">
                          {{ item.Title }}
                        </p>
                        <p class="goods-abstract" :title="item.Description">
                          {{ item.Description }}
                        </p>
                        <p class="goods-label" :title="item.Label">
                          <span class="rmb-icon"></span>{{ item.Label }}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                <div style="clear: both"></div>
              </div>
              <div :key="index" v-else-if="item.Identity == 3">
                <div class="otherDiv">
                  <span>{{ item.Content }}</span>
                </div>
              </div>
              <div :key="index" v-else-if="item.Identity == 4">
                <div class="consultGuide">
                  <div class="consultGuideDiv">{{ item.content.title }}</div>
                  <template
                    v-for="(questionItem, index) in item.Content.questions"
                  >
                    <a
                      :key="index"
                      class="aQuestion"
                      v-bind:href="questionItem.href"
                      >{{ questionItem.question }}</a
                    >
                  </template>
                </div>
              </div>
            </template>
          </div>
          <!--聊天框底部-->
          <div class="RightFoot">
            <div v-show="!allowSession" class="notAllowSeesion"></div>
            <div class="sendContent">
              <!--表情包-->
              <div v-show="expressionShow" class="emjon">
                <ul>
                  <template v-for="(item, index) in expressions">
                    <li :key="index">
                      <img
                        class="serviceSendExpression"
                        v-bind:src="item.image"
                        v-bind:title="item.title"
                        v-on:click="toSend(item.image, 1, 2)"
                      />
                    </li>
                  </template>
                </ul>
              </div>
              <!--工具栏-->
              <div class="footTop">
                <ul>
                  <li v-on:click="changeExpression">
                    <img src="../assets/Images/service/pc_expression.jpg" />
                  </li>
                  <li
                    v-on:click="expressionShow = false"
                    class="ExP"
                    style="position: relative"
                  >
                    <img src="../assets/Images/service/pc_upload.jpg" />
                    <input
                      class="FileImage serviceFileImage"
                      name="customerService"
                      type="file"
                      value=""
                      v-on:change="sendImage"
                    />
                  </li>
                </ul>
              </div>
              <!--发送内容-->
              <div style="height: calc(100% - 70px)">
                <textarea
                  v-on:focus="expressionShow = false"
                  id="dope"
                  v-model="sendInfo"
                  class="textBox"
                  :placeholder="
                    allowSession ? '请输入会话内容' : '当前会员已下线'
                  "
                  v-on:keyup.enter="enterSend"
                ></textarea>
                <button
                  class="sendBtn"
                  id="serviceSendBtn"
                  v-on:click="toSend(sendInfo, 1, 0)"
                >
                  发送(s)
                </button>
              </div>
            </div>
          </div>
        </div>
        <!--右边内容-->
        <div v-if="isSelectSession" class="infoBox">
          <!--工具栏-->
          <div class="serviceTool">
            <div
              v-for="(item, index) in serviceTool"
              :key="index"
              :class="[
                'service_tool',
                item.id == current_state ? 'active_tool' : '',
              ]"
              v-on:click="changeState(item)"
            >
              {{ item.text }}
            </div>
          </div>
          <!--用户信息-->
          <div v-show="current_state == 1" class="infoContent">
            <div>
              <label>访问来源：</label>
              <span>{{ revicer.source }}</span>
            </div>
            <div>
              <label>会员姓名：</label>
              <span>{{ revicer.name }}</span>
            </div>
            <div>
              <label>会员昵称：</label>
              <span>{{ revicer.nickName }}</span>
            </div>
            <div>
              <label>会员手机号：</label>
              <span>{{ revicer.mobile }}</span>
            </div>
            <div>
              <label>会员卡号：</label>
              <span>{{ revicer.cardNo }}</span>
            </div>
          </div>
          <!--快捷回复-->
          <div
            v-show="current_state == 2"
            class="infoContent"
            style="display: block"
          >
            <template v-for="(item, index) in fastReplay">
              <ul :key="index" class="domtree">
                <li>
                  <p class="tree-title" v-on:click="selectEasy(item.Id)">
                    {{ item.Title }}
                  </p>
                  <ul
                    v-show="currentEasy == item.Id"
                    style="position: relative"
                  >
                    <li v-for="(son, index2) in item.SonItem" :key="index2">
                      <p
                        class="sonTitle"
                        v-bind:data-id="son.Id"
                        v-on:click="selectReplay(son.Title)"
                      >
                        {{ son.Title }}
                      </p>
                      <div
                        class="see_all"
                        name="see_all"
                        v-bind:data-id="son.Id"
                      >
                        {{ son.Title }}
                      </div>
                    </li>
                  </ul>
                </li>
              </ul>
            </template>
          </div>
          <!--对接页面-->
          <div v-show="current_state == 3" class="infoContent">
            <iframe
              v-if="abutmentUrl"
              style="width: 100%; height: 100%; border: 0px"
              :src="abutmentUrl"
            ></iframe>
          </div>
        </div>
      </div>
    </div>
    <!--客服窗口结束-->
  </div>
</template>


<script>
(function (doc, win) {
  var docEl = doc.documentElement,
    resizeEvt = "orientationchange" in window ? "orientationchange" : "resize",
    recalc = function () {
      var clientWidth = docEl.clientWidth;
      if (!clientWidth) return;
      if (clientWidth >= 640) {
        docEl.style.fontSize = "100px";
      } else {
        docEl.style.fontSize = 100 * (clientWidth / 640) + "px";
      }
    };
  if (!doc.addEventListener) return;
  win.addEventListener(resizeEvt, recalc, false);
  doc.addEventListener("DOMContentLoaded", recalc, false);
})(document, window);
import io from "socket.io-client"; //引入socket.io-client
import { Toast } from "vant";
export default {
  metaInfo: {
    title: "聊天会话",
    meta: [
      {
        name: "viewport",
        content:
          "width=device-width, user-scalable=yes, initial-scale=1.0, maximum-scale=3.0, minimum-scale=1.0",
      },
    ],
  },
  data() {
    return {
      socket: null,
      sender: {
        id: 0,
        isService: 0,
        name: "",
        onlineState: false,
        outTradeNo: "",
        source: "",
        mobile: "",
        nickName: "",
        cardNo: "",
        receptNum: 0,
      },
      revicer: {
        id: 0,
        isService: 0,
        name: "",
        outTradeNo: "",
        source: "",
        mobile: "",
        nickName: "",
        cardNo: "",
        receptNum: 0,
      },
      infoTemplate: {},
      level: 0,
      currentEasy: 0,
      solveResult: -1,
      pageIndex: 1,
      current_state: 1,
      pageSize: 10,
      sendInfo: "",
      abutmentUrl: "",
      customerMessage: "",
      temporaryReceptNumber: 0,
      temporaryUserName: "",
      thisQuestion: "本次问题：",
      myselfImage: require("../assets/Images/service/customerImg.png"),
      customerServiceImage: require("../assets/Images/service/serviceImg.png"),
      messageTip:
        "您好，很抱歉我们暂时无法为您提供服务，如需帮助，请留言，我们将尽快联系并解决您的问题",
      messageTip2:
        "您好，为了更好地解决您的问题，请尽可能地描述清楚问题(最多200字)",
      noCode: +new Date(),
      msgTimer: null,
      moreTool: false,
      isSelectSession: false,
      expressionShow: false,
      changeReceptNumber: false,
      isPc: false,
      showProductDetail: false,
      showComment: false,
      showMessage: false,
      showLoginBtn: true,
      loginAgain: false,
      currentHasPeople: false,
      changeUserName: false,
      onlineShow: true,
      offlineShow: true,
      lastSession: true,
      sendState: true,
      messageType: true,
      allowSession: true,
      fastReplay: [],
      conversition: [],
      currentSessionPeople: [],
      offLineSessionPeople: [],
      messageList: [],
      productDetail: {},
      toolBox: [
        {
          name: "照片",
          image: require("../assets/Images/service/selectPhone.png"),
        },
        {
          name: "服务评价",
          image: require("../assets/Images/service/apraise.png"),
        },
      ],
      robotToolBox: [
        {
          name: "留言",
          image: require("../assets/Images/service/apraise.png"),
        },
      ],
      expressions: [
        {
          title: "[呵呵]",
          image: require("../assets/Images/Expression/smilea_thumb.gif"),
        },
        {
          title: "[嘻嘻]",
          image: require("../assets/Images/Expression/tootha_thumb.gif"),
        },
        {
          title: "[哈哈]",
          image: require("../assets/Images/Expression/laugh.gif"),
        },
        {
          title: "[可爱]",
          image: require("../assets/Images/Expression/tza_thumb.gif"),
        },
        {
          title: "[可怜]",
          image: require("../assets/Images/Expression/kl_thumb.gif"),
        },
        {
          title: "[挖鼻屎]",
          image: require("../assets/Images/Expression/kbsa_thumb.gif"),
        },
        {
          title: "[吃惊]",
          image: require("../assets/Images/Expression/cj_thumb.gif"),
        },
        {
          title: "[害羞]",
          image: require("../assets/Images/Expression/shamea_thumb.gif"),
        },
        {
          title: "[挤眼]",
          image: require("../assets/Images/Expression/zy_thumb.gif"),
        },
        {
          title: "[闭嘴]",
          image: require("../assets/Images/Expression/bz_thumb.gif"),
        },
        {
          title: "[鄙视]",
          image: require("../assets/Images/Expression/bs2_thumb.gif"),
        },
        {
          title: "[爱你]",
          image: require("../assets/Images/Expression/lovea_thumb.gif"),
        },
        {
          title: "[泪]",
          image: require("../assets/Images/Expression/sada_thumb.gif"),
        },
        {
          title: "[偷笑]",
          image: require("../assets/Images/Expression/heia_thumb.gif"),
        },
        {
          title: "[亲亲]",
          image: require("../assets/Images/Expression/qq_thumb.gif"),
        },
        {
          title: "[生病]",
          image: require("../assets/Images/Expression/sb_thumb.gif"),
        },
        {
          title: "[太开心]",
          image: require("../assets/Images/Expression/mb_thumb.gif"),
        },
        {
          title: "[懒得理你]",
          image: require("../assets/Images/Expression/ldln_thumb.gif"),
        },
        {
          title: "[右哼哼]",
          image: require("../assets/Images/Expression/yhh_thumb.gif"),
        },
        {
          title: "[左哼哼]",
          image: require("../assets/Images/Expression/zhh_thumb.gif"),
        },
        {
          title: "[嘘]",
          image: require("../assets/Images/Expression/x_thumb.gif"),
        },
        {
          title: "[衰]",
          image: require("../assets/Images/Expression/cry.gif"),
        },
        {
          title: "[委屈]",
          image: require("../assets/Images/Expression/wq_thumb.gif"),
        },
        {
          title: "[吐]",
          image: require("../assets/Images/Expression/t_thumb.gif"),
        },
        {
          title: "[打哈气]",
          image: require("../assets/Images/Expression/k_thumb.gif"),
        },
        {
          title: "[抱抱]",
          image: require("../assets/Images/Expression/bba_thumb.gif"),
        },
        {
          title: "[怒]",
          image: require("../assets/Images/Expression/angrya_thumb.gif"),
        },
        {
          title: "[疑问]",
          image: require("../assets/Images/Expression/yw_thumb.gif"),
        },
        {
          title: "[馋嘴]",
          image: require("../assets/Images/Expression/cza_thumb.gif"),
        },
        {
          title: "[拜拜]",
          image: require("../assets/Images/Expression/88_thumb.gif"),
        },
        {
          title: "[思考]",
          image: require("../assets/Images/Expression/sk_thumb.gif"),
        },
        {
          title: "[汗]",
          image: require("../assets/Images/Expression/sweata_thumb.gif"),
        },
        {
          title: "[困]",
          image: require("../assets/Images/Expression/sleepya_thumb.gif"),
        },
        {
          title: "[睡觉]",
          image: require("../assets/Images/Expression/sleepa_thumb.gif"),
        },
        {
          title: "[钱]",
          image: require("../assets/Images/Expression/money_thumb.gif"),
        },
        {
          title: "[失望]",
          image: require("../assets/Images/Expression/sw_thumb.gif"),
        },
        {
          title: "[酷]",
          image: require("../assets/Images/Expression/cool_thumb.gif"),
        },
        {
          title: "[花心]",
          image: require("../assets/Images/Expression/hsa_thumb.gif"),
        },
        {
          title: "[哼]",
          image: require("../assets/Images/Expression/hatea_thumb.gif"),
        },
        {
          title: "[鼓掌]",
          image: require("../assets/Images/Expression/gza_thumb.gif"),
        },
        {
          title: "[晕]",
          image: require("../assets/Images/Expression/dizzya_thumb.gif"),
        },
        {
          title: "[悲伤]",
          image: require("../assets/Images/Expression/bs_thumb.gif"),
        },
      ],
      start: [
        {
          offstart: require("../assets/Images/service/offstart.png"),
          onstart: require("../assets/Images/service/onstart.png"),
          state: false,
          level: 1,
        },
        {
          offstart: require("../assets/Images/service/offstart.png"),
          onstart: require("../assets/Images/service/onstart.png"),
          state: false,
          level: 2,
        },
        {
          offstart: require("../assets/Images/service/offstart.png"),
          onstart: require("../assets/Images/service/onstart.png"),
          state: false,
          level: 3,
        },
        {
          offstart: require("../assets/Images/service/offstart.png"),
          onstart: require("../assets/Images/service/onstart.png"),
          state: false,
          level: 4,
        },
        {
          offstart: require("../assets/Images/service/offstart.png"),
          onstart: require("../assets/Images/service/onstart.png"),
          state: false,
          level: 5,
        },
      ],
      solveState: [
        {
          name: "已解决",
          state: false,
          value: 1,
        },
        {
          name: "未解决",
          state: false,
          value: 0,
        },
      ],
      serviceTool: [
        {
          id: 1,
          text: "客户信息",
          state: true,
        },
        {
          id: 2,
          text: "快捷回复",
          state: false,
        },
        {
          id: 3,
          text: "对接页面",
          state: false,
        },
      ],
      browseCard: {
        Id: 0,
        Name: "",
        ShortDescription: "",
        DefaultPictureUrl: "",
        Amount: 0,
        Type: 0,
      },
    };
  },
  watch: {
    currentSessionPeople: function (newVal) {
      this.currentHasPeople = false;
      if (newVal.length > 0 && this.sender.isService) {
        this.currentHasPeople =
          newVal.filter((x) => x.ReviceId === this.sender.id).length > 0
            ? true
            : false;
      }
    },
  },
  mounted() {
    this.init();
    this.socket = io(process.env.VUE_APP_URL || "/");
    // 接收机器人回复的信息
    this.socket.on("reviceFromRobot", (data) => {
      if (data.flag) {
        this.signalrService(data.content, 1, 4, false);
      } else {
        this.signalrService(data.content, 1, 0, false);
      }
    });
    // 加入会话成功
    this.socket.on("joinSuccess", (data) => {
      this.closeLoad();
      if (
        data.user.SendId === this.sender.id &&
        data.user.NoCode == this.noCode &&
        this.sender.isService
      ) {
        this.sender.onlineState = true;
        let oldSessionPeople = this.currentSessionPeople;
        if (data.users.length > oldSessionPeople.length) {
          for (let i in data.users) {
            for (let j in oldSessionPeople) {
              if (oldSessionPeople[j].SendId == data.users[i].SendId) {
                data.users[i].SessionContent =
                  oldSessionPeople[j].SessionContent;
                data.users[i].UnRead = oldSessionPeople[j].UnRead;
              }
            }
          }
        } else {
          for (let i in oldSessionPeople) {
            for (let j in data.users) {
              if (oldSessionPeople[i].SendId == data.users[j].SendId) {
                data.users[j].SessionContent =
                  oldSessionPeople[i].SessionContent;
                data.users[j].UnRead = oldSessionPeople[i].UnRead;
              }
            }
          }
        }
      }
      //更新客服离线的列表
      if (this.sender.isService && data.user.ReviceId === this.sender.id) {
        this.offLineSessionPeople = this.offLineSessionPeople.filter(
          (x) => x.SendId !== data.user.SendId
        );
      }
      this.currentSessionPeople = data.users;
    });
    //当前用户接收加入提示信息
    this.socket.on("joinTip", (data) => {
      this.sender.onlineState = true;
      this.revicer.id = data.ReviceId;
      this.revicer.name = data.ReviceName;
      this.revicer.outTradeNo = data.ReviceOutTradeNo;
      this.infoTemplate = {
        SendId: 0,
        ReviceId: 0,
        Content: "客服" + data.ReviceName + "为您服务",
        Identity: 3,
        Type: 0,
        State: 1,
        NoCode: null,
        CreateDateUtc: null,
        Title: null,
        Description: null,
        Label: null,
        Thumbnail: null,
        NoSend: true,
      };
      this.toSendInfo(this.infoTemplate);
      if (this.browseCard.Id > 0) {
        this.infoTemplate = {
          SendId: this.sender.id,
          ReviceId: this.revicer.id,
          Content: "" + this.browseCard.Id,
          Identity: 2,
          Type: 3,
          State: 1,
          OutTradeNo: this.revicer.outTradeNo,
          NoCode: +new Date(),
          CreateDateUtc: null,
          Title: this.browseCard.Name,
          Description: this.browseCard.ShortDescription,
          Label: this.browseCard.Amount,
          Thumbnail: this.browseCard.DefaultPictureUrl,
          NoSend: true,
        };
        this.toSendInfo(this.infoTemplate);
      }
      this.toBottom(100);
    });
    //当前用户接收加入失败提示
    this.socket.on("joinError", (data) => {
      this.infoTemplate = {
        SendId: 0,
        ReviceId: 0,
        Content: data.msg,
        Identity: 3,
        Type: 0,
        State: 1,
        NoCode: null,
        OutTradeNo: null,
        CreateDateUtc: null,
        Title: null,
        Description: null,
        Label: null,
        Thumbnail: null,
        NoSend: true,
      };
      this.toSendInfo(this.infoTemplate);
      this.toBottom(100);
      this.closeLoad();
    });
    //当前用户接收对方离线提示
    this.socket.on("offLineTip", (data) => {
      this.showMsg(data.msg);
      this.conversition.forEach((x) => {
        if (x.SendId == this.sender.id) {
          x.State = -1;
          this.sendState = true;
        }
      });
    });
    //修改信息状态
    this.socket.on("changOrShowMsg", (data) => {
      this.sendState = true;
      clearTimeout(this.msgTimer);
      this.conversition.forEach((x) => {
        if (x.NoCode != null && x.NoCode == data.NoCode) {
          x.State = 1;
        }
      });
    });
    //接收信息
    this.socket.on("reviceMsg", (data) => {
      if (this.sender.isService && data.ReviceId == this.sender.id) {
        this.playMusic();
        this.currentSessionPeople.forEach((x) => {
          if (x.SendId == data.SendId) {
            if (!x.IsSelect) x.UnRead++;
            switch (data.Type) {
              case 0:
                x.SessionContent = data.Content;
                break;
              case 1:
                x.SessionContent = "图片";
                break;
              case 2:
                x.SessionContent = "表情";
                break;
              case 3:
                x.SessionContent = "卡片";
                break;
            }
          }
        });
      }
      this.toSendInfo(data);
    });
    //客服离线成功
    this.socket.on("offSuccess", (data) => {
      this.closeLoad();
      this.currentSessionPeople = data.Users;
      if (
        !this.sender.isService &&
        this.sender.onlineState &&
        this.revicer.id == data.SendId
      ) {
        this.infoTemplate = {
          SendId: 0,
          ReviceId: 0,
          Content: "当前客服已离线",
          Identity: 3,
          Type: 0,
          State: 1,
          NoCode: null,
          OutTradeNo: null,
          CreateDateUtc: null,
          Title: null,
          Description: null,
          Label: null,
          Thumbnail: null,
          NoSend: true,
        };
        this.toSendInfo(this.infoTemplate);
        this.sender.onlineState = false;
      } else if (this.noCode == data.NoCode && this.sender.isService) {
        this.sender.onlineState = !this.sender.onlineState;
        this.currentSessionPeople = [];
        this.offLineSessionPeople = [];
      }
    });
    //客服主动关闭会话
    this.socket.on("closeSessionSuccess", (data) => {
      if (!this.sender.isService) {
        this.infoTemplate = {
          SendId: 0,
          ReviceId: 0,
          Content: "客服结束了本次会话",
          Identity: 3,
          Type: 0,
          State: 1,
          NoCode: null,
          OutTradeNo: null,
          CreateDateUtc: null,
          Title: null,
          Description: null,
          Label: null,
          Thumbnail: null,
          NoSend: true,
        };
        this.toSendInfo(this.infoTemplate);
        this.sender.onlineState = false;
      } else {
        if (data.SendId === this.revicer.id) {
          this.isSelectSession = false;
        }
        let offLineSessionPeople = this.currentSessionPeople.filter(
          (x) => x.SendId === data.SendId
        );
        if (offLineSessionPeople.length > 0) {
          offLineSessionPeople[0].SessionContent = "客服主动结束会话";
          this.offLineSessionPeople.push(offLineSessionPeople[0]);
        }
      }
      this.currentSessionPeople = data.Users;
    });
    //会员刷新或关闭离线
    this.socket.on("customerDisconnect", (data) => {
      //将中间会话窗口关闭
      if (data.SendId == this.revicer.id) {
        this.isSelectSession = false;
      }
      let offLineSessionPeople = this.currentSessionPeople.filter(
        (x) => x.SendId === data.SendId
      );
      if (offLineSessionPeople.length > 0) {
        offLineSessionPeople[0].SessionContent = "已下线";
        offLineSessionPeople[0].IsSelect = false;
        this.offLineSessionPeople.push(offLineSessionPeople[0]);
      }
      this.currentSessionPeople = data.Users
        ? data.Users
        : this.currentSessionPeople;
    });
    //客服刷新或关闭离线
    this.socket.on("serviceDisconnect", (data) => {
      if (this.sender.onlineState) {
        this.infoTemplate = {
          SendId: 0,
          ReviceId: 0,
          Content: "当前客服已下线",
          Identity: 3,
          Type: 0,
          State: 1,
          NoCode: null,
          OutTradeNo: null,
          CreateDateUtc: null,
          Title: null,
          Description: null,
          Label: null,
          Thumbnail: null,
          NoSend: true,
        };
        this.toSendInfo(this.infoTemplate);
        this.sender.onlineState = false;
        this.currentSessionPeople = data.Users
          ? data.Users
          : this.currentSessionPeople;
      }
    });
    //多设备在线时，强制旧设备下线
    this.socket.on("squeezeOut", (data) => {
      if (this.noCode === data.noCode) {
        if (!this.sender.isService) {
          this.signalrService("账户已在其他设备登陆，会话中断", 3, 0, false);
          this.sender.onlineState = false;
        } else {
          this.currentSessionPeople = [];
          this.loginAgain = true;
          //离线
          this.isSelectSession = false;
          this.socket.emit("offLine", {
            SendId: this.sender.id,
            NoCode: this.noCode,
          });
          alert("账户已在其他设备登陆，会话中断");
        }
      }
    });
  },
  methods: {
    //初始化
    init() {
      this.sender.id = parseInt(this.$route.query.sendId);
      let product = this.$store.state.productList.filter(
        (x) => x.Id == this.$route.query.productId
      );
      if (product.length > 0) {
        this.browseCard.Id = product[0].Id;
        this.browseCard.Name = product[0].Name;
        this.browseCard.ShortDescription = product[0].ShortDescription;
        this.browseCard.DefaultPictureUrl = product[0].DefaultPictureUrl;
        this.browseCard.Amount = "编码:" + product[0].ProductCode;
        this.browseCard.Type = 1;
      }
      let userInfo = this.$store.state.userList.filter(
        (x) => x.id == this.sender.id
      )[0];
      this.fastReplay = this.$store.state.fastReply;
      this.sender.name = userInfo.name;
      this.temporaryUserName = userInfo.name; //修改昵称时的临时记录昵称
      this.sender.isService = userInfo.isService;
      this.sender.receptNum = userInfo.receptNum;
      this.temporaryReceptNumber = userInfo.receptNum; //修改接待用户数量时的临时记录接待用户数量
      //发送欢迎语
      let welCome = this.$store.state.robotReply.filter(
        (x) => x.Answer.indexOf("欢迎语") !== -1
      );
      if (welCome.length > 0) {
        this.signalrService(welCome[0], 1, 4, false);
      }
    },
    //查看大图
    loadOverImg() {
      this.$previewRefresh();
      this.toBottom(100);
    },
    //发送图片
    sendImage(e) {
      const fileObj = e.target.files[0];
      let identity = this.sender.isService ? 1 : 2;
      if (fileObj != null) {
        if (!/image\/\w+/.test(fileObj.type)) {
          return alert("请选择图片文件!", { icon: 5, time: 1000 });
        }
        var fd = new FormData();
        fd.append("file", fileObj);
        if (fileObj.size > 1024 * 1024 * 2 && fileObj.size < 1024 * 1024 * 10) {
          let reader = new FileReader();
          reader.readAsDataURL(fileObj);
          reader.onload = (e) => {
            let image = new Image(); //新建一个img标签（还没嵌入DOM节点)
            image.src = e.target.result;
            image.onload = () => {
              let canvas = document.createElement("canvas"),
                context = canvas.getContext("2d"),
                imageWidth = image.width / 2, //压缩后图片的大小
                imageHeight = image.height / 2,
                data = "";
              canvas.width = imageWidth;
              canvas.height = imageHeight;
              context.drawImage(image, 0, 0, imageWidth, imageHeight);
              data = canvas.toDataURL("image/jpeg");
              let newFile = this.dataURLtoFile(data); //压缩完成
              fd = new FormData();
              fd.append("file", newFile);
              this.signalrService(data, identity, 1);
            };
          };
        } else if (fileObj.size > 1024 * 1024 * 10) {
          return alert("上传图片不能超过10M!", { icon: 5, time: 1000 });
        } else {
          let reader = new FileReader();
          reader.readAsDataURL(fileObj);
          reader.onload = (e) => {
            this.signalrService(e.target.result, identity, 1);
          };
        }
      }
    },
    //压缩图片
    dataURLtoFile(dataurl, filename = "file") {
      let arr = dataurl.split(",");
      let mime = arr[0].match(/:(.*?);/)[1];
      let suffix = mime.split("/")[1];
      let bstr = atob(arr[1]);
      let n = bstr.length;
      let u8arr = new Uint8Array(n);
      while (n--) {
        u8arr[n] = bstr.charCodeAt(n);
      }
      return new File([u8arr], `${filename}.${suffix}`, {
        type: mime,
      });
    },
    //回车发送
    enterSend() {
      if (this.sendInfo) this.signalrService(this.sendInfo, 1, 0);
      else {
        this.showMsg("内容不得为空");
      }
    },
    //发送消息给会员或客服
    toSend(content, identity, type) {
      if (type === 0 && content.length <= 0) {
        this.showMsg("请输入发送内容");
        return;
      }
      if (type === 2) {
        this.expressionShow = !this.expressionShow;
      }
      this.signalrService(content, identity, type);
    },
    //1.信息组装
    signalrService(content, identity, type, isSendOther = true) {
      console.log(this.sendState);
      if (this.sendState) {
        let createDate = this.nowTime();
        let noCode = +new Date();
        this.infoTemplate = {
          SendId: this.sender.id,
          ReviceId: this.revicer.id,
          Content: content,
          Identity: identity,
          Type: type,
          State: this.sender.onlineState ? 0 : 1,
          NoCode: noCode,
          OutTradeNo: this.revicer.outTradeNo,
          CreateDateUtc: createDate,
          Title: null,
          Description: null,
          Label: null,
          Thumbnail: null,
          NoSend: true,
        };
        this.toSendInfo(this.infoTemplate);
        if (isSendOther) this.sendMsg(this.infoTemplate);
        this.sendState = this.sender.onlineState ? false : true;
        this.sendInfo = "";
        this.toBottom(100);
      } else {
        this.showMsg("发送太快啦，请稍后再试");
      }
    },
    //2.发送信息
    sendMsg(data) {
      this.socket.emit("sendMsg", data);
      this.sendFailed(data);
    },
    //开启信息状态定时器
    sendFailed(msg) {
      this.msgTimer = setTimeout(() => {
        this.conversition.forEach((x) => {
          if (x.NoCode != null && x.NoCode == msg.NoCode) {
            x.State = -1;
          }
        });
        this.sendState = true;
      }, 20000);
    },
    //修改在线状态
    changeOnLine() {
      if (!this.sender.onlineState) {
        this.loading();
        this.socket.emit("joinChat", {
          SendId: this.sender.id,
          SendName: this.sender.name,
          ReviceId: -1,
          ReviceName: this.revicer.name,
          IsService: true,
          NoCode: this.noCode,
        });
      } else {
        //离线
        this.loading();
        this.isSelectSession = false;
        this.socket.emit("offLine", {
          SendId: this.sender.id,
          NoCode: this.noCode,
        });
      }
    },
    //呼叫客服
    callPeople() {
      this.loading();
      this.joinChat();
    },
    //加入会话
    joinChat() {
      this.socket.emit("joinChat", {
        SendId: this.sender.id,
        ReviceId: this.revicer.id,
        SendName: this.sender.name,
        ReviceName: this.revicer.name,
        IsService: this.sender.isService,
        NoCode: this.noCode,
      });
    },
    //加载动画
    loading() {
      Toast.loading({
        duration: 0,
        message: "",
        forbidClick: true,
      });
    },
    //关闭加载动画
    closeLoad() {
      Toast.clear();
    },
    //弹屏提示
    showMsg(msg) {
      Toast(msg);
    },
    //点击卡片
    openCard(id) {
      this.openProductDetail(parseInt(id));
      // let starIndex = cardXML.indexOf("?key=p");
      // if (starIndex != -1) {
      //   let id = parseInt(cardXML.substring(starIndex + 6, cardXML.length));
      //   showProductDetail(id);
      // } else {
      //   window.open(cardXML);
      // }
    },
    openProductDetail(id) {
      this.loading();
      // #### 模拟数据库取商品数据 ####
      let product = this.$store.state.productList.filter((x) => x.Id === id);
      if (product.length > 0) {
        this.productDetail = product[0];
        this.showProductDetail = true;
      }
      this.closeLoad();
    },
    //客服收到信息提醒
    playMusic() {
      let audio = document.getElementById("tipMusic");
      if (audio != null) {
        audio.currentTime = 0;
        audio.play();
      }
    },
    //切换快捷回复
    selectEasy(id) {
      if (id == this.currentEasy) {
        this.currentEasy = 0;
      } else {
        this.currentEasy = id;
      }
    },
    //点击机器人链接
    linkReply(answer, reply) {
      this.signalrService(answer, 2, 0, false);
      this.signalrService(reply, 1, 0, false);
      this.toBottom(100);
    },
    //选中快捷回复
    selectReplay(text) {
      this.sendInfo = text;
    },
    //切换客服工具
    changeState(serviceTool) {
      this.serviceTool.map((a) => {
        if (a.id == serviceTool.id) {
          a.state = true;
          this.current_state = a.id;
        } else {
          a.state = false;
        }
      });
    },
    //判断是否PC端
    isPCMethod() {
      //是否为PC端
      var userAgentInfo = navigator.userAgent;
      var Agents = [
        "Android",
        "iPhone",
        "SymbianOS",
        "Windows Phone",
        "iPad",
        "iPod",
      ];
      var flag = true;
      for (var v = 0; v < Agents.length; v++) {
        if (userAgentInfo.indexOf(Agents[v]) > 0) {
          flag = false;
          break;
        }
      }
      this.isPc = flag;
    },
    //打开表情包
    changeExpression() {
      this.expressionShow = !this.expressionShow;
    },
    //获取当前时间
    nowTime() {
      var myDate = new Date();
      //获取当前年
      var year = myDate.getFullYear();
      //获取当前月
      var month = myDate.getMonth() + 1;
      //获取当前日
      var date = myDate.getDate();
      var h = myDate.getHours(); //获取当前小时数(0-23)
      var m = myDate.getMinutes(); //获取当前分钟数(0-59)
      var s = myDate.getSeconds();
      var t = myDate.getMilliseconds();
      var now =
        year + "-" + month + "-" + date + " " + h + ":" + m + ":" + s + ":" + t;
      return now;
    },
    //客服选择会话
    selectSession(obj, type) {
      this.allowSession = type == 1 ? true : false;
      this.currentSessionPeople.forEach((item) => {
        item.IsSelect = false;
      });
      this.current_state = 1;
      this.abutmentUrl = "";
      this.lastSession = true;
      obj.IsSelect = true;
      obj.UnRead = 0;
      let revicer = this.$store.state.userList.filter(
        (x) => x.id === obj.SendId
      );
      if (revicer.length > 0) {
        this.revicer.id = revicer[0].id;
        this.revicer.nickName = revicer[0].nickName;
        this.revicer.source = revicer[0].source;
        this.revicer.mobile = revicer[0].mobile;
        this.revicer.cardNo = revicer[0].cardNo;
        this.revicer.outTradeNo = obj.OutTradeNo;
        this.revicer.name = revicer[0].name;
        this.isSelectSession = true;
        this.pageIndex = 1;
        this.socket.emit("changeMsgRead", obj.OutTradeNo);
      }
    },
    //发送消息模板
    toSendInfo(data) {
      /*
       * identity:【0：机器人】【1：客服】 【2：顾客】
       * type:【0:文本】 【1:图片】 【2:表情】 【3:商品卡片/订单卡片】
       * */
      this.conversition.push({
        SendId: data.SendId,
        ReviceId: data.ReviceId,
        Content: data.Content,
        Identity: data.Identity,
        Type: data.Type,
        State: data.State,
        NoCode: data.NoCode,
        OutTradeNo: data.OutTradeNo,
        CreateDateUtc: data.CreateDate,
        Title: data.Title,
        Description: data.Description,
        Label: data.Label,
        Thumbnail: data.Thumbnail,
        noSend: true,
      });
      this.toBottom(100);
    },
    //打开更多功能
    openMore(type) {
      switch (type) {
        case "input":
          this.moreTool = false;
          this.expressionShow = false;
          this.changeHeight();
          this.toBottom(100);
          break;
        case "tool":
          this.expressionShow = false;
          this.moreTool = !this.moreTool;
          this.changeHeight();
          this.toBottom(100);
          break;
        case "expression":
          this.moreTool = false;
          this.expressionShow = !this.expressionShow;
          this.changeHeight();
          this.toBottom(100);
          break;
      }
    },
    //自适应高度
    changeHeight() {
      var height = document.body.clientHeight;
      setTimeout(() => {
        var floatHeight = document.getElementById("floatDiv").offsetHeight;
        document.getElementById("ChatContent").style.height =
          height - floatHeight + "px";
        this.toBottom(100);
      }, 100);
    },
    //回到底部
    toBottom(time) {
      setTimeout(() => {
        if (this.sender.isService) {
          let RightCont = document.getElementById("RightCont");
          if (RightCont != null) {
            let scrollHeight2 = RightCont.scrollHeight;
            RightCont.scrollTop = scrollHeight2;
          }
        } else {
          let chatContent = document.getElementById("ChatContent");
          let scrollHeight = chatContent.scrollHeight;
          chatContent.scrollTop = scrollHeight;
        }
      }, time);
      clearTimeout();
    },
    //机器人聊天
    sendToRobot() {
      if (this.sendInfo != "") {
        let createDate = this.nowTime();
        let noCode = +new Date();
        let content = this.sendInfo;
        this.sendInfo = "";
        this.infoTemplate = {
          SendId: this.sender.id,
          ReviceId: 0,
          Content: content,
          Identity: 2,
          Type: 0,
          State: 0,
          NoCode: noCode,
          OutTradeNo: null,
          CreateDateUtc: createDate,
          Title: null,
          Description: null,
          Label: null,
          Thumbnail: null,
          NoSend: true,
        };
        this.toSendInfo(this.infoTemplate);
        this.toBottom(100);
        this.socket.emit("sendToRobot", this.infoTemplate);
        this.sendFailed(this.infoTemplate);
      } else {
        return null;
      }
    },
    //关闭商品详情
    onCloseProduct() {
      this.showProductDetail = false;
    },
    //关闭评价
    onCloseComment() {
      this.showComment = false;
    },
    //加载更多
    loadMore() {
      /*
       * ##发起请求获取更多聊天记录
       */
      this.showMsg("发起请求获取更多聊天记录");
    },
    //改变评分
    changeLevel(item, index) {
      for (var i = 0; i < this.start.length; i++) {
        if (i <= index) {
          this.start[i].state = true;
        } else {
          this.start[i].state = false;
        }
      }
      this.level = item.level;
    },
    //已解决或未解决
    onClickSelect(index) {
      for (var i = 0; i < this.solveState.length; i++) {
        this.solveState[i].state = false;
      }
      this.solveState[index].state = !this.solveState[index].state;
      this.solveResult = this.solveState[index].value;
    },
    //提交评价
    sumbitComment() {
      this.loading();
      /*
       * ##发起请求提交评价
       */
      this.showComment = false;
      this.showMsg("发起请求提交评价");
    },
    //提交留言
    sumbitMessage() {
      /*
       * ##发起请求获取留言信息
       */
      this.showMsg("发起请求提交留言");
      this.customerMessage = "";
      this.showMessage = false;
    },
    //留言与留言记录的切换
    changeMessageType(flat) {
      this.messageType = flat;
      if (!flat) {
        /*
         * ##发起请求获取留言信息
         */
        this.showMsg("发起请求获取留言信息");
        this.messageList = this.$store.state.messageList;
      }
    },
    //查看留言详情
    seeMessageDetail(message) {
      if (message.State != 3) {
        /*
         * ##发起请求修改数据库留言状态
         */
        this.showMsg("发起请求修改数据库留言状态");
      }
      message.State = 4;
    },
    //修改客服昵称
    changName() {
      this.changeUserName = false;
      if (this.temporaryUserName == "") {
        this.temporaryUserName = this.sender.name;
        this.showMsg("客服昵称不得为空");
      } else {
        /*
         * ##发起请求修改数据库客服昵称
         */
        this.showMsg("发起请求修改数据库客服昵称");
        //this.sender.name = this.temporaryUserName;
      }
    },
    //修改接待人数
    changNumber() {
      this.changeReceptNumber = false;
      if (this.temporaryReceptNumber <= 0) {
        this.temporaryReceptNumber = this.receptNumber;
        this.showMsg("接待人数必须大于0");
      } else {
        /*
         * ##发起请求修改数据库接待人数
         */
        this.showMsg("发起请求修改数据库接待人数");
        //this.sender.receptNum = this.temporaryReceptNumber;
      }
    },
    //关闭会员会话
    closeSeesion(session) {
      this.socket.emit("closeSeesion", {
        SendId: session.SendId,
        OutTradeNo: session.OutTradeNo,
      });
    },
    //客服关闭离线会话
    removeOffLine(session, event) {
      if (event) {
        event.stopPropagation
          ? event.stopPropagation()
          : (event.cancelBubble = true);
      }
      for (let index in this.offLineSessionPeople) {
        if (this.offLineSessionPeople[index].SendId == session.SendId) {
          this.offLineSessionPeople.splice(index, 1);
        }
      }
    },
    //打开卡片链接
    toUrl(url) {
      window.open(url);
    },
    //会员发送卡片给客服
    sendCard(item) {
      if (item.noSend) {
        item.noSend = !item.noSend;
        this.socket.emit("sendMsg", item);
      } else {
        this.showMsg("已发送");
      }
    },
  },
};
</script>

<style scoped>
@import url("../assets/CSS/chat.css");
@import url("../assets/CSS/service.css");
</style>