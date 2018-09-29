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
 
  private mockWXGetQRCode = (ws: WebSocket, messageObj: PadchatRpcRequest) => {
    this.sendMockMessage(ws, messageObj, {
      message: 'success',
      status: 0,
      qr_code: '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'
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
    WXGetQRCode: {
      func: this.mockWXGetQRCode
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
