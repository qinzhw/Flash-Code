<template>
  <div id="appEditPage" class="page-container">
    <h2 class="page-title">修改应用信息</h2>
    <a-form
      :model="formState"
      name="appEdit"
      autocomplete="off"
      :required-mark="false"
      @finish="handleSubmit"
    >
      <a-form-item label="应用 id" name="id">
        <a-input v-model:value="formState.id" disabled />
      </a-form-item>
      <a-form-item
        label="应用名称"
        name="appName"
        :rules="[{ required: true, message: '请输入应用名称' }]"
      >
        <a-input
          v-model:value="formState.appName"
          placeholder="请输入应用名称"
          :maxlength="50"
          show-count
        />
      </a-form-item>

      <!-- 以下字段仅管理员可修改 -->
      <template v-if="isAdmin">
        <a-form-item label="应用封面" name="cover">
          <a-input v-model:value="formState.cover" placeholder="请输入封面图片地址" />
          <a-image
            v-if="formState.cover"
            :src="buildCoverUrl(formState.cover)"
            :width="160"
            style="margin-top: 8px"
          />
        </a-form-item>
        <a-form-item label="优先级" name="priority" extra="优先级为 99 表示精选应用">
          <a-input-number
            v-model:value="formState.priority"
            :min="0"
            :max="99"
            placeholder="请输入优先级"
            style="width: 100%"
          />
        </a-form-item>
      </template>

      <a-form-item :wrapper-col="{ span: 24, offset: 0 }" class="form-actions-center">
        <a-space>
          <a-button type="primary" html-type="submit" :loading="submitting">保存</a-button>
          <a-button @click="goBack">返回</a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/loginUser.ts'
import {
  getAppVoById,
  getAppVoByIdByAdmin,
  updateApp,
  updateAppByAdmin,
} from '@/api/appController.ts'
import { asApiId } from '@/utils/id.ts'
import { buildCoverUrl } from '@/utils/appUrl.ts'

const route = useRoute()
const router = useRouter()
const loginUserStore = useLoginUserStore()

// 应用 id（雪花 id 必须按字符串处理，避免精度丢失）
const appId = String(route.params.id ?? '')

const submitting = ref(false)

const formState = reactive<API.AppAdminUpdateRequest>({
  id: asApiId(appId),
  appName: '',
  cover: '',
  priority: 0,
})

// 是否为管理员
const isAdmin = computed(() => loginUserStore.loginUser.userRole === 'admin')

// 加载应用信息，并校验编辑权限
const initForm = async () => {
  if (!appId) {
    message.error('应用 id 不存在')
    return
  }
  const res = isAdmin.value
    ? await getAppVoByIdByAdmin({ id: asApiId(appId) })
    : await getAppVoById({ id: asApiId(appId) })
  if (res.data.code !== 0 || !res.data.data) {
    message.error('获取应用信息失败，' + res.data.message)
    return
  }
  const app = res.data.data
  // 普通用户只能编辑自己的应用
  if (!isAdmin.value && app.userId !== loginUserStore.loginUser.id) {
    message.error('没有权限修改该应用')
    router.replace('/')
    return
  }
  formState.id = app.id
  formState.appName = app.appName ?? ''
  formState.cover = app.cover ?? ''
  formState.priority = app.priority ?? 0
}

// 提交表单
const handleSubmit = async () => {
  submitting.value = true
  try {
    // 普通用户只支持修改应用名称，管理员可以修改名称、封面、优先级
    const res = isAdmin.value
      ? await updateAppByAdmin({
          id: formState.id,
          appName: formState.appName,
          cover: formState.cover,
          priority: formState.priority,
        })
      : await updateApp({
          id: formState.id,
          appName: formState.appName,
        })
    if (res.data.code === 0) {
      message.success('保存成功')
      router.back()
    } else {
      message.error('保存失败，' + res.data.message)
    }
  } finally {
    submitting.value = false
  }
}

// 返回上一页
const goBack = () => {
  router.back()
}

onMounted(() => {
  // 未登录则跳转到登录页
  if (!loginUserStore.loginUser.id) {
    message.warning('请先登录')
    router.replace(`/user/login?redirect=${encodeURIComponent(route.fullPath)}`)
    return
  }
  initForm()
})
</script>

<style scoped>
#appEditPage {
  max-width: 600px;
}
</style>
