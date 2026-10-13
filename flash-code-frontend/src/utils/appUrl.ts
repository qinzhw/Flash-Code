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
 */
export const buildPreviewUrl = (appId?: string | number, codeGenType?: string): string => {
  if (appId == null || appId === '') {
    return ''
  }
  return `${APP_PREVIEW_DOMAIN}/${codeGenType || CODE_GEN_TYPE.HTML}_${appId}/`
}
