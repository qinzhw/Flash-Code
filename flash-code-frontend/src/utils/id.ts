/**
 * 应用 id 可能是雪花 id（例如 467444799969439744），已经超出 JS 的
 * Number.MAX_SAFE_INTEGER，直接转成 number 会丢失精度、导致查不到数据。
 *
 * 后端通过 JsonConfig 把 Long 统一序列化成字符串返回，因此前端必须始终按
 * 字符串保存和传递 id；而 openapi2ts 生成的类型声明是 number，
 * 这里统一做一次类型转换，运行时传入的依旧是字符串。
 */
export const asApiId = (id: string): number => id as unknown as number
