/**
 * 对话消息类型，与后端 ChatHistoryMessageTypeEnum 保持一致
 *
 * public enum ChatHistoryMessageTypeEnum {
 *     USER("用户", "user"),
 *     AI("AI", "ai");
 * }
 */
export const CHAT_MESSAGE_TYPE = {
  /** 用户消息 */
  USER: 'user',
  /** AI 消息 */
  AI: 'ai',
} as const

/** 「消息类型」筛选下拉选项（不选表示全部） */
export const CHAT_MESSAGE_TYPE_OPTIONS = [
  { label: '用户', value: CHAT_MESSAGE_TYPE.USER },
  { label: 'AI', value: CHAT_MESSAGE_TYPE.AI },
]

/** 消息类型取值 -> 中文名称 */
export const getChatMessageTypeLabel = (value?: string): string => {
  if (!value) {
    return '-'
  }
  return CHAT_MESSAGE_TYPE_OPTIONS.find((item) => item.value === value)?.label ?? value
}
