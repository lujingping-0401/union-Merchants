<template>
  <div class="system-settings-dev">
    <el-card class="dev-card">
      <div class="card-content">
        <div class="icon-wrapper">
          <el-icon class="gears-icon"><Tools /></el-icon>
        </div>
        <h2 class="title">系统设置还在开发中</h2>
        <p class="description">
          为了给您提供更好的商户服务管理体验，系统设置模块目前正在进行全面升级与功能开发，敬请期待！
        </p>
        <div class="progress-bar-box">
          <span class="progress-text">开发进度 75%</span>
          <el-progress :percentage="75" status="success" :stroke-width="10" striped striped-flow />
        </div>
        <el-button type="primary" class="back-btn" @click="goHome">
          <el-icon><HomeFilled /></el-icon>返回主页
        </el-button>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'

const router = useRouter()

const goHome = () => {
  router.push('/')
}
</script>

<style scoped>
.system-settings-dev {
  display: flex;
  justify-content: center;
  align-items: center;
  flex: 1;
  padding: 40px;
}

.dev-card {
  width: 100%;
  max-width: 600px;
  border-radius: 16px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.05);
  border: none;
  background-color: #ffffff;
}

.card-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 40px 20px;
}

.icon-wrapper {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  background-color: rgba(0, 168, 107, 0.08);
  display: flex;
  justify-content: center;
  align-items: center;
  margin-bottom: 24px;
  animation: pulse 2s infinite ease-in-out;
}

.gears-icon {
  font-size: 40px;
  color: #00a86b;
  animation: rotate 8s infinite linear;
}

.title {
  font-size: 22px;
  font-weight: 700;
  color: #1e293b;
  margin-bottom: 12px;
}

.description {
  font-size: 14px;
  color: #64748b;
  line-height: 1.6;
  max-width: 400px;
  margin-bottom: 32px;
}

.progress-bar-box {
  width: 100%;
  max-width: 320px;
  margin-bottom: 32px;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.progress-text {
  font-size: 12px;
  color: #94a3b8;
  font-weight: 600;
}

.back-btn {
  border-radius: 8px;
  height: 40px;
  padding: 0 24px;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 8px;
}

@keyframes rotate {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

@keyframes pulse {
  0% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(0, 168, 107, 0.2);
  }
  70% {
    transform: scale(1.05);
    box-shadow: 0 0 0 15px rgba(0, 168, 107, 0);
  }
  100% {
    transform: scale(1);
    box-shadow: 0 0 0 0 rgba(0, 168, 107, 0);
  }
}
</style>
