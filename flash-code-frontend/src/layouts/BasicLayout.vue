<template>
  <a-layout class="basic-layout" :class="{ 'basic-layout-fixed': isWidePage }">
    <!-- 顶部导航栏 -->
    <GlobalHeader />

    <!-- 主要内容区域 -->
    <a-layout-content
      class="main-content"
      :class="{
        'main-content-wide': isWidePage,
        'main-content-fluid': isFluidPage,
        'main-content-full': isFullWidthPage,
      }"
    >
      <router-view />
    </a-layout-content>

    <!-- 底部版权信息 -->
    <GlobalFooter />
  </a-layout>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import GlobalHeader from '@/components/GlobalHeader.vue'
import GlobalFooter from '@/components/GlobalFooter.vue'

const route = useRoute()

// 应用生成对话页需要更宽的展示区域，并撑满剩余高度
const isWidePage = computed(() => route.path.startsWith('/app/chat'))

// 管理页（用户管理 / 应用管理）表格内容较多，宽度铺满 100%
const isFluidPage = computed(() => route.path.startsWith('/admin'))

// 主页由页面自己绘制 100% 宽度的渐变背景，外层容器不再限制宽度和内边距
const isFullWidthPage = computed(() => route.path === '/')
</script>

<style scoped>
.basic-layout {
  background: none;
  min-height: 100vh;
}

/*
 * 对话页专用：外层给一个确定高度，整页锁在一屏内，
 * 否则高度为 auto 时 flex-grow 不生效，页面会随消息内容一起变长
 */
.basic-layout-fixed {
  height: 100vh;
  height: 100dvh;
  overflow: hidden;
}

.main-content {
  flex: 1;
  width: 100%;
  max-width: 1200px;
  padding: 24px;
  background: white;
  border-radius: 8px;
  margin: 16px auto 24px;
}

/* 管理页：宽度铺满，去掉左右留白 */
.main-content-fluid {
  max-width: none;
  margin: 16px 0 24px;
  border-radius: 0;
}

/* 对话页：高度锁在一屏内，内部各区域自己滚动 */
.main-content-wide {
  display: flex;
  flex-direction: column;
  max-width: 1600px;
  min-height: 0;
  overflow: hidden;
  margin: 8px auto 12px;
  padding: 8px 16px;
}

.main-content-full {
  display: flex;
  flex-direction: column;
  max-width: none;
  margin: 0;
  padding: 0;
  background: transparent;
  border-radius: 0;
}
</style>
