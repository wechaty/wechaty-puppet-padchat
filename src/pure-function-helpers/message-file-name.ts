import {
  PadchatMessagePayload, PadchatMessageType,
}                               from '../padchat-schemas'

export function messageFileName (
  rawPayload: PadchatMessagePayload,
): string {
  if (rawPayload.sub_type === PadchatMessageType.Voice) {
    return rawPayload.msg_id + '.slk'
  }

  return rawPayload.msg_id + '-to-be-implement.txt'
}
