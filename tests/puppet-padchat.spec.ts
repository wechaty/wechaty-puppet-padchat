#!/usr/bin/env ts-node

// tslint:disable:no-shadowed-variable
import test  from 'blue-tape'
import sinon from 'sinon'

import {
  PadchatManager,
}                 from '../src/padchat-manager'
import {
  PuppetPadchat,
}                 from '../src/puppet-padchat'

class PuppetPadchatTest extends PuppetPadchat {
  public padchatManager? : PadchatManager
}

test('smoke testing', async t => {
  const puppet = new PuppetPadchatTest()

  const sandbox = sinon.createSandbox()

  await puppet.start()

  const mockWXGetContactPayload = (id: string) => {
    return { id } as any
  }

  const stub = sandbox.stub(puppet.padchatManager!, 'WXGetContactPayload')
                      .callsFake(mockWXGetContactPayload)

  // your `puppet` now is mocked with the mocked padchatManager with the mocked WXGetContactPayload

  // do whatever you want at here

  t.ok(stub.called, 'should call WXGetContactPayload')

  sandbox.restore()
})
