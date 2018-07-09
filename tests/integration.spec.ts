#!/usr/bin/env ts-node

// tslint:disable:no-shadowed-variable
import test  from 'blue-tape'
import fs from 'fs-extra'
import os     from 'os'
import path   from 'path'

import { PuppetPadchat } from '../src/puppet-padchat'

import { MockSocketServer } from './mock-server'

import { MOCK_TOKEN, MOCK_USER_ID } from './mock-config'

const FAKE_SERVER_PORT = 13421
const TOTAL_TEST_CHECK = 2

const clearFlashStoreCache = async () => {
  const baseDir = path.join(
    os.homedir(),
    path.sep,
    '.wechaty',
    'puppet-padchat-cache',
    path.sep,
    MOCK_TOKEN,
    path.sep,
    MOCK_USER_ID,
  )
  await fs.remove(baseDir)
}

test('PuppetPadchat Integration test', async t => {

  await clearFlashStoreCache()

  const mockServer = new MockSocketServer(FAKE_SERVER_PORT)
  mockServer.setContactPayloadMockArray([])
  await mockServer.start()

  const puppet = new PuppetPadchat({
    endpoint: `http://localhost:${FAKE_SERVER_PORT}`,
    token: MOCK_TOKEN,
  })

  await puppet.start()

  puppet.on('login', async contactId => {
    const validateResult = await puppet.contactValidate('id')
    t.ok(!validateResult, 'validate result should be false')

    const contactList: string[] = await puppet.contactList()

    t.ok(contactList.length === 1, 'contact list should be 1, which only contains self')

    await puppet.stop()
    t.plan(TOTAL_TEST_CHECK)
    await mockServer.stop()
  })
})
