import { xmlToJson } from './xml-to-json'

import {
  FriendshipType
}                       from 'wechaty-puppet'

import {
  FriendshipPayload,
  FriendshipPayloadConfirm,
  FriendshipPayloadReceive,
  FriendshipPayloadVerify,
  PadchatFriendshipPayload,
  PadchatMessagePayload,
}                                 from '../padchat-schemas'

import {
  friendshipConfirmEventMessageParser,
  friendshipReceiveEventMessageParser,
  friendshipVerifyEventMessageParser,
}                                         from './friendship-event-message-parser'

export async function friendshipRawPayloadParser (
  rawPayload: PadchatMessagePayload,
) : Promise<FriendshipPayload> {

  if (friendshipConfirmEventMessageParser(rawPayload)) {
    /**
     * 1. Confirm Event
     */
    return friendshipRawPayloadParserConfirm(rawPayload)

  } else if (friendshipVerifyEventMessageParser(rawPayload)) {
    /**
     * 2. Verify Event
     */
    return friendshipRawPayloadParserVerify(rawPayload)

  } else if (await friendshipReceiveEventMessageParser(rawPayload)) {
    /**
     * 3. Receive Event
     */
    return friendshipRawPayloadParserReceive(rawPayload)

  } else {
    throw new Error('event type is neither confirm nor verify, and not receive')
  }
}

async function friendshipRawPayloadParserConfirm (
  rawPayload: PadchatMessagePayload,
): Promise<FriendshipPayload> {
  const payload: FriendshipPayloadConfirm = {
    contactId : rawPayload.from_user,
    id        : rawPayload.msg_id,
    type      : FriendshipType.Confirm,
  }
  return payload
}

function friendshipRawPayloadParserVerify (
  rawPayload: PadchatMessagePayload,
): FriendshipPayload {
  const payload: FriendshipPayloadVerify = {
    contactId : rawPayload.from_user,
    id        : rawPayload.msg_id,
    type      : FriendshipType.Verify,
  }
  return payload
}

async function friendshipRawPayloadParserReceive (
  rawPayload: PadchatMessagePayload,
) {
  const tryXmlText = rawPayload.content

  interface XmlSchema {
    msg?: {
      $: PadchatFriendshipPayload,
    },
  }

  const jsonPayload: XmlSchema = await xmlToJson(tryXmlText) // , { object: true })

  if (!jsonPayload.msg) {
    throw new Error('no msg found')
  }
  const padchatFriendshipPayload: PadchatFriendshipPayload = jsonPayload.msg.$

  const friendshipPayload: FriendshipPayloadReceive = {
    contactId : padchatFriendshipPayload.fromusername,
    hello     : padchatFriendshipPayload.content,
    id        : rawPayload.msg_id,
    stranger  : padchatFriendshipPayload.encryptusername,
    ticket    : padchatFriendshipPayload.ticket,
    type      : FriendshipType.Receive,
  }

  return friendshipPayload
}
