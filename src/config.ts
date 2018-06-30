// tslint:disable:no-reference

/// <reference path="./typings.d.ts" />

import promiseRetry = require('promise-retry')
import { WrapOptions } from 'retry'

import qrImage   from 'qr-image'

import {
  FileBox,
}                 from 'file-box'

import {
  log,
}             from 'brolog'

export const WECHATY_PUPPET_PADCHAT_ENDPOINT = process.env.WECHATY_PUPPET_PADCHAT_ENDPOINT || 'ws://54.223.36.77:8080/wx'

function padchatToken () {
  const token = process.env.WECHATY_PUPPET_PADCHAT_TOKEN as string
  if (!token) {
    log.error('PuppetPadchatConfig', `

      WECHATY_PUPPET_PADCHAT_TOKEN environment variable not found.

      PuppetPadchat need a token before it can be used,
      Please set WECHATY_PUPPET_PADCHAT_TOKEN then retry again.


      Learn more about it at: https://github.com/Chatie/wechaty/issues/1296

    `)
    throw new Error('You need a valid WECHATY_PUPPET_PADCHAT_TOKEN to use PuppetPadchat')
  }
  return token
}

export async function retry<T> (
  retryableFn: (
    retry: (error: Error) => never,
    attempt: number,
  ) => Promise<T>,
): Promise<T> {
  /**
   * 60 seconds: (to be confirmed)
   *  factor: 3
   *  minTimeout: 10
   *  maxTimeout: 20 * 1000
   *  retries: 9
   */
  const factor     = 3
  const minTimeout = 10
  const maxTimeout = 20 * 1000
  const retries    = 9
  // const unref      = true

  const retryOptions: WrapOptions = {
    factor,
    maxTimeout,
    minTimeout,
    retries,
  }
  return promiseRetry(retryOptions, retryableFn)
}

export function qrCodeForChatie (): FileBox {
  const CHATIE_OFFICIAL_ACCOUNT_QRCODE = 'http://weixin.qq.com/r/qymXj7DEO_1ErfTs93y5'
  const name                           = 'qrcode-for-chatie.png'
  const type                           = 'png'

  const qrStream = qrImage.image(CHATIE_OFFICIAL_ACCOUNT_QRCODE, { type })
  return FileBox.fromStream(qrStream, name)
}

export {
  log,
  padchatToken,
}
