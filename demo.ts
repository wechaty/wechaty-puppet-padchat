const webSocket = require('ws')
const fs = require("fs")

const parseJson = require('parse-json')

// const piBuff = fs.readFileSync('./pic/intro.jpeg')
// const imgBuff = new Buffer(piBuff).toString('base64')

// user_name 作为唯一识别码，这个Object 中获取不到微信号，比如能获取到李佳芮的是`qq512436430`,但是获取不到微信号 `ruirui_0914`
export interface IpadContactRawPayload {
  big_head:           string, // "http://wx.qlogo.cn/mmhead/ver_1/y35kAtILvuLr7jntoxRJOnm5SbGjf4g3ALzUHNjK15QRG6hQsw8HBqFQpmKKDN4lIPvBgGscP22jXUruW3LBnA/0",
  bit_mask:           number, // 4294967295,
  bit_value:          number, // 1,
  chatroom_id:        0       // 0,
  chatroom_owner:     '',     // ''
  city:               string, // 'Haidian'
  continue:           number, // 1,
  country:            string, // "CN"
  id:                 number, // 0,
  img_flag:           number, // 1 || 2, don't know why
  intro:              string, // "",
  label:              string, // "",
  level:              number, // 5,7, don't know why
  max_member_count:   number, // 0,

  // Tips: Only Room has this, Contact don't have [member] para.
  member?:            string, // "[\"mengjunjun001\",\"wxid_6n6wxgvc6dqm22\",\"wxid_m1gvp4237gwl22\",\"a28221798\",\"wxid_ig0fbgf5k5th21\",\"wxid_tgvzoqe1c4612\"]\n"
  
  member_count:       number, // 0,
  msg_type:           number, // 2: Contact Or Room whole content
  nick_name:          string, // "梦君君", Contact:用户昵称， Room: 群昵称
  provincia:          string, // "Beijing",
  py_initial:         string, // "MJJ",
  quan_pin:           string, // "mengjunjun",
  remark:             string, // "女儿",
  remark_py_initial:  string, // "nver",
  remark_quan_pin:    string, // "NE",
  sex:                number, // 2 Female, 1 Male, 0 Not Known
  signature:          string, // "且行且珍惜",
  small_head:         string, // "http://wx.qlogo.cn/mmhead/ver_1/feicWsQuUVrib0F69hXEkTiaMqsNKqurKGNFxOACN7jZZWM4CynGX0K3gK0OgKfCib8D8DUNrIfNRHWOF4pwYTRhLw/132",
  source:             number, // 14, // 0, 14, don't know why
  status:             number, // 1, don't know why
  stranger:           string, // "v1_0468f2cd3f0efe7ca2589d57c3f9ba952a3789e41b6e78ee00ed53d1e6096b88@stranger",
  uin:                number, // 324216852,
  user_name:          string, // "mengjunjun001" | "qq512436430" Unique name
}

const userId = 'test'
const msgId = 'abc231923912983'

const init = {
  "userId": userId,
  "msgId":  msgId,
  "apiName": "init",
  "param": []
}

const WXInitialize = {
  "userId": userId,
  "msgId":  msgId,
  "apiName": "WXInitialize",
  "param": []
}

const WXGetQRCode = {
  "userId": userId,
  "msgId":  msgId,
  "apiName": "WXGetQRCode",
  "param": []
}

const WXCheckQRCode = {
  "userId": userId,
  "msgId":  msgId,
  "apiName": "WXCheckQRCode",
  "param": []
}

const WXHeartBeat = {
  "userId": userId,
  "msgId":  msgId,
  "apiName": "WXHeartBeat",
  "param": []
}

const WXSyncContact = {
  "userId": userId,
  "msgId":  msgId,
  "apiName": "WXSyncContact",
  "param": []
}

// 生成62
const WXGenerateWxDat = {
  "userId": userId,
  "msgId":  msgId,
  "apiName": "WXGenerateWxDat",
  "param": []
}

// 加载62
let WXLoadWxDat = {
  "userId": userId,
  "msgId":  msgId,
  "apiName": "WXLoadWxDat",
  "param": []
}

// 获取登陆token
const WXGetLoginToken = {
  "userId": userId,
  "msgId":  msgId,
  "apiName": "WXGetLoginToken",
  "param": []
}

// 断线重连
const WXAutoLogin = {
  "userId": userId,
  "msgId":  msgId,
  "apiName": "WXAutoLogin",
  "param": []
}

// 二次登陆
const WXLoginRequest = {
  "userId": userId,
  "msgId":  msgId,
  "apiName": "WXLoginRequest",
  "param": []
}

// 发送文本消息
let WXSendMsg = {
  "userId": userId,
  "msgId":  msgId,
  "apiName": "WXSendMsg",
  "param": []
}

let botWs

let user_name
let nick_name
let password

let contactSync = false

let autoData = {
  wxData: '',
  token: '',
  user_name: '',
  nick_name: ''
}

let IpadContactRawPayloadMap = new Map<string, IpadContactRawPayload>()

const connect = async function() {
  await initConfig()
  botWs = new webSocket("ws://101.132.129.155:9091/wx", { perMessageDeflate: true })
  
  botWs.on("open", function open() {
    try {
      botWs.send(JSON.stringify(init))
      botWs.send(JSON.stringify(WXInitialize))

      // 判断存62 的地方有没有62，如果有 WXLoadWxDat，加载，如果没有，就算了
      if (autoData.wxData) {
        console.log(`$$$$$$$$$$ 发现的62数据 $$$$$$$$$$`)
        WXLoadWxDat.param = [encodeURIComponent(autoData.wxData)]
        botWs.send(JSON.stringify(WXLoadWxDat))
      }
      
      if (autoData.token) {
        console.log(`$$$$$$$$$$ 发现${autoData.nick_name} token $$$$$$$$$$`)
        // 断线重连
        console.log('尝试断线重连')
        WXAutoLogin.param = [encodeURIComponent(autoData.token)]
        console.log(encodeURIComponent(autoData.token))
        botWs.send(JSON.stringify(WXAutoLogin))

      } else {
        botWs.send(JSON.stringify(WXGetQRCode))
      }

    } catch (error) {
      console.error(error)
      throw (error)
    }
  })
  
  botWs.on("message", async function incoming(data) {
    
    let allData = JSON.parse(data)
    console.log('========== New Message ==========')

    console.log(allData)
    console.log(allData.apiName)
    console.log(decodeURIComponent(allData.data))

    // 断线重连
    if (allData.apiName === 'WXAutoLogin') {
      if (!allData.data) {
        console.log('获取WXAutoLogin 的data 是空')
        botWs.send(JSON.stringify(WXGetQRCode))
        return
      }

      const decodeData = JSON.parse(decodeURIComponent(allData.data))
      if (decodeData.status === 0) {
        console.log(`${autoData.nick_name} 断线重连成功`)
        user_name = decodeData.user_name

        // 登陆成功
        loginSucceed()

      } else {
        // 二次登陆, token 有效
        WXLoginRequest.param = [encodeURIComponent(autoData.token)]
        botWs.send(JSON.stringify(WXLoginRequest))
      }
    }

    if (allData.apiName === 'WXLoginRequest') {
      const decodeData = JSON.parse(decodeURIComponent(allData.data))
      
      if (decodeData.status === 0) {
        // 判断是否点击确定登陆
        console.log('二次登陆判断二维码状态')
        checkQrcode(allData)
      } else {
        botWs.send(JSON.stringify(WXGetQRCode))
      }
    }

    if (allData.apiName === 'WXGetQRCode') {
      const decodeData = decodeURIComponent(allData.data)
      const qrcode = parseJson(decodeData)
      console.log('get qrcode')
      checkQrcode(allData)
      fs.writeFile("demo.jpg", qrcode.qr_code, "base64", async function (err, data) {
        if (err) throw err
      })
    }

    // 判断扫码状态
    if (allData.apiName === 'WXCheckQRCode') {
      const qrcodeStatus = JSON.parse(decodeURIComponent(allData.data))
      if (qrcodeStatus.status === 0) {
        console.log('尚未扫码！')
        setTimeout(() => {
          botWs.send(JSON.stringify(WXCheckQRCode))
        }, 3 * 1000)
        return
      }

      if (qrcodeStatus.status === 1) {
        console.log('已扫码，尚未登陆')
        setTimeout(() => {
          botWs.send(JSON.stringify(WXCheckQRCode))
        }, 3 * 1000)
        return
      }

      if (qrcodeStatus.status === 2) {
        console.log('正在登陆中。。。')
        user_name = qrcodeStatus.user_name
        nick_name = qrcodeStatus.nick_name
        password = qrcodeStatus.password
        const WXQRCodeLogin = {
          "userId": userId,
          "msgId":  msgId,
          "apiName": "WXQRCodeLogin",
          "param": [encodeURIComponent(user_name), encodeURIComponent(password)]
        }
        botWs.send(JSON.stringify(WXQRCodeLogin))
        return
      }

      if (qrcodeStatus.status === 3) {
        console.log('超时')
       
        return
      }

      if (qrcodeStatus.status === 4) {
        console.log('取消操作了，重新获取二维码')
      
        return
      }
    }

    if (allData.apiName === 'WXGetLoginToken') {
      const tokenObj = JSON.parse(decodeURIComponent(allData.data))
      if (tokenObj.token && tokenObj.status === 0) {
        console.log('录入token' + tokenObj.token)
        autoData.token = tokenObj.token
      }
    }

    if (allData.apiName === 'WXGenerateWxDat') {
      const wxDataObj = JSON.parse(decodeURIComponent(allData.data))
      if (wxDataObj.data && wxDataObj.status === 0) {
        console.log('录入62数据' + wxDataObj.data)
        autoData.wxData = wxDataObj.data
      }
    }

    if (allData.apiName === 'WXQRCodeLogin') {
      const qrcodeStatus = JSON.parse(decodeURIComponent(allData.data))
      // 还有其他的，看报错原因，比如-3是账号密码错误
      if (qrcodeStatus.status === 0) {
        console.log('登陆成功！')
        user_name = qrcodeStatus.user_name
        nick_name = qrcodeStatus.nick_name

        // 登陆成功
        loginSucceed()

        return
      }

      if (qrcodeStatus.status === -301) {
        console.log('301重定向')
        const WXQRCodeLogin = {
          "userId": userId,
          "msgId":  msgId,
          "apiName": "WXQRCodeLogin",
          "param": [encodeURIComponent(user_name), encodeURIComponent(password)]
        }
        botWs.send(JSON.stringify(WXQRCodeLogin))
        return
      }
      
    }

    // 循环调用 WXSyncContact
    if (allData.apiName === 'WXSyncContact' && contactSync === false) {
      if (!allData.data) {
        console.log('allData 没有data 了, 加载完成')
        contactSync = true
        WXSendMsg.param = [encodeURIComponent(user_name), encodeURIComponent('通讯录同步完成'), '']
        botWs.send(JSON.stringify(WXSendMsg))
        return
      }

      const contactStatus = JSON.parse(decodeURIComponent(allData.data))

      // msg_type: 2 才是通讯录消息，如果是其他的是文字消息、音频消息，同 MSG_TYPE
      if (Array.isArray(contactStatus)) {
        contactStatus.forEach(element => {
          if (element.continue === 0) {
            contactSync = true
            saveToJson(IpadContactRawPayloadMap)
            console.log('continue 为0 加载完成')
            WXSendMsg.param = [encodeURIComponent(user_name), encodeURIComponent('通讯录同步完成'), '']
            botWs.send(JSON.stringify(WXSendMsg))
            return
          }

          if (element.continue === 1) {
            if (element.msg_type === 2) {
              IpadContactRawPayloadMap.set(element.user_name, element as IpadContactRawPayload)
            }
          }
          
        })

        console.log('############### 继续加载 ###############')
        setTimeout(function() {
          botWs.send(JSON.stringify(WXSyncContact))
        }, 3 * 1000)


      } else {
        console.log('出错啦! contactStatus 不是数组')
        setTimeout(function() {
          botWs.send(JSON.stringify(WXSyncContact))
        }, 3 * 1000)
      }
    }

  })

  botWs.on('error', (error) => {
    console.error('============= detect error =============')
    connect()
    throw Error(error)
  })

  botWs.on('close', () => {
    console.error('============= detect close =============')
    connect()
  })

}  

try {
  connect()
} catch (error) {
  console.error('Connect to Ws occur error')
  throw(error)
}

async function initConfig() {
  // 获取62数据和token
  try {
    const tmpBuf = await fs.readFileSync('./config.json')
    const data = JSON.parse(String(tmpBuf))
    autoData.wxData = data.wxData
    autoData.token = data.token
    console.log(`载入设备参数与自动登陆数据：%o + ${JSON.stringify(autoData)}`)
  } catch (e) {
    console.log('没有在本地发现设备登录参数或解析数据失败！如首次登录请忽略！')
  }
}

function checkQrcode(allData) {
  console.log('begin to checkQrcode')
  botWs.send(JSON.stringify(WXCheckQRCode))
  if (allData.status === 0) {
    console.log('尚未扫码！')
    setTimeout(() => {
      botWs.send(JSON.stringify(WXCheckQRCode))
    }, 1000)
    return
  }
  if (allData.status === 1) {
    console.log('已扫码，尚未登陆')
    setTimeout(() => {
      botWs.send(JSON.stringify(WXCheckQRCode))
    }, 1000)
    return
  }
  if (allData.status === 2) {
    console.log('正在登陆中。。。')

    return
  }
  if (allData.status === 3) {

  }
  if (allData.status === 4) {

  }
}


function saveToJson(rawPayload: Map<string, IpadContactRawPayload>) {
  let rawPayloadJson = {}
  rawPayload.forEach((value , key) =>{
    rawPayloadJson[key] = value
  })

  fs.writeFileSync('./contact.json', JSON.stringify(rawPayloadJson, null, 2))
  console.log('已写入json file 中')
}

function saveConfig(){
  if (autoData.wxData && autoData.token) {
    fs.writeFileSync('./config.json', JSON.stringify(autoData, null, 2))
    console.log('已写入config file 中')
  } else {
    console.log('数据不全，稍后重新录入')
    console.log(autoData)
    setTimeout(saveConfig, 2 * 1000)
  }
}

function loginSucceed() {
  // 设置心跳
  botWs.send(JSON.stringify(WXHeartBeat))
  autoData.token = ''
  botWs.send(JSON.stringify(WXGetLoginToken))
  WXSendMsg.param = [encodeURIComponent(user_name), encodeURIComponent('ding'), '']
  botWs.send(JSON.stringify(WXSendMsg))

  // 判断是否有62，如果没有，就调用。 第一次调用的时候，在这里存62数据
  if (!autoData.wxData || autoData.user_name !== user_name) {
    console.log('没有62数据，或者62数据和wxid 不符合')
    autoData.user_name = user_name
    autoData.nick_name = nick_name
    botWs.send(JSON.stringify(WXGenerateWxDat))
  }

  saveConfig()

  WXSendMsg.param = [encodeURIComponent(user_name), encodeURIComponent('我上线了'), '']
  botWs.send(JSON.stringify(WXSendMsg))

  // 同步通讯录
  botWs.send(JSON.stringify(WXSyncContact))
}