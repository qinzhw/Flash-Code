import { APP_DEPLOY_DOMAIN, APP_PREVIEW_DOMAIN } from '@/config'
import { CODE_GEN_TYPE } from '@/constants/codeGenType.ts'

/**
 * 部署后的访问地址：{部署域名}/{deployKey}/
 *
 * 注意：这是「部署」后的地址，和「生成预览」地址不是同一个
 */
export const buildDeployUrl = (deployKey?: string): string => {
  const key = (deployKey ?? '').replace(/^\/+|\/+$/, '')
  return key ? `${APP_DEPLOY_DOMAIN}/${key}/` : ''
}

/**
 * 生成后的预览地址：{预览域名}/{codeGenType}_{appId}/
 *
 * Vue 工程模式保存的是完整工程（根目录 index.html 是 Vite 开发入口，
 * 里面的 /src/main.js 浏览器无法直接执行），必须指向构建产物 dist/index.html。
 */
export const buildPreviewUrl = (appId?: string | number, codeGenType?: string): string => {
  if (appId == null || appId === '') {
    return ''
  }
  const type = codeGenType || CODE_GEN_TYPE.HTML
  const entry = type === CODE_GEN_TYPE.VUE_PROJECT ? '/dist/index.html' : '/'
  return `${APP_PREVIEW_DOMAIN}/${type}_${appId}${entry}`
}

/**
 * 应用封面地址
 *
 * 后端截图上传对象存储后返回的是「域名 + 路径」，例如
 * flashcode-xxx.cos.ap-guangzhou.myqcloud.com/screenshots/2026/10/20/xxx_compressed.jpg，
 * 并没有协议前缀。直接交给 <img> 会被当成相对路径解析到前端域名下（必然 404），
 * 所以这里统一补全 https；已经带协议、协议相对、data: 或以 / 开头的站内路径则原样返回。
 */
export const buildCoverUrl = (cover?: string): string => {
  const value = (cover ?? '').trim()
  if (!value) {
    return ''
  }
  if (/^(https?:)?\/\//i.test(value)) {
    return value.startsWith('//') ? `https:${value}` : value
  }
  if (/^data:/i.test(value) || value.startsWith('/')) {
    return value
  }
  return `https://${value}`
}
