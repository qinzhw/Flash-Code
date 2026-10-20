<template>
  <a-modal
    v-model:open="open"
    :title="simple ? '应用详情' : app?.appName || '应用详情'"
    :footer="null"
    :width="simple ? 480 : 720"
    destroy-on-close
  >
    <template v-if="app">
      <div v-if="!simple" class="detail-cover">
        <img v-if="coverUrl" :src="coverUrl" :alt="app.appName" />
        <div v-else class="detail-cover-placeholder">{{ (app.appName || 'AI').slice(0, 1) }}</div>
      </div>

      <!-- 简洁模式只展示创建者与创建时间，其余字段在完整模式展示 -->
      <a-descriptions
        :column="simple ? 1 : 2"
        :bordered="!simple"
        size="small"
        class="detail-descriptions"
      >
        <template v-if="!simple">
          <a-descriptions-item label="应用名称" :span="2">
            {{ app.appName || '未命名应用' }}
            <a-tag v-if="isGood" color="gold" class="detail-tag">精选</a-tag>
          </a-descriptions-item>
        </template>
        <a-descriptions-item label="创建者">
          <a-space :size="6">
            <a-avatar :size="20" :src="app.user?.userAvatar">
              {{ (app.user?.userName ?? '匿').slice(0, 1) }}
            </a-avatar>
            {{ app.user?.userName ?? '匿名用户' }}
          </a-space>
        </a-descriptions-item>
        <a-descriptions-item label="创建时间">
          {{ formatDateTime(app.createTime) }}
        </a-descriptions-item>
        <template v-if="!simple">
          <a-descriptions-item label="生成类型">
            {{ getCodeGenTypeLabel(app.codeGenType) }}
          </a-descriptions-item>
          <a-descriptions-item label="优先级">{{ app.priority ?? 0 }}</a-descriptions-item>
          <a-descriptions-item label="部署标识">{{
            app.deployKey || '未部署'
          }}</a-descriptions-item>
          <a-descriptions-item label="部署时间">
            {{ formatDateTime(app.deployedTime) }}
          </a-descriptions-item>
          <a-descriptions-item label="更新时间" :span="2">
            {{ formatDateTime(app.updateTime) }}
          </a-descriptions-item>
          <a-descriptions-item label="初始提示词" :span="2">
            <div class="detail-prompt">{{ app.initPrompt || '-' }}</div>
          </a-descriptions-item>
        </template>
      </a-descriptions>

      <!-- 操作栏：仅本人或管理员可见 -->
      <div v-if="canManage" class="detail-actions">
        <a-space>
          <a-button v-if="deployedUrl && !simple" type="link" :href="deployedUrl" target="_blank">
            <template #icon>
              <link-outlined />
            </template>
            访问已部署网站
          </a-button>
          <a-button type="primary" @click="emit('edit', app)">
            <template #icon>
              <edit-outlined />
            </template>
            修改
          </a-button>
          <a-button danger @click="emit('delete', app)">
            <template #icon>
              <delete-outlined />
            </template>
            删除
          </a-button>
        </a-space>
      </div>
    </template>
  </a-modal>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { DeleteOutlined, EditOutlined, LinkOutlined } from '@ant-design/icons-vue'
import { getCodeGenTypeLabel } from '@/constants/codeGenType.ts'
import { formatDateTime } from '@/utils/time.ts'
import { buildCoverUrl, buildDeployUrl } from '@/utils/appUrl.ts'
import { isGoodApp } from '@/constants/app.ts'
import { useLoginUserStore } from '@/stores/loginUser.ts'

interface Props {
  /** 要展示的应用信息 */
  app?: API.AppVO
  /** 简洁模式：只展示创建者与创建时间（对话页使用） */
  simple?: boolean
}

const props = withDefaults(defineProps<Props>(), {
  simple: false,
})

const loginUserStore = useLoginUserStore()

/** 是否打开弹窗 */
const open = defineModel<boolean>('open', { default: false })

const emit = defineEmits<{
  (e: 'edit', app: API.AppVO): void
  (e: 'delete', app: API.AppVO): void
}>()

// 是否精选应用
const isGood = computed(() => isGoodApp(props.app?.priority))

// 操作栏仅本人或管理员可见
const canManage = computed(() => {
  const loginUser = loginUserStore.loginUser
  if (loginUser.userRole === 'admin') {
    return true
  }
  return loginUser.id != null && loginUser.id === props.app?.userId
})

// 已部署应用的访问地址：{部署域名}/{deployKey}/
const deployedUrl = computed(() => buildDeployUrl(props.app?.deployKey))

// 封面地址（后端返回的是对象存储域名，需要补全协议）
const coverUrl = computed(() => buildCoverUrl(props.app?.cover))
</script>

<style scoped>
.detail-cover {
  width: 100%;
  height: 220px;
  margin-bottom: 16px;
  border-radius: 8px;
  overflow: hidden;
  background: #f5f5f5;
}

.detail-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  display: block;
}

.detail-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 44px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #69c0ff 0%, #b37feb 100%);
}

.detail-descriptions {
  margin-bottom: 16px;
}

.detail-tag {
  margin-left: 8px;
}

.detail-prompt {
  max-height: 120px;
  overflow-y: auto;
  white-space: pre-wrap;
  word-break: break-word;
}

.detail-actions {
  display: flex;
  justify-content: flex-end;
}
</style>
