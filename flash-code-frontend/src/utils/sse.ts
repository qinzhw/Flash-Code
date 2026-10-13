/**
 * 轻量级 SSE（Server-Sent Events）客户端
 *
 * 生成的接口代码基于 axios，浏览器端的 axios 无法逐块读取响应流，
 * 因此这里使用原生 fetch + ReadableStream 手动解析 text/event-stream，
 * 避免额外引入第三方依赖。
 */

/** 一条 SSE 事件 */
export interface SSEMessage {
  /** 事件名称，未指定时为 message */
  event: string
  /** data 字段内容（多行 data 以 \n 拼接） */
  data: string
}

export interface SSEOptions {
  /** 每收到一条事件时触发 */
  onMessage?: (message: SSEMessage) => void
  /** 连接异常时触发 */
  onError?: (error: unknown) => void
  /** 连接正常结束时触发 */
  onClose?: () => void
  /** 用于主动中断连接 */
  signal?: AbortSignal
}

/**
 * 解析单个 SSE 事件块
 */
const parseEvent = (rawEvent: string): SSEMessage | null => {
  let event = 'message'
  const dataLines: string[] = []
  for (const line of rawEvent.split('\n')) {
    // 空行是事件分隔符，以冒号开头的是注释（心跳包）
    if (!line || line.startsWith(':')) {
      continue
    }
    const colonIndex = line.indexOf(':')
    const field = colonIndex === -1 ? line : line.slice(0, colonIndex)
    // 规范：冒号后紧跟一个可选空格需要去掉
    let value = colonIndex === -1 ? '' : line.slice(colonIndex + 1)
    if (value.startsWith(' ')) {
      value = value.slice(1)
    }
    if (field === 'event') {
      event = value
    } else if (field === 'data') {
      dataLines.push(value)
    }
  }
  if (dataLines.length === 0 && event === 'message') {
    return null
  }
  return { event, data: dataLines.join('\n') }
}

/**
 * 建立 SSE 连接并持续回调事件
 */
export const fetchSSE = async (url: string, options: SSEOptions = {}) => {
  const { onMessage, onError, onClose, signal } = options
  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        Accept: 'text/event-stream',
      },
      credentials: 'include',
      signal,
    })
    if (!response.ok || !response.body) {
      throw new Error(`请求失败，状态码：${response.status}`)
    }

    const reader = response.body.getReader()
    const decoder = new TextDecoder('utf-8')
    let buffer = ''

    while (true) {
      const { done, value } = await reader.read()
      if (done) {
        break
      }
      // 统一换行符，兼容服务端返回 \r\n 的情况
      buffer = (buffer + decoder.decode(value, { stream: true })).replace(/\r\n/g, '\n')
      let separatorIndex = buffer.indexOf('\n\n')
      while (separatorIndex !== -1) {
        const message = parseEvent(buffer.slice(0, separatorIndex))
        buffer = buffer.slice(separatorIndex + 2)
        if (message) {
          onMessage?.(message)
        }
        separatorIndex = buffer.indexOf('\n\n')
      }
    }

    // 处理服务端最后一段没有以空行结尾的事件
    const rest = parseEvent(buffer.replace(/\r\n/g, '\n'))
    if (rest) {
      onMessage?.(rest)
    }
    onClose?.()
  } catch (error) {
    // 主动中断属于正常流程，不做错误处理
    if ((error as Error)?.name === 'AbortError') {
      return
    }
    onError?.(error)
  }
}
