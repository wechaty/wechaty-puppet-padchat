import {
  RoomPayload,
}                   from 'wechaty-puppet'

import {
  PadchatRoomPayload,
}                         from '../padchat-schemas'

export function roomRawPayloadParser (
  rawPayload: PadchatRoomPayload,
): RoomPayload {
  const payload: RoomPayload = {
    id           : rawPayload.user_name,
    memberIdList : rawPayload.member || [],
    ownerId      : rawPayload.chatroom_owner,
    topic        : rawPayload.nick_name,
  }

  return payload
}
