#!/usr/bin/env ts-node

// tslint:disable:no-shadowed-variable
import test  from 'blue-tape'

import {
  xmlToJson,
}                           from './xml-to-json'

test('xml2json()', async t => {
  const TEXT         = '<mol>42</mol>'
  const EXPECTED_OBJ = { mol: '42' }

  const json = await xmlToJson(TEXT)
  t.deepEqual(json, EXPECTED_OBJ, 'should parse xml to json right')
})

test('xml2json() $', async t => {
  const TEXT         = '<mol meaning="42"><life>17</life></mol>'
  const EXPECTED_OBJ = { mol: { $: { meaning: '42' }, life: '17' } }

  const json = await xmlToJson(TEXT)
  t.deepEqual(json, EXPECTED_OBJ, 'should parse xml to json right')
})
