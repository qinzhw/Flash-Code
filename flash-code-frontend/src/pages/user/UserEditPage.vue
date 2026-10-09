<template>
  <div id="userEditPage">
    <h2 class="title">个人中心</h2>
    <a-form
      :model="formState"
      name="userEdit"
      autocomplete="off"
      :required-mark="false"
      @finish="handleSubmit"
    >
      <a-form-item label="账号" name="userAccount">
        <a-input v-model:value="formState.userAccount" disabled />
      </a-form-item>
      <a-form-item
        label="名称"
        name="userName"
        :rules="[{ required: true, message: '请输入用户名' }]"
      >
        <a-input v-model:value="formState.userName" placeholder="请输入用户名" />
      </a-form-item>
      <a-form-item label="头像" name="userAvatar">
        <a-input v-model:value="formState.userAvatar" placeholder="请输入头像图片地址" />
        <a-image
          v-if="formState.userAvatar"
          :src="formState.userAvatar"
          :width="120"
          style="margin-top: 8px"
        />
      </a-form-item>
      <a-form-item label="简介" name="userProfile">
        <a-textarea
          v-model:value="formState.userProfile"
          placeholder="请输入个人简介"
          :auto-size="{ minRows: 3, maxRows: 6 }"
        />
      </a-form-item>
      <a-form-item :wrapper-col="{ span: 24, offset: 0 }" class="center-actions">
        <a-space>
          <a-button type="primary" html-type="submit" :loading="submitting">保存</a-button>
          <a-button @click="goBack">返回</a-button>
        </a-space>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { reactive, ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { useLoginUserStore } from '@/stores/loginUser.ts'
import { userUpdateMy } from '@/api/userController.ts'

const router = useRouter()
const loginUserStore = useLoginUserStore()

const submitting = ref(false)

const formState = reactive<API.LoginUserVO>({
  userAccount: '',
  userName: '',
  userAvatar: '',
  userProfile: '',
})

// 初始化表单：使用当前登录用户信息
const initForm = () => {
  const loginUser = loginUserStore.loginUser
  formState.userAccount = loginUser.userAccount ?? ''
  formState.userName = loginUser.userName ?? ''
  formState.userAvatar = loginUser.userAvatar ?? ''
  formState.userProfile = loginUser.userProfile ?? ''
}

// 提交表单
const handleSubmit = async () => {
  submitting.value = true
  try {
    const res = await userUpdateMy({
      userName: formState.userName,
      userAvatar: formState.userAvatar,
      userProfile: formState.userProfile,
    })
    if (res.data.code === 0) {
      message.success('保存成功')
      // 同步更新全局登录用户信息
      loginUserStore.setLoginUser({
        ...loginUserStore.loginUser,
        userName: formState.userName,
        userAvatar: formState.userAvatar,
        userProfile: formState.userProfile,
      })
      router.push('/')
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
    router.replace('/user/login')
    return
  }
  initForm()
})
</script>

<style scoped>
#userEditPage {
  max-width: 600px;
  margin: 0 auto;
}

.title {
  text-align: center;
  margin-bottom: 24px;
}

.center-actions :deep(.ant-form-item-control-input) {
  text-align: center;
}
</style>
