import axios from 'axios'
import { ElMessage } from 'element-plus'
import router from '@/router'
import { baseUrl } from './baseUrl.js'
import { getToken, removeToken } from './token.js'

const AUTH_MESSAGE_THROTTLE_TIME = 1500
let lastAuthMessageTime = 0

const showAuthMessage = (message) => {
  const now = Date.now()
  if (now - lastAuthMessageTime < AUTH_MESSAGE_THROTTLE_TIME) {
    return
  }
  lastAuthMessageTime = now
  ElMessage.error(message)
}

const redirectToLogin = async () => {
  removeToken()
  localStorage.clear()
  if (router.currentRoute.value.path !== '/login') {
    await router.replace('/login')
  }
}

const request = axios.create({
  baseURL: baseUrl(),
  timeout: 10000,
})

request.interceptors.request.use((config) => {
  const token = getToken()
  if (token) {
    config.headers.token = token
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

request.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    const status = error.response?.status
    const message =
      status === 401
        ? '登录状态已过期，请重新登录'
        : status === 403
          ? '你没有被授权访问该功能'
          : error.response?.data?.message || error.response?.data?.msg || error.message || '请求失败，请稍后重试'

    if (status === 401 || status === 403) {
      showAuthMessage(message)
    }

    if (status === 401) {
      redirectToLogin()
    }

    const normalizedError = new Error(message)
    normalizedError.handled = status === 401 || status === 403

    return Promise.reject(normalizedError)
  },
)

export default request