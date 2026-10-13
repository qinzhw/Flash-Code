<template>
  <a-modal v-model:open="open" title="部署成功" :footer="null" :width="520" destroy-on-close>
    <div class="deploy-result">
      <check-circle-filled class="deploy-result-icon" />
      <h3 class="deploy-result-title">网站部署成功！</h3>
      <p class="deploy-result-desc">你的网站已经成功部署，可以通过以下链接访问：</p>

      <div class="deploy-result-url">
        <span class="deploy-result-url-text" :title="url">{{ url }}</span>
        <a-tooltip title="复制链接">
          <copy-outlined class="deploy-result-copy" @click="copyUrl" />
        </a-tooltip>
      </div>

      <div class="deploy-result-actions">
        <a-space>
          <a-button type="primary" @click="visitSite">访问网站</a-button>
          <a-button @click="open = false">关闭</a-button>
        </a-space>
      </div>
    </div>
  </a-modal>
</template>

<script setup lang="ts">
import { message } from 'ant-design-vue'
import { CheckCircleFilled, CopyOutlined } from '@ant-design/icons-vue'

interface Props {
  /** 部署后的访问地址 */
  url: string
}

const props = defineProps<Props>()

/** 是否展示弹窗 */
const open = defineModel<boolean>('open', { default: false })

/** 新页面打开部署好的网站 */
const visitSite = () => {
  if (props.url) {
    window.open(props.url, '_blank')
  }
}

/** 复制访问地址 */
const copyUrl = async () => {
  if (!props.url) {
    return
  }
  try {
    await navigator.clipboard.writeText(props.url)
    message.success('链接已复制')
  } catch {
    message.error('复制失败，请手动复制')
  }
}
</script>

<style scoped>
.deploy-result {
  padding: 8px 0 4px;
  text-align: center;
}

.deploy-result-icon {
  font-size: 56px;
  color: #52c41a;
}

.deploy-result-title {
  margin: 12px 0 8px;
  font-size: 18px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.88);
}

.deploy-result-desc {
  margin: 0 0 20px;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.55);
}

.deploy-result-url {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 16px;
  margin-bottom: 24px;
  border: 1px solid #d9d9d9;
  border-radius: 6px;
  text-align: left;
}

.deploy-result-url-text {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  font-size: 14px;
  color: rgba(0, 0, 0, 0.88);
  text-overflow: ellipsis;
  white-space: nowrap;
}

.deploy-result-copy {
  flex: none;
  font-size: 16px;
  color: rgba(0, 0, 0, 0.45);
  cursor: pointer;
  transition: color 0.2s;
}

.deploy-result-copy:hover {
  color: #1677ff;
}

.deploy-result-actions {
  display: flex;
  justify-content: center;
}
</style>
