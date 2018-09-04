// tslint:disable:max-line-length
// tslint:disable:no-shadowed-variable
// tslint:disable:object-literal-sort-keys
// tslint:disable:no-unused-variable

import test  from 'blue-tape'
import { appMessageParser } from '.'

const sampleLink = {
  content: '<msg><appmsg appid=\"\" sdkver=\"0\"><title>全球最惨烈的房地产泡沫，是怎么滋生、膨胀、破灭的？</title><des>十次危机九次地产，过去一百年有四次波澜壮阔的房地产危机，每一次都影响深远，猫哥打算分两期跟大家回顾这四次地产危机，个中滋味各自体会。</des><action></action><type>5</type><showtype>0</showtype><soundtype>0</soundtype><mediatagname></mediatagname><messageext></messageext><messageaction></messageaction><content></content><contentattr>0</contentattr><url>http://mp.weixin.qq.com/s?__biz=MjM5MDY5NjI2MQ==&amp;mid=2649758936&amp;idx=1&amp;sn=57c792c972163c93331c4e5daefe81d3&amp;chksm=be446af28933e3e4a98dc8478cb72e43269dafefaa0241f5a2863d12540d37d56afff48f8617&amp;mpshare=1&amp;scene=1&amp;srcid=0807oacxSyqTqFVtuXlErueP#rd</url><lowurl></lowurl><dataurl></dataurl><lowdataurl></lowdataurl><appattach><totallen>0</totallen><attachid></attachid><emoticonmd5></emoticonmd5><fileext></fileext><cdnthumburl>3059020100045230500201000204300cad8c02033d0af802047030feb602045b68dd6a042b777875706c6f61645f373032313533303331334063686174726f6f6d333835385f313533333539393038310204010400030201000400</cdnthumburl><cdnthumbmd5>2e2b8a1ace12ecf482119868ebf0eb85</cdnthumbmd5><cdnthumblength>5270</cdnthumblength><cdnthumbwidth>160</cdnthumbwidth><cdnthumbheight>160</cdnthumbheight><cdnthumbaeskey>fe3ba55a0eec46cd8e66e6ae08f1c5e6</cdnthumbaeskey><aeskey>fe3ba55a0eec46cd8e66e6ae08f1c5e6</aeskey><encryver>0</encryver><filekey>wxid_rdwh63c150bm12182_1533627050</filekey></appattach><extinfo></extinfo><sourceusername>gh_315ad8d1dc77</sourceusername><sourcedisplayname>大猫财经</sourcedisplayname><thumburl>http://mmbiz.qpic.cn/mmbiz_jpg/tft1HVJPPk9BOD3thBicXAzZpO117gbtVy8lhB7Pn3nsZtU7ydhUJQZdT33HEvnQynJgsib93JXbs1jBKjkMAJJA/300?wx_fmt=jpeg&amp;wxfrom=1</thumburl><md5></md5><statextstr></statextstr></appmsg><fromusername>lylezhuifeng</fromusername><scene>0</scene><appinfo><version>1</version><appname></appname></appinfo><commenturl></commenturl></msg>',
  continue: 1,
  description: '高原ོ : [链接]全球最惨烈的房地产泡沫，是怎么滋生、膨胀、破灭的？',
  from_user: 'lylezhuifeng',
  msg_id: '8273769814016020343',
  msg_source: '<msgsource />\n',
  msg_type: 5,
  status: 1,
  sub_type: 49,
  timestamp: 1533627051,
  to_user: 'wxid_rdwh63c150bm12',
  uin: 3774860349
}

// Keep the content below for future reference
const sampleLinkContent = {
  msg: {
    appmsg: {
      appid: '',
      sdkver: '0',
      title: '全球最惨烈的房地产泡沫，是怎么滋生、膨胀、破灭的？',
      des: '十次危机九次地产，过去一百年有四次波澜壮阔的房地产危机，每一次都影响深远，猫哥打算分两期跟大家回顾这四次地产危机，个中滋味各自体会。',
      action: {},
      type: '5',
      showtype: '0',
      soundtype: '0',
      mediatagname: {},
      messageext: {},
      messageaction: {},
      content: {},
      contentattr: '0',
      url: 'http://mp.weixin.qq.com/s?__biz=MjM5MDY5NjI2MQ==&mid=2649758936&idx=1&sn=57c792c972163c93331c4e5daefe81d3&chksm=be446af28933e3e4a98dc8478cb72e43269dafefaa0241f5a2863d12540d37d56afff48f8617&mpshare=1&scene=1&srcid=0807oacxSyqTqFVtuXlErueP#rd',
      lowurl: {},
      dataurl: {},
      lowdataurl: {},
      appattach: {
        totallen: '0',
        attachid: {},
        emoticonmd5: {},
        fileext: {},
        cdnthumburl: '30580201000451304f020100020419661a0702032f4f560204977ac2dc02045b6bc2a0042a777875706c6f61645f777869645f72647768363363313530626d31323139385f313533333738383833320204010400030201000400',
        cdnthumbmd5: '2e2b8a1ace12ecf482119868ebf0eb85',
        cdnthumblength: '5270',
        cdnthumbwidth: '160',
        cdnthumbheight: '160',
        cdnthumbaeskey: 'fe3ba55a0eec46cd8e66e6ae08f1c5e6',
        aeskey: 'fe3ba55a0eec46cd8e66e6ae08f1c5e6',
        encryver: '0',
        filekey: 'wxid_rdwh63c150bm12198_1533788832'
      },
      extinfo: {},
      sourceusername: 'gh_315ad8d1dc77',
      sourcedisplayname: '大猫财经',
      thumburl: 'http://mmbiz.qpic.cn/mmbiz_jpg/tft1HVJPPk9BOD3thBicXAzZpO117gbtVy8lhB7Pn3nsZtU7ydhUJQZdT33HEvnQynJgsib93JXbs1jBKjkMAJJA/300?wx_fmt=jpeg&wxfrom=1',
      md5: {},
      statextstr: {}
    },
    fromusername: 'lylezhuifeng',
    scene: '0',
    appinfo: {
      version: '1',
      appname: {}
    },
    commenturl: {}
  }
}

const sampleFile = {
  content: '<msg><appmsg appid=\"\" sdkver=\"0\"><title>滴滴出行行程报销单.pdf</title><des></des><action></action><type>6</type><showtype>0</showtype><soundtype>0</soundtype><mediatagname></mediatagname><messageext></messageext><messageaction></messageaction><content></content><contentattr>0</contentattr><url></url><lowurl></lowurl><dataurl></dataurl><lowdataurl></lowdataurl><appattach><totallen>133559</totallen><attachid>@cdn_30580201000451304f0201000204d8e50c6e02033d0af802046731feb602045b694b77042a777875706c6f61645f777869645f72647768363363313530626d31323138365f313533333632373235350204010400050201000400_dda53cf3b3344147b0cd7c4fc02886e2_1</attachid><emoticonmd5></emoticonmd5><fileext>pdf</fileext><cdnattachurl>30580201000451304f0201000204d8e50c6e02033d0af802046731feb602045b694b77042a777875706c6f61645f777869645f72647768363363313530626d31323138365f313533333632373235350204010400050201000400</cdnattachurl><cdnthumbaeskey></cdnthumbaeskey><aeskey>dda53cf3b3344147b0cd7c4fc02886e2</aeskey><encryver>0</encryver><filekey>wxid_rdwh63c150bm12186_1533627255</filekey></appattach><extinfo></extinfo><sourceusername></sourceusername><sourcedisplayname></sourcedisplayname><thumburl></thumburl><md5>22038764154d52a56017ba24031c0422</md5><statextstr></statextstr></appmsg><fromusername>lylezhuifeng</fromusername><scene>0</scene><appinfo><version>1</version><appname></appname></appinfo><commenturl></commenturl></msg>',
  continue: 1,
  description: '高原ོ : [文件]滴滴出行行程报销单.pdf',
  from_user: 'lylezhuifeng',
  msg_id: '3489869879335154488',
  msg_source: '<msgsource />\n',
  msg_type: 5,
  status: 1,
  sub_type: 49,
  timestamp: 1533627255,
  to_user: 'wxid_rdwh63c150bm12',
  uin: 3774860349
}

const sampleFileContent = {
  msg: {
    appmsg: {
      appid: '',
      sdkver: '0',
      title: '滴滴出行行程报销单.pdf',
      des: {},
      action: {},
      type: '6',
      showtype: '0',
      soundtype: '0',
      mediatagname: {},
      messageext: {},
      messageaction: {},
      content: {},
      contentattr: '0',
      url: {},
      lowurl: {},
      dataurl: {},
      lowdataurl: {},
      appattach: {
        totallen: '133559',
        attachid: '@cdn_30580201000451304f0201000204d8e50c6e02032f4f5602044a7ac2dc02045b6bc316042a777875706c6f61645f777869645f72647768363363313530626d31323230305f313533333738383935300204010400050201000400_dda53cf3b3344147b0cd7c4fc02886e2_1',
        emoticonmd5: {},
        fileext: 'pdf',
        cdnattachurl: '30580201000451304f0201000204d8e50c6e02032f4f5602044a7ac2dc02045b6bc316042a777875706c6f61645f777869645f72647768363363313530626d31323230305f313533333738383935300204010400050201000400',
        cdnthumbaeskey: {},
        aeskey: 'dda53cf3b3344147b0cd7c4fc02886e2',
        encryver: '0',
        filekey: 'wxid_rdwh63c150bm12200_1533788950'
      },
      extinfo: {},
      sourceusername: {},
      sourcedisplayname: {},
      thumburl: {},
      md5: '22038764154d52a56017ba24031c0422',
      statextstr: {}
    },
    fromusername: 'lylezhuifeng',
    scene: '0',
    appinfo: {
      version: '1',
      appname: {}
    },
    commenturl: {}
  }
}

const sampleLink2 = {
  content: '<msg><appmsg appid=\"\" sdkver=\"0\"><title>600k concurrent websocket connections on AWS using Node.js - Jayway</title><des>https://blog.jayway.com/2015/04/13/600k-concurrent-websocket-connections-on-aws-using-node-js/</des><action></action><type>5</type><showtype>0</showtype><soundtype>0</soundtype><mediatagname></mediatagname><messageext></messageext><messageaction></messageaction><content></content><contentattr>0</contentattr><url>https://blog.jayway.com/2015/04/13/600k-concurrent-websocket-connections-on-aws-using-node-js/</url><lowurl></lowurl><dataurl></dataurl><lowdataurl></lowdataurl><appattach><totallen>0</totallen><attachid></attachid><emoticonmd5></emoticonmd5><fileext></fileext><cdnthumbaeskey></cdnthumbaeskey><aeskey></aeskey></appattach><extinfo></extinfo><sourceusername></sourceusername><sourcedisplayname></sourcedisplayname><thumburl>https://blog.jayway.com/wp-content/jayway-full-logotype.svg</thumburl><md5></md5><statextstr></statextstr></appmsg><fromusername>lylezhuifeng</fromusername><scene>0</scene><appinfo><version>1</version><appname></appname></appinfo><commenturl></commenturl></msg>',
  continue: 1,
  description: '高原ོ : [链接]600k concurrent websocket connections on AWS using Node.js - Jayway',
  from_user: 'lylezhuifeng',
  msg_id: '8535518458251892057',
  msg_source: '<msgsource />\n',
  msg_type: 5,
  status: 1,
  sub_type: 49,
  timestamp: 1533627385,
  to_user: 'wxid_rdwh63c150bm12',
  uin: 3774860349
}

const sampleLink2Content = {
  msg: {
    appmsg: {
      appid: '',
      sdkver: '0',
      title: '600k concurrent websocket connections on AWS using Node.js - Jayway',
      des: 'https://blog.jayway.com/2015/04/13/600k-concurrent-websocket-connections-on-aws-using-node-js/',
      action: {},
      type: '5',
      showtype: '0',
      soundtype: '0',
      mediatagname: {},
      messageext: {},
      messageaction: {},
      content: {},
      contentattr: '0',
      url: 'https://blog.jayway.com/2015/04/13/600k-concurrent-websocket-connections-on-aws-using-node-js/',
      lowurl: {},
      dataurl: {},
      lowdataurl: {},
      appattach: {
        totallen: '0',
        attachid: {},
        emoticonmd5: {},
        fileext: {},
        cdnthumbaeskey: {},
        aeskey: {}
      },
      extinfo: {},
      sourceusername: {},
      sourcedisplayname: {},
      thumburl: 'https://blog.jayway.com/wp-content/jayway-full-logotype.svg',
      md5: {},
      statextstr: {}
    },
    fromusername: 'lylezhuifeng',
    scene: '0',
    appinfo: {
      version: '1',
      appname: {}
    },
    commenturl: {}
  }
}

const sampleApp = {
  content: '<msg><appmsg appid=\"\" sdkver=\"0\"><title>每日优鲜</title><des>&quot;我发现一个买生鲜的好地方，2小时就能送到！&quot;</des><action></action><type>33</type><showtype>0</showtype><soundtype>0</soundtype><mediatagname></mediatagname><messageext></messageext><messageaction></messageaction><content></content><contentattr>0</contentattr><url>https://mp.weixin.qq.com/mp/waerrpage?appid=wxebf773691904eee9&amp;type=upgrade&amp;upgradetype=3#wechat_redirect</url><lowurl></lowurl><dataurl></dataurl><lowdataurl></lowdataurl><appattach><totallen>0</totallen><attachid></attachid><emoticonmd5></emoticonmd5><fileext></fileext><cdnthumburl>30580201000451304f020100020419661a0702032f4f560204287ac2dc02045b6a8a6e042a777875706c6f61645f777869645f72647768363363313530626d31323139345f313533333730383931300204010400030201000400</cdnthumburl><cdnthumbmd5>2bf781f3805a38e1cd22b1f4591152e7</cdnthumbmd5><cdnthumblength>846640</cdnthumblength><cdnthumbwidth>1125</cdnthumbwidth><cdnthumbheight>2172</cdnthumbheight><cdnthumbaeskey>8fac9bf29cbe4891a7669ab2ee4760a9</cdnthumbaeskey><aeskey>8fac9bf29cbe4891a7669ab2ee4760a9</aeskey><encryver>0</encryver><filekey>wxid_rdwh63c150bm12194_1533708910</filekey></appattach><extinfo></extinfo><sourceusername>gh_05c85a53c7ee@app</sourceusername><sourcedisplayname>每日优鲜</sourcedisplayname><thumburl></thumburl><md5></md5><statextstr></statextstr><weappinfo><username><![CDATA[gh_05c85a53c7ee@app]]></username><appid><![CDATA[wxebf773691904eee9]]></appid><type>3</type><version>130</version><weappiconurl><![CDATA[http://mmbiz.qpic.cn/mmbiz_png/gnrPKmATCKvnK83zLsFDVN7Lq5yuYNnw3QwnBPClPb8xNHnPsSWSSwJibVsmwGiaXqJLvrzTT0GsrIfAq4uw4VyA/0?wx_fmt=png]]></weappiconurl><pagepath><![CDATA[pages/index/index.html?ald_share_src=15334688395753696331]]></pagepath><shareId><![CDATA[0_wxebf773691904eee9_426121735_1533708909_0]]></shareId><appservicetype>0</appservicetype></weappinfo></appmsg><fromusername>lylezhuifeng</fromusername><scene>0</scene><appinfo><version>1</version><appname></appname></appinfo><commenturl></commenturl></msg>',
  continue: 1,
  description: '你收到了一条消息',
  from_user: 'lylezhuifeng',
  msg_id: '8899432683540025195',
  msg_source: '<msgsource />\n',
  msg_type: 5,
  status: 1,
  sub_type: 49,
  timestamp: 1533708910,
  to_user: 'wxid_rdwh63c150bm12',
  uin: 3774860349
}

const sampleAppContent = {
  msg: {
    appmsg: {
      appid: '',
      sdkver: '0',
      title: '美团外卖',
      des: '你想吃的，你想喝的：都在美团外卖！赶快下单吧~',
      action: {},
      type: '33',
      showtype: '0',
      soundtype: '0',
      mediatagname: {},
      messageext: {},
      messageaction: {},
      content: {},
      contentattr: '0',
      url: 'https://mp.weixin.qq.com/mp/waerrpage?appid=wx2c348cf579062e56&type=upgrade&upgradetype=3#wechat_redirect',
      lowurl: {},
      dataurl: {},
      lowdataurl: {},
      appattach: {
        totallen: '0',
        attachid: {},
        emoticonmd5: {},
        fileext: {},
        cdnthumburl: '30580201000451304f020100020419661a0702032f4f560204977ac2dc02045b6bc377042a777875706c6f61645f777869645f72647768363363313530626d31323230325f313533333738393034370204010400030201000400',
        cdnthumbmd5: 'ea93bdfe84222ec60c0c67ea2eb7e1e5',
        cdnthumblength: '742008',
        cdnthumbwidth: '1125',
        cdnthumbheight: '2172',
        cdnthumbaeskey: 'addba6b6857945dbbe37c13912e56fa1',
        aeskey: 'addba6b6857945dbbe37c13912e56fa1',
        encryver: '0',
        filekey: 'wxid_rdwh63c150bm12202_1533789047'
      },
      extinfo: {},
      sourceusername: 'gh_72a4eb2d4324@app',
      sourcedisplayname: '美团外卖',
      thumburl: {},
      md5: {},
      statextstr: {},
      weappinfo: {
        username: 'gh_72a4eb2d4324@app',
        appid: 'wx2c348cf579062e56',
        type: '2',
        version: '92',
        weappiconurl: 'http://mmbiz.qpic.cn/mmbiz_png/IXJic6HOb8QT02PwzH5wCUicpuGmIagaUJLxzGRKtoY8PLQqBR1UDHwK5DpsyRJnQ0OHAFGaA8jweXGUh8RsJpCA/0?wx_fmt=png',
        pagepath: 'pages/index/index.html?from=from_share_index',
        shareId: '0_wx2c348cf579062e56_426121735_1533789047_0',
        appservicetype: '0'
      }
    },
    fromusername: 'lylezhuifeng',
    scene: '0',
    appinfo: {
      version: '1',
      appname: {}
    },
    commenturl: {}
  }
}

const sampleLink3Content = {
  msg: {
    appmsg: {
      appid: 'wx59cc372381201d39',
      sdkver: '0',
      title: '今日份的咖啡小幸运，最高手气1.1折！',
      des: 'lucky goolooloo',
      action: {},
      type: '5',
      showtype: '0',
      soundtype: '0',
      mediatagname: {},
      messageext: {},
      messageaction: {},
      content: {},
      contentattr: '0',
      url: 'https://m.luckincoffee.com/apartRedPacket/apart?type=dice&orderNo=6azHKjkwryVGoZqd59AXjg%3D%3D&activityNo=lIQyKaOWVbgHhAXZu8wpZg%3D%3D&inviteCode=dUBPtbSXDyCuwZhJhgQw4w%3D%3D',
      lowurl: {},
      dataurl: {},
      lowdataurl: {},
      appattach: {
        totallen: '0',
        attachid: {},
        emoticonmd5: {},
        fileext: {},
        cdnthumburl: '305a0201000453305102010002044e95586402032f4f560204257ac2dc02045b6bc373042c777875706c6f61645f313632373036363430324063686174726f6f6d32343038315f313533333738393034310204010400030201000400',
        cdnthumbmd5: '6e2f715dd149433dbc93e6b2121fc1bc',
        cdnthumblength: '14465',
        cdnthumbwidth: '120',
        cdnthumbheight: '120',
        cdnthumbaeskey: '84906ddd0d5f4908932dd3880e89c8b6',
        aeskey: '84906ddd0d5f4908932dd3880e89c8b6',
        encryver: '0',
        filekey: 'wxid_rdwh63c150bm12204_1533801210'
      },
      extinfo: {},
      sourceusername: {},
      sourcedisplayname: {},
      thumburl: {},
      md5: {},
      statextstr: 'GhQKEnd4NTljYzM3MjM4MTIwMWQzOQ=='
    },
    fromusername: 'lylezhuifeng',
    scene: '0',
    appinfo: {
      version: '1',
      appname: 'luckincoffee瑞幸咖啡'
    },
    commenturl: {}
  }
}

test('Should be able to parse url link message successfully', async (t) => {
  const payload = await appMessageParser(sampleLink)
  const expectedResult = {
    title: '全球最惨烈的房地产泡沫，是怎么滋生、膨胀、破灭的？',
    des: '十次危机九次地产，过去一百年有四次波澜壮阔的房地产危机，每一次都影响深远，猫哥打算分两期跟大家回顾这四次地产危机，个中滋味各自体会。',
    url: 'http://mp.weixin.qq.com/s?__biz=MjM5MDY5NjI2MQ==&mid=2649758936&idx=1&sn=57c792c972163c93331c4e5daefe81d3&chksm=be446af28933e3e4a98dc8478cb72e43269dafefaa0241f5a2863d12540d37d56afff48f8617&mpshare=1&scene=1&srcid=0807oacxSyqTqFVtuXlErueP#rd',
    thumburl: 'http://mmbiz.qpic.cn/mmbiz_jpg/tft1HVJPPk9BOD3thBicXAzZpO117gbtVy8lhB7Pn3nsZtU7ydhUJQZdT33HEvnQynJgsib93JXbs1jBKjkMAJJA/300?wx_fmt=jpeg&wxfrom=1',
    type: 5
  }
  t.deepEqual(payload, expectedResult)
})
