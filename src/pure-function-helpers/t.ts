#!/usr/bin/env ts-node

// tslint:disable:max-line-length
// tslint:disable:no-shadowed-variable
import test  from 'blue-tape'

import {
  PadchatMessagePayload,
}                                 from '../padchat-schemas'

import { messageRawPayloadParser } from './message-raw-payload-parser'

test('sys', async t => {
  const PADCHAT_MESSAGE_PAYLOAD_SYS: PadchatMessagePayload = { content:
    '<?xml version="1.0"?>\n<msg bigheadimgurl="http://wx.qlogo.cn/mmhead/ver_1/27zgBIIcxGmtINOWjoXPZ7yIsvfuIzGepXbcWUFyUHSK2N8MA2x1VkTZLzk9iaQca6CtPR6ooUZWR52icTwnia51A/0" smallheadimgurl="http://wx.qlogo.cn/mmhead/ver_1/27zgBIIcxGmtINOWjoXPZ7yIsvfuIzGepXbcWUFyUHSK2N8MA2x1VkTZLzk9iaQca6CtPR6ooUZWR52icTwnia51A/132" username="v1_cebe1d0a6ff469f5d1bc136ffd69929605f8e90cbefc2a42a81f53b3c90ee264@stranger" nickname="李佳芮" fullpy="李佳芮" shortpy="LJR" alias="" imagestatus="0" scene="17" province="北京" city="海淀" sign="" sex="2" certflag="0" certinfo="" brandIconUrl="" brandHomeUrl="" brandSubscriptConfigUrl="" brandFlags="0" regionCode="CN_Beijing_Haidian" antispamticket="v2_93b56e18c355bdbec761e459231b7e6ded4b0c4861a88f3ead9b2c89bce028fa56f345d8e7cf5479dc94a6e13b5b42ec@stranger" />\n',
    continue: 1,
    description: '李卓桓 : [Contact Card] 李佳芮',
    from_user: 'lizhuohuan',
    msg_id: '5911987709823889005',
    msg_source: '',
    msg_type: 5,
    status: 1,
    sub_type: 42,
    timestamp: 1528959169,
    to_user: 'wxid_5zj4i5htp9ih22',
    uin: 1928023446,
  }

  const payload = messageRawPayloadParser(PADCHAT_MESSAGE_PAYLOAD_SYS)
  console.log('payload:', payload)
  t.ok('ok')

})
