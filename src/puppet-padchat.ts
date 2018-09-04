/**
 *   Wechaty - https://github.com/chatie/wechaty
 *
 *   @copyright 2016-2018 Huan LI <zixia@zixia.net>
 *
 *   Licensed under the Apache License, Version 2.0 (the "License");
 *   you may not use this file except in compliance with the License.
 *   You may obtain a copy of the License at
 *
 *       http://www.apache.org/licenses/LICENSE-2.0
 *
 *   Unless required by applicable law or agreed to in writing, software
 *   distributed under the License is distributed on an "AS IS" BASIS,
 *   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 *   See the License for the specific language governing permissions and
 *   limitations under the License.
 *
 */

import path     from 'path'

import flatten  from 'array-flatten'
import LRU      from 'lru-cache'

import { FileBox }    from 'file-box'

import {
  ContactGender,

  ContactPayload,
  ContactType,

  FriendshipPayload,

  MessagePayload,
  MessageType,

  Puppet,

  PuppetOptions,
  Receiver,
  RoomInvitationPayload,
  RoomMemberPayload,
  RoomPayload,
  UrlLinkPayload,
}                                 from 'wechaty-puppet'

import {
  appMessageParser,
  contactRawPayloadParser,

  fileBoxToQrcode,

  friendshipConfirmEventMessageParser,
  friendshipRawPayloadParser,
  friendshipReceiveEventMessageParser,
  friendshipVerifyEventMessageParser,

  generateFakeSelfBot,
  isStrangerV1,

  isStrangerV2,

  messageRawPayloadParser,
  roomInviteEventMessageParser,
  roomJoinEventMessageParser,
  roomLeaveEventMessageParser,
  roomRawPayloadParser,
  roomTopicEventMessageParser,
}                                         from './pure-function-helpers'

import {
  log,
  padchatToken,
  qrCodeForChatie,
  retry,
  SELF_QRCODE_MAX_RETRY,
  VERSION,
  WECHATY_PUPPET_PADCHAT_ENDPOINT,
}                   from './config'

import {
  PadchatManager,
}                       from './padchat-manager'

import {
  FriendshipPayloadReceive,
  PadchatContactPayload,
  PadchatMessagePayload,
  PadchatMessageType,
  PadchatRoomInvitationPayload,
  PadchatRoomMemberPayload,
  PadchatRoomPayload,
}                           from './padchat-schemas'

import {
  WXSearchContactType,
  WXSearchContactTypeStatus,
}                           from './padchat-rpc.type'
import { generateAppXMLMessage } from './pure-function-helpers/app-message-generator'
import { emojiPayloadParser } from './pure-function-helpers/message-emoji-payload-parser'

let PADCHAT_COUNTER = 0 // PuppetPadchat Instance Counter

export class PuppetPadchat extends Puppet {
  public static readonly VERSION = VERSION

  private padchatCounter: number
  private readonly cachePadchatMessagePayload: LRU.Cache<string, PadchatMessagePayload>

  private padchatManager? : PadchatManager

  constructor (
    public options: PuppetOptions = {},
  ) {
    super({
      timeout: 60 * 4,  // Default set timeout to 4 minutes for PuppetPadchat
      ...options,
    })

    const lruOptions: LRU.Options = {
      max: 1000,
      // length: function (n) { return n * 2},
      dispose (key: string, val: any) {
        log.silly('PuppetPadchat', 'constructor() lruOptions.dispose(%s, %s)', key, JSON.stringify(val))
      },
      maxAge: 1000 * 60 * 60,
    }

    this.cachePadchatMessagePayload = new LRU<string, PadchatMessagePayload>(lruOptions)

    this.padchatCounter = PADCHAT_COUNTER++

    if (this.padchatCounter > 0) {
      if (!this.options.token) {
        throw new Error([
          'You need to specify `token` when constructor PuppetPadchat becasue you have more than one instance. ',
          'see: https://github.com/Chatie/wechaty/issues/1367',
        ].join(''))
      }
    }
  }

  public toString () {
    const text = super.toString()
    return text + `/PuppetPadchat#${this.padchatCounter}`
  }

  public ding (data?: string): void {
    log.verbose('PuppetPadchat', 'ding(%s)', data || '')

    // TODO: do some internal health check inside this.padchatManager
    if (!this.padchatManager) {
      this.emit('error', new Error('no padchat Manager'))
      return
    }
    this.padchatManager.ding(data)
    return
  }

  public startWatchdog (): void {
    log.verbose('PuppetPadchat', 'startWatchdog()')

    if (!this.padchatManager) {
      throw new Error('no padchat manager')
    }

    // clean the dog because this could be re-inited
    // this.watchdog.removeAllListeners()

    /**
     * Use manager's heartbeat to feed dog
     */
    this.padchatManager.on('heartbeat', (data: string) => {
      log.silly('PuppetPadchat', 'startWatchdog() padchatManager.on(heartbeat)')
      this.emit('watchdog', {
        data,
      })
    })

    this.emit('watchdog', {
      data: 'inited',
      type: 'startWatchdog()',
    })

  }

  public async start (): Promise<void> {
    log.verbose('PuppetPadchat', `start() with ${this.memory.name}`)

    if (this.state.on()) {
      log.warn('PuppetPadchat', 'start() already on(pending)?')
      await this.state.ready('on')
      return
    }

    /**
     * state has two main state: ON / OFF
     * ON (pending)
     * OFF (pending)
     */
    this.state.on('pending')

    const manager = this.padchatManager = new PadchatManager({
      endpoint : this.options.endpoint  || WECHATY_PUPPET_PADCHAT_ENDPOINT,
      memory   : this.memory,
      token    : this.options.token     || padchatToken(),
    })

    await this.startManager(manager)
    await this.startWatchdog()

    this.state.on(true)
  }

  protected async login (selfId: string): Promise<void> {
    if (!this.padchatManager) {
      throw new Error('no padchat manager')
    }
    await super.login(selfId)
    await this.padchatManager.syncContactsAndRooms()
  }

  public async startManager (manager: PadchatManager): Promise<void> {
    log.verbose('PuppetPadchat', 'startManager()')

    if (this.state.off()) {
      throw new Error('startManager() state is off')
    }

    manager.removeAllListeners()
    manager.on('error',   e                                               => this.emit('error', e))
    manager.on('scan',    (qrcode: string, status: number, data?: string) => this.emit('scan', qrcode, status, data))
    manager.on('login',   (userId: string)                                => this.login(userId))
    manager.on('message', (rawPayload: PadchatMessagePayload)             => this.onPadchatMessage(rawPayload))
    manager.on('logout',  ()                                              => this.logout(true))
    manager.on('dong',    (data)                                          => this.emit('dong', data))
    manager.on('ready',   ()                                              => this.emit('ready'))

    manager.on('reset', async reason => {
      log.warn('PuppetPadchat', 'startManager() manager.on(reset) for %s. Restarting PuppetPadchat ... ', reason)
      // Puppet Base class will deal with this RESET event for you.
      await this.emit('reset', reason)
    })
    manager.on('reconnect', async msg => {
      log.verbose('PuppetPadchat', 'startManager() manager.on(reconnect) for %s', msg)
      // Slightly delay the reconnect after disconnected from the server
      await new Promise(r => setTimeout(r, 2000))
      await manager.reconnect()
    })

    await manager.start()
  }

  protected async onPadchatMessage (rawPayload: PadchatMessagePayload): Promise<void> {
    log.verbose('PuppetPadchat', 'onPadchatMessage({id=%s, type=%s(%s)})',
                                rawPayload.msg_id,
                                PadchatMessageType[rawPayload.sub_type],
                                rawPayload.msg_type,
              )
    /**
     * 0. Discard messages when not logged in
     */
    if (!this.id) {
      log.warn('PuppetPadchat', 'onPadchatMessage(%s) discarded message because puppet is not logged-in', JSON.stringify(rawPayload))
      return
    }

    /**
     * 1. Sometimes will get duplicated same messages from rpc, drop the same message from here.
     */
    if (this.cachePadchatMessagePayload.has(rawPayload.msg_id)) {
      log.silly('PuppetPadchat', 'onPadchatMessage(id=%s) duplicate message: %s',
                                rawPayload.msg_id,
                                JSON.stringify(rawPayload).substr(0, 500),
              )
      return
    }

    /**
     * 2. Save message for future usage
     */
    this.cachePadchatMessagePayload.set(
      rawPayload.msg_id,
      rawPayload,
    )

    /**
     * 3. Check for Different Message Types
     */
    switch (rawPayload.sub_type) {
      case PadchatMessageType.VerifyMsg:
        this.emit('friendship', rawPayload.msg_id)
        break

      case PadchatMessageType.Recalled:
        /**
         * When someone joined the room invited by Bot,
         * the bot will receive a `recall-able` message for room event
         *
         * { content: '12740017638@chatroom:\n<sysmsg type="delchatroommember">\n\t<delchatroommember>\n\t\t<plain>
         *            <![CDATA[You invited 卓桓、Zhuohuan, 太阁_传话助手, 桔小秘 to the group chat.   ]]></plain>...,
         *  sub_type: 10002}
         */
        await Promise.all([
          this.onPadchatMessageRoomEventJoin(rawPayload),
        ])
        break
      case PadchatMessageType.Sys:
        await Promise.all([
          this.onPadchatMessageFriendshipEvent(rawPayload),
          ////////////////////////////////////////////////
          this.onPadchatMessageRoomEventJoin(rawPayload),
          this.onPadchatMessageRoomEventLeave(rawPayload),
          this.onPadchatMessageRoomEventTopic(rawPayload),
        ])
        break

      case PadchatMessageType.App:
        await Promise.all([
          this.onPadchatMessageRoomInvitation(rawPayload),
        ])
        break
      case PadchatMessageType.Emoticon:
      case PadchatMessageType.Image:
      case PadchatMessageType.MicroVideo:
      case PadchatMessageType.Video:
        // TODO: the above types are field type

      default:
        this.emit('message', rawPayload.msg_id)
        break
    }
  }

  protected async onPadchatMessageRoomInvitation (rawPayload: PadchatMessagePayload): Promise<void> {
    log.verbose('PuppetPadchat', 'onPadchatMessageRoomInvitation(%s)', rawPayload)
    const roomInviteEvent = await roomInviteEventMessageParser(rawPayload)

    if (!this.padchatManager) {
      throw new Error('no padchat manager')
    }

    if (roomInviteEvent) {
      await this.padchatManager.saveRoomInvitationRawPayload(roomInviteEvent)

      this.emit('room-invite', roomInviteEvent.msgId)
    } else {
      this.emit('message', rawPayload.msg_id)
    }
  }

  /**
   * Look for room join event
   */
  protected async onPadchatMessageRoomEventJoin (rawPayload: PadchatMessagePayload): Promise<void> {
    log.verbose('PuppetPadchat', 'onPadchatMessageRoomEventJoin({id=%s})', rawPayload.msg_id)

    const roomJoinEvent = await roomJoinEventMessageParser(rawPayload)

    if (roomJoinEvent) {
      const inviteeNameList = roomJoinEvent.inviteeNameList
      const inviterName     = roomJoinEvent.inviterName
      const roomId          = roomJoinEvent.roomId
      log.silly('PuppetPadchat', 'onPadchatMessageRoomEventJoin() roomJoinEvent="%s"', JSON.stringify(roomJoinEvent))

      const inviteeIdList = await retry(async (retryException, attempt) => {
        log.verbose('PuppetPadchat', 'onPadchatMessageRoomEvent({id=%s}) roomJoin retry(attempt=%d)', attempt)

        const tryIdList = flatten<string>(
          await Promise.all(
            inviteeNameList.map(
              inviteeName => this.roomMemberSearch(roomId, inviteeName),
            ),
          ),
        )

        if (tryIdList.length) {
          return tryIdList
        }

        if (!this.padchatManager) {
          throw new Error('no manager')
        }

        /**
         * Set Cache Dirty
         */
        await this.roomMemberPayloadDirty(roomId)

        return retryException(new Error('roomMemberSearch() not found'))

      }).catch(e => {
        log.warn('PuppetPadchat', 'onPadchatMessageRoomEvent({id=%s}) roomJoin retry() fail: %s', e.message)
        return [] as string[]
      })

      const inviterIdList = await this.roomMemberSearch(roomId, inviterName)

      if (inviterIdList.length < 1) {
        throw new Error('no inviterId found')
      } else if (inviterIdList.length > 1) {
        log.warn('PuppetPadchat', 'onPadchatMessageRoomEvent() case PadchatMesssageSys: inviterId found more than 1, use the first one.')
      }

      const inviterId = inviterIdList[0]

      /**
       * Set Cache Dirty
       */
      await this.roomMemberPayloadDirty(roomId)
      await this.roomPayloadDirty(roomId)

      this.emit('room-join', roomId, inviteeIdList,  inviterId)
    }
  }

  /**
   * Look for room leave event
   */
  protected async onPadchatMessageRoomEventLeave (rawPayload: PadchatMessagePayload): Promise<void> {
    log.verbose('PuppetPadchat', 'onPadchatMessageRoomEventLeave({id=%s})', rawPayload.msg_id)

    const roomLeaveEvent = roomLeaveEventMessageParser(rawPayload)

    if (roomLeaveEvent) {
      const leaverNameList = roomLeaveEvent.leaverNameList
      const removerName    = roomLeaveEvent.removerName
      const roomId         = roomLeaveEvent.roomId
      log.silly('PuppetPadchat', 'onPadchatMessageRoomEventLeave() roomLeaveEvent="%s"', JSON.stringify(roomLeaveEvent))

      const leaverIdList = flatten<string>(
        await Promise.all(
          leaverNameList.map(
            leaverName => this.roomMemberSearch(roomId, leaverName),
          ),
        ),
      )
      const removerIdList = await this.roomMemberSearch(roomId, removerName)
      if (removerIdList.length < 1) {
        throw new Error('no removerId found')
      } else if (removerIdList.length > 1) {
        log.warn('PuppetPadchat', 'onPadchatMessage() case PadchatMesssageSys: removerId found more than 1, use the first one.')
      }
      const removerId = removerIdList[0]

      if (!this.padchatManager) {
        throw new Error('no padchatManager')
      }

      /**
       * Set Cache Dirty
       */
      await this.roomMemberPayloadDirty(roomId)
      await this.roomPayloadDirty(roomId)

      this.emit('room-leave',  roomId, leaverIdList, removerId)
    }
  }

  /**
   * Look for room topic event
   */
  protected async onPadchatMessageRoomEventTopic (rawPayload: PadchatMessagePayload): Promise<void> {
    log.verbose('PuppetPadchat', 'onPadchatMessageRoomEventTopic({id=%s})', rawPayload.msg_id)

    const roomTopicEvent = roomTopicEventMessageParser(rawPayload)

    if (roomTopicEvent) {
      const changerName = roomTopicEvent.changerName
      const newTopic    = roomTopicEvent.topic
      const roomId      = roomTopicEvent.roomId
      log.silly('PuppetPadchat', 'onPadchatMessageRoomEventTopic() roomTopicEvent="%s"', JSON.stringify(roomTopicEvent))

      const roomOldPayload = await this.roomPayload(roomId)
      const oldTopic       = roomOldPayload.topic

      const changerIdList = await this.roomMemberSearch(roomId, changerName)
      if (changerIdList.length < 1) {
        throw new Error('no changerId found')
      } else if (changerIdList.length > 1) {
        log.warn('PuppetPadchat', 'onPadchatMessage() case PadchatMesssageSys: changerId found more than 1, use the first one.')
      }
      const changerId = changerIdList[0]

      if (!this.padchatManager) {
        throw new Error('no padchatManager')
      }
      /**
       * Set Cache Dirty
       */
      await this.roomPayloadDirty(roomId)

      this.emit('room-topic',  roomId, newTopic, oldTopic, changerId)
    }
  }

  protected async onPadchatMessageFriendshipEvent (rawPayload: PadchatMessagePayload): Promise<void> {
    log.verbose('PuppetPadchat', 'onPadchatMessageFriendshipEvent({id=%s})', rawPayload.msg_id)
    /**
     * 1. Look for friendship confirm event
     */
    const friendshipConfirmContactId = friendshipConfirmEventMessageParser(rawPayload)
    /**
     * 2. Look for friendship receive event
     */
    const friendshipReceiveContactId = await friendshipReceiveEventMessageParser(rawPayload)
    /**
     * 3. Look for friendship verify event
     */
    const friendshipVerifyContactId = friendshipVerifyEventMessageParser(rawPayload)

    if (   friendshipConfirmContactId
        || friendshipReceiveContactId
        || friendshipVerifyContactId
    ) {
      // Maybe load contact here since we know a new friend is added
      this.emit('friendship', rawPayload.msg_id)
    }
  }

  public async stop (): Promise<void> {
    log.verbose('PuppetPadchat', 'stop()')

    if (!this.padchatManager) {
      throw new Error('no padchat manager')
    }

    if (this.state.off()) {
      log.warn('PuppetPadchat', 'stop() is called on a OFF puppet. await ready(off) and return.')
      await this.state.ready('off')
      return
    }

    this.state.off('pending')

    // this.watchdog.sleep()
    await this.logout(true)

    await this.padchatManager.stop()

    this.padchatManager.removeAllListeners()
    this.padchatManager = undefined

    this.state.off(true)
  }

  public async logout (shallow = false): Promise<void> {
    log.verbose('PuppetPadchat', 'logout()')

    if (!this.id) {
      log.warn('PuppetPadchat', 'logout() this.id not exist')
      return
    }

    if (!this.padchatManager) {
      throw new Error('no padchat manager')
    }

    this.emit('logout', this.id) // becore we will throw above by logonoff() when this.user===undefined
    this.id = undefined

    if (!shallow) {
      await this.padchatManager.WXLogout()
    }

    await this.padchatManager.logout()
  }

  /**
   *
   * Contact
   *
   */
  public contactAlias (contactId: string)                      : Promise<string>
  public contactAlias (contactId: string, alias: string | null): Promise<void>

  public async contactAlias (contactId: string, alias?: string | null): Promise<void | string> {
    log.verbose('PuppetPadchat', 'contactAlias(%s, %s)', contactId, alias)

    if (typeof alias === 'undefined') {
      const payload = await this.contactPayload(contactId)
      return payload.alias || ''
    }

    if (!this.padchatManager) {
      throw new Error('no padchat manager')
    }

    await this.padchatManager.WXSetUserRemark(contactId, alias || '')

    return
  }

  public async contactValidate (contactId: string): Promise<boolean> {
    log.verbose('PuppetPadchat', 'contactValid(%s)', contactId)

    if (!this.padchatManager) {
      throw new Error('no padchat manager')
    }

    try {
      await this.padchatManager.contactRawPayload(contactId)
      return true
    } catch (e) {
      return false
    }
  }

  public async contactList (): Promise<string[]> {
    log.verbose('PuppetPadchat', 'contactList()')

    if (!this.padchatManager) {
      throw new Error('no padchat manager')
    }

    const contactIdList = this.padchatManager.getContactIdList()

    return contactIdList
  }

  public async contactAvatar (contactId: string)                : Promise<FileBox>
  public async contactAvatar (contactId: string, file: FileBox) : Promise<void>

  public async contactAvatar (contactId: string, file?: FileBox): Promise<void | FileBox> {
    log.verbose('PuppetPadchat', 'contactAvatar(%s%s)',
                                  contactId,
                                  file ? (', ' + file.name) : '',
                )

    /**
     * 1. set avatar for user self
     */
    if (file) {
      if (contactId !== this.selfId()) {
        throw new Error('can not set avatar for others')
      }
      if (!this.padchatManager) {
        throw new Error('no padchat manager')
      }
      await this.padchatManager.WXSetHeadImage(await file.toBase64())
      return
    }

    /**
     * 2. get avatar
     */
    const payload = await this.contactPayload(contactId)

    if (!payload.avatar) {
      throw new Error('no avatar')
    }

    const fileBox = FileBox.fromUrl(
      payload.avatar,
      `wechaty-contact-avatar-${payload.name}.jpg`,
    )
    return fileBox
  }

  public async contactSelfQrcode (): Promise<string> {
    log.verbose('PuppetPadchat', 'contactSelfQrcode()')

    const contactId = this.selfId()

    if (!this.padchatManager) {
      throw new Error('no padchat manager')
    }

    const contactPayload = await this.contactPayload(contactId)
    const contactName    = contactPayload.alias || contactPayload.name || contactPayload.id

    return this.getQRCode(this.padchatManager, contactName, contactId)
  }

  private async getQRCode (manager: PadchatManager, contactName: string,
                           contactId: string, counter?: number): Promise<string> {
    const base64 = await manager.WXGetUserQRCode(contactId, 3)

    const fileBox        = FileBox.fromBase64(base64, `${contactName}.jpg`)
    try {
      // There are some styles of qrcode can not be parsed by the library we are using,
      // So added a retry mechanism here to guarantee the qrcode
      // But still sometimes, the qrcode would be not available
      // So in the error message, let the user to do a retry
      return await fileBoxToQrcode(fileBox)
    } catch (e) {
      if (!counter) {
        counter = 1
      }
      if (counter > SELF_QRCODE_MAX_RETRY) {
        log.verbose('PuppetPadchat', 'contactQrcode(%s) get qrcode , this should happen very rare', contactId)
        throw Error('Unable to get qrcode for self, Please try , this issue usually won\'t happen frequently, retry should fix it. If not, please open an issue on https://github.com/lijiarui/wechaty-puppet-padchat')
      }
      return this.getQRCode(manager, contactName, contactId, ++ counter)
    }
  }

  public async contactPayloadDirty (contactId: string): Promise<void> {
    log.verbose('PuppetPadchat', 'contactPayloadDirty(%s)', contactId)

    if (this.padchatManager) {
      this.padchatManager.contactRawPayloadDirty(contactId)
    }

    await super.contactPayloadDirty(contactId)
  }

  public async contactRawPayload (contactId: string): Promise<PadchatContactPayload> {
    log.silly('PuppetPadchat', 'contactRawPayload(%s)', contactId)

    if (!this.id) {
      throw Error('bot not login!')
    }

    if (!this.padchatManager) {
      throw new Error('no padchat manager')
    }
    const rawPayload = await this.padchatManager.contactRawPayload(contactId)

    if (!rawPayload.user_name && contactId === this.id) {
      return generateFakeSelfBot(contactId)
    }

    return rawPayload
  }

  public async contactRawPayloadParser (rawPayload: PadchatContactPayload): Promise<ContactPayload> {
    log.silly('PuppetPadchat', 'contactRawPayloadParser({user_name="%s"})', rawPayload.user_name)

    const payload: ContactPayload = contactRawPayloadParser(rawPayload)

    if (rawPayload.stranger && isStrangerV1(rawPayload.stranger)) {
      payload.friend = true
    } else {
      payload.friend = false
    }

    // if (!this.padchatManager) {
    //   throw new Error('no padchat manager')
    // }

    // const searchResult = await this.padchatManager.WXSearchContact(rawPayload.user_name)

    // let friend: undefined | boolean = undefined

    // if (searchResult) {
    //   if (searchResult.status === -24 && !searchResult.user_name) {
    //     friend = false
    //   } else if (  isStrangerV1(searchResult.user_name)
    //             || isStrangerV2(searchResult.user_name)
    //   ) {
    //     friend = false
    //   }
    // }

    // return {
    //   ...payload,
    //   friend,
    // }

    return payload
  }

  /**
   * Overwrite the Puppet.contactPayload()
   */
  public async contactPayload (
    contactId: string,
  ): Promise<ContactPayload> {

    try {
      const payload = await super.contactPayload(contactId)
      return payload
    } catch (e) {
      log.silly('PuppetPadchat', 'contactPayload(%s) exception: %s', contactId, e.message)
      log.silly('PuppetPadchat', 'contactPayload(%s) get failed for %s, try load from room member data source', contactId)
    }

    const rawPayload = await this.contactRawPayload(contactId)

    /**
     * Issue #1397
     *  https://github.com/Chatie/wechaty/issues/1397#issuecomment-400962638
     *
     * Try to use the contact information from the room
     * when it is not available directly
     */
    if (!rawPayload || Object.keys(rawPayload).length <= 0) {
      log.silly('PuppetPadchat', 'contactPayload(%s) rawPayload not exist', contactId)

      const roomList = await this.contactRoomList(contactId)
      log.silly('PuppetPadchat', 'contactPayload(%s) found %d rooms', contactId, roomList.length)

      if (roomList.length > 0) {
        const roomId = roomList[0]
        const roomMemberPayload = await this.roomMemberPayload(roomId, contactId)
        if (roomMemberPayload) {

          const payload: ContactPayload = {
            avatar : roomMemberPayload.avatar,
            gender : ContactGender.Unknown,
            id     : roomMemberPayload.id,
            name   : roomMemberPayload.name,
            type   : ContactType.Personal,
          }

          this.cacheContactPayload.set(contactId, payload)
          log.silly('PuppetPadchat', 'contactPayload(%s) cache SET', contactId)

          return payload
        }
      }
      throw new Error('no raw payload')
    }

    return this.contactRawPayloadParser(rawPayload)
  }

  /**
   *
   * Message
   *
   */
  public async messageFile (messageId: string): Promise<FileBox> {
    log.warn('PuppetPadchat', 'messageFile(%s)', messageId)

    if (!this.padchatManager) {
      throw new Error('no padchat manager')
    }

    const rawPayload = await this.messageRawPayload(messageId)
    const payload    = await this.messagePayload(messageId)

    const rawText        = JSON.stringify(rawPayload)
    const attachmentName = payload.filename || payload.id

    let result

    switch (payload.type) {
      case MessageType.Audio:
        return this.getVoiceFileBoxFromRawPayload(rawPayload, attachmentName)

      case MessageType.Emoticon:
        const emojiPayload = await emojiPayloadParser(rawPayload)
        if (emojiPayload) {
          return FileBox.fromUrl(emojiPayload.cdnurl, `${attachmentName}.gif`)
        } else {
          throw new Error('Can not get emoji file from the message')
        }

      case MessageType.Image:
        result = await this.padchatManager.WXGetMsgImage(rawText)
        return FileBox.fromBase64(result.image, `${attachmentName}.jpg`)

      case MessageType.Video:
        result = await this.padchatManager.WXGetMsgVideo(rawText)
        return FileBox.fromBase64(result.video, `${attachmentName}.mp4`)

      case MessageType.Attachment:
      default:
        log.warn('PuppetPadchat', 'messageFile(%s) unsupport type: %s(%s) because it is not fully implemented yet, PR is welcome.',
                                  messageId,
                                  PadchatMessageType[rawPayload.sub_type],
                                  rawPayload.sub_type,
                )
        const base64 = 'Tm90IFN1cHBvcnRlZCBBdHRhY2htZW50IEZpbGUgVHlwZSBpbiBNZXNzYWdlLgpTZWU6IGh0dHBzOi8vZ2l0aHViLmNvbS9DaGF0aWUvd2VjaGF0eS9pc3N1ZXMvMTI0OQo='
        const filename = 'wechaty-puppet-padchat-message-attachment-' + messageId + '.txt'

        const file = FileBox.fromBase64(
          base64,
          filename,
        )

        return file
    }
  }

  public async messageUrl (messageId: string): Promise<UrlLinkPayload> {

    const rawPayload = await this.messageRawPayload(messageId)
    const payload = await this.messagePayload(messageId)

    if (payload.type !== MessageType.Url) {
      throw new Error('Can not get url from non url payload')
    } else {
      const appPayload = await appMessageParser(rawPayload)
      if (appPayload) {
        return {
          description: appPayload.des,
          thumbnailUrl: appPayload.thumburl,
          title: appPayload.title,
          url: appPayload.url,
        }
      } else {
        throw new Error('Can not parse url message payload')
      }
    }
  }

  private async getVoiceFileBoxFromRawPayload (rawPayload: PadchatMessagePayload, attachmentName: string): Promise<FileBox> {
    const data = await this.getVoiceDataFromRawPayload(rawPayload)
    const result = FileBox.fromBase64(data, attachmentName)
    try {
      const match  = rawPayload.content.match(/voicelength="(\d+)"/) || []
      const voiceLength = parseInt(match[1], 10) || 0
      result.name = `${rawPayload.msg_id}.${voiceLength}.slk`
    } catch (e) {
      log.error('PuppetPadchat', 'Can not get voice length from content, will have empty voice length')
    }

    return result
  }

  private async getVoiceDataFromRawPayload (rawPayload: PadchatMessagePayload): Promise<string> {
    if (!this.padchatManager) {
      throw new Error('no padchat manager')
    }
    if (!rawPayload.data) {
      const result = await this.padchatManager.WXGetMsgVoice(JSON.stringify(rawPayload))
      return result.voice
    } else {
      return rawPayload.data
    }
  }

  public async messageRawPayload (id: string): Promise<PadchatMessagePayload> {
    const rawPayload = this.cachePadchatMessagePayload.get(id)

    if (!rawPayload) {
      throw new Error('no rawPayload')
    }

    return rawPayload
  }

  public async messageRawPayloadParser (rawPayload: PadchatMessagePayload): Promise<MessagePayload> {
    log.verbose('PuppetPadChat', 'messageRawPayloadParser({msg_id="%s"})', rawPayload.msg_id)

    const payload: MessagePayload = await messageRawPayloadParser(rawPayload)

    log.silly('PuppetPadchat', 'messagePayload(%s)', JSON.stringify(payload))
    return payload
  }

  public async messageSendText (
    receiver : Receiver,
    text     : string,
  ): Promise<void> {
    log.verbose('PuppetPadchat', 'messageSend(%s, %s)', JSON.stringify(receiver), text)

    // Send to the Room if there's a roomId
    const id = receiver.roomId || receiver.contactId

    if (!id) {
      throw Error('no id')
    }
    if (!this.padchatManager) {
      throw new Error('no padchat manager')
    }
    await this.padchatManager.WXSendMsg(id, text)
  }

  public async messageSendFile (
    receiver : Receiver,
    file     : FileBox,
  ): Promise<void> {
    log.verbose('PuppetPadchat', 'messageSend("%s", %s)', JSON.stringify(receiver), file)

    // Send to the Room if there's a roomId
    const id = receiver.roomId || receiver.contactId

    if (!id) {
      throw new Error('no id!')
    }

    if (!this.padchatManager) {
      throw new Error('no padchat manager')
    }

    const type = file.mimeType || path.extname(file.name)
    switch (type) {
      case '.slk':
        try {
          // TODO: temporary hack solution, replace this when there is metadata in FileBox object
          const voiceLength = parseInt(file.name.split('.')[1], 10)
          await this.padchatManager.WXSendVoice(
            id,
            await file.toBase64(),
            voiceLength,
          )
        } catch (e) {
          throw Error('Can not send voice file, voice length not found from file name, please use voice file generated by wechaty, and don\' modify the file object')
        }
        break

      default:
        await this.padchatManager.WXSendImage(
          id,
          await file.toBase64(),
        )
        break
    }
  }

  public async messageSendContact (
    receiver  : Receiver,
    contactId : string,
  ): Promise<void> {
    log.verbose('PuppetPadchat', 'messageSendContact("%s", %s)', JSON.stringify(receiver), contactId)

    if (!this.padchatManager) {
      throw new Error('no padchat manager')
    }

    // Send to the Room if there's a roomId
    const id = receiver.roomId || receiver.contactId

    if (!id) {
      throw Error('no id')
    }

    const payload = await this.contactPayload(contactId)
    const title = payload.name + '名片'
    await this.padchatManager.WXShareCard(id, contactId, title)
  }

  public async messageSendUrl (
    receiver: Receiver,
    urlLinkPayload: UrlLinkPayload
  ): Promise<void> {
    log.verbose('PuppetPadchat', 'messageSendLink("%s", %s)', JSON.stringify(receiver), JSON.stringify(urlLinkPayload))

    if (!this.padchatManager) {
      throw new Error('no padchat manager')
    }

    // Send to the Room if there's a roomId
    const id = receiver.roomId || receiver.contactId

    if (!id) {
      throw Error('no id')
    }

    await this.padchatManager.WXSendAppMsg(id, generateAppXMLMessage(urlLinkPayload))
  }

  public async messageForward (
    receiver  : Receiver,
    messageId : string,
  ): Promise<void> {
    log.verbose('PuppetPadchat', 'messageForward(%s, %s)',
                              JSON.stringify(receiver),
                              messageId,
              )

    if (!this.padchatManager) {
      throw new Error('no padchat manager')
    }

    const payload = await this.messagePayload(messageId)

    if (payload.type === MessageType.Text) {
      if (!payload.text) {
        throw new Error('no text')
      }
      await this.messageSendText(
        receiver,
        payload.text,
      )
    } else if (payload.type === MessageType.Audio) {
      const rawPayload = await this.messageRawPayload(messageId)

      const id = receiver.roomId || receiver.contactId
      if (!id) {
        throw Error(`Can not find the receiver id for forwarding voice message(${rawPayload.msg_id}), forward voice message failed`)
      }

      let voiceLength: number
      try {
        const match  = rawPayload.content.match(/voicelength="(\d+)"/) || []
        voiceLength = parseInt(match[1], 10) || 0
      } catch (e) {
        log.error(e)
        throw new Error(`Can not get the length of the voice message(${rawPayload.msg_id}), forward voice message failed`)
      }

      const res = await this.padchatManager.WXSendVoice(
        id,
        await this.getVoiceDataFromRawPayload(rawPayload),
        voiceLength,
      )
      log.error(res)
    } else if (payload.type === MessageType.Url) {
      await this.messageSendUrl(
        receiver,
        await this.messageUrl(messageId)
      )
    } else {
      await this.messageSendFile(
        receiver,
        await this.messageFile(messageId),
      )
    }
  }

  /**
   *
   * Room
   *
   */
  public async roomMemberPayloadDirty (roomId: string) {
    log.silly('PuppetPadchat', 'roomMemberRawPayloadDirty(%s)', roomId)

    await super.roomMemberPayloadDirty(roomId)

    if (this.padchatManager) {
      await this.padchatManager.roomMemberRawPayloadDirty(roomId)
    }
  }

  public async roomMemberRawPayload (
    roomId    : string,
    contactId : string,
  ): Promise<PadchatRoomMemberPayload> {
    log.silly('PuppetPadchat', 'roomMemberRawPayload(%s)', roomId)

    if (!this.padchatManager) {
      throw new Error('no padchat manager')
    }

    const memberDictRawPayload = await this.padchatManager.roomMemberRawPayload(roomId)

    return memberDictRawPayload[contactId]
  }

  public async roomMemberRawPayloadParser (
    rawPayload: PadchatRoomMemberPayload,
  ): Promise<RoomMemberPayload> {
    log.silly('PuppetPadchat', 'roomMemberRawPayloadParser(%s)', rawPayload)

    const payload: RoomMemberPayload = {
      avatar    : rawPayload.big_head,
      id        : rawPayload.user_name,
      inviterId : rawPayload.invited_by,
      name      : rawPayload.nick_name,
      roomAlias : rawPayload.chatroom_nick_name,
    }

    return payload
  }

  public async roomPayloadDirty (roomId: string): Promise<void> {
    log.verbose('PuppetPadchat', 'roomPayloadDirty(%s)', roomId)

    if (this.padchatManager) {
      this.padchatManager.roomRawPayloadDirty(roomId)
    }

    await super.roomPayloadDirty(roomId)
  }

  public async roomRawPayload (
    roomId: string,
  ): Promise<PadchatRoomPayload> {
    log.verbose('PuppetPadchat', 'roomRawPayload(%s)', roomId)

    if (!this.padchatManager) {
      throw new Error('no padchat manager')
    }

    const rawPayload = await this.padchatManager.roomRawPayload(roomId)

    if (!rawPayload.user_name) rawPayload.user_name = roomId
    return rawPayload
  }

  public async roomRawPayloadParser (rawPayload: PadchatRoomPayload): Promise<RoomPayload> {
    log.verbose('PuppetPadchat', 'roomRawPayloadParser(rawPayload.user_name="%s")', rawPayload.user_name)

    const payload: RoomPayload = roomRawPayloadParser(rawPayload)
    return payload
  }

  public async roomMemberList (roomId: string): Promise<string[]> {
    log.verbose('PuppetPadchat', 'roomMemberList(%s)', roomId)

    if (!this.padchatManager) {
      throw new Error('no padchat manager')
    }

    const memberIdList = await this.padchatManager.getRoomMemberIdList(roomId)
    log.silly('PuppetPadchat', 'roomMemberList()=%d', memberIdList.length)

    if (memberIdList.length <= 0) {
      await this.roomPayloadDirty(roomId)
    }

    return memberIdList
  }

  public async roomValidate (roomId: string): Promise<boolean> {
    log.verbose('PuppetPadchat', 'roomValid(%s)', roomId)
    if (!this.padchatManager) {
      throw new Error('no padchat manager')
    }
    const exist = await this.padchatManager.WXGetChatRoomMember(roomId)
    return !!exist
  }

  public async roomList (): Promise<string[]> {
    log.verbose('PuppetPadchat', 'roomList()')

    if (!this.padchatManager) {
      throw new Error('no padchat manager')
    }

    const roomIdList = await this.padchatManager.getRoomIdList()
    log.silly('PuppetPadchat', 'roomList()=%d', roomIdList.length)

    return roomIdList
  }

  public async roomDel (
    roomId    : string,
    contactId : string,
  ): Promise<void> {
    log.verbose('PuppetPadchat', 'roomDel(%s, %s)', roomId, contactId)

    if (!this.padchatManager) {
      throw new Error('no padchat manager')
    }

    const memberIdList = await this.roomMemberList(roomId)
    if (memberIdList.includes(contactId)) {
      await this.padchatManager.WXDeleteChatRoomMember(roomId, contactId)
    } else {
      log.warn('PuppetPadchat', 'roomDel() room(%s) has no member contact(%s)', roomId, contactId)
    }

    /**
     * Should not dirty payload at here,
     * because later we need to get the leaverId from the event.
     * We will dirty the payload when we process the leave event.
     * Issue #1329 - https://github.com/Chatie/wechaty/issues/1329
     */
    // await this.roomMemberPayloadDirty(roomId)
  }

  public async roomQrcode (roomId: string): Promise<string> {
    log.verbose('PuppetPadchat', 'roomQrcode(%s)', roomId)

    const memberIdList = await this.roomMemberList(roomId)
    if (!memberIdList.includes(this.selfId())) {
      throw new Error('userSelf not in this room: ' + roomId)
    }

    const base64 = await this.padchatManager!.WXGetUserQRCode(roomId, 0)

    const roomPayload = await this.roomPayload(roomId)
    const roomName    = roomPayload.topic || roomPayload.id
    const fileBox     = FileBox.fromBase64(base64, `${roomName}-qrcode.jpg`)

    const qrcode = await fileBoxToQrcode(fileBox)

    return qrcode
  }

  public async roomAvatar (roomId: string): Promise<FileBox> {
    log.verbose('PuppetPadchat', 'roomAvatar(%s)', roomId)

    const payload = await this.roomPayload(roomId)

    if (payload.avatar) {
      return FileBox.fromUrl(payload.avatar)
    }

    log.warn('PuppetPadchat', 'roomAvatar() avatar not found, use the chatie default.')
    return qrCodeForChatie()
  }

  public async roomAdd (
    roomId    : string,
    contactId : string,
  ): Promise<void> {
    log.verbose('PuppetPadchat', 'roomAdd(%s, %s)', roomId, contactId)

    if (!this.padchatManager) {
      throw new Error('no padchat manager')
    }

    // XXX: did there need to calc the total number of the members in this room?
    // if n <= 40 then add() else invite() ?
    try {
      log.verbose('PuppetPadchat', 'roomAdd(%s, %s) try to Add', roomId, contactId)
      await this.padchatManager.WXAddChatRoomMember(roomId, contactId)
    } catch (e) {
      // FIXME
      console.error(e)
      log.warn('PuppetPadchat', 'roomAdd(%s, %s) Add exception: %s', e)
      log.verbose('PuppetPadchat', 'roomAdd(%s, %s) try to Invite', roomId, contactId)
      await this.padchatManager.WXInviteChatRoomMember(roomId, contactId)
    }

    // Will reload room information when receive room-join event
    // instead of here, since the room information might not be updated yet
    // await new Promise(r => setTimeout(r, 1000))
    // await this.roomMemberPayloadDirty(roomId)
    // await this.roomMemberPayload(roomId, contactId)
  }

  public async roomTopic (roomId: string)                : Promise<string>
  public async roomTopic (roomId: string, topic: string) : Promise<void>

  public async roomTopic (
    roomId: string,
    topic?: string,
  ): Promise<void | string> {
    log.verbose('PuppetPadchat', 'roomTopic(%s, %s)', roomId, topic)

    if (typeof topic === 'undefined') {
      const payload = await this.roomPayload(roomId)
      return payload.topic
    }

    if (!this.padchatManager) {
      throw new Error('no padchat manager')
    }

    await this.padchatManager.WXSetChatroomName(roomId, topic)
    /**
     * Give server some time to refresh the API payload
     * when we have to make sure the data is the latest.
     */
    await new Promise(r => setTimeout(r, 1000))
    await this.roomPayloadDirty(roomId)
    await this.roomPayload(roomId)

    return
  }

  public async roomCreate (
    contactIdList : string[],
    topic         : string,
  ): Promise<string> {
    log.verbose('PuppetPadchat', 'roomCreate(%s, %s)', contactIdList, topic)

    if (!this.padchatManager) {
      throw new Error('no padchat manager')
    }

    const roomId = await this.padchatManager.WXCreateChatRoom(contactIdList)

    // Load new created room payload
    await this.roomPayload(roomId)

    return roomId
  }

  public async roomQuit (roomId: string): Promise<void> {
    log.verbose('PuppetPadchat', 'roomQuit(%s)', roomId)

    if (!this.padchatManager) {
      throw new Error('no padchat manager')
    }

    await this.padchatManager.WXQuitChatRoom(roomId)

    // Clean Cache
    await this.roomMemberPayloadDirty(roomId)
    await this.roomPayloadDirty(roomId)
  }

  public async roomAnnounce (roomId: string)             : Promise<string>
  public async roomAnnounce (roomId: string, text: string) : Promise<void>

  public async roomAnnounce (roomId: string, text?: string): Promise<void | string> {
    log.verbose('PuppetPadchat', 'roomAnnounce(%s, %s)', roomId, text ? text : '')

    if (!this.padchatManager) {
      throw new Error('no padchat manager')
    }

    if (text) {
      await this.padchatManager.WXSetChatroomAnnouncement(roomId, text)
    } else {
      log.warn('Getting room announcement is not supported by wechaty-puppet-padchat.')
      return ''
    }
  }

  public async roomInvitationRawPayload (roomInvitationId: string): Promise<PadchatRoomInvitationPayload> {
    if (!this.padchatManager) {
      throw new Error('no padchat manager')
    }

    return this.padchatManager.roomInvitationRawPayload(roomInvitationId)
  }

  public async roomInvitationRawPayloadParser (rawPayload: PadchatRoomInvitationPayload): Promise<RoomInvitationPayload> {
    return {
      id: rawPayload.id,
      inviterId: rawPayload.fromUser,
      roomMemberCount: 0,
      roomMemberIdList: [],
      roomTopic: rawPayload.roomName,
      timestamp: rawPayload.timestamp
    }
  }

  public async roomInvitationAccept (roomInvitationId: string): Promise<void> {

    if (!this.padchatManager) {
      throw new Error('no padcaht manager')
    }

    let res: string = ''
    try {
      const payload = await this.padchatManager.roomInvitationRawPayload(roomInvitationId)
      const shareUrl = payload.url

      const response = await this.padchatManager.WXGetRequestToken(this.selfId(), shareUrl)

      res = await require('request-promise')({
        method: 'POST',
        simple: false,
        uri: response.full_url,
      })
    } catch (e) {
      throw new Error('UNKNOWN: Unexpected error happened when trying to accept invitation\n' + e)
    }

    if (res.indexOf('你无法查看被转发过的邀请') !== -1 || res.indexOf('Unable to view forwarded invitations') === -1) {
      throw new Error('FORWARDED: Accept invitation failed, this is a forwarded invitation, can not be accepted')
    } else if (res.indexOf('你未开通微信支付') !== -1 || res.indexOf('You haven\'t enabled WeChat Pay') === -1
              || res.indexOf('你需要实名验证后才能接受邀请') !== -1) {
      throw new Error('WXPAY: The user need to enable wechaty pay(微信支付) to join the room, this is requested by Wechat.')
    } else if (res.indexOf('该邀请已过期') !== -1 || res.indexOf('Invitation expired') === -1) {
      throw new Error('EXPIRED: The invitation is expired, please request the user to send again')
    } else if (res.indexOf('群聊邀请操作太频繁请稍后再试') !== -1 || res.indexOf('操作太频繁，请稍后再试') !== -1) {
      throw new Error('FREQUENT: Room invitation operation too frequent.')
    } else if (res.indexOf('已达群聊人数上限') !== -1) {
      throw new Error('LIMIT: The room member count has reached the limit.')
    } else if (res.indexOf('该群因违规已被限制使用，无法添加群成员') !== -1) {
      throw new Error('INVALID: This room has been mal used, can not add new members.')
    }
  }

  /**
   *
   * Friendship
   *
   */
  public async friendshipAdd (
    contactId : string,
    hello     : string,
  ): Promise<void> {
    log.verbose('PuppetPadchat', 'friendshipAdd(%s, %s)', contactId, hello)

    if (!this.padchatManager) {
      throw new Error('no padchat manager')
    }
    let rawSearchPayload: WXSearchContactType
    try {
      rawSearchPayload = await this.padchatManager.WXSearchContact(contactId)
    } catch (e) {
      throw Error(`Can not add user ${contactId}, this contactId is not searchable. Please refer to issue: https://github.com/lijiarui/wechaty-puppet-padchat/issues/166`)
    }

    /**
     * If the contact is not stranger, than ussing WXSearchContact can get user_name
     */
    if (rawSearchPayload.user_name !== '' && !isStrangerV1(rawSearchPayload.user_name) && !isStrangerV2(rawSearchPayload.user_name)) {
      log.warn('PuppetPadchat', 'friendshipAdd %s has been friend with bot, no need to send friend request!', contactId)
      return
    }

    let strangerV1
    let strangerV2
    if (isStrangerV1(rawSearchPayload.stranger)) {
      strangerV1 = rawSearchPayload.stranger
      strangerV2 = rawSearchPayload.user_name
    } else if (isStrangerV2(rawSearchPayload.stranger)) {
      strangerV2 = rawSearchPayload.stranger
      strangerV1 = rawSearchPayload.user_name
    } else {
      throw new Error('stranger neither v1 nor v2!')
    }

    // Issue #1252 : what's wrong here?, Trying to fix now...

    await this.padchatManager.WXAddUser(
      strangerV1 || '',
      strangerV2 || '',
      WXSearchContactTypeStatus.WXID, // default
      hello,
    )
  }

  public async friendshipAccept (
    friendshipId : string,
  ): Promise<void> {
    log.verbose('PuppetPadchat', 'friendshipAccept(%s)', friendshipId)

    const payload = await this.friendshipPayload(friendshipId) as any as FriendshipPayloadReceive

    if (!payload.ticket) {
      throw new Error('no ticket')
    }
    if (!payload.stranger) {
      throw new Error('no stranger')
    }

    if (!this.padchatManager) {
      throw new Error('no padchat manager')
    }

    await this.padchatManager.WXAcceptUser(
      payload.stranger,
      payload.ticket,
    )
  }

  public async friendshipRawPayloadParser (rawPayload: PadchatMessagePayload) : Promise<FriendshipPayload> {
    log.verbose('PuppetPadchat', 'friendshipRawPayloadParser({id=%s})', rawPayload.msg_id)

    const payload: FriendshipPayload = await friendshipRawPayloadParser(rawPayload)
    return payload
  }

  public async friendshipRawPayload (friendshipId: string): Promise<PadchatMessagePayload> {
    log.verbose('PuppetPadchat', 'friendshipRawPayload(%s)', friendshipId)

    /**
     * Friendship shares Cache with the Message RawPayload
     */
    const rawPayload = this.cachePadchatMessagePayload.get(friendshipId)
    if (!rawPayload) {
      throw new Error('no rawPayload for id ' + friendshipId)
    }

    return rawPayload
  }

  public unref (): void {
    log.verbose('PuppetPadchat', 'unref ()')

    super.unref()

    if (this.padchatManager) {
      // TODO: this.padchatManager.unref()
    }
  }

  public async contactSelfName (newName: string) : Promise<void> {
    if (!this.padchatManager) {
      throw new Error('no padchat manager')
    }

    await this.padchatManager.updateSelfName(newName)
    await this.contactPayloadDirty(this.selfId())
  }

  public async contactSelfSignature (signature: string) : Promise<void> {
    if (!this.padchatManager) {
      throw new Error('no padchat manager')
    }

    await this.padchatManager.updateSelfSignature(signature)
    await this.contactPayloadDirty(this.selfId())
  }
}

export default PuppetPadchat
