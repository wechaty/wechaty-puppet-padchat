#!/usr/bin/env ts-node

// tslint:disable:max-line-length
// tslint:disable:no-shadowed-variable
import test  from 'blue-tape'

import {
  PadchatMessagePayload,
  PadchatRoomInviteEvent,
}                                 from '../padchat-schemas'

import { roomInviteEventMessageParser } from './room-event-invite-message-parser'

test('roomInviteEventMessageParser() ZH', async t => {
  const MESSAGE_PAYLOAD: PadchatMessagePayload = {
    content: '<msg><appmsg appid="" sdkver="0"><title>邀请你加入群聊</title><des>&quot;高原ོ&quot;邀请你加入群聊Wechaty Developers&apos; Home 2，进入可查看详情。</des><action>view</action><type>5</type><showtype>0</showtype><soundtype>0</soundtype><mediatagname></mediatagname><messageext></messageext><messageaction></messageaction><content></content><contentattr>0</contentattr><url>http://support.weixin.qq.com/cgi-bin/mmsupport-bin/addchatroombyinvite?ticket=AVs3velIDxTkA0EOhKogxg%3D%3D</url><lowurl></lowurl><dataurl></dataurl><lowdataurl></lowdataurl><appattach><totallen>0</totallen><attachid></attachid><emoticonmd5></emoticonmd5><fileext></fileext><cdnthumbaeskey></cdnthumbaeskey><aeskey></aeskey></appattach><extinfo></extinfo><sourceusername></sourceusername><sourcedisplayname></sourcedisplayname><thumburl>http://weixin.qq.com/cgi-bin/getheadimg?username=42e4fc96ae9472a2063bbabbe1cfbddbe3b59b105d1d59c217099cb8f3441f95</thumburl><md5></md5><statextstr></statextstr></appmsg><fromusername>lylezhuifeng</fromusername><scene>0</scene><appinfo><version>1</version><appname></appname></appinfo><commenturl></commenturl></msg>',
    continue: 1,
    description: '高原ོ : [链接]邀请你加入群聊',
    from_user: 'lylezhuifeng',
    msg_id: '7724778097781555979',
    msg_source: '<msgsource />\n',
    msg_type: 5,
    status: 1,
    sub_type: 49,
    timestamp: 1532158619,
    to_user: 'wxid_rdwh63c150bm12',
    uin: 3774860349,
  }

  const EXPECTED_EVENT: PadchatRoomInviteEvent = {
    fromUser: 'lylezhuifeng',
    msgId: '7724778097781555979',
    roomName: 'Wechaty Developers\' Home 2',
    timestamp: 1532158619,
    url: 'http://support.weixin.qq.com/cgi-bin/mmsupport-bin/addchatroombyinvite?ticket=AVs3velIDxTkA0EOhKogxg%3D%3D',
  }

  const event = roomInviteEventMessageParser(MESSAGE_PAYLOAD)
  t.deepEqual(event, EXPECTED_EVENT, 'should parse event')
})

test('roomInviteEventMessageParser() EN', async t => {
  const MESSAGE_PAYLOAD: PadchatMessagePayload = {
    content: '<msg><appmsg appid="" sdkver="0"><title>Group Chat Invitation</title><des>&quot;高原ོ&quot; invited you to join the group chat &quot;💃🏻这个群特别炸💃🏻&quot;. Enter to view details.</des><action>view</action><type>5</type><showtype>0</showtype><soundtype>0</soundtype><mediatagname></mediatagname><messageext></messageext><messageaction></messageaction><content></content><contentattr>0</contentattr><url>http://support.weixin.qq.com/cgi-bin/mmsupport-bin/addchatroombyinvite?ticket=AV5L4pEpxU7L8XAEFRxuHw%3D%3D</url><lowurl></lowurl><dataurl></dataurl><lowdataurl></lowdataurl><appattach><totallen>0</totallen><attachid></attachid><emoticonmd5></emoticonmd5><fileext></fileext><cdnthumbaeskey></cdnthumbaeskey><aeskey></aeskey></appattach><extinfo></extinfo><sourceusername></sourceusername><sourcedisplayname></sourcedisplayname><thumburl>http://weixin.qq.com/cgi-bin/getheadimg?username=04ef81268a57fc57de56d6c64e2982669163556ca6bd32c2edccc34ee889052e</thumburl><md5></md5><statextstr></statextstr></appmsg><fromusername>lylezhuifeng</fromusername><scene>0</scene><appinfo><version>1</version><appname></appname></appinfo><commenturl></commenturl></msg>',
    continue: 1,
    description: '高原ོ : [链接]Group Chat Invitation',
    from_user: 'lylezhuifeng',
    msg_id: '7969935287794034973',
    msg_source: '<msgsource />\n',
    msg_type: 5,
    status: 1,
    sub_type: 49,
    timestamp: 1532273578,
    to_user: 'wxid_rdwh63c150bm12',
    uin: 3774860349
  }

  const EXPECTED_EVENT: PadchatRoomInviteEvent = {
    fromUser: 'lylezhuifeng',
    msgId: '7969935287794034973',
    roomName: '💃🏻这个群特别炸💃🏻',
    timestamp: 1532273578,
    url: 'http://support.weixin.qq.com/cgi-bin/mmsupport-bin/addchatroombyinvite?ticket=AV5L4pEpxU7L8XAEFRxuHw%3D%3D',
  }

  const event = roomInviteEventMessageParser(MESSAGE_PAYLOAD)
  t.deepEqual(event, EXPECTED_EVENT, 'should parse event')
})
