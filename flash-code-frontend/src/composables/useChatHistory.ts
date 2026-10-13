import { ref } from 'vue'
import { listAppChatHistory } from '@/api/chatHistoryController.ts'
import { asApiId } from '@/utils/id.ts'
import { CHAT_MESSAGE_TYPE } from '@/constants/chat.ts'
import type { ChatMessage } from '@/types/chat.ts'

/** 每页加载的对话条数 */
export const CHAT_HISTORY_PAGE_SIZE = 10

/**
 * 应用对话历史（游标分页）
 *
 * 后端按 createTime 倒序返回一页数据，游标为「已加载消息里最旧一条的 createTime」，
 * 前端按创建时间升序维护列表，加载更多时把更早的一页插到列表最前面。
 */
export const useChatHistory = (appId: string) => {
  /** 消息列表（创建时间升序） */
  const messages = ref<ChatMessage[]>([])
  /** 是否正在加载历史 */
  const loading = ref(false)
  /** 是否还有更早的消息 */
  const hasMore = ref(false)
  /** 该应用的对话总数（首次加载时由后端返回） */
  const total = ref(0)
  /** 是否成功读取过历史（未登录或无权限时为 false） */
  const loaded = ref(false)

  // 游标：已加载消息里最旧一条的创建时间
  let cursor = ''

  /** 后端记录 -> 页面消息 */
  const toMessage = (record: API.ChatHistory): ChatMessage => ({
    id: String(record.id),
    role: record.messageType === CHAT_MESSAGE_TYPE.AI ? 'ai' : 'user',
    content: record.message ?? '',
    createTime: record.createTime,
  })

  /**
   * 拉取一页历史
   * @param older 是否为「加载更早的一页」
   */
  const fetchPage = async (older: boolean) => {
    if (loading.value || !appId) {
      return
    }
    loading.value = true
    try {
      const res = await listAppChatHistory({
        appId: asApiId(appId),
        pageSize: CHAT_HISTORY_PAGE_SIZE,
        ...(older && cursor ? { lastCreateTime: cursor } : {}),
      })
      if (res.data.code !== 0 || !res.data.data) {
        return
      }
      const records = res.data.data.records ?? []
      // 后端按时间倒序返回，转成升序后再拼接
      const pageMessages = records.map(toMessage).reverse()
      if (older) {
        messages.value.unshift(...pageMessages)
      } else {
        messages.value = pageMessages
        // totalRow 由后端序列化为字符串，这里统一转成数字
        total.value = Number(res.data.data.totalRow ?? 0)
      }
      // 游标取本页最旧一条（倒序返回的最后一条）的创建时间
      const oldest = records[records.length - 1]
      cursor = oldest?.createTime ?? ''
      // 返回条数不足一页说明没有更早的消息了
      hasMore.value = records.length >= CHAT_HISTORY_PAGE_SIZE
      loaded.value = true
    } catch {
      // 未登录 / 无权查看他人应用的对话历史时静默处理，不影响页面其余功能
    } finally {
      loading.value = false
    }
  }

  /** 加载最新一页（进入页面时调用） */
  const loadLatest = async () => {
    cursor = ''
    hasMore.value = false
    await fetchPage(false)
  }

  /** 加载更早的一页 */
  const loadMore = async () => {
    if (!hasMore.value) {
      return
    }
    await fetchPage(true)
  }

  /** 本地追加一条消息（发送消息 / 流式生成时使用） */
  const appendMessage = (message: ChatMessage) => {
    messages.value.push(message)
  }

  return { messages, loading, hasMore, total, loaded, loadLatest, loadMore, appendMessage }
}
