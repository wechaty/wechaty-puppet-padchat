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

const WECHATY_PUPPET_PADCHAT_ENDPOINT_ENV_VAR = 'WECHATY_PUPPET_PADCHAT_ENDPOINT'

export const WECHATY_PUPPET_PADCHAT_ENDPOINT = process.env[WECHATY_PUPPET_PADCHAT_ENDPOINT_ENV_VAR]  || 'ws://54.223.73.175:8788/wx'
export const SELF_QRCODE_MAX_RETRY = 5

export const CON_TIME_OUT = 10000
export const RE_CON_RETRY = 6
export const RE_CON_INTERVAL = 5000
export const POST_LOGIN_API_CALL_INTERVAL = 100
export const MAX_HEARTBEAT_TIMEOUT = 3

const logLevel = process.env.WECHATY_LOG
if (logLevel) {
  log.level(logLevel.toLowerCase() as any)
  log.silly('Config', 'WECHATY_LOG set level to %s', logLevel)
}

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

/**
 * VERSION
 */
import readPkgUp from 'read-pkg-up'

const pkg = readPkgUp.sync({ cwd: __dirname }).pkg
export const VERSION = pkg.version

export {
  log,
  padchatToken,
}
