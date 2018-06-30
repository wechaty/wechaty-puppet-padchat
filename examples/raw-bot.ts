const webSocket = require('ws')
const fs = require('fs')
import * as uuidV4        from 'uuid/v4'

// userName 作为唯一识别码，这个Object 中获取不到微信号，比如能获取到李佳芮的是`qq512436430`,但是获取不到微信号 `ruirui_0914`
export interface IpadContactRawPayload {
  big_head:           string, // 'http://wx.qlogo.cn/mmhead/ver_1/y35kAtILvuLr7jntoxRJOnm5SbGjf4g3ALzUHNjK15QRG6hQsw8HBqFQpmKKDN4lIPvBgGscP22jXUruW3LBnA/0',
  bit_mask:           number, // 4294967295,
  bit_value:          number, // 1,
  chatroom_id:        0       // 0,
  chatroom_owner:     '',     // ''
  city:               string, // 'Haidian'
  continue:           number, // 1,
  country:            string, // 'CN'
  id:                 number, // 0,
  img_flag:           number, // 1 || 2, don't know why
  intro:              string, // '',
  label:              string, // '',
  level:              number, // 5,7, don't know why
  max_member_count:   number, // 0,

  // Tips: Only Room has this, Contact don't have [member] para.
  member?:            string, // '[\'mengjunjun001\',\'wxid_6n6wxgvc6dqm22\',\'wxid_m1gvp4237gwl22\',\'a28221798\',\'wxid_ig0fbgf5k5th21\',\'wxid_tgvzoqe1c4612\']\n'

  member_count:       number, // 0,
  msg_type:           number, // 2: Contact Or Room whole content
  nickName:          string, // '梦君君', Contact:用户昵称， Room: 群昵称
  provincia:          string, // 'Beijing',
  py_initial:         string, // 'MJJ',
  quan_pin:           string, // 'mengjunjun',
  remark:             string, // '女儿',
  remark_py_initial:  string, // 'nver',
  remark_quan_pin:    string, // 'NE',
  sex:                number, // 2 Female, 1 Male, 0 Not Known
  signature:          string, // '且行且珍惜',
  small_head:         string, // 'http://wx.qlogo.cn/mmhead/ver_1/feicWsQuUVrib0F69hXEkTiaMqsNKqurKGNFxOACN7jZZWM4CynGX0K3gK0OgKfCib8D8DUNrIfNRHWOF4pwYTRhLw/132',
  source:             number, // 14, // 0, 14, don't know why
  status:             number, // 1, don't know why
  stranger:           string, // 'v1_0468f2cd3f0efe7ca2589d57c3f9ba952a3789e41b6e78ee00ed53d1e6096b88@stranger',
  uin:                number, // 324216852,
  userName:          string, // 'mengjunjun001' | 'qq512436430' Unique name
}

const userId = 'test'
const msgId = 'abc231923912983'

const init = {
  userId,
  msgId:  uuidV4(),
  apiName: 'init',
  param: [],
}

const wXInitialize = {
  userId,
  msgId:  uuidV4(),
  apiName: 'wXInitialize',
  param: [],
}

const wXGetQRCode = {
  userId,
  msgId:  uuidV4(),
  apiName: 'wXGetQRCode',
  param: [],
}

const wXCheckQRCode = {
  userId,
  msgId:  uuidV4(),
  apiName: 'wXCheckQRCode',
  param: [],
}

const wXHeartBeat = {
  userId,
  msgId:  uuidV4(),
  apiName: 'wXHeartBeat',
  param: [],
}

const wXSyncContact = {
  userId,
  msgId:  uuidV4(),
  apiName: 'wXSyncContact',
  param: [],
}

// 生成62
const wXGenerateWxDat = {
  userId,
  msgId:  uuidV4(),
  apiName: 'wXGenerateWxDat',
  param: [],
}

// 加载62
const wXLoadWxDat = {
  userId,
  msgId:  uuidV4(),
  apiName: 'wXLoadWxDat',
  param: [],
}

// 获取登陆token
const wXGetLoginToken = {
  userId,
  msgId:  uuidV4(),
  apiName: 'wXGetLoginToken',
  param: [],
}

// 断线重连
const wXAutoLogin = {
  userId,
  msgId:  uuidV4(),
  apiName: 'wXAutoLogin',
  param: [],
}

// 二次登陆
const wXLoginRequest = {
  userId,
  msgId:  uuidV4(),
  apiName: 'wXLoginRequest',
  param: [],
}

// 发送文本消息
const wXSendMsg = {
  userId,
  msgId:  uuidV4(),
  apiName: 'wXSendMsg',
  param: [],
}

// 获取联系人信息
const wXGetContact = {
  userId,
  msgId:  uuidV4(),
  apiName: 'wXGetContact',
  param: [],
}

// 获取联系人信息
const wXSearchContact = {
  userId,
  msgId:  uuidV4(),
  apiName: 'wXSearchContact',
  param: [],
}

let botWs

let userName
let nickName
let password

let contactSync = false

const autoData = {
  wxData: '',
  token: '',
  userName: '',
  nickName: '',
}

const ipadContactRawPayloadMap = new Map<string, IpadContactRawPayload>()

const connect = async function () {
  await initConfig()
  botWs = new webSocket('ws://101.132.129.155:9091/wx', { perMessageDeflate: true })

  botWs.on('open', function open () {
    try {
      botWs.send(JSON.stringify(init))
      console.log('SEND: ' + JSON.stringify(init))

      botWs.send(JSON.stringify(wXInitialize))
      console.log('SEND: ' + JSON.stringify(wXInitialize))

      // 判断存62 的地方有没有62，如果有 wXLoadWxDat，加载，如果没有，就算了
      if (autoData.wxData) {
        console.log(`$$$$$$$$$$ 发现的62数据 $$$$$$$$$$`)
        wXLoadWxDat.param = [encodeURIComponent(autoData.wxData)]

        botWs.send(JSON.stringify(wXLoadWxDat))
        console.log('SEND: ' + JSON.stringify(wXLoadWxDat))
      }

      if (autoData.token) {
        console.log(`$$$$$$$$$$ 发现${autoData.nickName} token $$$$$$$$$$`)
        // 断线重连
        console.log('尝试断线重连')
        wXAutoLogin.param = [encodeURIComponent(autoData.token)]
        console.log(encodeURIComponent(autoData.token))
        botWs.send(JSON.stringify(wXAutoLogin))
        console.log('SEND: ' + JSON.stringify(wXAutoLogin))

      } else {
        botWs.send(JSON.stringify(wXGetQRCode))
        console.log('SEND: ' + JSON.stringify(wXGetQRCode))
      }

    } catch (error) {
      console.error(error)
      throw (error)
    }
  })

  botWs.on('message', async function incoming (data) {

    const allData = JSON.parse(data)
    console.log('========== New Message ==========')

    console.log(allData)
    console.log(allData.apiName)
    console.log(decodeURIComponent(allData.data))

    // 断线重连
    if (allData.apiName === 'wXAutoLogin') {
      if (!allData.data) {
        console.log('获取wXAutoLogin 的data 是空')

        botWs.send(JSON.stringify(wXGetQRCode))
        console.log('SEND: ' + JSON.stringify(wXGetQRCode))

        return
      }

      const decodeData = JSON.parse(decodeURIComponent(allData.data))
      if (decodeData.status === 0) {
        console.log(`${autoData.nickName} 断线重连成功`)
        userName = decodeData.userName

        // 登陆成功
        loginSucceed()

      } else {
        // 二次登陆, token 有效
        wXLoginRequest.param = [encodeURIComponent(autoData.token)]
        botWs.send(JSON.stringify(wXLoginRequest))
        console.log('SEND: ' + JSON.stringify(wXLoginRequest))
      }
    }

    if (allData.apiName === 'wXLoginRequest') {
      if (!allData.data) {
        console.log('no wXLoginRequest data, token 过期')

        botWs.send(JSON.stringify(wXGetQRCode))
        console.log('SEND: ' + JSON.stringify(wXGetQRCode))
        return
      }
      const decodeData = JSON.parse(decodeURIComponent(allData.data))

      if (decodeData.status === 0) {
        // 判断是否点击确定登陆
        console.log('二次登陆判断二维码状态')
        checkQrcode(allData)
      } else {
        botWs.send(JSON.stringify(wXGetQRCode))
        console.log('SEND: ' + JSON.stringify(wXGetQRCode))
      }
    }

    if (allData.apiName === 'wXGetQRCode') {
      if (!allData.data) {
        console.log('cannot get wXGetQRCode')

        botWs.send(JSON.stringify(wXInitialize))
        console.log('SEND: ' + JSON.stringify(wXInitialize))

        botWs.send(JSON.stringify(wXGetQRCode))
        console.log('SEND: ' + JSON.stringify(wXGetQRCode))
        return
      }
      const decodeData = decodeURIComponent(allData.data)
      const qrcode = JSON.parse(decodeData)
      console.log('get qrcode')
      checkQrcode(allData)
      fs.writeFile('demo.jpg', qrcode.qr_code, 'base64', async function (err) {
        if (err) throw err
      })
    }

    // 判断扫码状态
    if (allData.apiName === 'wXCheckQRCode') {
      const qrcodeStatus = JSON.parse(decodeURIComponent(allData.data))
      if (qrcodeStatus.status === 0) {
        console.log('尚未扫码！')
        setTimeout(() => {
          botWs.send(JSON.stringify(wXCheckQRCode))
          console.log('SEND: ' + JSON.stringify(wXCheckQRCode))
        }, 3 * 1000)
        return
      }

      if (qrcodeStatus.status === 1) {
        console.log('已扫码，尚未登陆')
        setTimeout(() => {
          botWs.send(JSON.stringify(wXCheckQRCode))
          console.log('SEND: ' + JSON.stringify(wXCheckQRCode))
        }, 3 * 1000)
        return
      }

      if (qrcodeStatus.status === 2) {
        console.log('正在登陆中。。。')
        userName = qrcodeStatus.userName
        nickName = qrcodeStatus.nickName
        password = qrcodeStatus.password
        const wXQRCodeLogin = {
          userId,
          msgId,
          apiName: 'wXQRCodeLogin',
          param: [encodeURIComponent(userName), encodeURIComponent(password)],
        }
        botWs.send(JSON.stringify(wXQRCodeLogin))
        console.log('SEND: ' + JSON.stringify(wXQRCodeLogin))
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

    if (allData.apiName === 'wXGetLoginToken') {
      const tokenObj = JSON.parse(decodeURIComponent(allData.data))
      if (tokenObj.token && tokenObj.status === 0) {
        console.log('录入token' + tokenObj.token)
        autoData.token = tokenObj.token
      }
    }

    if (allData.apiName === 'wXGenerateWxDat') {
      const wxDataObj = JSON.parse(decodeURIComponent(allData.data))
      if (wxDataObj.data && wxDataObj.status === 0) {
        console.log('录入62数据' + wxDataObj.data)
        autoData.wxData = wxDataObj.data
      }
    }

    if (allData.apiName === 'wXQRCodeLogin') {
      const qrcodeStatus = JSON.parse(decodeURIComponent(allData.data))
      // 还有其他的，看报错原因，比如-3是账号密码错误
      if (qrcodeStatus.status === 0) {
        console.log('登陆成功！')
        userName = qrcodeStatus.userName
        nickName = qrcodeStatus.nickName

        // 登陆成功
        loginSucceed()

        return
      }

      if (qrcodeStatus.status === -301) {
        console.log('301重定向')
        const wXQRCodeLogin = {
          userId,
          msgId,
          apiName: 'wXQRCodeLogin',
          param: [encodeURIComponent(userName), encodeURIComponent(password)],
        }
        botWs.send(JSON.stringify(wXQRCodeLogin))
        console.log('SEND: ' + JSON.stringify(wXQRCodeLogin))
        return
      }

    }

    // 循环调用 wXSyncContact
    if (allData.apiName === 'wXSyncContact' && contactSync === false) {
      if (!allData.data) {
        console.log('allData 没有data 了, 加载完成')
        contactSync = true
        wXSendMsg.param = [encodeURIComponent(userName), encodeURIComponent('通讯录同步完成'), '']
        botWs.send(JSON.stringify(wXSendMsg))
        console.log('SEND: ' + JSON.stringify(wXSendMsg))
        return
      }

      const contactStatus = JSON.parse(decodeURIComponent(allData.data))

      // msg_type: 2 才是通讯录消息，如果是其他的是文字消息、音频消息，同 MSG_TYPE
      if (Array.isArray(contactStatus)) {
        contactStatus.forEach(element => {
          if (element.continue === 0) {
            contactSync = true
            saveToJson(ipadContactRawPayloadMap)
            console.log('continue 为0 加载完成')
            wXSendMsg.param = [encodeURIComponent(userName), encodeURIComponent('通讯录同步完成'), '']
            botWs.send(JSON.stringify(wXSendMsg))
            console.log('SEND: ' + JSON.stringify(wXSendMsg))
            return
          }

          if (element.continue === 1) {
            if (element.msg_type === 2) {
              ipadContactRawPayloadMap.set(element.userName, element as IpadContactRawPayload)
            }
          }

        })

        console.log('############### 继续加载 ###############')
        setTimeout(function () {
          botWs.send(JSON.stringify(wXSyncContact))
          console.log('SEND: ' + JSON.stringify(wXSyncContact))
        }, 3 * 1000)

      } else {
        console.log('出错啦! contactStatus 不是数组')
        setTimeout(function () {
          botWs.send(JSON.stringify(wXSyncContact))
          console.log('SEND: ' + JSON.stringify(wXSyncContact))
        }, 3 * 1000)
      }
    }

  })

  botWs.on('error', async (error) => {
    console.error('============= detect error =============')
    await connect()
    throw Error(error)
  })

  botWs.on('close', async () => {
    console.error('============= detect close =============')
    await connect()
  })

}

try {
  setTimeout(async () => {
    await connect()
  }, 1)
} catch (error) {
  console.error('Connect to Ws occur error')
  throw(error)
}

async function initConfig () {
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

function checkQrcode (allData) {
  console.log('begin to checkQrcode')
  botWs.send(JSON.stringify(wXCheckQRCode))
  console.log('SEND: ' + JSON.stringify(wXCheckQRCode))

  if (allData.status === 0) {
    console.log('尚未扫码！')
    setTimeout(() => {
      botWs.send(JSON.stringify(wXCheckQRCode))
      console.log('SEND: ' + JSON.stringify(wXCheckQRCode))
    }, 1000)
    return
  }
  if (allData.status === 1) {
    console.log('已扫码，尚未登陆')
    setTimeout(() => {
      botWs.send(JSON.stringify(wXCheckQRCode))
      console.log('SEND: ' + JSON.stringify(wXCheckQRCode))
    }, 1000)
    return
  }
  if (allData.status === 2) {
    console.log('正在登陆中。。。')

    return
  }
  if (allData.status === 3) {
    return
  }
  if (allData.status === 4) {
    return
  }
}

function saveToJson (rawPayload: Map<string, IpadContactRawPayload>) {
  const rawPayloadJson = {}
  rawPayload.forEach((value , key) => {
    rawPayloadJson[key] = value
  })

  fs.writeFileSync('./contact.json', JSON.stringify(rawPayloadJson, null, 2))
  console.log('已写入json file 中')
}

function saveConfig () {
  if (autoData.wxData && autoData.token) {
    fs.writeFileSync('./config.json', JSON.stringify(autoData, null, 2))
    console.log('已写入config file 中')
  } else {
    console.log('数据不全，稍后重新录入')
    console.log(autoData)
    setTimeout(saveConfig, 2 * 1000)
  }
}

function loginSucceed () {
  // 设置心跳
  botWs.send(JSON.stringify(wXHeartBeat))
  console.log('SEND: ' + JSON.stringify(wXHeartBeat))

  autoData.token = ''
  botWs.send(JSON.stringify(wXGetLoginToken))
  console.log('SEND: ' + JSON.stringify(wXGetLoginToken))

  wXSendMsg.param = [encodeURIComponent(userName), encodeURIComponent('ding'), '']
  botWs.send(JSON.stringify(wXSendMsg))
  console.log('SEND: ' + JSON.stringify(wXSendMsg))

  // 判断是否有62，如果没有，就调用。 第一次调用的时候，在这里存62数据
  if (!autoData.wxData || autoData.userName !== userName) {
    console.log('没有62数据，或者62数据和wxid 不符合')
    autoData.userName = userName
    autoData.nickName = nickName
    botWs.send(JSON.stringify(wXGenerateWxDat))
    console.log('SEND: ' + JSON.stringify(wXGenerateWxDat))

  }

  saveConfig()

  wXSendMsg.param = [encodeURIComponent(userName), encodeURIComponent('我上线了'), '']
  botWs.send(JSON.stringify(wXSendMsg))
  console.log('SEND: ' + JSON.stringify(wXSendMsg))

  // 同步通讯录
  botWs.send(JSON.stringify(wXSyncContact))
  console.log('SEND: ' + JSON.stringify(wXSyncContact))

  // console.log(' wXGetContact done !!!! qq512436430')
  // wXGetContact.param = [encodeURIComponent('qq512436430')]
  // botWs.send(JSON.stringify(wXGetContact))
  // console.log('SEND: ' + JSON.stringify(wXGetContact))

  // console.log(' wXGetContact done !!!! fake 11111')
  // wXGetContact.param = [encodeURIComponent('11111')]
  // botWs.send(JSON.stringify(wXGetContact))
  // console.log('SEND: ' + JSON.stringify(wXGetContact))

  // console.log(' wXSearchContact done !!!! qq512436430')
  // wXSearchContact.param = [encodeURIComponent('qq512436430')]
  // botWs.send(JSON.stringify(wXSearchContact))
  // console.log('SEND: ' + JSON.stringify(wXSearchContact))

  // console.log(' wXSearchContact done !!!! fake 11111')
  // wXSearchContact.param = [encodeURIComponent('11111')]
  // botWs.send(JSON.stringify(wXSearchContact))
  // console.log('SEND: ' + JSON.stringify(wXSearchContact))
}
