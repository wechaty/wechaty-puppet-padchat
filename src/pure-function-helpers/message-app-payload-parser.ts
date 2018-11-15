import { xmlToJson } from './xml-to-json'

import {
  PadchatAppAttachPayload,
  PadchatAppMessagePayload,
  PadchatMessagePayload,
}                       from '../padchat-schemas'

import { isPayload } from './is-type'

export async function appMessageParser (rawPayload: PadchatMessagePayload): Promise<PadchatAppMessagePayload | null> {
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
          attachid: string,
          emoticonmd5: string,
          fileext: string,
          cdnattachurl: string,
          cdnthumbaeskey: string,
          aeskey: string,
          encryver: string
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

    const { title, des, url, thumburl, type, md5 } = jsonPayload.msg.appmsg
    let appattach: PadchatAppAttachPayload | undefined
    const tmp = jsonPayload.msg.appmsg.appattach
    if (tmp) {
      appattach = {
        aeskey        : tmp.aeskey,
        attachid      : tmp.attachid,
        cdnattachurl  : tmp.cdnattachurl,
        cdnthumbaeskey: tmp.cdnthumbaeskey,
        emoticonmd5   : tmp.emoticonmd5,
        encryver      : parseInt(tmp.encryver, 10),
        fileext       : tmp.fileext,
        totallen      : parseInt(tmp.totallen, 10),
      }
    }

    return { title, des, url, thumburl, md5, type: parseInt(type, 10), appattach }
  } catch (e) {
    return null
  }
}
