<template>
  <div class="preview-panel">
    <div class="preview-header">
      <span class="preview-title">生成后的网页展示</span>
      <a-space>
        <a-typography-text v-if="deployedUrl" type="success" class="deployed-url">
          已部署：{{ deployedUrl }}
        </a-typography-text>
        <a-button size="small" :disabled="!visible" @click="refresh">
          <template #icon>
            <reload-outlined />
          </template>
          刷新
        </a-button>
      </a-space>
    </div>

    <div class="preview-body">
      <div v-if="generating" class="preview-loading">
        <a-spin />
        <span class="preview-loading-text">AI 正在生成代码……</span>
      </div>
      <iframe
        v-if="visible && src"
        :key="previewKey"
        class="preview-iframe"
        :src="src"
        title="应用预览"
      />
      <a-empty v-else-if="!generating" description="网站文件生成完成后，将在此处展示效果" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { ReloadOutlined } from '@ant-design/icons-vue'

interface Props {
  /** 预览地址 */
  src: string
  /** 是否展示预览 */
  visible?: boolean
  /** 是否正在生成代码 */
  generating?: boolean
  /** 已部署的访问地址 */
  deployedUrl?: string
}

withDefaults(defineProps<Props>(), {
  visible: false,
  generating: false,
  deployedUrl: '',
})

// 作为 iframe 的 key，变化后强制重新加载
const previewKey = ref(0)

/** 重新加载预览 */
const refresh = () => {
  previewKey.value += 1
}

defineExpose({ refresh })
</script>

<style scoped>
.preview-panel {
  flex: 3 1 0;
  min-width: 0;
  display: flex;
  flex-direction: column;
  border: 1px solid #f0f0f0;
  border-radius: 12px;
  overflow: hidden;
  background: #fff;
}

.preview-header {
  flex: none;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 6px 12px;
  border-bottom: 1px solid #f0f0f0;
}

.preview-title {
  font-size: 14px;
  font-weight: 500;
  color: rgba(0, 0, 0, 0.88);
}

.deployed-url {
  max-width: 320px;
  font-size: 12px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.preview-body {
  position: relative;
  flex: 1;
  min-height: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f5f5f5;
}

.preview-iframe {
  width: 100%;
  height: 100%;
  border: none;
  background: #fff;
}

.preview-loading {
  position: absolute;
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 20px 28px;
  background: rgba(255, 255, 255, 0.9);
  border-radius: 12px;
}

.preview-loading-text {
  font-size: 13px;
  color: rgba(0, 0, 0, 0.55);
}
</style>
