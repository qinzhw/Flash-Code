<template>
  <!-- eslint-disable-next-line vue/no-v-html -->
  <div class="markdown-body" v-html="renderedHtml" @click="handleCopyClick" />
</template>

<script setup lang="ts">
import { onBeforeUnmount, ref, watch } from 'vue'
import { message } from 'ant-design-vue'
import { renderMarkdown } from '@/utils/markdown.ts'
// 代码高亮主题（.hljs 命名空间，仅在代码块内生效）
import 'highlight.js/styles/github-dark.css'

interface Props {
  /** Markdown 原文 */
  content: string
  /** 是否正在流式输出：开启后会限制重渲染频率 */
  streaming?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  streaming: false,
})

/** AI 回复是逐块返回的，重渲染（含代码高亮）节流，避免每个字符都全量解析 */
const STREAM_THROTTLE_MS = 80

const renderedHtml = ref('')

let timer: ReturnType<typeof setTimeout> | null = null
let hasPendingRender = false

const render = () => {
  renderedHtml.value = renderMarkdown(props.content)
}

const scheduleRender = () => {
  if (!props.streaming) {
    render()
    return
  }
  // 首次立即渲染，保证内容及时出现；后续最多每 STREAM_THROTTLE_MS 渲染一次
  if (timer) {
    hasPendingRender = true
    return
  }
  render()
  timer = setTimeout(() => {
    timer = null
    if (hasPendingRender) {
      hasPendingRender = false
      scheduleRender()
    }
  }, STREAM_THROTTLE_MS)
}

const stopThrottle = () => {
  if (timer) {
    clearTimeout(timer)
    timer = null
  }
  hasPendingRender = false
}

// 流式过程中节流渲染
watch(() => props.content, scheduleRender, { immediate: true })

// 流式结束后补一次完整渲染
watch(
  () => props.streaming,
  (streaming) => {
    if (!streaming) {
      stopThrottle()
      render()
    }
  },
)

onBeforeUnmount(stopThrottle)

/** 代码块复制：v-html 内部无法绑定事件，使用事件委托 */
const handleCopyClick = async (event: MouseEvent) => {
  const trigger = (event.target as HTMLElement | null)?.closest('[data-code-copy]')
  if (!trigger) {
    return
  }
  const code = trigger.closest('.md-code-block')?.querySelector('code')?.textContent ?? ''
  if (!code) {
    return
  }
  try {
    await navigator.clipboard.writeText(code)
    message.success('代码已复制')
  } catch {
    message.error('复制失败，请手动选中代码复制')
  }
}
</script>

<style scoped>
.markdown-body {
  font-size: 13px;
  line-height: 1.75;
  word-break: break-word;
  overflow-wrap: anywhere;
}

/* 基础排版 */
.markdown-body :deep(> *:first-child) {
  margin-top: 0;
}

.markdown-body :deep(> *:last-child) {
  margin-bottom: 0;
}

.markdown-body :deep(p) {
  margin: 0 0 10px;
}

.markdown-body :deep(h1),
.markdown-body :deep(h2),
.markdown-body :deep(h3),
.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
  margin: 16px 0 8px;
  font-weight: 600;
  line-height: 1.4;
}

.markdown-body :deep(h1) {
  font-size: 18px;
}

.markdown-body :deep(h2) {
  font-size: 16px;
}

.markdown-body :deep(h3) {
  font-size: 15px;
}

.markdown-body :deep(h4),
.markdown-body :deep(h5),
.markdown-body :deep(h6) {
  font-size: 14px;
}

.markdown-body :deep(ul),
.markdown-body :deep(ol) {
  margin: 0 0 10px;
  padding-left: 22px;
}

.markdown-body :deep(li) {
  margin-bottom: 4px;
}

.markdown-body :deep(li > p) {
  margin-bottom: 4px;
}

.markdown-body :deep(blockquote) {
  margin: 0 0 10px;
  padding: 6px 12px;
  color: rgba(0, 0, 0, 0.6);
  border-left: 3px solid #d9d9d9;
  background: #fafafa;
  border-radius: 0 6px 6px 0;
}

.markdown-body :deep(a) {
  color: #1890ff;
}

.markdown-body :deep(a:hover) {
  text-decoration: underline;
}

.markdown-body :deep(hr) {
  margin: 14px 0;
  border: none;
  border-top: 1px solid #f0f0f0;
}

.markdown-body :deep(strong) {
  font-weight: 600;
}

/* 表格 */
.markdown-body :deep(table) {
  width: 100%;
  margin: 0 0 10px;
  border-collapse: collapse;
  font-size: 12px;
}

.markdown-body :deep(th),
.markdown-body :deep(td) {
  padding: 6px 10px;
  border: 1px solid #ececec;
  text-align: left;
}

.markdown-body :deep(th) {
  background: #fafafa;
  font-weight: 600;
}

/* 行内代码 */
.markdown-body :deep(.md-code-inline) {
  padding: 1px 5px;
  font-family: 'JetBrains Mono', Consolas, Monaco, 'Courier New', monospace;
  font-size: 12px;
  color: #c41d7f;
  background: #f5f5f5;
  border-radius: 4px;
}

/* 代码块 */
.markdown-body :deep(.md-code-block) {
  margin: 0 0 10px;
  border-radius: 8px;
  overflow: hidden;
  background: #0d1117;
}

.markdown-body :deep(.md-code-header) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 12px;
  background: #161b22;
  border-bottom: 1px solid #21262d;
}

.markdown-body :deep(.md-code-lang) {
  font-size: 12px;
  font-weight: 600;
  color: #8b949e;
  text-transform: lowercase;
}

.markdown-body :deep(.md-code-title) {
  flex: 1;
  min-width: 0;
  font-size: 12px;
  color: #6e7681;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.markdown-body :deep(.md-code-copy) {
  margin-left: auto;
  padding: 1px 8px;
  font-size: 12px;
  color: #8b949e;
  background: transparent;
  border: 1px solid #30363d;
  border-radius: 4px;
  cursor: pointer;
  transition:
    color 0.2s,
    border-color 0.2s;
}

.markdown-body :deep(.md-code-copy:hover) {
  color: #e6edf3;
  border-color: #8b949e;
}

.markdown-body :deep(.md-code-pre) {
  margin: 0;
  padding: 12px;
  /* 代码较长时限制高度并在块内滚动，保证对话区可读 */
  max-height: 420px;
  overflow: auto;
  background: #0d1117;
}

.markdown-body :deep(.md-code-pre code) {
  padding: 0;
  font-family: 'JetBrains Mono', Consolas, Monaco, 'Courier New', monospace;
  font-size: 12px;
  line-height: 1.6;
  background: transparent;
  white-space: pre;
}
</style>
