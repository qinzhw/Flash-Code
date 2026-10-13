/**
 * 应用相关的业务常量
 */

/** 精选应用优先级，与后端 AppConstant.GOOD_APP_PRIORITY 保持一致 */
export const GOOD_APP_PRIORITY = 99

/** 取消精选时重置的优先级 */
export const DEFAULT_APP_PRIORITY = 0

/** 是否为精选应用 */
export const isGoodApp = (priority?: number): boolean =>
  (priority ?? DEFAULT_APP_PRIORITY) >= GOOD_APP_PRIORITY
