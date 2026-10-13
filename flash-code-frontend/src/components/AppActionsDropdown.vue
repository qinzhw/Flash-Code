<template>
  <a-dropdown :trigger="['click']">
    <a-button type="text" size="small" class="app-actions-trigger" @click.stop>
      <template #icon>
        <more-outlined />
      </template>
    </a-button>
    <template #overlay>
      <a-menu>
        <a-menu-item v-if="showDetail" key="detail" @click="emit('detail')">
          <eye-outlined />
          查看详情
        </a-menu-item>
        <a-menu-item v-if="showEdit" key="edit" @click="emit('edit')">
          <edit-outlined />
          编辑
        </a-menu-item>
        <a-menu-item v-if="showDelete" key="delete" danger @click="emit('delete')">
          <delete-outlined />
          删除
        </a-menu-item>
      </a-menu>
    </template>
  </a-dropdown>
</template>

<script setup lang="ts">
import { DeleteOutlined, EditOutlined, EyeOutlined, MoreOutlined } from '@ant-design/icons-vue'

interface Props {
  /** 是否展示「查看详情」 */
  showDetail?: boolean
  /** 是否展示「编辑」 */
  showEdit?: boolean
  /** 是否展示「删除」 */
  showDelete?: boolean
}

withDefaults(defineProps<Props>(), {
  showDetail: true,
  showEdit: true,
  showDelete: true,
})

const emit = defineEmits<{
  (e: 'detail'): void
  (e: 'edit'): void
  (e: 'delete'): void
}>()
</script>

<style scoped>
.app-actions-trigger {
  color: rgba(0, 0, 0, 0.45);
}
</style>
