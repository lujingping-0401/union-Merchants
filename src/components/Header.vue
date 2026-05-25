<template>
  <el-header class="app-header">
    <div class="header-left">
      <div class="logo-box">
        <el-icon class="logo-icon"><Shop /></el-icon>
        <span class="logo-title">数智工会商家端</span>
      </div>
    </div>
    <div class="header-right">
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
          <el-dropdown-menu>
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
import { onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElMessageBox } from 'element-plus'
import { removeToken } from '@/utils/token'
import { resetBreadcrumbs } from '@/utils/breadcrumbState'
import { getCurrentMerchant } from '@/api/authApi'
import {
  merchantInfo,
  nickname,
  avatarChar,
  clearMerchantInfo,
  setMerchantInfo,
  loadMerchantInfoFromStorage
} from '@/utils/merchantState'

const router = useRouter()

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
})

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
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
  z-index: 10;
}

.logo-box {
  display: flex;
  align-items: center;
  gap: 10px;
}

.logo-icon {
  font-size: 24px;
  color: #00a86b;
}

.logo-title {
  font-size: 18px;
  font-weight: 700;
  color: #1e293b;
  letter-spacing: 0.5px;
}

.user-info {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  padding: 4px 8px;
  border-radius: 20px;
  transition: background-color 0.2s;
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

.logout-menu-item {
  color: #ef4444 !important;
}
</style>
