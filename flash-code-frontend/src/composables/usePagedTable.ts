import { computed, ref } from 'vue'
import type { TablePaginationConfig } from 'ant-design-vue'

interface PageQuery {
  pageNum?: number
  pageSize?: number
}

/**
 * 分页表格通用逻辑
 *
 * 统一管理「总条数 + 分页配置 + 翻页 / 搜索」，查询条件由各页面自己维护（可携带业务字段）。
 *
 * @param searchParams 页面的查询条件对象
 * @param fetchData    查询方法
 * @param defaultPageSize 每页条数
 */
export const usePagedTable = <Q extends PageQuery>(
  searchParams: Q,
  fetchData: () => void,
  defaultPageSize = 10,
) => {
  /** 总条数 */
  const total = ref(0)

  /** 分页配置 */
  const pagination = computed(() => ({
    current: searchParams.pageNum ?? 1,
    pageSize: searchParams.pageSize ?? defaultPageSize,
    total: total.value,
    showSizeChanger: true,
    showTotal: (value: number) => `共 ${value} 条`,
  }))

  /** 翻页 */
  const handleTableChange = (page: TablePaginationConfig) => {
    searchParams.pageNum = page.current ?? 1
    searchParams.pageSize = page.pageSize ?? searchParams.pageSize
    fetchData()
  }

  /** 搜索：回到第一页 */
  const search = () => {
    searchParams.pageNum = 1
    fetchData()
  }

  return { total, pagination, handleTableChange, search }
}
