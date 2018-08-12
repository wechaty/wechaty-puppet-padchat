import { UrlLinkPayload } from 'wechaty-puppet'

export const generateAppXMLMessage = ({ title, description, url, thumbnailUrl }: UrlLinkPayload): string => {
  return `
    <appmsg appid="" sdkver="0">
      <title>${title}</title>
      <des>${description}</des>
      <username></username>
      <action>view</action>
      <type>5</type>
      <showtype>0</showtype>
      <url>${url}</url>
      <contentattr>0</contentattr>
      ${thumbnailUrl ? '<thumburl>' + thumbnailUrl + '</thumburl>' : ''}
    </appmsg>
  `
}
