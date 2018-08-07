#!/usr/bin/env ts-node

// tslint:disable:no-shadowed-variable
import test  from 'blue-tape'

import {
  xml2json,
}                           from './xml2json'

test('xml2json()', async t => {
  const TEXT         = '<mol>42</mol>'
  const EXPECTED_OBJ = { mol: '42' }

  const json = await xml2json(TEXT)
  t.deepEqual(json, EXPECTED_OBJ, 'should parse xml to json right')
})
