# WECHATY-PUPPET-PADCHAT

[![Powered by Wechaty](https://img.shields.io/badge/Powered%20By-Wechaty-blue.svg)](https://github.com/chatie/wechaty)
[![NPM Version](https://badge.fury.io/js/wechaty-puppet-padchat.svg)](https://badge.fury.io/js/wechaty-puppet-padchat)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![Linux/Mac Build Status](https://travis-ci.com/lijiarui/wechaty-puppet-padchat.svg?branch=master)](https://travis-ci.com/lijiarui/wechaty-puppet-padchat)

This module is a sub module of [Wechaty Puppet](https://github.com/Chatie/wechaty/issues/1167).

## INSTALL

```shell
npm install wechaty@next
npm install wechaty-puppet-padchat
```

## SOURCE

```ts
import { Wechaty } from 'wechaty'
import { PuppetPadchat } from 'wechaty-puppet-padchat'

const WECHATY_PUPPET_PADCHAT_TOKEN = 'your-token-here'

const puppet = new PuppetPadchat({
  token: WECHATY_PUPPET_PADCHAT_TOKEN,
})

const bot = new Wechaty({
  puppet,
})

// You are all set
```

## RUN

```shell
./node_modules/.bin/ts-node examples/wechaty-padchat-bot.ts
```

Currently you can apply a Alpha Testing Padchat Token at here: [Wechaty Padchat Alpha Testing](https://github.com/Chatie/wechaty/issues/1296)

## AUTHOR

Jiarui LI <rui@chatie.io>

## LICENSE

Apache-2.0
