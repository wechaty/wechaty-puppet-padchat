# WECHATY-PUPPET-PADCHAT

[![Powered by Wechaty](https://img.shields.io/badge/Powered%20By-Wechaty-blue.svg)](https://github.com/chatie/wechaty)
[![NPM Version](https://badge.fury.io/js/wechaty-puppet-padchat.svg)](https://www.npmjs.com/package/wechaty-puppet-padchat)
[![npm (tag)](https://img.shields.io/npm/v/wechaty-puppet-padchat/next.svg)](https://www.npmjs.com/package/wechaty-puppet-padchat?activeTab=versions)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![Linux/Mac Build Status](https://travis-ci.com/lijiarui/wechaty-puppet-padchat.svg?branch=master)](https://travis-ci.com/lijiarui/wechaty-puppet-padchat) [![Greenkeeper badge](https://badges.greenkeeper.io/lijiarui/wechaty-puppet-padchat.svg)](https://greenkeeper.io/)

This module is a sub module of [Wechaty Puppet](https://github.com/Chatie/wechaty/issues/1167).

## INSTALL

```shell
npm install wechaty
npm install wechaty-puppet-padchat
```

## SOURCE

```ts
import { Wechaty } from 'wechaty'

const WECHATY_PUPPET_PADCHAT_TOKEN = 'your-token-here'

const puppet = 'wechaty-puppet-padchat'
const puppetOptions = {
  token: WECHATY_PUPPET_PADCHAT_TOKEN,
}
  
const bot = new Wechaty({
  puppet,
  puppetOptions,
})

// You are all set

// Run wechaty
bot
.on('scan', (qrcode, status) => console.log(`Scan QR Code to login: ${status}\nhttps://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrcode)}`))
.on('login',            user => console.log(`User ${user} logined`))
.on('message',       message => console.log(`Message: ${message}`))
.start()
```

## RUN

```shell
./node_modules/.bin/ts-node examples/wechaty-padchat-bot.ts
```

## Get Token

Scan the qrcode to contact us and ask for token
![contact](./image/contact.gif)

[More info about token](https://github.com/lijiarui/wechaty-puppet-padchat/wiki/Buy-Padchat-Token)

## AUTHOR

Jiarui LI <rui@chatie.io>

## LICENSE

Apache-2.0
