import { Modal } from 'ant-design-vue'

interface ConfirmDeleteOptions {
  /** 被删除对象的名称，用于生成提示文案 */
  name?: string
  /** 自定义提示文案，优先级高于 name */
  content?: string
  /** 确认后的回调 */
  onOk: () => void | Promise<void>
}

/**
 * 删除类操作的二次确认弹窗
 */
export const confirmDelete = ({ name, content, onOk }: ConfirmDeleteOptions) => {
  Modal.confirm({
    title: '确认删除',
    content: content ?? `确定要删除「${name || '该内容'}」吗？删除后不可恢复。`,
    okText: '删除',
    okType: 'danger',
    cancelText: '取消',
    onOk,
  })
}
