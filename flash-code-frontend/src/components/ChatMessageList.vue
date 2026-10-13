<template>
  <div ref="listRef" class="message-list">
    <!-- 更早的历史消息 -->
    <div v-if="hasMore" class="message-load-more">
      <a-button type="link" size="small" :loading="loadingMore" @click="handleLoadMore">
        加载更多
      </a-button>
    </div>

    <a-empty v-if="messages.length === 0" description="和 AI 说点什么，开始生成你的应用吧" />
    <div
      v-for="item in messages"
      :key="item.id"
      class="message-item"
      :class="item.role === 'user' ? 'message-item-user' : 'message-item-ai'"
    >
      <a-avatar v-if="item.role === 'ai'" :size="32" :src="aiAvatar" class="message-avatar" />
      <div class="message-content" :class="item.role === 'user' ? 'is-user' : 'is-ai'">
        <span v-if="!item.content && item.role === 'ai'" class="message-loading">
          正在思考中……
        </span>
        <!-- AI 回复按 Markdown 渲染，支持代码高亮 -->
        <MarkdownRenderer
          v-else-if="item.role === 'ai'"
          :content="item.content"
          :streaming="streaming"
        />
        <template v-else>{{ item.content }}</template>
      </div>
      <a-avatar v-if="item.role === 'user'" :size="32" :src="userAvatar" class="message-avatar">
        {{ (userName ?? '我').slice(0, 1) }}
      </a-avatar>
    </div>
  </div>
</template>

<script setup lang="ts">
import { nextTick, ref, watch } from 'vue'
import defaultAiAvatar from '@/assets/logo.png'
import MarkdownRenderer from '@/components/MarkdownRenderer.vue'
import type { ChatMessage } from '@/types/chat.ts'

interface Props {
  /** 消息列表 */
  messages: ChatMessage[]
  /** AI 是否正在流式输出（用于限制 Markdown 重渲染频率） */
  streaming?: boolean
  /** 是否还有更早的历史消息 */
  hasMore?: boolean
  /** 是否正在加载更早的历史消息 */
  loadingMore?: boolean
  /** AI 头像 */
  aiAvatar?: string
  /** 当前登录用户昵称，用于生成头像占位文字 */
  userName?: string
  /** 当前登录用户头像 */
  userAvatar?: string
}

const props = withDefaults(defineProps<Props>(), {
  streaming: false,
  hasMore: false,
  loadingMore: false,
  aiAvatar: defaultAiAvatar,
})

const emit = defineEmits<{
  /** 加载更早的历史消息 */
  (e: 'load-more'): void
}>()

const listRef = ref<HTMLElement>()

/** 滚动到消息列表底部 */
const scrollToBottom = async () => {
  await nextTick()
  const el = listRef.value
  if (el) {
    el.scrollTop = el.scrollHeight
  }
}

// 加载更早消息前后的高度与滚动位置，用于保持视觉位置不跳动
let prevScrollHeight = 0
let prevScrollTop = 0

const handleLoadMore = () => {
  const el = listRef.value
  prevScrollHeight = el?.scrollHeight ?? 0
  prevScrollTop = el?.scrollTop ?? 0
  emit('load-more')
}

// 旧消息插入到顶部后，把滚动位置补偿回原来的位置
watch(
  () => props.loadingMore,
  async (loading, wasLoading) => {
    if (!wasLoading || loading) {
      return
    }
    await nextTick()
    const el = listRef.value
    if (el && prevScrollHeight) {
      el.scrollTop = prevScrollTop + (el.scrollHeight - prevScrollHeight)
      prevScrollHeight = 0
    }
  },
)

defineExpose({ scrollToBottom })
</script>

<style scoped>
.message-list {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 12px;
}

/* 加载更多历史消息 */
.message-load-more {
  display: flex;
  justify-content: center;
  margin-bottom: 4px;
}

.message-item {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  margin-bottom: 16px;
}

.message-item-user {
  justify-content: flex-end;
}

.message-avatar {
  flex: none;
}

.message-content {
  max-width: 82%;
  padding: 8px 12px;
  border-radius: 10px;
  font-size: 13px;
  line-height: 1.7;
  word-break: break-word;
}

.message-content.is-user {
  white-space: pre-wrap;
  background: #1890ff;
  color: #fff;
  border-top-right-radius: 2px;
}

.message-content.is-ai {
  /* Markdown 渲染后的内容自行控制换行，代码块需要更宽的空间 */
  max-width: 94%;
  padding: 10px 14px;
  background: #fff;
  border: 1px solid #f0f0f0;
  color: rgba(0, 0, 0, 0.85);
  border-top-left-radius: 2px;
}

.message-loading {
  color: rgba(0, 0, 0, 0.45);
}
</style>
