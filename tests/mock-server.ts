#!/usr/bin/env ts-node
// tslint:disable:object-literal-sort-keys
// tslint:disable:no-trailing-whitespace
// tslint:disable:no-unnecessary-type-assertion

import WebSocket from 'ws'

import { PadchatRpcRequest } from '../src/padchat-rpc.type'

import { MOCK_SELF_CONTACT, MOCK_TOKEN, MOCK_USER_ID } from './mock-config' 
interface MockFunction {
  callLimit?: number,
  callCount?: number,
  func: (ws: WebSocket, messageObj: PadchatRpcRequest) => void,
}

export class MockSocketServer {
  private readonly USER_NAME = MOCK_USER_ID
  private port: number
  private server?: WebSocket.Server
  private contactPayloadMockArray: any[] = []
  private contactCounter = 0

  constructor (port: number) {
    this.port = port
  }

  private mockInitApi = (ws: WebSocket, messageObj: PadchatRpcRequest) => {
    this.sendMockMessage(ws, messageObj, {
      message: 'success',
      status: 0
    })
  }
 
  private mockWXInitialize = (ws: WebSocket, messageObj: PadchatRpcRequest) => {
    this.sendMockMessage(ws, messageObj, {
      message: 'success',
      status: 0
    })
  }
 
  private mockWXCheckQRCode = (ws: WebSocket, messageObj: PadchatRpcRequest) => {
    this.sendMockMessage(ws, messageObj, {
      status: 2,
      user_name: this.USER_NAME,
      password: 'very_secure'
    })
  }
 
  private mockWXQRCodeLogin = (ws: WebSocket, messageObj: PadchatRpcRequest) => {
    this.sendMockMessage(ws, messageObj, {
      status: 0,
      user_name: this.USER_NAME
    })
  }
 
  private mockWXHeartBeat = (ws: WebSocket, messageObj: PadchatRpcRequest) => {
    this.sendMockMessage(ws, messageObj, {
      status: 0,
      message: ':P'
    })
  }
 
  private mockWXGenerateWxDat = (ws: WebSocket, messageObj: PadchatRpcRequest) => {
    this.sendMockMessage(ws, messageObj, {
      status: 0,
      data: 'YnBsaXN0MDDUAQIDBAUGCQpYJHZlcnNpb25YJG9iamVjdHNZJGFyY2hpdmVyVCR0b3ASAAGGoKIHCFUkbnVsbF8QIDJjOGQzNDZmNTNjNmVjNmI4OTE1YjEwNTY4YjYyY2MzXxAPTlNLZXllZEFyY2hpdmVy0QsMVHJvb3SAAQgRGiMtMjc6QGN1eH0AAAAAAAABAQAAAAAAAAANAAAAAAAAAAAAAAAAAAAAfw=='
    })
  }
 
  private mockWXGetLoginToken = (ws: WebSocket, messageObj: PadchatRpcRequest) => {
    this.sendMockMessage(ws, messageObj, {
      status: 0,
      token: MOCK_TOKEN,
      uin: 1234567
    })
  }
 
  private mockWXGetContact = (ws: WebSocket, messageObj: PadchatRpcRequest) => {
    if (messageObj.param && messageObj.param.length ===  1
        && messageObj.param[0] === this.USER_NAME
    ) {
      this.sendMockMessage(ws, messageObj, MOCK_SELF_CONTACT)
    } else {
      if (this.contactCounter < this.contactPayloadMockArray.length) {
        this.sendMockMessage(ws, messageObj, this.contactPayloadMockArray[this.contactCounter])
        this.contactCounter++
      } else {
        console.warn('No more mock contact payload to be returned, returned empty result')
        this.sendMockMessage(ws, messageObj, {})
      }
    }
  }
 
  private sendMockMessage = (ws: WebSocket, messageObj: PadchatRpcRequest, obj: any) => {
    ws.send(this.constructPayload(messageObj.msgId as string, obj))
  }
 
  private constructPayload = (msgId: string, data: any) => {
    return JSON.stringify({
      msgId,
      data: encodeURIComponent(JSON.stringify(data))
    })
  }

  private apiMapping: { [apiName: string]: MockFunction } = {
    init: {
      callLimit: 1,
      func: this.mockInitApi
    },
    WXInitialize: {
      callLimit: 1,
      func: this.mockWXInitialize
    },
    WXCheckQRCode: {
      callLimit: 1,
      func: this.mockWXCheckQRCode
    },
    WXQRCodeLogin: {
      callLimit: 1,
      func: this.mockWXQRCodeLogin
    },
    WXHeartBeat: {
      callLimit: 1,
      func: this.mockWXHeartBeat
    },
    WXGenerateWxDat: {
      callLimit: 1,
      func: this.mockWXGenerateWxDat
    },
    WXGetLoginToken: {
      callLimit: 1,
      func: this.mockWXGetLoginToken
    },
    WXGetContact: {
      func: this.mockWXGetContact
    }
  }

  private fakeApiResponse = (api: MockFunction, ws: WebSocket, messageObj: PadchatRpcRequest) => {
    if (api.callLimit) {
      if (typeof api.callCount === 'undefined') {
        api.callCount = 0
      }
      if (api.callCount < api.callLimit) {
        api.callCount++
        api.func(ws, messageObj)
      } else {
        console.log(`Drop call since call limit exceed, message: ${JSON.stringify(messageObj)}`)
      }
    } else {
      api.func(ws, messageObj)
    }
  }

  public start = async () => {
    this.server = new WebSocket.Server({ port: this.port })
    this.server.on('connection', ws => {
      ws.on('message', message => {
        const messageObj: PadchatRpcRequest = JSON.parse(message.toString())
        const { apiName } = messageObj
        if (apiName) {
          if (this.apiMapping[apiName]) {
            this.fakeApiResponse(this.apiMapping[apiName], ws, messageObj)
          } else {
            console.error(`No mapping for ${apiName} in /tests/mock-api.ts 
                please add your mock to run the integration test`)
          }
        } else {
          console.error(`Received non api message, please check! Message: ${message}`)
        }
      })
    })
  }

  public setContactPayloadMockArray = (mockArray: any[]) => {
    this.contactPayloadMockArray = mockArray
  }

  public stop = async () => {
    if (this.server) {
      await this.server!.close()
    }
  }
}
