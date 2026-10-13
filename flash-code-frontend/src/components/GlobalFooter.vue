<template>
  <a-layout-footer class="footer">
    <div class="footer-inner">
      <div class="footer-brand">
        <img class="footer-logo" src="@/assets/logo.png" alt="FlashCode" />
        <span class="footer-name">FlashCode</span>
        <span class="footer-slogan">AI 零代码工作台</span>
      </div>

      <a
        class="footer-link"
        href="https://github.com/qinzhw/Flash-Code"
        target="_blank"
        rel="noopener noreferrer"
      >
        FlashCode by qinzhw（qinzhiwei200ok@163.com） 欢迎一起交流学习！
      </a>
    </div>
  </a-layout-footer>
</template>

<script setup lang="ts">
// 无需额外的响应式数据
</script>

<style scoped>
.footer {
  padding: 22px 24px 26px;
  background: linear-gradient(180deg, #f8fbff 0%, #edf3fd 100%);
  border-top: 1px solid rgba(22, 119, 255, 0.08);
}

.footer-inner {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
}

/* 品牌行 */
.footer-brand {
  display: flex;
  align-items: center;
  gap: 8px;
}

.footer-logo {
  width: 22px;
  height: 22px;
  border-radius: 5px;
  object-fit: contain;
}

.footer-name {
  font-size: 15px;
  font-weight: 600;
  letter-spacing: 0.5px;
  color: #1f2a44;
}

.footer-slogan {
  font-size: 13px;
  color: #8794ad;
}

/* 版权行 */
.footer-link {
  font-size: 13px;
  line-height: 1.7;
  color: #1677ff;
  transition: color 0.2s;
}

.footer-link:hover {
  color: #4096ff;
  text-decoration: underline;
}

@media (max-width: 768px) {
  .footer-link {
    font-size: 12px;
  }
}
</style>
