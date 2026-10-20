<template>
  <div class="app-card" @click="handleClick">
    <div class="app-card-cover">
      <img v-if="coverUrl" :src="coverUrl" :alt="app.appName" class="app-card-cover-img" />
      <div v-else class="app-card-cover-placeholder">{{ coverText }}</div>
      <a-tag v-if="isGood" class="app-card-badge" color="gold">精选</a-tag>

      <!-- 悬浮操作：查看对话始终展示；已部署的应用额外提供查看作品 -->
      <div class="app-card-overlay">
        <a-space>
          <a-button type="primary" @click.stop="handleClick">查看对话</a-button>
          <a-button v-if="deployUrl" @click.stop="emit('work', app)">查看作品</a-button>
        </a-space>
      </div>
    </div>

    <!-- 左侧创建者头像；右侧上下结构：应用标题 + 创建者昵称 -->
    <div class="app-card-body">
      <a-avatar :size="36" :src="app.user?.userAvatar" class="app-card-avatar">
        {{ userText.slice(0, 1) }}
      </a-avatar>
      <div class="app-card-info">
        <div class="app-card-title-row">
          <div class="app-card-name" :title="app.appName">{{ app.appName || '未命名应用' }}</div>
          <!-- 卡片操作区（编辑、删除等），悬停时展示 -->
          <div v-if="$slots.actions" class="app-card-actions" @click.stop>
            <slot name="actions" />
          </div>
        </div>
        <div class="app-card-user" :title="userText">{{ userText }}</div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { buildCoverUrl, buildDeployUrl } from '@/utils/appUrl.ts'
import { isGoodApp } from '@/constants/app.ts'

interface Props {
  /** 应用信息 */
  app: API.AppVO
}

const props = defineProps<Props>()

const emit = defineEmits<{
  /** 查看对话：跳转到应用对话页 */
  (e: 'click', app: API.AppVO): void
  /** 查看作品：新页面打开部署地址 */
  (e: 'work', app: API.AppVO): void
}>()

// 封面缺省时使用应用名首字占位
const coverText = computed(() => (props.app.appName || 'AI').slice(0, 1))

// 封面地址（后端返回的是对象存储域名，需要补全协议）
const coverUrl = computed(() => buildCoverUrl(props.app.cover))

// 是否精选应用
const isGood = computed(() => isGoodApp(props.app.priority))

// 创建者昵称（无头像时用其首字占位）
const userText = computed(() => props.app.user?.userName || '匿名用户')

// 部署后的访问地址，没有部署过则为空（此时不展示「查看作品」）
const deployUrl = computed(() => buildDeployUrl(props.app.deployKey))

const handleClick = () => {
  emit('click', props.app)
}
</script>

<style scoped>
.app-card {
  cursor: pointer;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
  border: 1px solid #eef2f8;
  box-shadow: 0 2px 8px rgba(31, 56, 110, 0.06);
  transition:
    box-shadow 0.2s,
    transform 0.2s;
}

.app-card:hover {
  box-shadow: 0 8px 24px rgba(31, 56, 110, 0.14);
  transform: translateY(-2px);
}

.app-card-cover {
  position: relative;
  width: 100%;
  aspect-ratio: 16 / 10;
  overflow: hidden;
  background: #f5f5f5;
}

.app-card-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: top center;
  display: block;
}

.app-card-cover-placeholder {
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 32px;
  font-weight: 600;
  color: #fff;
  background: linear-gradient(135deg, #69c0ff 0%, #b37feb 100%);
}

.app-card-badge {
  position: absolute;
  top: 8px;
  right: 8px;
  margin-inline-end: 0;
}

/* 悬浮操作层 */
.app-card-overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);
  opacity: 0;
  transition: opacity 0.2s;
}

.app-card:hover .app-card-overlay {
  opacity: 1;
}

/* 头像在左、文字信息在右 */
.app-card-body {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px 12px;
}

.app-card-avatar {
  flex: none;
  font-size: 14px;
  color: #fff;
  background: #1677ff;
}

.app-card-info {
  flex: 1;
  min-width: 0;
}

.app-card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 4px;
}

.app-card-name {
  flex: 1;
  min-width: 0;
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.88);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.app-card-actions {
  flex: none;
  opacity: 0;
  transition: opacity 0.2s;
}

.app-card:hover .app-card-actions {
  opacity: 1;
}

.app-card-user {
  margin-top: 2px;
  font-size: 12px;
  color: rgba(0, 0, 0, 0.45);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
</style>
