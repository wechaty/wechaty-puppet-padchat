import {
  Contact,
  Message,
  Wechaty,
}                   from 'wechaty'

import {
  PuppetPadchat,
}                   from '../src/'

import { FileBox }  from 'file-box'
import { generate } from 'qrcode-terminal'

/**
 *
 * 1. Create our bot
 *
 */
const puppet = new PuppetPadchat()

const bot = new Wechaty({
  name : 'padchat-demo',
  puppet,
})

/**
 *
 * 2. Define Event Handler Functions for:
 *  `scan`, `login`, `logout`, `error`, and `message`
 *
 */
function onScan (qrcode: string, status: number) {
  generate(qrcode, { small: true })

  const qrcodeImageUrl = [
    'https://api.qrserver.com/v1/create-qr-code/?data=',
    encodeURIComponent(qrcode),
    '&size=220x220&margin=0',
  ].join('')

  console.log(`[${status}] ${qrcodeImageUrl}\nScan QR Code above to log in: `)
}

function onLogin (user: Contact) {
  console.log(`${user.name()} login`)
  bot.say('Wechaty login').catch(console.error)
}

function onLogout (user: Contact) {
  console.log(`${user.name()} logouted`)
}

function onError (e: Error) {
  console.error('Bot error:', e)
  if (bot.logonoff()) {
    bot.say('Wechaty error: ' + e.message).catch(console.error)
  }
}

/**
 *
 * 3. The most important handler is for:
 *    dealing with Messages.
 *
 */
async function onMessage (msg: Message) {
  console.log(msg.toString())

  if (msg.age() > 60) {
    console.log('Message TOO OLD(than 1 minute), discarded.')
    return
  }

  if (!/^(ding|ping|bing|code)$/i.test(msg.text()) /*&& !msg.self()*/) {
    console.log('Message NOT MATCH, discarded.')
    return
  }

  /**
   * 3.1. reply 'dong'
   */
  await msg.say('dong')
  console.log('REPLY: dong')

  /**
   * 3.2. reply image(qrcode image)
   */
  const fileBox = FileBox.fromUrl('https://chatie.io/wechaty/images/bot-qr-code.png')

  await msg.say(fileBox)
  console.log('REPLY: %s', fileBox.toString())

  /**
   * 3.3. reply 'scan now!'
   */
  await msg.say([
    'Join Wechaty Developers Community\n\n',
    'Scan now, because other Wechaty developers want to talk with you too!\n\n',
    '(secret code: wechaty)'
  ].join(''))
}

/**
 *
 * 4. Register all event handlers
 *    that we had previous defined.
 *
 */
bot
.on('logout', onLogout)
.on('login',  onLogin)
.on('scan',   onScan)
.on('error',  onError)

.on('message', onMessage)

/**
 *
 * 5. Start the bot!
 *
 */
bot.start()
.catch(async e => {
  console.error('Bot start() fail:', e)
  await bot.stop()
  process.exit(-1)
})
