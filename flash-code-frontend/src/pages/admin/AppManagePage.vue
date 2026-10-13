<template>
  <div id="appManagePage">
    <h2 class="admin-title">应用管理</h2>

    <!-- 搜索表单 -->
    <a-form layout="inline" :model="searchParams" @finish="doSearch">
      <a-form-item label="应用名称">
        <a-input v-model:value="searchParams.appName" placeholder="输入应用名称" allow-clear />
      </a-form-item>
      <a-form-item label="创建者">
        <!-- 雪花 id 只能用字符串输入，避免精度丢失 -->
        <a-input v-model:value="searchUserId" placeholder="输入用户ID" allow-clear />
      </a-form-item>
      <a-form-item label="生成类型">
        <a-select
          v-model:value="searchParams.codeGenType"
          :options="CODE_GEN_TYPE_OPTIONS"
          placeholder="全部"
          allow-clear
          style="width: 180px"
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit">搜索</a-button>
      </a-form-item>
    </a-form>
    <a-divider />

    <a-table
      :columns="columns"
      :data-source="data"
      :pagination="pagination"
      :scroll="{ x: 1440 }"
      row-key="id"
      @change="doTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'cover'">
          <a-image v-if="record.cover" :src="record.cover" :width="120" />
          <span v-else> </span>
        </template>
        <template v-else-if="column.dataIndex === 'initPrompt'">
          <a-typography-paragraph
            :content="record.initPrompt"
            :ellipsis="{ rows: 2, tooltip: record.initPrompt }"
            class="cell-ellipsis"
          />
        </template>
        <template v-else-if="column.dataIndex === 'priority'">
          <a-tag :color="isGoodApp(record.priority) ? 'gold' : 'default'">
            {{ record.priority ?? 0 }}
          </a-tag>
        </template>
        <template v-else-if="column.dataIndex === 'user'">
          {{ record.user?.userName ?? record.userId ?? '-' }}
        </template>
        <template v-else-if="column.dataIndex === 'createTime'">
          {{ formatDateTime(record.createTime) }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-space :size="4">
            <a-button type="link" size="small" @click="openDetail(record)">详情</a-button>
            <a-button type="link" size="small" @click="doEdit(record)">编辑</a-button>
            <a-button type="link" size="small" @click="doToggleGood(record)">
              {{ isGoodApp(record.priority) ? '取消精选' : '精选' }}
            </a-button>
            <a-button type="link" size="small" danger @click="doDelete(record)">删除</a-button>
          </a-space>
        </template>
      </template>
    </a-table>

    <!-- 应用详情弹窗 -->
    <AppDetailModal
      v-model:open="detailVisible"
      :app="detailApp"
      @edit="doEdit"
      @delete="doDelete"
    />
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import type { TableColumnsType } from 'ant-design-vue'
import AppDetailModal from '@/components/AppDetailModal.vue'
import { deleteAppByAdmin, listAppVoByPageByAdmin, updateAppByAdmin } from '@/api/appController.ts'
import { formatDateTime } from '@/utils/time.ts'
import { asApiId } from '@/utils/id.ts'
import { confirmDelete } from '@/utils/confirm.ts'
import { usePagedTable } from '@/composables/usePagedTable.ts'
import { CODE_GEN_TYPE_OPTIONS } from '@/constants/codeGenType.ts'
import { DEFAULT_APP_PRIORITY, GOOD_APP_PRIORITY, isGoodApp } from '@/constants/app.ts'

const router = useRouter()

const columns: TableColumnsType = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: '应用名称',
    dataIndex: 'appName',
    width: 160,
  },
  {
    title: '封面',
    dataIndex: 'cover',
    width: 150,
  },
  {
    title: '初始提示词',
    dataIndex: 'initPrompt',
    width: 240,
  },
  {
    title: '生成类型',
    dataIndex: 'codeGenType',
    width: 120,
  },
  {
    title: '部署标识',
    dataIndex: 'deployKey',
    width: 160,
  },
  {
    title: '优先级',
    dataIndex: 'priority',
    width: 100,
  },
  {
    title: '创建用户',
    dataIndex: 'user',
    width: 140,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 180,
  },
  {
    title: '操作',
    key: 'action',
    width: 220,
    fixed: 'right',
  },
]

// 数据
const data = ref<API.AppVO[]>([])

// 搜索条件（管理员查询不限每页数量，支持除时间外的任何字段）
const searchParams = reactive<API.AppQueryRequest>({
  pageNum: 1,
  pageSize: 10,
})

// 应用详情弹窗
const detailVisible = ref(false)
const detailApp = ref<API.AppVO>()

// 创建者（用户 id）用字符串保存并单独传递，避免雪花 id 精度丢失
const searchUserId = ref('')

// 获取数据
const fetchData = async () => {
  const res = await listAppVoByPageByAdmin({
    ...searchParams,
    ...(searchUserId.value ? { userId: asApiId(searchUserId.value) } : {}),
  })
  if (res.data.code === 0 && res.data.data) {
    data.value = res.data.data.records ?? []
    total.value = res.data.data.totalRow ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
}

// 分页查询通用逻辑：总条数、分页配置、翻页与搜索
const {
  total,
  pagination,
  handleTableChange: doTableChange,
  search: doSearch,
} = usePagedTable(searchParams, fetchData)

// 编辑：新开页面跳转到应用信息修改页
const doEdit = (record: API.AppVO) => {
  if (record?.id == null) {
    return
  }
  const { href } = router.resolve(`/app/edit/${record.id}`)
  window.open(href, '_blank')
}

// 打开应用详情弹窗
const openDetail = (record: API.AppVO) => {
  detailApp.value = record
  detailVisible.value = true
}

// 精选 / 取消精选：设置或重置应用优先级
const doToggleGood = async (record: API.AppVO) => {
  if (record.id == null) {
    return
  }
  const toGood = !isGoodApp(record.priority)
  const res = await updateAppByAdmin({
    id: record.id,
    priority: toGood ? GOOD_APP_PRIORITY : DEFAULT_APP_PRIORITY,
  })
  if (res.data.code === 0) {
    message.success(toGood ? '已设为精选' : '已取消精选')
    fetchData()
  } else {
    message.error((toGood ? '设置' : '取消') + '失败，' + res.data.message)
  }
}

// 删除数据
const doDelete = (record: API.AppVO) => {
  if (record.id == null) {
    return
  }
  confirmDelete({
    name: record.appName || '未命名应用',
    async onOk() {
      const res = await deleteAppByAdmin({ id: record.id })
      if (res.data.code === 0) {
        message.success('删除成功')
        detailVisible.value = false
        fetchData()
      } else {
        message.error('删除失败，' + res.data.message)
      }
    },
  })
}

// 页面加载时请求一次
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
#appManagePage {
  width: 100%;
}

.admin-title {
  margin: 0 0 16px;
  font-size: 18px;
  font-weight: 600;
  color: rgba(0, 0, 0, 0.88);
}

.cell-ellipsis {
  margin-bottom: 0;
  max-width: 240px;
}
</style>
