import { UrlLinkPayload } from 'wechaty-puppet'
import { PadchatAppMessagePayload } from '../padchat-schemas'

export const generateAppXMLMessage = ({ title, description, url, thumbnailUrl }: UrlLinkPayload): string => {
  return `
    <appmsg appid="" sdkver="0">
      <title>${title}</title>
      <des>${description}</des>
      <username></username>
      <action>view</action>
      <type>5</type>
      <showtype>0</showtype>
      <url>${url.replace(/&/g, '&amp;')}</url>
      <contentattr>0</contentattr>
      ${thumbnailUrl ? '<thumburl>' + thumbnailUrl.replace(/&/g, '&amp;') + '</thumburl>' : ''}
    </appmsg>
  `
}

export const generateAttachmentXMLMessageFromRaw = (payload: PadchatAppMessagePayload): string => {
  return `
  <appmsg appid="" sdkver="0">
    <title>${payload.title}</title>
    <des></des>
    <action></action>
    <type>${payload.type}</type>
    <showtype>0</showtype>
    <mediatagname></mediatagname>
    <messageaction></messageaction>
    <content></content>
    <url></url>
    <lowurl></lowurl>
    <dataurl></dataurl>
    <lowdataurl></lowdataurl>
    <appattach>
      <totallen>${payload.appattach && payload.appattach.totallen}</totallen>
      <attachid>
        ${payload.appattach && payload.appattach.attachid}
      </attachid>
      <emoticonmd5></emoticonmd5>
      <fileext>${payload.appattach && payload.appattach.fileext}</fileext>
      <cdnattachurl>
        ${payload.appattach && payload.appattach.cdnattachurl}
      </cdnattachurl>
      <aeskey>${payload.appattach && payload.appattach.aeskey}</aeskey>
      <encryver>${payload.appattach && payload.appattach.encryver}</encryver>
    </appattach>
    <extinfo></extinfo>
    <sourceusername></sourceusername>
    <sourcedisplayname></sourcedisplayname>
    <commenturl></commenturl>
    <thumburl></thumburl>
    <md5>${payload.md5}</md5>
  </appmsg>
  `
}
