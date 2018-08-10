import { xmlToJson } from './xml-to-json'

import {
  PadchatMessagePayload, PadchatAppMessagePayload
}                       from '../padchat-schemas'

import { isPayload } from './is-type'
import { AppType } from 'wechaty-puppet'

export async function appMessageParser(rawPayload: PadchatMessagePayload): Promise<PadchatAppMessagePayload | null> {
  if (!isPayload(rawPayload)) {
    return null
  }

  const { content } = rawPayload

  interface XmlSchema {
    msg: {
      appmsg: {
        title: string,
        des: string,
        type: string,
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
    const jsonPayload: XmlSchema = await xmlToJson(tryXmlText)

    const { title, des, url, thumburl, type } = jsonPayload.msg.appmsg
    
    return { title, des, url, thumburl, type: parseInt(type) }
  } catch (e) {
    return null
  }
}
