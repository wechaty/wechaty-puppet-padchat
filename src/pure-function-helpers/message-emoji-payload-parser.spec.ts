import test from 'blue-tape'
import {
  emojiPayloadParser
} from './message-emoji-payload-parser'

const sampleEmojiMessage = {
  content: '<msg><emoji fromusername="lylezhuifeng" tousername="wxid_rdwh63c150bm12" type="2" idbuffer="media:0_0" md5="8dae79800b6ef10195e126042fc94076" len="310090" productid="" androidmd5="8dae79800b6ef10195e126042fc94076" androidlen="310090" s60v3md5="8dae79800b6ef10195e126042fc94076" s60v3len="310090" s60v5md5="8dae79800b6ef10195e126042fc94076" s60v5len="310090" cdnurl="http://emoji.qpic.cn/wx_emoji/l4keeCADqvmX5rSCy4nHXib3IpnTLy2T6CXetFgclb3ICM8zFs2wjNQ/" designerid="" thumburl="" encrypturl="http://emoji.qpic.cn/wx_emoji/b1Nsib7KBEDmYQq4bzAFibrXjUehx9MhaK2GgYMLcFeerjLd7jic3aLibQ/" aeskey="54a31301a1a2fb1a36ca35b741473d6f" externurl="http://emoji.qpic.cn/wx_emoji/CEnicDu2nX21RqMM5FdUtC6dAibroWDIdae0FeNAznUhEXQf7MKjtQQcet3Uqjl1Dy/" externmd5="128bdfe8c926db33f6adc62b955904a2" width="135" height="180" tpurl="" tpauthkey="" attachedtext=""></emoji><gameext type="0" content="0"></gameext></msg>',
  continue: 1,
  description: '高原ོ : [动画表情]',
  from_user: 'lylezhuifeng',
  msg_id: '5087157196027406248',
  msg_source: '<msgsource />\n',
  msg_type: 5,
  status: 1,
  sub_type: 47,
  timestamp: 1534321826,
  to_user: 'wxid_rdwh63c150bm12',
  uin: 3774860349
}

test('Should parse emoji message correctly', async (t) => {
  const payload = await emojiPayloadParser(sampleEmojiMessage)
  const expectedResult = {
    cdnurl: 'http://emoji.qpic.cn/wx_emoji/l4keeCADqvmX5rSCy4nHXib3IpnTLy2T6CXetFgclb3ICM8zFs2wjNQ/',
    height: 180,
    len: 310090,
    type: 2,
    width: 135,
  }

  t.deepEqual(expectedResult, payload)
})
