<template>
  <div id="chatHistoryManagePage">
    <h2 class="admin-title">对话管理</h2>

    <!-- 搜索表单 -->
    <a-form layout="inline" :model="searchParams" @finish="doSearch">
      <a-form-item label="应用 ID">
        <!-- 雪花 id 只能用字符串输入，避免精度丢失 -->
        <a-input v-model:value="searchAppId" placeholder="输入应用ID" allow-clear />
      </a-form-item>
      <a-form-item label="用户 ID">
        <a-input v-model:value="searchUserId" placeholder="输入用户ID" allow-clear />
      </a-form-item>
      <a-form-item label="消息内容">
        <a-input v-model:value="searchParams.message" placeholder="输入消息内容" allow-clear />
      </a-form-item>
      <a-form-item label="消息类型">
        <a-select
          v-model:value="searchParams.messageType"
          :options="CHAT_MESSAGE_TYPE_OPTIONS"
          placeholder="全部"
          allow-clear
          style="width: 140px"
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
      :scroll="{ x: 1200 }"
      row-key="id"
      @change="doTableChange"
    >
      <template #bodyCell="{ column, record }">
        <template v-if="column.dataIndex === 'messageType'">
          <a-tag :color="record.messageType === CHAT_MESSAGE_TYPE.AI ? 'green' : 'blue'">
            {{ getChatMessageTypeLabel(record.messageType) }}
          </a-tag>
        </template>
        <template v-else-if="column.dataIndex === 'message'">
          <a-typography-paragraph
            :content="record.message"
            :ellipsis="{ rows: 2, tooltip: record.message }"
            class="cell-ellipsis"
          />
        </template>
        <template v-else-if="column.dataIndex === 'createTime'">
          {{ formatDateTime(record.createTime) }}
        </template>
        <template v-else-if="column.key === 'action'">
          <a-button type="link" size="small" @click="doViewChat(record)">查看对话</a-button>
        </template>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import type { TableColumnsType } from 'ant-design-vue'
import { listAllChatHistoryByPageForAdmin } from '@/api/chatHistoryController.ts'
import { formatDateTime } from '@/utils/time.ts'
import { asApiId } from '@/utils/id.ts'
import { usePagedTable } from '@/composables/usePagedTable.ts'
import {
  CHAT_MESSAGE_TYPE,
  CHAT_MESSAGE_TYPE_OPTIONS,
  getChatMessageTypeLabel,
} from '@/constants/chat.ts'

const router = useRouter()

const columns: TableColumnsType = [
  {
    title: 'id',
    dataIndex: 'id',
    width: 180,
  },
  {
    title: '应用 ID',
    dataIndex: 'appId',
    width: 180,
  },
  {
    title: '用户 ID',
    dataIndex: 'userId',
    width: 180,
  },
  {
    title: '消息类型',
    dataIndex: 'messageType',
    width: 100,
  },
  {
    title: '消息内容',
    dataIndex: 'message',
    width: 320,
  },
  {
    title: '创建时间',
    dataIndex: 'createTime',
    width: 180,
  },
  {
    title: '操作',
    key: 'action',
    width: 120,
    fixed: 'right',
  },
]

// 数据
const data = ref<API.ChatHistory[]>([])

// 搜索条件（管理员查询不限每页数量，支持除时间外的任何字段）
const searchParams = reactive<API.ChatHistoryQueryRequest>({
  pageNum: 1,
  pageSize: 10,
})

// id 类查询条件用字符串保存并单独传递，避免雪花 id 精度丢失
const searchAppId = ref('')
const searchUserId = ref('')

// 获取数据
const fetchData = async () => {
  const res = await listAllChatHistoryByPageForAdmin({
    ...searchParams,
    ...(searchAppId.value ? { appId: asApiId(searchAppId.value) } : {}),
    ...(searchUserId.value ? { userId: asApiId(searchUserId.value) } : {}),
  })
  if (res.data.code === 0 && res.data.data) {
    data.value = res.data.data.records ?? []
    total.value = Number(res.data.data.totalRow ?? 0)
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

// 查看对话：跳转到对应应用的对话页
const doViewChat = (record: API.ChatHistory) => {
  if (record.appId == null) {
    return
  }
  router.push(`/app/chat/${record.appId}`)
}

// 页面加载时请求一次
onMounted(() => {
  fetchData()
})
</script>

<style scoped>
#chatHistoryManagePage {
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
  max-width: 320px;
}
</style>
