#!/usr/bin/env ts-node

// tslint:disable:no-shadowed-variable
import test  from 'blue-tape'
// import sinon from 'sinon'

import { MemoryCard } from 'memory-card'

import {
  WECHATY_PUPPET_PADCHAT_ENDPOINT,
}                                     from './config'
import { PadchatManager } from './padchat-manager'

class PadchatManagerTest extends PadchatManager {
  public onSocket (payload: any) {
    return super.onSocket(payload)
  }

  public async initCache (token: string, selfId: string) {
    return super.initCache(
      token,
      selfId,
    )
  }
  public async releaseCache () {
    return super.releaseCache()
  }
}

test('PadchatManager() cache should be release and can be re-init again.', async t => {
  const manager = new PadchatManagerTest({
    endpoint : WECHATY_PUPPET_PADCHAT_ENDPOINT,
    memory   : new MemoryCard(),
    token    : 'mock token',
  })
  try {
    for (let i = 0; i < 3; i++) {
      await manager.initCache('test-fake-token', 'fake-self-id')
      await manager.releaseCache()
      t.pass('init/release-ed at #' + i)
    }
    t.pass('PadchatManager() cache init/release/init successed.')
  } catch (e) {
    t.fail(e)
  }
})

test('PadchatManager() cache release 10 instances for the same time', async t => {
  const MAX_NUM = 10
  const managerList = [] as PadchatManagerTest[]

  for (let i = 0; i < MAX_NUM; i++ ) {
    const manager = new PadchatManagerTest({
      endpoint : WECHATY_PUPPET_PADCHAT_ENDPOINT,
      memory   : new MemoryCard(),
      token    : 'mock token',
    })
    await manager.initCache('test-fake-token-' + i, 'fake-self-id-' + i)

    managerList.push(manager)
  }

  try {
    await Promise.all(
      managerList.map(
        manager => manager.releaseCache(),
      ),
    )
    t.pass('release ' + MAX_NUM + ' at the same time success')
  } catch (e) {
    t.fail(e)
  }
})
// TODO: Temporary disabled when launch token validation, enable me later
// test('PadchatManager() should can be able to restart() many times for one instance', async t => {
//   const MAX_NUM = 3

//   const memory = new MemoryCard()
//   await memory.load()

//   const manager = new PadchatManager({
//     endpoint : WECHATY_PUPPET_PADCHAT_ENDPOINT,
//     memory,
//     token    : 'test-mock-token',
//   })
//   try {
//     for (let i = 0; i < MAX_NUM; i++) {
//       await manager.start()
//       await manager.stop()
//       t.pass('restarted at #' + i)
//     }
//     t.pass('PadchatManager() restart successed.')
//   } catch (e) {
//     console.error(e)
//     t.fail(e)
//   }
// })
// TODO: Temporary disabled when launch token validation, enable me later
// test('PadchatManager() stop many instances for the same time', async t => {
//   const MAX_NUM = 3
//   const managerList = [] as PadchatManagerTest[]

//   const memory = new MemoryCard()
//   await memory.load()

//   const sandbox = sinon.createSandbox()

//   for (let i = 0; i < MAX_NUM; i++ ) {
//     const manager = new PadchatManagerTest({
//       endpoint : WECHATY_PUPPET_PADCHAT_ENDPOINT,
//       memory,
//       token    : 'mock token ' + i,
//     })
//     await manager.start()

//     managerList.push(manager)
//   }

//   const stopFutureList = [] as Array<Promise<void>>

//   for (let i = 0; i < MAX_NUM; i++) {
//     const manager = managerList[i]
//     const future = manager.stop()
//     stopFutureList.push(future)
//   }

//   try {
//     await Promise.all(stopFutureList)
//     t.pass('stop' + MAX_NUM + ' at the same time success')
//   } catch (e) {
//     t.fail(e)
//   }

//   sandbox.restore()
// })
