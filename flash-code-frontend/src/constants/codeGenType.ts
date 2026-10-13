/**
 * 代码生成类型，与后端 CodeGenTypeEnum 保持一致
 *
 * public enum CodeGenTypeEnum {
 *     HTML("原生 HTML 模式", "html"),
 *     MULTI_FILE("原生多文件模式", "multi_file");
 * }
 */
export const CODE_GEN_TYPE = {
  /** 原生 HTML 模式 */
  HTML: 'html',
  /** 原生多文件模式 */
  MULTI_FILE: 'multi_file',
} as const

/** 「生成类型」筛选下拉选项（不选表示全部） */
export const CODE_GEN_TYPE_OPTIONS = [
  { label: '原生 HTML 模式', value: CODE_GEN_TYPE.HTML },
  { label: '原生多文件模式', value: CODE_GEN_TYPE.MULTI_FILE },
]

/** 生成类型取值 -> 中文名称 */
export const getCodeGenTypeLabel = (value?: string): string => {
  if (!value) {
    return '-'
  }
  return CODE_GEN_TYPE_OPTIONS.find((item) => item.value === value)?.label ?? value
}
