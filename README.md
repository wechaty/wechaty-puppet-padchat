# WECHATY-PUPPET-PADCHAT (DEPRECATED)

[![English Version](https://img.shields.io/badge/-English%20Version-blue.svg)](/README-en.md)

[![Powered by Wechaty](https://img.shields.io/badge/Powered%20By-Wechaty-blue.svg)](https://github.com/chatie/wechaty)
[![NPM Version](https://badge.fury.io/js/wechaty-puppet-padchat.svg)](https://www.npmjs.com/package/wechaty-puppet-padchat)
[![npm (tag)](https://img.shields.io/npm/v/wechaty-puppet-padchat/next.svg)](https://www.npmjs.com/package/wechaty-puppet-padchat?activeTab=versions)
[![TypeScript](https://img.shields.io/badge/%3C%2F%3E-TypeScript-blue.svg)](https://www.typescriptlang.org/)
[![Linux/Mac Build Status](https://travis-ci.com/lijiarui/wechaty-puppet-padchat.svg?branch=master)](https://travis-ci.com/lijiarui/wechaty-puppet-padchat) [![Greenkeeper badge](https://badges.greenkeeper.io/lijiarui/wechaty-puppet-padchat.svg)](https://greenkeeper.io/)

# 已不再维护

这个项目之后不再继续维护，需要通过iPad方式接入微信的开发者们请移步 [`wechaty-puppet-padpro`](https://github.com/botorange/wechaty-puppet-padpro)

`wechaty-puppet-padpro`是本项目的升级版，支持更多的功能，提供更稳定的服务

---

这个模块是是通过WebSocket 连接一个协议服务器来控制iPad 微信，实现个人号的微信接口。

这个模块是基于[Wechaty](https://github.com/Chatie/wechaty/) 的子模块，专门针对ipad 接入的。wechaty 是一个开源的的 **个人号** 微信机器人接口，是一个使用Typescript 构建的Node.js 应用。支持多种微信接入方案，包括网页，ipad，ios，windows， android 等。同时支持[Linux](https://travis-ci.com/chatie/wechaty), [Windows](https://ci.appveyor.com/project/chatie/wechaty), [Darwin\(OSX/Mac\)](https://travis-ci.com/chatie/wechaty) 和 [Docker](https://app.shippable.com/github/Chatie/wechaty) 多个平台。

只需要6行代码，你就可以 **通过个人号** 搭建一个 **微信机器人功能** ，用来自动管理微信消息。

更多功能包括：

* 消息处理：关键词回复
* 群管理：自动入群，拉人，踢人
* 自动处理好友请求
* 智能对话：通过简单配置，即可加入智能对话系统，完成指定任务
* ... 请自行开脑洞

详情请看[Wechaty](https://github.com/chatie/wechaty)项目 [![NPM Version](https://badge.fury.io/js/wechaty.svg)](https://badge.fury.io/js/wechaty) [![Docker Pulls](https://img.shields.io/docker/pulls/zixia/wechaty.svg?maxAge=2592000)](https://hub.docker.com/r/zixia/wechaty/) [![TypeScript](https://img.shields.io/badge/<%2F>-TypeScript-blue.svg)](https://www.typescriptlang.org/) [![Greenkeeper badge](https://badges.greenkeeper.io/Chatie/wechaty.svg)](https://greenkeeper.io/)

## 安装

```shell
npm install wechaty
npm install wechaty-puppet-padchat
```

## 示例代码

```ts
import { Wechaty } from 'wechaty'

const WECHATY_PUPPET_PADCHAT_TOKEN = 'your-token-here'

const puppet = 'wechaty-puppet-padchat' // 使用ipad 的方式接入。

const puppetOptions = {
  token: WECHATY_PUPPET_PADCHAT_TOKEN,
}
  
const bot = new Wechaty({
  puppet,
  puppetOptions,
})

// 设置完成

// 运行 wechaty
bot
.on('scan', (qrcode, status) => console.log(`Scan QR Code to login: ${status}\nhttps://api.qrserver.com/v1/create-qr-code/?data=${encodeURIComponent(qrcode)}`))
.on('login',            user => console.log(`User ${user} logined`))
.on('message',       message => console.log(`Message: ${message}`))
.start()
```

## 运行

```shell
./node_modules/.bin/ts-node examples/wechaty-padchat-bot.ts
```

## 购买Token

- [点击购买](https://token.juzi.bot/info)
- [了解更多Token 相关内容](https://github.com/lijiarui/wechaty-puppet-padchat/wiki/%E8%B4%AD%E4%B9%B0token)

## 文档

[https://docs.chatie.io](https://docs.chatie.io)

## AUTHOR

Jiarui LI <rui@chatie.io>

## LICENSE

Apache-2.0
