<template>
  <a-layout-header class="header">
    <a-row :wrap="false" align="middle">
      <!-- 左侧：Logo和标题（宽度自适应内容，保证标题完整展开不换行） -->
      <a-col flex="none">
        <RouterLink to="/">
          <div class="header-left">
            <img class="logo" src="@/assets/logo.png" alt="Logo" />
            <h1 class="site-title">Flash Code AI 零代码工作台</h1>
          </div>
        </RouterLink>
      </a-col>
      <!-- 中间：导航菜单 -->
      <a-col flex="auto" class="header-menu-col">
        <a-menu
          v-model:selectedKeys="selectedKeys"
          mode="horizontal"
          :items="menuItems"
          @click="handleMenuClick"
        />
      </a-col>
      <!-- 右侧：用户操作区域 -->
      <a-col flex="none">
        <div class="user-login-status">
          <a-button type="primary">登录</a-button>
        </div>
      </a-col>
    </a-row>
  </a-layout-header>
</template>

<script setup lang="ts">
import { h, ref } from 'vue'
import { useRouter } from 'vue-router'
import type { MenuProps } from 'ant-design-vue'

const router = useRouter()
// 当前选中菜单
const selectedKeys = ref<string[]>(['/'])
// 监听路由变化，更新当前选中菜单
router.afterEach((to, from, next) => {
  selectedKeys.value = [to.path]
})

// 菜单配置项
const menuItems = ref([
  {
    key: '/',
    label: '首页',
    title: '首页',
  },
  {
    key: 'others',
    label: h(
      'a',
      { href: 'https://github.com/qinzhw/Flash-Code', target: '_blank' },
      'GitHub',
    ),
    title: 'GitHub',
  },
])

// 处理菜单点击
const handleMenuClick: MenuProps['onClick'] = (e) => {
  const key = e.key as string
  selectedKeys.value = [key]
  // 跳转到对应页面
  if (key.startsWith('/')) {
    router.push(key)
  }
}
</script>

<style scoped>
.header {
  background: #fff;
  padding: 0 24px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 12px;
}

.logo {
  width: 40px;
  height: 40px;
  flex: none;
  display: block;
  border-radius: 8px;
  object-fit: contain;
}

.site-title {
  margin: 0;
  font-size: 20px;
  font-weight: 500;
  line-height: 1;
  color: #1890ff;
  white-space: nowrap;
}

/* 菜单与左侧标题之间留出间距 */
.header-menu-col {
  padding-left: 24px;
}

.ant-menu-horizontal {
  border-bottom: none !important;
}
</style>
