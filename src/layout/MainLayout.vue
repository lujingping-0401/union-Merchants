<template>
  <el-container class="app-layout">
    <!-- 侧边栏 (顶满左侧全部高度) -->
    <Sidebar />

    <el-container class="right-container">
      <!-- 头部 (放置于右侧顶部) -->
      <Header />

      <!-- 主要内容 (放置于右侧底部) -->
      <el-main class="app-main">
        <!-- Breadcrumb / Tab Bar -->
        <div class="breadcrumb-bar">
          <el-tag
            v-for="item in breadcrumbs"
            :key="item.path"
            :closable="breadcrumbs.length > 1"
            :class="['breadcrumb-tag', { active: route.path === item.path, inactive: route.path !== item.path }]"
            @click="handleBreadcrumbClick($event, item.path)"
            @close="handleBreadcrumbClose(item.path)"
          >
            {{ item.name }}
          </el-tag>
        </div>

        <!-- router-view with KeepAlive -->
        <router-view v-slot="{ Component }">
          <keep-alive :include="cachedNames">
            <component :is="Component" />
          </keep-alive>
        </router-view>
      </el-main>
    </el-container>
  </el-container>
</template>

<script setup>
import { computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import Header from '@/components/Header.vue'
import { breadcrumbs, removeBreadcrumb } from '@/utils/breadcrumbState'

const route = useRoute()
const router = useRouter()

// Compute the list of component names to be kept alive based on current active tabs
const cachedNames = computed(() => {
  return breadcrumbs.value.map(item => {
    if (item.path === '/') return 'Home'
    if (item.path === '/product') return 'Product'
    if (item.path === '/product-apply') return 'ProductApply'
    if (item.path === '/system-settings') return 'SystemSettings'
    return ''
  }).filter(Boolean)
})

const handleBreadcrumbClick = (event, path) => {
  if (event.target.closest('.el-tag__close')) {
    return
  }
  router.push(path)
}

const handleBreadcrumbClose = (path) => {
  const nextPath = removeBreadcrumb(path, route.path)
  if (nextPath) {
    router.push(nextPath)
  }
}
</script>

<style scoped>
.app-layout {
  height: 100vh;
  display: flex;
  flex-direction: row; /* 横向排列：左侧侧边栏，右侧主容器 */
  overflow: hidden;
}

.right-container {
  flex: 1;
  display: flex;
  flex-direction: column; /* 纵向排列：上方头部，下方主要内容 */
  overflow: hidden;
}

.app-main {
  background-color: #f8fafc;
  padding: 10px 10px 10px 10px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
}

.breadcrumb-bar {
  background: #ffffff;
  padding: 10px 24px;
  margin: -10px -10px 0 -10px; /* Offset parent el-main padding */
  display: flex;
  align-items: center;
  flex-shrink: 0;
  gap: 8px;
  border-bottom: 1px solid #f1f5f9;
}

.breadcrumb-tag {
  flex: 0 0 auto;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  height: 34px !important;
  max-width: 180px;
  padding: 0 10px 0 14px !important;
  border: 1px solid #e5e7eb !important;
  border-radius: 10px !important;
  color: #64748b !important;
  font-size: 14px !important;
  line-height: 1 !important;
  background-color: #ffffff !important;
  box-shadow: 0 6px 16px rgba(15, 23, 42, 0.04) !important;
  cursor: pointer;
  font-weight: 500;
  transition: color 0.2s ease, border-color 0.2s ease, box-shadow 0.2s ease !important;
}

/* Hover and active style matching Figure 2 */
.breadcrumb-tag:hover,
.breadcrumb-tag.active {
  background-color: #ffffff !important;
  color: #00a86b !important;
  border-color: rgba(0, 168, 107, 0.3) !important;
  box-shadow: 0 8px 20px rgba(0, 168, 107, 0.1) !important;
}

.breadcrumb-tag:hover :deep(.el-tag__close),
.breadcrumb-tag.active :deep(.el-tag__close) {
  color: #00a86b !important;
}

.breadcrumb-tag:hover :deep(.el-tag__close:hover),
.breadcrumb-tag.active :deep(.el-tag__close:hover) {
  background-color: rgba(0, 168, 107, 0.2) !important;
  color: #00a86b !important;
}

/* Inactive tag style (default state close icon color) */
.breadcrumb-tag.inactive :deep(.el-tag__close) {
  color: #94a3b8 !important;
  transition: color 0.2s ease, background-color 0.2s ease;
}

.breadcrumb-tag.inactive :deep(.el-tag__close:hover) {
  background-color: rgba(0, 168, 107, 0.2) !important;
  color: #00a86b !important;
}
</style>
