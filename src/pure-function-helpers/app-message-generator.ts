import { LinkPayload } from "wechaty-puppet";

export const generateAppXMLMessage = ({ title, des, url, thumburl }: LinkPayload): string => {
  return `
    <appmsg appid="" sdkver="0">
      <title>${title}</title>
      <des>${des}</des>
      <username></username>
      <action>view</action>
      <type>5</type>
      <showtype>0</showtype>
      <url>${url}</url>
      <contentattr>0</contentattr>
      ${thumburl ? '<thumburl>' + thumburl + '</thumburl>' : ''}
    </appmsg>
    `
}
