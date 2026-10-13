/**
 * 环境配置
 *
 * 所有域名统一从环境变量读取，取值见前端根目录的 .env 文件，
 * 更换部署环境时只需要改配置、不需要改代码。
 */

/**
 * 读取环境变量并去掉末尾多余的斜杠，避免拼接出 「//」
 * 未配置时直接报错，避免请求地址静默变成相对路径
 */
const readDomain = (key: keyof ImportMetaEnv): string => {
  const value = import.meta.env[key]
  if (!value) {
    throw new Error(`缺少环境变量 ${key}，请检查前端根目录的 .env 文件`)
  }
  return value.replace(/\/+$/, '')
}

/** 后端接口地址（axios 请求、SSE 流式接口使用） */
export const API_BASE_URL = readDomain('VITE_API_BASE_URL')

/** 应用生成预览域名，拼接规则：{域名}/{codeGenType}_{appId}/ */
export const APP_PREVIEW_DOMAIN = readDomain('VITE_APP_PREVIEW_DOMAIN')

/** 应用部署域名，拼接规则：{域名}/{deployKey}/ */
export const APP_DEPLOY_DOMAIN = readDomain('VITE_APP_DEPLOY_DOMAIN')
