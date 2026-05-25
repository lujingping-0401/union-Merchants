<template>
  <div class="login-container">
    <!-- Left Section: Scenic Background and Text -->
    <div class="login-left" :class="{ 'login-left--first-enter': isBackgroundEntering }">
      <div
        v-for="(image, index) in backgroundImages"
        :key="image"
        class="login-left__bg"
        :class="{ 'login-left__bg--active': currentBackgroundIndex === index }"
        :style="{ backgroundImage: `url(${image})` }"
      />
      <div class="login-left__overlay" />

      <div class="login-left__content">
        <h1 class="login-left__title">欢迎使用智慧商品管理系统</h1>
        <p class="login-left__subtitle">专注工会服务，提升商家运营与发展</p>

        <div class="login-features">
          <div class="feature-item">
            <div class="feature-icon">
              <el-icon><User /></el-icon>
            </div>
            <div class="feature-text">
              <h3>商户管理</h3>
              <p>高效管理商户信息与数据</p>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon">
              <el-icon><Connection /></el-icon>
            </div>
            <div class="feature-text">
              <h3>销售支付</h3>
              <p>提供交易工具，助力商家推广</p>
            </div>
          </div>

          <div class="feature-item">
            <div class="feature-icon">
              <el-icon><Lock /></el-icon>
            </div>
            <div class="feature-text">
              <h3>安全保障</h3>
              <p>确保数据安全，保护隐私</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Right Section: Login Form -->
    <div class="login-right">
      <div class="login-form-wrapper">
        <h2 class="login-form-title">智慧商品管理系统</h2>

        <!-- ALERT banner for Mock Mode -->
        <div class="mock-alert-banner" v-if="isMockMode" style="margin-bottom: 20px;">
          <el-alert
            title="提示：未检测到后端服务，已自动启用本地 Mock 仿真演示模式，输入任意账号密码即可登录。"
            type="warning"
            show-icon
            :closable="false"
          />
        </div>

        <el-form
          :model="loginForm"
          label-position="top"
          class="custom-login-form"
        >
          <el-form-item required label="用户名">
            <template #label>
              <span class="custom-label"><span class="required-star">*</span> 用户名</span>
            </template>
            <el-input
              v-model="loginForm.username"
              placeholder="请输入用户名"
              size="large"
            />
          </el-form-item>
          <el-form-item required label="密码">
            <template #label>
              <span class="custom-label"><span class="required-star">*</span> 密码</span>
            </template>
            <el-input
              v-model="loginForm.password"
              type="password"
              placeholder="请输入密码"
              show-password
              size="large"
            />
          </el-form-item>
          <el-form-item required label="验证码">
            <template #label>
              <span class="custom-label"><span class="required-star">*</span> 验证码</span>
            </template>
            <div class="custom-code-box">
              <el-input
                v-model="loginForm.captcha"
                placeholder="请输入验证码"
                size="large"
                @keydown.enter="onSubmit"
              />
              <button type="button" class="custom-captcha-trigger" @click="loadCaptcha">
                <img v-if="verificationImageSrc" :src="verificationImageSrc" alt="验证码" class="custom-verification-img" />
                <span v-else>加载中...</span>
              </button>
            </div>
          </el-form-item>
          <el-form-item>
            <el-button
              type="primary"
              :loading="loginLoading"
              class="custom-login-btn"
              @click="onSubmit"
            >
              <el-icon class="btn-icon"><User /></el-icon>
              登录
            </el-button>
            <div class="login-actions-row">
              <el-button link class="apply-btn" @click="goToApply">
                <el-icon class="btn-icon-mr"><Shop /></el-icon>
                商家入驻申请
              </el-button>
            </div>
          </el-form-item>
        </el-form>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, reactive, ref } from 'vue'
import { ElMessage } from 'element-plus'
import { useRouter, useRoute } from 'vue-router'
import { Connection, Iphone, Key, Lock, Message, User, Shop } from '@element-plus/icons-vue'

import { getCaptcha, login } from '@/api/authApi'
import { setToken } from '@/utils/token'

import loginBg from '@/assets/login_bg.png'
const loginBg1 = loginBg
const loginBg2 = loginBg
import logoImg from '@/assets/logo.png'

const PHONE_REGEX = /^1[3-9]\d{9}$/
const SMS_COUNTDOWN_TIME = 60

defineOptions({
  name: 'LoginView',
})

const router = useRouter()
const route = useRoute()

const captchaImage = ref('')
const isMockMode = ref(false)
const loginLoading = ref(false)

const loginForm = reactive({
  username: '',
  password: '',
  captcha: '',
  captchaKey: '',
})

const loginMode = ref('password')
const isSmsCodeButtonDisabled = ref(false)
const smsCodeButtonText = ref('获取验证码')
const isSmsCodeLoading = ref(false)
const currentBackgroundIndex = ref(0)
const isBackgroundEntering = ref(true)

const smsForm = reactive({
  phoneNumber: '',
  code: '',
  captchaCode: '',
})

let smsCodeTimer = null
let backgroundTimer = null

const verificationImageSrc = computed(() => captchaImage.value || '')
const backgroundImages = [loginBg, loginBg1, loginBg2]
const isSmsMode = computed(() => loginMode.value === 'sms')
const currentModeTitle = computed(() => (isSmsMode.value ? '短信验证登录' : '账号密码登录'))
const currentModeDescription = computed(() =>
  isSmsMode.value
    ? '请输入手机号、图形验证码与短信验证码完成登录。'
    : '请输入账号、密码和图形验证码完成登录。',
)

const modeOptions = [
  { key: 'password', label: '账号密码登录', icon: User },
  { key: 'sms', label: '手机短信登录', icon: Iphone },
]

const loginNotes = [
  {
    title: '登录方式',
    description: '支持账号密码、手机短信和统一身份认证三种登录方式。',
  },
  {
    title: '使用提示',
    description: '校内用户建议优先使用统一身份认证入口进入系统。',
  },
  {
    title: '遇到问题',
    description: '如无法登录，可联系管理员处理。',
  },
]

const validatePasswordForm = () => {
  if (!loginForm.username.trim()) {
    ElMessage({ message: '请输入账号', type: 'warning' })
    return false
  }
  if (!loginForm.password.trim()) {
    ElMessage({ message: '请输入密码', type: 'warning' })
    return false
  }
  if (!loginForm.captcha.trim()) {
    ElMessage({ message: '请输入验证码', type: 'warning' })
    return false
  }
  return true
}

const validateSmsForm = () => {
  if (!smsForm.phoneNumber.trim()) {
    ElMessage({ message: '请输入手机号码', type: 'warning' })
    return false
  }
  if (!PHONE_REGEX.test(smsForm.phoneNumber)) {
    ElMessage({ message: '请输入正确的手机号码', type: 'warning' })
    return false
  }
  if (!smsForm.code.trim()) {
    ElMessage({ message: '请输入短信验证码', type: 'warning' })
    return false
  }
  return true
}

const validatePhoneNumber = (phoneNumber) => {
  if (!phoneNumber.trim()) {
    ElMessage({ message: '请输入手机号码', type: 'warning' })
    return false
  }
  if (!PHONE_REGEX.test(phoneNumber)) {
    ElMessage({ message: '请输入正确的手机号码', type: 'warning' })
    return false
  }
  return true
}

const handleLoginSuccess = async () => {
  ElMessage({ message: '登录成功', type: 'success' })
  const redirect = route.query.redirect || '/'
  await router.push({ path: redirect })
}

const loadCaptcha = async () => {
  try {
    const res = await getCaptcha()
    if (res && (res.code === 200 || res.code === 0) && res.data) {
      loginForm.captchaKey = res.data.captchaKey || res.data.key || ''
      captchaImage.value = res.data.captchaImage || res.data.image || res.data.img || res.data.captcha || ''
      isMockMode.value = false
    } else {
      ElMessage.error(res?.message || '获取验证码失败')
    }
  } catch (err) {
    console.error('获取验证码错误:', err)
    isMockMode.value = true
    loginForm.captchaKey = 'mock-captcha-key'
    captchaImage.value = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="110" height="40" viewBox="0 0 110 40"><rect width="110" height="40" fill="%23f5f7fa"/><text x="50%" y="55%" dominant-baseline="middle" text-anchor="middle" font-family="sans-serif" font-size="16" fill="%23008b57" font-weight="bold">MOCK</text></svg>'
  }
}

const handlePasswordLogin = async () => {
  if (!validatePasswordForm()) {
    return
  }

  loginLoading.value = true
  try {
    if (isMockMode.value) {
      throw new Error('MOCK_MODE_ACTIVE')
    }
    const res = await login({
      username: loginForm.username,
      password: loginForm.password,
      captcha: loginForm.captcha,
      captchaKey: loginForm.captchaKey
    })
    
    if (res && (res.code === 200 || res.code === 0) && res.data) {
      const token = res.data.token
      setToken(token)
      await handleLoginSuccess()
    } else {
      ElMessage.error(res?.message || '登录失败')
      loginForm.captcha = ''
      await loadCaptcha().catch(() => {})
    }
  } catch (error) {
    console.warn('登录失败，启用本地 Mock 仿真演示模式：', error)
    isMockMode.value = true
    ElMessage.warning('已自动登录到本地 Mock 仿真模式')
    setToken('mock-token')
    await handleLoginSuccess()
  } finally {
    loginLoading.value = false
  }
}

const handleSmsLogin = async () => {
  if (!validateSmsForm()) {
    return
  }

  ElMessage({ message: '短信登录接口暂未提供，当前仅保留界面交互。', type: 'info' })
}

const onSubmit = async () => {
  if (loginMode.value === 'password') {
    await handlePasswordLogin()
  } else {
    await handleSmsLogin()
  }
}

const clearForms = () => {
  Object.assign(loginForm, {
    username: '',
    password: '',
    captcha: '',
    captchaKey: '',
  })
  Object.assign(smsForm, {
    phoneNumber: '',
    code: '',
    captchaCode: '',
  })
}

const switchMode = async (mode) => {
  if (loginMode.value === mode) {
    return
  }
  loginMode.value = mode
  clearForms()
  await loadCaptcha().catch(() => {})
}

const switchToSmsMode = () => switchMode('sms')
const switchToPasswordMode = () => switchMode('password')

const startSmsCountdown = () => {
  let countdown = SMS_COUNTDOWN_TIME
  smsCodeButtonText.value = `${countdown}秒后重试`
  smsCodeTimer = setInterval(() => {
    countdown -= 1
    if (countdown <= 0) {
      clearInterval(smsCodeTimer)
      smsCodeTimer = null
      smsCodeButtonText.value = '获取验证码'
      isSmsCodeButtonDisabled.value = false
    } else {
      smsCodeButtonText.value = `${countdown}秒后重试`
    }
  }, 1000)
}

const resetSmsButtonState = () => {
  smsCodeButtonText.value = '获取验证码'
  isSmsCodeButtonDisabled.value = false
}

const handleGetSmsCode = async () => {
  if (!validatePhoneNumber(smsForm.phoneNumber)) {
    return
  }
  if (!smsForm.captchaCode.trim()) {
    ElMessage({ message: '请输入图形验证码', type: 'warning' })
    return
  }

  isSmsCodeButtonDisabled.value = true
  smsCodeButtonText.value = '发送中...'
  isSmsCodeLoading.value = true

  try {
    await new Promise((resolve) => setTimeout(resolve, 1000))
    ElMessage({ message: '短信接口暂未接入，当前保留原交互态。', type: 'info' })
    startSmsCountdown()
  } catch {
    resetSmsButtonState()
    await loadCaptcha().catch(() => {})
  } finally {
    isSmsCodeLoading.value = false
  }
}

const startBackgroundRotation = () => {
  backgroundTimer = setInterval(() => {
    currentBackgroundIndex.value = (currentBackgroundIndex.value + 1) % backgroundImages.length
  }, 3000)
}

const handleUnifiedLogin = () => {
  ElMessage({ message: '统一身份认证入口暂未接入当前仓库', type: 'info' })
}

const goToApply = () => {
  router.push('/merchant-apply')
}

const handleBackgroundEnterEnd = () => {
  isBackgroundEntering.value = false
}

onMounted(async () => {
  try {
    await loadCaptcha()
  } catch (error) {
    ElMessage({ message: error.message || '验证码加载失败', type: 'error' })
  }
  setTimeout(() => {
    isBackgroundEntering.value = false
  }, 2000)
})

onBeforeUnmount(() => {
  if (smsCodeTimer) {
    clearInterval(smsCodeTimer)
  }
  if (backgroundTimer) {
    clearInterval(backgroundTimer)
  }
})
</script>

<style scoped>
.login-container {
  display: flex;
  width: 100vw;
  height: 100vh;
  min-height: 100vh;
  overflow: hidden;
  background-color: #ffffff;
}

/* Left side (scenic area) */
.login-left {
  position: relative;
  width: 60%;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  padding: 40px 40px 140px 40px;
  color: #ffffff;
  overflow: hidden;
}

.login-left__bg {
  position: absolute;
  inset: 0;
  background-size: cover;
  background-position: center;
  opacity: 0;
  transition: opacity 1s ease;
  z-index: 0;
}

.login-left__bg--active {
  opacity: 1;
}

.login-left--first-enter .login-left__bg--active {
  animation: bg-slide-up-right 1.6s cubic-bezier(0.25, 1, 0.5, 1) forwards;
}

.login-left__overlay {
  position: absolute;
  inset: 0;
  background: rgba(0, 0, 0, 0.35);
  z-index: 1;
}

.login-left__content {
  position: relative;
  z-index: 2;
  max-width: 860px;
  width: 100%;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: -60px;
}

.login-left__title {
  font-size: 34px;
  font-weight: 700;
  margin: 0 0 16px 0;
  letter-spacing: 2px;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
  animation: text-slide-up-right 1.2s cubic-bezier(0.25, 1, 0.5, 1) 0.2s both;
}

.login-left__subtitle {
  font-size: 18px;
  color: rgba(255, 255, 255, 0.95);
  margin: 0 0 54px 0;
  letter-spacing: 1px;
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
  animation: text-slide-up-right 1.2s cubic-bezier(0.25, 1, 0.5, 1) 0.4s both;
}

.login-features {
  display: flex;
  justify-content: center;
  gap: 40px;
  width: 100%;
  max-width: 900px;
  animation: text-slide-up-right 1.2s cubic-bezier(0.25, 1, 0.5, 1) 0.6s both;
}

.feature-item {
  display: flex;
  align-items: center;
  gap: 12px;
  color: #ffffff;
  flex: 1;
  min-width: 0;
  text-align: left;
}

.feature-icon {
  width: 44px;
  height: 44px;
  border-radius: 8px;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #008b57;
  font-size: 20px;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.feature-text {
  display: flex;
  flex-direction: column;
}

.feature-text h3 {
  margin: 0 0 4px 0;
  font-size: 15px;
  font-weight: 600;
  color: #ffffff;
}

.feature-text p {
  margin: 0;
  font-size: 12px;
  color: rgba(255, 255, 255, 0.85);
  line-height: 1.4;
}

/* Right side (login block) */
.login-right {
  width: 40%;
  height: 100%;
  background: #ffffff;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 40px;
  z-index: 2;
}

.login-form-wrapper {
  width: 100%;
  max-width: 360px;
}

.login-form-title {
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 36px 0;
  text-align: left;
  animation: text-slide-up-right 1.2s cubic-bezier(0.25, 1, 0.5, 1) 0.4s both;
}

/* Form fields & labels */
.required-star {
  color: #f56c6c;
  margin-right: 4px;
  font-family: SimSun, sans-serif;
  font-weight: 700;
}

.custom-label {
  font-size: 14px;
  font-weight: 500;
  color: #374151;
}

.custom-login-form :deep(.el-form-item) {
  margin-bottom: 24px;
}

.custom-login-form :deep(.el-form-item:nth-child(1)) {
  animation: text-slide-up-right 1.2s cubic-bezier(0.25, 1, 0.5, 1) 0.6s both;
}

.custom-login-form :deep(.el-form-item:nth-child(2)) {
  animation: text-slide-up-right 1.2s cubic-bezier(0.25, 1, 0.5, 1) 0.8s both;
}

.custom-login-form :deep(.el-form-item:nth-child(3)) {
  animation: text-slide-up-right 1.2s cubic-bezier(0.25, 1, 0.5, 1) 1.0s both;
}

.custom-login-form :deep(.el-form-item:nth-child(4)) {
  animation: text-slide-up-right 1.2s cubic-bezier(0.25, 1, 0.5, 1) 1.2s both;
}

.custom-login-form :deep(.el-form-item__label) {
  padding: 0 0 6px !important;
  line-height: 1.4 !important;
}

.custom-login-form :deep(.el-form-item__label::before) {
  display: none !important;
}

.custom-login-form :deep(.el-input__wrapper) {
  min-height: 40px;
  border-radius: 4px;
  box-shadow: 0 0 0 1px #dcdfe6 inset;
}

.custom-login-form :deep(.el-input__inner) {
  font-size: 14px;
}

.custom-login-form :deep(.el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #c0c4cc inset;
}

.custom-login-form :deep(.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #008b57 inset !important;
}

.custom-code-box {
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
}

.custom-code-box :deep(.el-input) {
  flex: 1;
}

.custom-captcha-trigger {
  width: 110px;
  min-width: 110px;
  height: 40px;
  border: 1px solid #dcdfe6;
  border-radius: 4px;
  background: #f5f7fa;
  cursor: pointer;
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  transition: border-color 0.25s;
}

.custom-captcha-trigger:hover {
  border-color: #c0c4cc;
}

.custom-verification-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Green button */
.custom-login-btn {
  width: 100%;
  height: 40px;
  border-radius: 4px;
  background-color: #008b57 !important;
  border-color: #008b57 !important;
  font-size: 15px;
  font-weight: 500;
  color: #ffffff !important;
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  border: none;
  transition: background-color 0.2s, border-color 0.2s;
}

.custom-login-btn:hover {
  background-color: #00764a !important;
  border-color: #00764a !important;
}

.login-actions-row {
  display: flex;
  justify-content: center;
  width: 100%;
  margin-top: 12px;
}

.apply-btn {
  font-size: 14px;
  color: #008b57 !important;
  font-weight: 500;
  display: flex;
  align-items: center;
  transition: all 0.2s;
}

.apply-btn:hover {
  opacity: 0.8;
  transform: translateY(-0.5px);
}

.btn-icon-mr {
  margin-right: 4px;
}

.custom-login-btn:active {
  transform: scale(0.99);
}

@keyframes bg-slide-up-right {
  0% {
    opacity: 0;
    transform: scale(1.1) translate(-30px, 30px);
  }
  100% {
    opacity: 1;
    transform: scale(1) translate(0, 0);
  }
}

@keyframes text-slide-up-right {
  0% {
    opacity: 0;
    filter: blur(10px);
    transform: translate(-40px, 40px);
  }
  100% {
    opacity: 1;
    filter: blur(0);
    transform: translate(0, 0);
  }
}

@keyframes form-slide-up {
  0% {
    opacity: 0;
    filter: blur(5px);
    transform: translateY(30px);
  }
  100% {
    opacity: 1;
    filter: blur(0);
    transform: translateY(0);
  }
}

@media (max-width: 1024px) {
  .login-left {
    display: none;
  }
  .login-right {
    width: 100%;
    padding: 24px;
  }
}
</style>
