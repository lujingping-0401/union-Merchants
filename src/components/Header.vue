<template>
  <el-header class="app-header">
    <div class="header-left">
      <!-- 折叠/展开控制按钮 (图标状态已调换，margin-left 负边距实现对齐) -->
      <div class="collapse-btn" @click="toggleCollapse" :title="isCollapse ? '展开侧边栏' : '收起侧边栏'">
        <el-icon v-if="isCollapse"><Fold /></el-icon>
        <el-icon v-else><Expand /></el-icon>
      </div>

      <!-- 路由层级面包屑 (除了最后一级，其他全部加粗显示) -->
      <div class="route-breadcrumbs">
        <span v-for="(item, idx) in routeHierarchy" :key="idx" class="breadcrumb-item-span">
          <span v-if="idx > 0" class="breadcrumb-separator">/</span>
          <span class="breadcrumb-text" :class="{ 'bold': item.isBold }">{{ item.name }}</span>
        </span>
      </div>
    </div>
    
    <div class="header-right">
      <!-- 全屏切换按钮 -->
      <div class="header-btn fullscreen-btn" @click="toggleFullscreen" :title="isFullscreen ? '退出全屏' : '全屏显示'">
        <el-icon v-if="isFullscreen"><Aim /></el-icon>
        <el-icon v-else><FullScreen /></el-icon>
      </div>

      <!-- 消息通知中心 -->
      <el-popover
        placement="bottom-end"
        :width="340"
        trigger="click"
        popper-class="notification-popper"
      >
        <template #reference>
          <div class="header-btn notification-btn" title="消息通知">
            <el-badge :value="unreadCount" :max="99" :hidden="unreadCount === 0" class="badge-item">
              <el-icon><Bell /></el-icon>
            </el-badge>
          </div>
        </template>
        
        <div class="notification-box">
          <div class="notification-header">
            <span class="title">通知中心</span>
            <el-button 
              v-if="unreadCount > 0" 
              type="primary" 
              link 
              @click="markAllAsRead"
              size="small"
            >
              <el-icon class="btn-icon-spacing"><Check /></el-icon>全部标记已读
            </el-button>
          </div>
          
          <div class="notification-list" v-if="notifications.length > 0">
            <div 
              v-for="item in notifications" 
              :key="item.id" 
              class="notification-item"
              :class="{ unread: !item.read }"
              @click="readNotification(item)"
            >
              <div class="noti-icon-box" :class="item.type">
                <el-icon v-if="item.type === 'success'"><CircleCheck /></el-icon>
                <el-icon v-else-if="item.type === 'warning'"><Warning /></el-icon>
                <el-icon v-else><InfoFilled /></el-icon>
              </div>
              <div class="noti-content">
                <div class="noti-title">{{ item.title }}</div>
                <div class="noti-time">{{ item.time }}</div>
              </div>
            </div>
          </div>
          
          <div class="notification-empty" v-else>
            <el-empty description="暂无新消息" :image-size="60" />
          </div>
        </div>
      </el-popover>

      <!-- 用户个人中心下拉菜单 -->
      <el-dropdown trigger="click" @command="handleHeaderCommand">
        <div class="user-info">
          <div class="char-avatar">
            <img v-if="merchantInfo && merchantInfo.businessLicenseUrl" :src="merchantInfo.businessLicenseUrl" alt="avatar" class="avatar-img" />
            <span v-else>{{ avatarChar }}</span>
          </div>
          <span class="nickname">{{ nickname }}</span>
          <el-icon class="arrow-icon"><ArrowDown /></el-icon>
        </div>
        <template #dropdown>
          <el-dropdown-menu class="custom-dropdown-menu">
            <el-dropdown-item command="logout" class="logout-menu-item">
              <el-icon><SwitchButton /></el-icon>退出登录
            </el-dropdown-item>
          </el-dropdown-menu>
        </template>
      </el-dropdown>
    </div>
  </el-header>
</template>

<script setup>
import { onMounted, ref, computed } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { removeToken } from '@/utils/token'
import { resetBreadcrumbs } from '@/utils/breadcrumbState'
import { getCurrentMerchant } from '@/api/authApi'
import { isCollapse, toggleCollapse } from '@/utils/sidebarState'
import {
  merchantInfo,
  nickname,
  avatarChar,
  clearMerchantInfo,
  setMerchantInfo,
  loadMerchantInfoFromStorage
} from '@/utils/merchantState'

const router = useRouter()
const route = useRoute()
const isFullscreen = ref(false)

// 计算当前路由的层级，除了最后一级都加粗
const routeHierarchy = computed(() => {
  const base = '数智工会商家端'
  if (route.path === '/') {
    return [
      { name: base, isBold: true },
      { name: '数据概览', isBold: false }
    ]
  } else if (route.path === '/product') {
    return [
      { name: base, isBold: true },
      { name: '商品管理', isBold: true },
      { name: '商品列表', isBold: false }
    ]
  } else if (route.path === '/product-apply') {
    return [
      { name: base, isBold: true },
      { name: '商品管理', isBold: true },
      { name: '上架申请', isBold: false }
    ]
  } else if (route.path === '/system-settings') {
    return [
      { name: base, isBold: true },
      { name: '系统设置', isBold: false }
    ]
  }
  // 备用 fallback
  return [
    { name: base, isBold: true },
    { name: route.meta.title || '当前页面', isBold: false }
  ]
})

// Mock 消息通知列表数据
const notifications = ref([
  {
    id: 1,
    title: '【上架审核】您提交的“阳光玫瑰葡萄”已成功通过上架申请！',
    time: '今天 09:30',
    type: 'success',
    read: false
  },
  {
    id: 2,
    title: '【库存预警】“精品白菜”库存不足10件，请尽快安排补充。',
    time: '昨天 15:20',
    type: 'warning',
    read: false
  },
  {
    id: 3,
    title: '【系统通知】本期工会专享优惠促销季规则已发布，请查阅。',
    time: '2026-05-24 10:00',
    type: 'info',
    read: false
  }
])

const unreadCount = computed(() => {
  return notifications.value.filter(n => !n.read).length
})

onMounted(async () => {
  loadMerchantInfoFromStorage()
  try {
    const res = await getCurrentMerchant()
    if (res && (res.code === 200 || res.code === 0) && res.data) {
      setMerchantInfo(res.data)
    }
  } catch (error) {
    console.error('获取商户信息失败:', error)
  }

  // 监听全屏改变事件，保持状态一致
  document.addEventListener('fullscreenchange', () => {
    isFullscreen.value = !!document.fullscreenElement
  })
})

// 全屏切换逻辑
const toggleFullscreen = () => {
  if (!document.fullscreenElement) {
    document.documentElement.requestFullscreen()
      .then(() => {
        isFullscreen.value = true
      })
      .catch((err) => {
        ElMessage.error(`全屏开启失败: ${err.message}`)
      })
  } else {
    document.exitFullscreen().then(() => {
      isFullscreen.value = false
    })
  }
}

// 消息已读处理
const readNotification = (item) => {
  if (!item.read) {
    item.read = true
    ElMessage.success('消息已标记为已读')
  }
}

// 全部标记为已读
const markAllAsRead = () => {
  notifications.value.forEach(n => {
    n.read = true
  })
  ElMessage.success('已将所有消息标记为已读')
}

// 退出登录逻辑
const handleHeaderCommand = (command) => {
  if (command === 'logout') {
    ElMessageBox.confirm('确定要退出登录吗？', '提示', {
      confirmButtonText: '确定',
      cancelButtonText: '取消',
      type: 'warning'
    }).then(() => {
      removeToken()
      resetBreadcrumbs()
      clearMerchantInfo()
      ElMessage.success('退出成功')
      router.push('/login')
    }).catch(() => {})
  }
}
</script>

<style scoped>
.app-header {
  height: 64px;
  background: #ffffff;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
  z-index: 10;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 16px;
}

/* 侧边栏折叠按钮 - 负边距使折叠图标与右下方的文字元素对齐 */
.collapse-btn {
  font-size: 20px;
  color: #64748b;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  margin-left: -6px; 
}

.collapse-btn:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

/* 路由层级面包屑样式 */
.route-breadcrumbs {
  display: flex;
  align-items: center;
  font-size: 14px;
  color: #64748b;
}

.breadcrumb-item-span {
  display: flex;
  align-items: center;
}

.breadcrumb-separator {
  margin: 0 8px;
  color: #cbd5e1;
}

.breadcrumb-text {
  color: #64748b;
  font-weight: 500;
}

.breadcrumb-text.bold {
  font-weight: 700;
  color: #1e293b;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 6px;
}

/* 头部操作按钮样式 */
.header-btn {
  font-size: 20px;
  color: #64748b;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.header-btn:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

/* 全屏按钮图标缩小，从 20px 调小到 16px */
.fullscreen-btn {
  font-size: 16px !important;
}

/* 消息徽章样式，确保完美水平居中对齐，消除 baseline 引起的偏移 */
.badge-item {
  display: flex !important;
  align-items: center;
  justify-content: center;
}

/* 未读徽章样式微调 */
.badge-item :deep(.el-badge__content.is-fixed) {
  top: 6px;
  right: 6px;
  background-color: #ef4444;
}

.btn-icon-spacing {
  margin-right: 4px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 20px;
  transition: background-color 0.2s;
  margin-left: 4px;
}

.user-info:hover {
  background-color: #f1f5f9;
}

.char-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: linear-gradient(135deg, #00a86b 0%, #10b981 100%);
  color: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 14px;
  box-shadow: 0 2px 4px rgba(0, 168, 107, 0.2);
  overflow: hidden;
}

.avatar-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.nickname {
  font-size: 14px;
  color: #334155;
  font-weight: 600;
}

.arrow-icon {
  font-size: 12px;
  color: #94a3b8;
}

.custom-dropdown-menu :deep(.el-dropdown-menu__item) {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 14px;
}

.logout-menu-item {
  color: #ef4444 !important;
}

/* 通知卡片定制化样式 */
.notification-box {
  display: flex;
  flex-direction: column;
  max-height: 360px;
}

.notification-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px 12px;
  border-bottom: 1px solid #f1f5f9;
}

.notification-header .title {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
}

.notification-list {
  overflow-y: auto;
  flex: 1;
}

.notification-item {
  display: flex;
  gap: 12px;
  padding: 12px 14px;
  border-bottom: 1px solid #f8fafc;
  cursor: pointer;
  transition: all 0.2s ease;
}

.notification-item:hover {
  background-color: #f8fafc;
}

.notification-item.unread {
  background-color: rgba(0, 168, 107, 0.02);
}

.notification-item.unread:hover {
  background-color: rgba(0, 168, 107, 0.04);
}

.noti-icon-box {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  font-size: 16px;
}

.noti-icon-box.success {
  background-color: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.noti-icon-box.warning {
  background-color: rgba(245, 158, 11, 0.1);
  color: #f59e0b;
}

.noti-icon-box.info {
  background-color: rgba(59, 130, 246, 0.1);
  color: #3b82f6;
}

.noti-content {
  flex: 1;
  min-width: 0;
}

.noti-title {
  font-size: 12.5px;
  color: #475569;
  line-height: 1.5;
  margin-bottom: 4px;
  font-weight: 500;
  word-break: break-all;
}

.notification-item.unread .noti-title {
  font-weight: 600;
  color: #0f172a;
}

.noti-time {
  font-size: 11px;
  color: #94a3b8;
}

.notification-empty {
  padding: 30px 0;
}
</style>
