<template>
  <div id="homePage" class="home-page">
    <!-- 顶部：网站标题 + 用户提示词输入框 -->
    <section class="hero">
      <h1 class="hero-title">
        一句话
        <img class="hero-logo" src="@/assets/logo.png" alt="Flash Code" />
        秒实现
      </h1>
      <p class="hero-desc">与 AI 对话轻松创建应用和网站</p>

      <div class="prompt-box">
        <a-textarea
          v-model:value="initPrompt"
          class="prompt-input"
          placeholder="帮我创建个人博客网站"
          :auto-size="{ minRows: 3, maxRows: 6 }"
          :maxlength="1000"
          :bordered="false"
          @keydown.enter.exact.prevent="doCreateApp"
        />
        <div class="prompt-footer">
          <span class="prompt-tip">Enter 发送，Shift + Enter 换行</span>
          <a-button
            type="primary"
            shape="circle"
            size="large"
            :loading="creating"
            title="创建应用"
            @click="doCreateApp"
          >
            <template #icon>
              <arrow-up-outlined />
            </template>
          </a-button>
        </div>
      </div>

      <!-- 推荐需求，点击即可把完整提示词填入输入框 -->
      <div class="prompt-samples">
        <a-tag
          v-for="sample in PROMPT_SAMPLES"
          :key="sample.label"
          class="sample-tag"
          @click="initPrompt = sample.prompt"
        >
          {{ sample.label }}
        </a-tag>
      </div>
    </section>

    <div class="home-content">
      <!-- 我的作品 -->
      <AppListSection
        ref="mySectionRef"
        title="我的作品"
        :apps="myApps"
        :total="myTotal"
        :loading="myLoading"
        :page-size="LIST_PAGE_SIZE"
        search-placeholder="搜索我的应用名称"
        @query="fetchMyApps"
        @select="goChatPage"
        @work="openDeployUrl"
      >
        <!-- 未登录时不请求接口，引导登录 -->
        <template #empty>
          <a-empty v-if="!loginUserStore.loginUser.id" description="登录后即可查看和创建自己的应用">
            <a-button type="primary" @click="goLogin">去登录</a-button>
          </a-empty>
          <a-empty v-else description="还没有作品，在上方输入一句话创建你的第一个应用吧" />
        </template>
        <template #cardActions="{ app }">
          <AppActionsDropdown
            @detail="openDetail(app)"
            @edit="goEditPage(app)"
            @delete="doDeleteApp(app)"
          />
        </template>
      </AppListSection>

      <!-- 精选案例 -->
      <AppListSection
        title="精选案例"
        :apps="goodApps"
        :total="goodTotal"
        :loading="goodLoading"
        :page-size="LIST_PAGE_SIZE"
        search-placeholder="搜索精选应用名称"
        empty-description="暂无精选应用"
        @query="fetchGoodApps"
        @select="goChatPage"
        @work="openDeployUrl"
      />
    </div>

    <!-- 应用详情弹窗 -->
    <AppDetailModal
      v-model:open="detailVisible"
      :app="detailApp"
      @edit="goEditPage"
      @delete="doDeleteApp"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { message } from 'ant-design-vue'
import { ArrowUpOutlined } from '@ant-design/icons-vue'
import AppActionsDropdown from '@/components/AppActionsDropdown.vue'
import AppDetailModal from '@/components/AppDetailModal.vue'
import AppListSection from '@/components/AppListSection.vue'
import { useLoginUserStore } from '@/stores/loginUser.ts'
import { addApp, deleteApp, listGoodAppVoByPage, listMyAppVoByPage } from '@/api/appController.ts'
import { confirmDelete } from '@/utils/confirm.ts'
import { buildDeployUrl } from '@/utils/appUrl.ts'

const router = useRouter()
const loginUserStore = useLoginUserStore()

// 推荐需求：标签只展示简短名称，点击后把完整的提示词填入输入框
const PROMPT_SAMPLES = [
  {
    label: '个人博客网站',
    prompt:
      '帮我创建一个个人博客网站，首页展示文章卡片列表，每张卡片包含封面图、标题、摘要和发布时间，点击卡片进入文章详情页，顶部有导航栏和搜索框，底部有友情链接，整体风格简洁清爽，浅色主题，兼容手机端浏览。',
  },
  {
    label: '咖啡品牌官网',
    prompt:
      '做一个手工咖啡品牌的官方网站，包含品牌故事、产品展示、门店导航和在线预约四个板块，配色以深棕和米白为主，首页顶部放一张大幅产品图，向下滚动时有淡入动画，所有板块都要适配手机端浏览。',
  },
  {
    label: '电商运营后台',
    prompt:
      '生成一个电商运营后台管理页面，左侧是可折叠的菜单栏，右侧是内容区，包含数据概览卡片、订单列表表格、商品管理和用户管理四个模块，表格支持关键词搜索、状态筛选和分页，整体风格专业简洁。',
  },
  {
    label: '招聘信息网站',
    prompt:
      '帮我做一个招聘信息展示网站，首页是职位列表，支持按城市、薪资范围和经验要求三个条件筛选，点击职位进入详情页查看岗位职责和任职要求，页面底部提供在线投递简历的表单，风格专业简洁。',
  },
]

// 列表每页数量（每页最多 20 个）
const LIST_PAGE_SIZE = 20

// 提示词输入
const initPrompt = ref('')
const creating = ref(false)

// 我的作品
const myApps = ref<API.AppVO[]>([])
const myTotal = ref(0)
const myLoading = ref(false)

// 精选案例
const goodApps = ref<API.AppVO[]>([])
const goodTotal = ref(0)
const goodLoading = ref(false)

// 应用详情弹窗
const detailVisible = ref(false)
const detailApp = ref<API.AppVO>()

// 列表区块（用于删除后刷新）
const mySectionRef = ref<InstanceType<typeof AppListSection>>()

// 获取我的作品
const fetchMyApps = async (params: API.AppQueryRequest) => {
  if (!loginUserStore.loginUser.id) {
    myApps.value = []
    myTotal.value = 0
    return
  }
  myLoading.value = true
  try {
    const res = await listMyAppVoByPage(params)
    if (res.data.code === 0 && res.data.data) {
      myApps.value = res.data.data.records ?? []
      myTotal.value = res.data.data.totalRow ?? 0
    } else {
      message.error('获取我的作品失败，' + res.data.message)
    }
  } finally {
    myLoading.value = false
  }
}

// 获取精选案例
const fetchGoodApps = async (params: API.AppQueryRequest) => {
  goodLoading.value = true
  try {
    const res = await listGoodAppVoByPage(params)
    if (res.data.code === 0 && res.data.data) {
      goodApps.value = res.data.data.records ?? []
      goodTotal.value = res.data.data.totalRow ?? 0
    } else {
      message.error('获取精选案例失败，' + res.data.message)
    }
  } finally {
    goodLoading.value = false
  }
}

// 创建应用：得到应用 id 后跳转到应用生成对话页
const doCreateApp = async () => {
  const prompt = initPrompt.value.trim()
  if (!prompt) {
    message.warning('请输入应用描述')
    return
  }
  if (!loginUserStore.loginUser.id) {
    message.warning('请先登录')
    goLogin()
    return
  }
  creating.value = true
  try {
    const res = await addApp({ initPrompt: prompt })
    if (res.data.code === 0 && res.data.data != null) {
      message.success('创建成功，正在为你生成应用')
      // autoGen=1 表示需要在对话页自动把初始提示词发送给 AI
      await router.push(`/app/chat/${res.data.data}?autoGen=1`)
    } else {
      message.error('创建失败，' + res.data.message)
    }
  } finally {
    creating.value = false
  }
}

// 删除应用
const doDeleteApp = (app: API.AppVO) => {
  confirmDelete({
    name: app.appName || '未命名应用',
    async onOk() {
      const res = await deleteApp({ id: app.id })
      if (res.data.code === 0) {
        message.success('删除成功')
        detailVisible.value = false
        mySectionRef.value?.refresh()
      } else {
        message.error('删除失败，' + res.data.message)
      }
    },
  })
}

// 打开应用详情弹窗
const openDetail = (app: API.AppVO) => {
  detailApp.value = app
  detailVisible.value = true
}

// 查看对话：跳转到应用生成对话页（view=1 表示只是查看，不自动发送消息）
const goChatPage = (app: API.AppVO) => {
  if (app.id == null) {
    return
  }
  router.push(`/app/chat/${app.id}?view=1`)
}

// 查看作品：新页面打开部署地址（仅已部署的应用会有该入口）
const openDeployUrl = (app: API.AppVO) => {
  const url = buildDeployUrl(app.deployKey)
  if (url) {
    window.open(url, '_blank')
  }
}

// 跳转到应用信息修改页
const goEditPage = (app: API.AppVO) => {
  if (app.id == null) {
    return
  }
  router.push(`/app/edit/${app.id}`)
}

// 跳转登录页
const goLogin = () => {
  router.push(`/user/login?redirect=${encodeURIComponent(router.currentRoute.value.fullPath)}`)
}
</script>

<style scoped>
/* 整页浅色系科技感渐变背景，宽度铺满并撑满剩余高度 */
.home-page {
  position: relative;
  flex: 1;
  width: 100%;
  min-height: 100%;
  padding-bottom: 56px;
  background-color: #f2f7ff;
  background-image:
    radial-gradient(980px 520px at 6% -12%, rgba(56, 189, 248, 0.42), transparent 62%),
    radial-gradient(880px 480px at 96% -8%, rgba(139, 92, 246, 0.3), transparent 62%),
    radial-gradient(920px 620px at 50% 112%, rgba(37, 99, 235, 0.16), transparent 66%),
    linear-gradient(168deg, #f7fbff 0%, #edf4ff 48%, #f6f9ff 100%);
}

/* 顶部叠加一层淡蓝色网格并向下淡出，强化科技感 */
.home-page::before {
  content: '';
  position: absolute;
  top: 0;
  right: 0;
  left: 0;
  height: 560px;
  pointer-events: none;
  background-image:
    linear-gradient(rgba(59, 130, 246, 0.075) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59, 130, 246, 0.075) 1px, transparent 1px);
  background-size: 44px 44px;
  -webkit-mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.9), transparent);
  mask-image: linear-gradient(180deg, rgba(0, 0, 0, 0.9), transparent);
}

/* 顶部标题与输入框（本身不再带背景） */
.hero {
  position: relative;
  z-index: 1;
  max-width: 900px;
  margin: 0 auto;
  padding: 72px 24px 48px;
  text-align: center;
}

.hero-title {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  margin: 0;
  font-size: 44px;
  font-weight: 700;
  letter-spacing: 2px;
  color: #0f1c33;
}

.hero-logo {
  width: 46px;
  height: 46px;
  object-fit: contain;
  filter: drop-shadow(0 4px 12px rgba(22, 119, 255, 0.28));
}

.hero-desc {
  margin: 14px 0 32px;
  font-size: 15px;
  letter-spacing: 1px;
  color: #5b6b8c;
}

/* 输入框：去掉边框，只用柔和投影和背景区分 */
.prompt-box {
  max-width: 760px;
  margin: 0 auto;
  padding: 16px 16px 10px;
  background: #fff;
  border: none;
  border-radius: 18px;
  box-shadow:
    0 16px 40px rgba(22, 119, 255, 0.14),
    0 2px 8px rgba(15, 28, 51, 0.04);
}

.prompt-input {
  padding: 0;
  font-size: 14px;
  resize: none;
}

.prompt-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-top: 12px;
}

.prompt-tip {
  font-size: 12px;
  color: rgba(0, 0, 0, 0.35);
}

/* 推荐需求标签 */
.prompt-samples {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 10px;
  margin-top: 26px;
}

.sample-tag {
  padding: 5px 14px;
  font-size: 13px;
  border-radius: 16px;
  cursor: pointer;
  color: #40506b;
  background: rgba(255, 255, 255, 0.75);
  border: 1px solid rgba(22, 119, 255, 0.16);
  transition:
    color 0.2s,
    background 0.2s,
    border-color 0.2s;
}

.sample-tag:hover {
  color: #1677ff;
  background: #fff;
  border-color: rgba(22, 119, 255, 0.5);
}

/* 列表内容区居中，避免渐变背景上内容过宽 */
.home-content {
  position: relative;
  z-index: 1;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

@media (max-width: 992px) {
  .hero-title {
    font-size: 30px;
  }

  .hero {
    padding: 48px 20px 36px;
  }
}
</style>
