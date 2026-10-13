/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** 后端接口地址 */
  readonly VITE_API_BASE_URL: string
  /** 应用生成预览域名：{域名}/{codeGenType}_{appId}/ */
  readonly VITE_APP_PREVIEW_DOMAIN: string
  /** 应用部署域名：{域名}/{deployKey}/ */
  readonly VITE_APP_DEPLOY_DOMAIN: string
}
