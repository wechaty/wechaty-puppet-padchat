# WECHATY-PUPPET-PADCHAT

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
npm install

./node_modules/.bin/ts-node \
  examples/wechaty-padchat-bot.ts
```

Currently you can apply a Alpha Testing Padchat Token at here: [Wechaty Padchat Alpha Testing](https://github.com/Chatie/wechaty/issues/1296)

## AUTHOR

Jiarui LI <rui@chatie.io>

## LICENSE

Apache-2.0
