/**
 * 对话消息
 */
export interface ChatMessage {
  /** 消息唯一标识 */
  id: string
  /** 消息来源 */
  role: 'user' | 'ai'
  /** 消息内容，AI 消息为 Markdown 原文 */
  content: string
}
