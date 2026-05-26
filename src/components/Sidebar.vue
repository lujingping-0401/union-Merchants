<template>
  <el-aside :width="isCollapse ? '64px' : '240px'" class="aside-menu" :class="{ 'collapsed': isCollapse }">
    <!-- 侧边栏顶部 Logo 区 -->
    <div class="logo-section" :class="{ 'collapsed': isCollapse }">
      <el-icon class="logo-icon"><Shop /></el-icon>
      <span v-show="!isCollapse" class="logo-title">数智工会商家端</span>
    </div>

    <el-menu
      :default-active="activeMenu"
      class="el-menu-vertical"
      background-color="transparent"
      text-color="#475569"
      active-text-color="#00a86b"
      :collapse="isCollapse"
      :collapse-transition="false"
      @select="handleMenuSelect"
    >
      <el-menu-item index="data-overview">
        <el-icon><Menu /></el-icon>
        <template #title>数据概览</template>
      </el-menu-item>
      
      <el-sub-menu index="product-group">
        <template #title>
          <el-icon><Goods /></el-icon>
          <span>商品管理</span>
        </template>
        <el-menu-item index="product-list">
          <el-icon><List /></el-icon>
          <template #title>商品列表</template>
        </el-menu-item>
        <el-menu-item index="product-apply">
          <el-icon><DocumentChecked /></el-icon>
          <template #title>上架申请</template>
        </el-menu-item>
      </el-sub-menu>

      <el-menu-item index="system-settings">
        <el-icon><Setting /></el-icon>
        <template #title>系统设置</template>
      </el-menu-item>
    </el-menu>
  </el-aside>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { isCollapse } from '@/utils/sidebarState'

const route = useRoute()
const router = useRouter()

// Automatically set active menu index based on the current route path
const activeMenu = computed(() => {
  if (route.path === '/product') return 'product-list'
  if (route.path === '/product-apply') return 'product-apply'
  if (route.path === '/system-settings') return 'system-settings'
  return 'data-overview' // default to overview for other routes on home
})

const handleMenuSelect = (index) => {
  if (index === 'product-list') {
    router.push('/product')
  } else if (index === 'product-apply') {
    router.push('/product-apply')
  } else if (index === 'data-overview') {
    router.push('/')
  } else if (index === 'system-settings') {
    router.push('/system-settings')
  }
}
</script>

<style scoped>
.aside-menu {
  background-color: #ffffff;
  border-right: 1px solid #e2e8f0;
  display: flex;
  flex-direction: column;
  height: 100vh; /* 侧边栏高度顶满头部 */
  transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow-x: hidden;
}

/* Logo 样式 */
.logo-section {
  height: 64px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 24px;
  box-sizing: border-box;
  overflow: hidden;
  transition: all 0.3s ease;
  background-color: #ffffff;
  flex-shrink: 0;
}

.logo-section.collapsed {
  padding: 0;
  justify-content: center;
}

.logo-icon {
  font-size: 24px;
  color: #00a86b;
  flex-shrink: 0;
}

.logo-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: 0.5px;
  white-space: nowrap;
}

.el-menu-vertical {
  border-right: none;
  padding-top: 0px;
  margin-top: -8px;
}

/* Default state styling */
:deep(.el-menu-item),
:deep(.el-sub-menu__title) {
  margin: 4px 12px;
  border-radius: 8px;
  height: 48px;
  line-height: 48px;
  color: #475569 !important;
  transition: all 0.2s ease;
}

/* Center elements when menu is collapsed */
:deep(.el-menu--collapse) {
  width: 100% !important;
}

.aside-menu.collapsed :deep(.el-menu-item),
.aside-menu.collapsed :deep(.el-sub-menu__title) {
  margin: 4px 8px !important;
  width: 48px !important;
  padding: 0 !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
}

/* Align tooltip trigger for collapsed menu items */
.aside-menu.collapsed :deep(.el-tooltip__trigger) {
  padding: 0 !important;
  display: flex !important;
  justify-content: center !important;
  align-items: center !important;
  width: 100% !important;
  height: 100% !important;
}

/* Remove margins from icons in collapsed state */
.aside-menu.collapsed :deep(.el-menu-item .el-icon),
.aside-menu.collapsed :deep(.el-sub-menu__title .el-icon) {
  margin: 0 !important;
}

.aside-menu.collapsed :deep(.el-sub-menu__icon-arrow) {
  display: none !important;
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
