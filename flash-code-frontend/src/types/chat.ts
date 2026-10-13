/**
 * 对话消息
 */
export interface ChatMessage {
  /** 消息唯一标识（历史消息为数据库 id） */
  id: string
  /** 消息来源 */
  role: 'user' | 'ai'
  /** 消息内容，AI 消息为 Markdown 原文 */
  content: string
  /** 消息创建时间，历史消息用于游标分页 */
  createTime?: string
}
