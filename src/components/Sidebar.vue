<template>
  <el-aside width="240px" class="aside-menu">
    <el-menu
      :default-active="activeMenu"
      class="el-menu-vertical"
      background-color="transparent"
      text-color="#475569"
      active-text-color="#00a86b"
      @select="handleMenuSelect"
    >
      <el-menu-item index="data-overview">
        <el-icon><Menu /></el-icon>
        <span>数据概览</span>
      </el-menu-item>
      
      <el-sub-menu index="product-group">
        <template #title>
          <el-icon><Goods /></el-icon>
          <span>商品管理</span>
        </template>
        <el-menu-item index="product-list">
          <el-icon><List /></el-icon>
          <span>商品列表</span>
        </el-menu-item>
        <el-menu-item index="product-apply">
          <el-icon><DocumentChecked /></el-icon>
          <span>上架申请</span>
        </el-menu-item>
      </el-sub-menu>

      <el-menu-item index="system-settings">
        <el-icon><Setting /></el-icon>
        <span>系统设置</span>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'

const route = useRoute()
const router = useRouter()

// Automatically set active menu index based on the current route path
const activeMenu = computed(() => {
  if (route.path === '/product') return 'product-list'
  if (route.path === '/product-apply') return 'product-apply'
  return 'data-overview' // default to overview for other routes on home
})

const handleMenuSelect = (index) => {
  if (index === 'product-list') {
    router.push('/product')
  } else if (index === 'product-apply') {
    router.push('/product-apply')
  } else if (index === 'data-overview') {
    router.push('/')
  } else {
    ElMessage.info(`点击了: ${index}`)
  }
}
</script>

<style scoped>
.aside-menu {
  background-color: #ffffff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  height: 100%;
}

.el-menu-vertical {
  border-right: none;
  padding-top: 15px;
}

:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  margin: 4px 12px;
  border-radius: 8px;
  height: 48px;
  line-height: 48px;
  color: #475569 !important;
  transition: all 0.2s ease;
}

:deep(.el-menu-item.is-active) {
  background-color: rgba(0, 168, 107, 0.08) !important;
  color: #00a86b !important;
  font-weight: 600;
}

:deep(.el-menu-item:hover),
:deep(.el-sub-menu__title:hover) {
  background-color: #f1f5f9 !important;
  color: #0f172a !important;
}
</style>
