#!/usr/bin/env ts-node

/**
 * Water mark html page
 * https://www.cnblogs.com/daixinyu/p/6715398.html
 */
import fs   from 'fs-extra'
import path from 'path'

import { FlashStoreSync } from 'flash-store'

import {
  PadchatContactPayload,
  PadchatRoomMemberPayload,
  PadchatRoomPayload,
}                             from '../src/padchat-schemas'

import {
  log,
}          from '../src/config'

let cacheContactRawPayload    : FlashStoreSync<string, PadchatContactPayload>
let cacheRoomRawPayload       : FlashStoreSync<string, PadchatRoomPayload>
let cacheRoomMemberRawPayload : FlashStoreSync<string, {
  [contactId: string]: PadchatRoomMemberPayload,
}>

async function main () {
  const workdir = process.env.STORE_HOME
  if (!workdir) {
    log.info('Dumper', 'main() Usage: `STORE_HOME=xxx dumper.ts')
    throw new Error('STORE_HOME env var not set')
  }

  if (!await fs.pathExists(workdir)) {
    throw new Error('path not exist: ' + workdir)
  }

  cacheContactRawPayload    = new FlashStoreSync(path.join(workdir, 'contact-raw-payload'))
  cacheRoomRawPayload       = new FlashStoreSync(path.join(workdir, 'room-raw-payload'))
  cacheRoomMemberRawPayload = new FlashStoreSync(path.join(workdir, 'room-member-raw-payload'))

  await Promise.all([
    cacheContactRawPayload.ready(),
    cacheRoomRawPayload.ready(),
    cacheRoomMemberRawPayload.ready(),
  ])

  const roomMemberTotalNum = [...cacheRoomMemberRawPayload.values()].reduce(
    (accuVal, currVal) => {
      return accuVal + Object.keys(currVal).length
    },
    0,
  )

  log.warn('Dumper', 'main() Store status: contact: %d, room: %d, room members: %d',
                      cacheContactRawPayload.size,
                      cacheRoomRawPayload.size,
                      roomMemberTotalNum,
          )

  dumpHtml()

}

function dumpHtml () {

  console.log(`
    <html>
    <head>
      <style>
        table, th, td {
          border: 1px solid black;
        }
      </style>
    </head>
    <body>
  `)

  // dumpRooms()
  dumpRoomMembers()
  // dumpContacts()

  console.log(`
    </body>
    </html>
  `)
}

/**
 * Cotnacts
 */
export function dumpContacts () {
  let n = 0
  console.log(`
    <h2>Contacts</h2>
    <table>
      <tr>
        <td>
          #
        </td>
        <th>
          Profile Photo
        </th>
        <th>
          Wechat Name
        </th>
      </tr>
  `)

  for (const payload of cacheContactRawPayload.values()) {
    if (!payload.user_name) {
      continue
    }
    console.log(`
      <tr>
        <td>
          ${++n}
        </td>
        <td>
          <image width="40" height="40" src=${payload.small_head} />
        </td>
        <td>
          ${payload.nick_name}
        </td>
      </tr>
    `)
  }

  console.log(`
    </table>
  `)
}

/**
 * Rooms
 */
export function dumpRooms () {
  let n = 0
  console.log(`
    <h2>Rooms</h2>
    <table>
      <tr>
        <td>
          #
        </td>
        <th>
          Room Topic
        </th>
        <th>
          Members Number
        </th>
      </tr>
  `)

  for (const payload of cacheRoomRawPayload.values()) {
    if (!payload.user_name) {
      continue
    }
    console.log(`
      <tr>
        <td>
          ${++n}
        </td>
        <td>
          ${payload.nick_name}
        </td>
        <td>
          ${payload.member_count}
        </td>
      </tr>
    `)
  }

  console.log(`
    </table>
  `)
}

/**
 * Room Members
 */
export function dumpRoomMembers () {
  let n = 0
  console.log(`
  <h2>Room Members</h2>
  <table>
    <tr>
      <th>
        #
      </th>
      <th>
        Room Topic
      </th>
      <th>
        Member Photo
      </th>
      <th>
        Member Name
      </th>
    </tr>
  `)

  for (const [roomid, memberDictPayload] of cacheRoomMemberRawPayload) {
    const roomPayload = cacheRoomRawPayload.get(roomid)
    if (!roomPayload) {
      continue
    }

    for (const memberWxid of Object.keys(memberDictPayload)) {
      const memberPayload = memberDictPayload[memberWxid]

      if (!memberPayload.user_name) {
        continue
      }

      console.log(`
        <tr>
          <td>
            ${++n}
          </td>
          <td>
            ${roomPayload.nick_name}
          </td>
          <td>
            <img width="40" height="40" src="${memberPayload.small_head}" />
          </td>
          <td>
            ${memberPayload.nick_name}
          </td>
        </tr>
      `)
    }
  }
}

main()
.catch(console.error)
