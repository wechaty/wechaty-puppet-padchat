import { toJson } from 'xml2json'

import {
  PadchatMessagePayload, PadchatAppMessagePayload
}                       from '../padchat-schemas'

import { isPayload } from './is-type'
import { AppType } from 'wechaty-puppet'

export function appMessageParser(rawPayload: PadchatMessagePayload): PadchatAppMessagePayload | null {
  if (!isPayload(rawPayload)) {
    return null
  }

  const { content, msg_id, timestamp, from_user } = rawPayload

  interface XmlSchema {
    msg: {
      appmsg: {
        title: string,
        des: string,
        type: number,
        url: string,
        appattach: {
          totallen: string,
          attachid: any,
          emoticonmd5: any,
          fileext: any,
          cdnthumbaeskey: any,
          aeskey: any
        },
        thumburl: string,
        md5: any,
        recorditem?: string
      },
      fromusername: string,
      appinfo: {
        appname: any
      }
    }
  }

  const tryXmlText = content.replace(/^[^\n]+\n/, '')

  try {
    const jsonPayload = toJson(tryXmlText, { object: true }) as XmlSchema

    console.log(jsonPayload.msg.appmsg.type === AppType.Link)
    return {
      title: jsonPayload.msg.appmsg.title,
      des: jsonPayload.msg.appmsg.des,
      url: jsonPayload.msg.appmsg.url,
      thumburl: jsonPayload.msg.appmsg.thumburl,
      type: jsonPayload.msg.appmsg.type
    }
  } catch (e) {
    console.error(e)
    return null
  }
}
