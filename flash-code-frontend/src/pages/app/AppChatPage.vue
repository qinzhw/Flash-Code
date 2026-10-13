<template>
  <div id="appChatPage">
    <!-- 顶部栏：左侧应用名称，右侧部署按钮 -->
    <div class="chat-header">
      <div class="chat-header-left">
        <a-button type="text" title="返回主页" @click="goHome">
          <template #icon>
            <arrow-left-outlined />
          </template>
        </a-button>
        <span class="app-name">{{ app?.appName || '未命名应用' }}</span>
        <a-tag v-if="isGood" color="gold">精选</a-tag>
        <span v-if="app?.user?.userName" class="app-author">作者：{{ app.user.userName }}</span>
        <a-button v-if="canManage" type="link" size="small" @click="goEditPage">
          <template #icon>
            <edit-outlined />
          </template>
          编辑
        </a-button>
      </div>

      <div class="chat-header-right">
        <a-button v-if="deployedUrl" type="link" :href="deployedUrl" target="_blank">
          <template #icon>
            <link-outlined />
          </template>
          访问已部署网站
        </a-button>
        <a-button @click="detailVisible = true">
          <template #icon>
            <info-circle-outlined />
          </template>
          应用详情
        </a-button>
        <a-button v-if="isOwner" type="primary" :loading="deploying" @click="doDeploy">
          <template #icon>
            <cloud-upload-outlined />
          </template>
          部署
        </a-button>
      </div>
    </div>

    <!-- 核心内容区域：左侧对话，右侧网页展示 -->
    <div class="chat-body">
      <!-- 左侧：消息区域 + 用户消息输入框 -->
      <div class="chat-panel">
        <ChatMessageList
          ref="messageListRef"
          :messages="messages"
          :streaming="isGenerating"
          :has-more="hasMore"
          :loading-more="historyLoading"
          :user-name="loginUserStore.loginUser.userName"
          :user-avatar="loginUserStore.loginUser.userAvatar"
          @load-more="loadMore"
        />

        <!-- 用户消息输入框：不是自己的作品时禁止对话 -->
        <div class="message-input">
          <a-tooltip :title="isOwner ? '' : CHAT_DISABLED_TIP" placement="topLeft">
            <div class="message-input-box">
              <a-textarea
                v-model:value="inputMessage"
                placeholder="请描述你想生成的网站，越详细效果越好哦"
                :auto-size="{ minRows: 2, maxRows: 5 }"
                :maxlength="1000"
                :disabled="isGenerating || !isOwner"
                @keydown.enter.exact.prevent="doSend"
              />
            </div>
          </a-tooltip>
          <div class="message-input-footer">
            <span class="input-tip">
              <template v-if="!isOwner">{{ CHAT_DISABLED_TIP }}</template>
              <template v-else>Enter 发送，Shift + Enter 换行</template>
            </span>
            <a-space>
              <a-button v-if="isGenerating" danger @click="doStop">停止生成</a-button>
              <a-button type="primary" :loading="isGenerating" :disabled="!isOwner" @click="doSend">
                发送
              </a-button>
            </a-space>
          </div>
        </div>
      </div>

      <!-- 右侧：网页展示区域 -->
      <AppPreviewPanel
        ref="previewPanelRef"
        :src="previewSrc"
        :visible="previewVisible"
        :generating="isGenerating"
        :deployed-url="deployedUrl"
      />
    </div>

    <!-- 应用详情弹窗 -->
    <AppDetailModal
      v-model:open="detailVisible"
      :app="app"
      simple
      @edit="goEditPage"
      @delete="doDeleteApp"
    />

    <!-- 部署成功弹窗 -->
    <DeployResultModal v-model:open="deployResultVisible" :url="deployedUrl" />
  </div>
</template>

<script setup lang="ts">
import { computed, nextTick, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import {
  ArrowLeftOutlined,
  CloudUploadOutlined,
  EditOutlined,
  InfoCircleOutlined,
  LinkOutlined,
} from '@ant-design/icons-vue'
import AppDetailModal from '@/components/AppDetailModal.vue'
import AppPreviewPanel from '@/components/AppPreviewPanel.vue'
import ChatMessageList from '@/components/ChatMessageList.vue'
import DeployResultModal from '@/components/DeployResultModal.vue'
import { useLoginUserStore } from '@/stores/loginUser.ts'
import { deleteApp, deployApp, getAppVoById } from '@/api/appController.ts'
import { API_BASE_URL } from '@/config'
import { fetchSSE } from '@/utils/sse.ts'
import { asApiId } from '@/utils/id.ts'
import { buildDeployUrl, buildPreviewUrl } from '@/utils/appUrl.ts'
import { confirmDelete } from '@/utils/confirm.ts'
import { useChatHistory } from '@/composables/useChatHistory.ts'
import { CODE_GEN_TYPE } from '@/constants/codeGenType.ts'
import { isGoodApp } from '@/constants/app.ts'
import type { ChatMessage } from '@/types/chat.ts'

/** 不是自己的作品时的提示文案 */
const CHAT_DISABLED_TIP = '无法在别人的作品下对话哦~'

const route = useRoute()
const router = useRouter()
const loginUserStore = useLoginUserStore()

// 应用 id（雪花 id 必须按字符串处理，避免精度丢失）
const appId = String(route.params.appId ?? '')

// 应用信息
const app = ref<API.AppVO>()

// 对话消息（含游标分页的历史消息）
const {
  messages,
  loading: historyLoading,
  hasMore,
  total: historyTotal,
  loaded: historyLoaded,
  loadLatest,
  loadMore,
  appendMessage,
} = useChatHistory(appId)
const messageListRef = ref<InstanceType<typeof ChatMessageList>>()
const inputMessage = ref('')
const isGenerating = ref(false)

// 网页展示
const previewVisible = ref(false)
const previewPanelRef = ref<InstanceType<typeof AppPreviewPanel>>()

// 应用详情弹窗
const detailVisible = ref(false)

// 部署成功弹窗
const deployResultVisible = ref(false)

// 部署
const deploying = ref(false)
const deployedUrl = ref('')

// 随时可以中断生成
let controller: AbortController | null = null
// 消息自增 id
let messageSeed = 0

// 是否为应用创建者（只有创建者可以对话生成、部署，与后端权限保持一致）
const isOwner = computed(
  () => loginUserStore.loginUser.id != null && loginUserStore.loginUser.id === app.value?.userId,
)

// 是否拥有该应用信息的管理权限（创建者本人或管理员）
const canManage = computed(() => isOwner.value || loginUserStore.loginUser.userRole === 'admin')

// 是否精选应用
const isGood = computed(() => isGoodApp(app.value?.priority))

// 生成后的网站预览地址：{预览域名}/{codeGenType}_{appId}/
const previewSrc = computed(() =>
  buildPreviewUrl(app.value?.id, app.value?.codeGenType || CODE_GEN_TYPE.HTML),
)

// 后端返回的每个代码片段为 JSON：{"d":"代码片段"}
const parseChunk = (data: string): string => {
  if (!data) {
    return ''
  }
  try {
    const parsed = JSON.parse(data)
    return typeof parsed?.d === 'string' ? parsed.d : data
  } catch {
    return data
  }
}

// 生成一条新消息
const createMessage = (role: ChatMessage['role'], content: string) => {
  messageSeed += 1
  return reactive<ChatMessage>({
    id: `${Date.now()}-${messageSeed}`,
    role,
    content,
  })
}

// 消息区域滚动到底部
const scrollToBottom = async () => {
  await nextTick()
  messageListRef.value?.scrollToBottom()
}

// 获取应用详情
const fetchApp = async () => {
  if (!appId) {
    message.error('应用 id 不存在')
    return
  }
  try {
    const res = await getAppVoById({ id: asApiId(appId) })
    if (res.data.code === 0 && res.data.data) {
      app.value = res.data.data
    } else {
      message.error('获取应用详情失败，' + res.data.message)
    }
  } catch {
    message.error('获取应用详情失败，请稍后重试')
  }
}

/**
 * 调用 SSE 对话接口生成代码
 * 流式接口全部返回后，自动展示生成的网站效果
 */
const doGenerate = async (userMessage: string) => {
  const currentAppId = app.value?.id
  if (currentAppId == null) {
    return
  }
  isGenerating.value = true
  const aiMessage = createMessage('ai', '')
  appendMessage(aiMessage)
  await scrollToBottom()

  const currentController = new AbortController()
  controller = currentController
  const url = `${API_BASE_URL}/app/chat/gen/code?appId=${currentAppId}&message=${encodeURIComponent(
    userMessage,
  )}`

  await fetchSSE(url, {
    signal: currentController.signal,
    onMessage(sseMessage) {
      // 结束事件，后端返回的 data 为空
      if (sseMessage.event === 'done') {
        return
      }
      aiMessage.content += parseChunk(sseMessage.data)
      scrollToBottom()
    },
    onError(error) {
      aiMessage.content += `\n[生成失败] ${(error as Error)?.message ?? '请稍后重试'}`
      message.error('生成失败，请稍后重试')
    },
  })

  isGenerating.value = false
  controller = null

  // 用户主动停止生成时不刷新预览
  if (currentController.signal.aborted) {
    message.info('已停止生成')
    return
  }
  // 生成完成，展示最新的网站效果
  previewPanelRef.value?.refresh()
  previewVisible.value = true
  await scrollToBottom()
}

/** 发送一条用户消息并触发 AI 生成 */
const sendMessage = async (content: string) => {
  appendMessage(createMessage('user', content))
  await scrollToBottom()
  await doGenerate(content)
}

// 发送用户消息（输入框）
const doSend = async () => {
  if (isGenerating.value) {
    message.warning('AI 正在生成中，请稍候')
    return
  }
  if (!isOwner.value) {
    message.warning('你只能修改自己创建的应用')
    return
  }
  const content = inputMessage.value.trim()
  if (!content) {
    message.warning('请输入内容')
    return
  }
  inputMessage.value = ''
  await sendMessage(content)
}

// 停止生成
const doStop = () => {
  controller?.abort()
}

// 部署应用
const doDeploy = async () => {
  if (app.value?.id == null) {
    return
  }
  deploying.value = true
  try {
    const res = await deployApp({ appId: app.value.id })
    if (res.data.code === 0 && res.data.data) {
      // 后端返回的地址带的是后端配置的域名，这里按前端配置的部署域名重新拼装
      const deployKey = res.data.data.replace(/^https?:\/\/[^/]+/, '')
      deployedUrl.value = buildDeployUrl(deployKey) || res.data.data
      message.success('部署成功')
      // 展示部署成功弹窗，提供访问与复制链接
      deployResultVisible.value = true
    } else {
      message.error('部署失败，' + res.data.message)
    }
  } finally {
    deploying.value = false
  }
}

// 删除应用（仅本人或管理员，与详情弹窗操作栏一致）
const doDeleteApp = (target: API.AppVO) => {
  if (target.id == null) {
    return
  }
  confirmDelete({
    name: target.appName || '未命名应用',
    async onOk() {
      const res = await deleteApp({ id: target.id })
      if (res.data.code === 0) {
        message.success('删除成功')
        detailVisible.value = false
        await router.push('/')
      } else {
        message.error('删除失败，' + res.data.message)
      }
    },
  })
}

// 进入应用信息修改页
const goEditPage = () => {
  router.push(`/app/edit/${appId}`)
}

// 返回主页
const goHome = () => {
  router.push('/')
}

onMounted(async () => {
  await fetchApp()
  if (!app.value) {
    return
  }
  // 已经部署过的应用，直接按配置的部署域名展示访问地址
  if (app.value.deployKey) {
    deployedUrl.value = buildDeployUrl(app.value.deployKey)
  }

  // 加载最近一页对话历史（该接口需要登录，且仅本人或管理员可查看）
  if (loginUserStore.loginUser.id) {
    await loadLatest()
  }

  // 网站展示：已经生成过（至少一轮对话，即 2 条消息），或读不到历史时按已有文件展示
  previewVisible.value = !historyLoaded.value || historyTotal.value >= 2

  // 自己的应用、且没有任何对话历史时，自动把初始提示词作为第一条消息发起对话
  if (isOwner.value && historyLoaded.value && historyTotal.value === 0 && app.value.initPrompt) {
    await sendMessage(app.value.initPrompt)
  }
})
</script>

<style scoped>
#appChatPage {
  flex: 1;
  /* 高度由外层撑满一屏，消息区与预览区各自内部滚动 */
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* 顶部栏 */
.chat-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 0 0 8px;
  border-bottom: 1px solid #f0f0f0;
}

.chat-header-left,
.chat-header-right {
  display: flex;
  align-items: center;
  gap: 8px;
}

.app-name {
  font-size: 16px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.88);
}

.app-author {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
}

/* 核心内容区域：左右宽度比例 2:3 */
.chat-body {
  flex: 1;
  min-height: 0;
  display: flex;
  gap: 12px;
  padding-top: 10px;
}

/* 左侧对话区域 */
.chat-panel {
  display: flex;
  flex-direction: column;
  flex: 2 1 0;
  min-width: 320px;
  /* 允许压缩到容器高度内，由内部消息列表滚动 */
  min-height: 0;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
  background: #fafafa;
}

/* 用户消息输入框 */
.message-input {
  flex: none;
  padding: 10px 12px;
  background: #fff;
  border-top: 1px solid #f0f0f0;
}

/* 输入框外层容器，保证禁用时也能触发 tooltip 的 hover */
.message-input-box {
  display: block;
}

.message-input-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 8px;
}

.input-tip {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.35);
}
</style>
