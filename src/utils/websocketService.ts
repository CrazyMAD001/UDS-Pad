/**
 * WebSocket 通用工具（浏览器）
 *
 * features:
 * - 自动重连（指数回退 + 最大重试次数）
 * - 心跳检测（发送 heartBeatMessage，等待 heartBeatReply）
 * - 发送队列（连接建立前缓存）
 * - 简单事件系统：open / close / error / message / reconnect / connecting
 * - 支持可选 JSON 编解码与泛型消息类型
 *
 * 使用示例:
 * const ws = new WebSocketService<MyRecvType, MySendType>('wss://...', { json: true })
 * ws.on('message', msg => ...)
 * ws.connect()
 * ws.send({ type: 'hello' })
 */
import messageService from './messageService'
type WSEvent = 'open' | 'close' | 'error' | 'message' | 'reconnect' | 'connecting'

type Handler<T = any> = (payload?: T) => void

export interface WebSocketOptions {
  json?: boolean // 发送/接收是否以 JSON 处理（默认 true）
  autoConnect?: boolean // 构造后是否自动 connect（默认 true）
  reconnect?: boolean // 断开后是否自动重连（默认 true）
  maxReconnectAttempts?: number // 最大重连次数（默认 Infinity）
  reconnectInterval?: number // 初始重连间隔 ms（默认 1000）
  reconnectDecay?: number // 重连退避因子（默认 1.5）
  heartbeatInterval?: number // 心跳发送间隔 ms（0 表示关闭，默认 15000）
  heartbeatTimeout?: number // 心跳检测超时 ms（默认 5000）
  heartbeatMessage?: any // 发送的心跳消息（会根据 json 自动 stringify）
  heartbeatReply?: any // 心跳回复的匹配内容（可为 function | value），默认 'pong'
}

const DEFAULTS: Required<WebSocketOptions> = {
  json: true,
  autoConnect: false,
  reconnect: true,
  maxReconnectAttempts: 5,
  reconnectInterval: 1000,
  reconnectDecay: 1.5,
  heartbeatInterval: 3000,
  heartbeatTimeout: 5000,
  heartbeatMessage: { type: 'ping' },
  heartbeatReply: 'pong'
}

export default class WebSocketService<Recv = any, Send = any> {
  private url: string
  private opts: Required<WebSocketOptions>
  private ws?: WebSocket
  private reconnectAttempts = 0
  private reconnectTimer?: number
  private heartbeatTimer?: number
  private heartbeatTimeoutTimer?: number
  private lastPongAt = 0
  private sendQueue: Send[] = []
  private handlers: Map<WSEvent, Set<Handler>> = new Map()

  constructor(url: string, options?: WebSocketOptions) {
    this.url = url
    this.opts = { ...DEFAULTS, ...(options || {}) }
    ;['open', 'close', 'error', 'message', 'reconnect', 'connecting'].forEach((e) =>
      this.handlers.set(e as WSEvent, new Set())
    )

    if (this.opts.autoConnect) this.connect()
  }

  // 连接
  connect(): void {
    if (
      this.ws &&
      (this.ws.readyState === WebSocket.OPEN || this.ws.readyState === WebSocket.CONNECTING)
    )
      return
    this.emit('connecting')
    try {
      console.log('Connecting to WebSocket:', this.url)
      this.ws = new WebSocket(this.url)
    } catch (err) {
      this.emit('error', err)
      messageService.error('WebSocket 连接失败: ' + (err as Error).message)
      return
    }

    this.ws.onopen = async (ev) => {
      this.reconnectAttempts = 0

      this.emit('open', ev)
      this.flushQueue()
      // this.startHeartbeat()

      messageService.success('WebSocket 连接成功!')
    }

    this.ws.onmessage = (ev) => {
      const data = this.parseMessage(ev.data)
      console.log('Received data:', data)
      // 心跳回复检测
      if (this.isHeartbeatReply(data)) {
        this.lastPongAt = Date.now()
        return
      }
      this.emit('message', data as Recv)
    }

    this.ws.onerror = (ev) => {
      this.emit('error', ev)
    }

    this.ws.onclose = (ev) => {
      this.stopHeartbeat()
      this.emit('close', ev)
      // 非主动关闭且允许重连 => 重连
      if (this.opts.reconnect && !this.isNormalClose(ev)) {
        this.tryReconnect()
      }
    }
  }

  // 关闭（主动）
  close(code = 1000, reason?: string): void {
    this.opts.reconnect = false // 主动关闭时不再重连
    this.stopHeartbeat()
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer)
      this.reconnectTimer = undefined
    }
    if (this.ws) {
      try {
        this.ws.close(code, reason)
      } catch (e) {
        // ignore
      }
    }
  }

  // 发送（支持连接前缓存）
  send(payload: Send): void {
    const raw = this.opts.json ? safeStringify(payload) : (payload as unknown as string)
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(raw)
    } else {
      this.sendQueue.push(payload)
    }
  }

  // 订阅事件
  on<E extends WSEvent>(event: E, fn: Handler<any>): void {
    this.handlers.get(event)?.add(fn)
  }

  // 取消订阅
  off<E extends WSEvent>(event: E, fn: Handler<any>): void {
    this.handlers.get(event)?.delete(fn)
  }

  // 是否连接中 / 已连接
  isConnected(): boolean {
    return !!this.ws && this.ws.readyState === WebSocket.OPEN
  }

  // ----- internal -----
  private emit(event: WSEvent, payload?: any) {
    this.handlers.get(event)?.forEach((h) => {
      try {
        h(payload)
      } catch (e) {
        // swallow handler errors
        console.error(e)
      }
    })
  }

  private flushQueue() {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return
    while (this.sendQueue.length) {
      const p = this.sendQueue.shift()!
      const raw = this.opts.json ? safeStringify(p) : (p as unknown as string)
      try {
        this.ws.send(raw)
      } catch (e) {
        // 如果发送失败，重新放回队列并停止
        this.sendQueue.unshift(p)
        break
      }
    }
  }

  private tryReconnect() {
    if (this.reconnectAttempts >= this.opts?.maxReconnectAttempts) return
    this.reconnectAttempts++
    const delay = Math.floor(
      this.opts.reconnectInterval * Math.pow(this.opts.reconnectDecay, this.reconnectAttempts - 1)
    )
    this.emit('reconnect', { attempt: this.reconnectAttempts, delay })
    this.reconnectTimer = window.setTimeout(() => {
      this.connect()
    }, delay)
  }

  private startHeartbeat() {
    if (this.opts.heartbeatInterval <= 0) return
    this.lastPongAt = Date.now()
    // 每次发心跳并等待响应
    this.heartbeatTimer = window.setInterval(() => {
      if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return
      // 如果上次心跳超时未收到回复 -> 断开，触发重连
      if (Date.now() - this.lastPongAt > this.opts.heartbeatInterval + this.opts.heartbeatTimeout) {
        try {
          this.ws.close()
        } catch {}
        return
      }
      // 发送心跳
      try {
        const raw = this.opts.json
          ? safeStringify(this.opts.heartbeatMessage)
          : (this.opts.heartbeatMessage as any as string)
        this.ws!.send(raw)
        // 设置超时以便检测 pong 未到
        if (this.heartbeatTimeoutTimer) {
          clearTimeout(this.heartbeatTimeoutTimer)
        }
        this.heartbeatTimeoutTimer = window.setTimeout(() => {
          // 如果在 heartbeatTimeout 内没有更新 lastPongAt，则触发断开
          if (Date.now() - this.lastPongAt > this.opts.heartbeatTimeout) {
            try {
              this.ws?.close()
            } catch {}
          }
        }, this.opts.heartbeatTimeout)
      } catch (e) {
        // ignore send errors
      }
    }, this.opts.heartbeatInterval)
  }

  private stopHeartbeat() {
    if (this.heartbeatTimer) {
      clearInterval(this.heartbeatTimer)
      this.heartbeatTimer = undefined
    }
    if (this.heartbeatTimeoutTimer) {
      clearTimeout(this.heartbeatTimeoutTimer)
      this.heartbeatTimeoutTimer = undefined
    }
  }

  private parseMessage(raw: any): any {
    if (!this.opts.json) return raw
    try {
      if (typeof raw === 'string') return JSON.parse(raw)

      return raw
    } catch {
      return raw
    }
  }

  private isHeartbeatReply(data: any): boolean {
    if (this.opts.heartbeatReply == null) return false
    const reply = this.opts.heartbeatReply
    if (typeof reply === 'function') {
      try {
        return !!reply(data)
      } catch {
        return false
      }
    }
    // 简单匹配：相等或对象深相等（JSON 序列化）
    if (data === reply) return true
    try {
      return JSON.stringify(data) === JSON.stringify(reply)
    } catch {
      return false
    }
  }

  private isNormalClose(ev: CloseEvent): boolean {
    // 1000 是正常关闭
    return ev && ev.code === 1000
  }
}

// small util
function safeStringify(v: any): string {
  try {
    return typeof v === 'string' ? v : JSON.stringify(v)
  } catch {
    return String(v)
  }
}
