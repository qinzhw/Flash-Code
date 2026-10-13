<template>
  <section class="app-list-section">
    <div class="section-header">
      <h2 class="section-title">{{ title }}</h2>
      <a-input-search
        v-model:value="searchText"
        class="section-search"
        :placeholder="searchPlaceholder"
        allow-clear
        @search="doSearch"
      />
    </div>

    <a-spin :spinning="loading">
      <slot v-if="apps.length === 0" name="empty">
        <a-empty :description="emptyDescription" />
      </slot>
      <div v-else class="app-grid">
        <AppCard
          v-for="app in apps"
          :key="app.id"
          :app="app"
          @click="emit('select', app)"
          @work="emit('work', app)"
        >
          <template v-if="$slots.cardActions" #actions>
            <slot name="cardActions" :app="app" />
          </template>
        </AppCard>
      </div>
    </a-spin>

    <div v-if="total > pageSize" class="pagination-wrapper">
      <a-pagination
        :current="pageNum"
        :page-size="pageSize"
        :total="total"
        :show-size-changer="false"
        :show-total="(value: number) => `共 ${value} 个应用`"
        @change="doPageChange"
      />
    </div>
  </section>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import AppCard from '@/components/AppCard.vue'

interface Props {
  /** 区块标题 */
  title: string
  /** 当前页数据 */
  apps: API.AppVO[]
  /** 总条数 */
  total: number
  /** 是否加载中 */
  loading?: boolean
  /** 每页条数 */
  pageSize?: number
  /** 搜索框占位文案 */
  searchPlaceholder?: string
  /** 默认空状态文案 */
  emptyDescription?: string
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  pageSize: 20,
  searchPlaceholder: '搜索应用名称',
  emptyDescription: '暂无数据',
})

const emit = defineEmits<{
  /** 查询条件变化（含首次加载） */
  (e: 'query', params: { pageNum: number; pageSize: number; appName?: string }): void
  /** 查看对话：点击应用卡片 */
  (e: 'select', app: API.AppVO): void
  /** 查看作品：新页面打开部署地址 */
  (e: 'work', app: API.AppVO): void
}>()

const pageNum = ref(1)
const searchText = ref('')

/** 触发查询 */
const doQuery = () => {
  emit('query', {
    pageNum: pageNum.value,
    pageSize: props.pageSize,
    appName: searchText.value || undefined,
  })
}

/** 搜索时回到第一页 */
const doSearch = () => {
  pageNum.value = 1
  doQuery()
}

/** 翻页 */
const doPageChange = (page: number) => {
  pageNum.value = page
  doQuery()
}

// 组件挂载后自动发起一次查询
onMounted(doQuery)

// 供父组件在数据变更后主动刷新（保持当前页码与搜索条件）
defineExpose({ refresh: doQuery })
</script>

<style scoped>
/* 只保留结构样式，配色沿用主题默认值，方便在其他页面复用 */
.app-list-section {
  margin-bottom: 40px;
}

.section-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  margin-bottom: 16px;
}

.section-title {
  display: flex;
  align-items: center;
  gap: 8px;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1f2a44;
}

.section-title::before {
  content: '';
  width: 4px;
  height: 18px;
  border-radius: 2px;
  background: linear-gradient(180deg, #38bdf8, #8b5cf6);
}

.section-search {
  max-width: 240px;
}

.app-grid {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16px;
}

.pagination-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}

@media (max-width: 992px) {
  .app-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}
</style>
