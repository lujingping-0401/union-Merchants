import { ref, computed } from 'vue'

export const merchantInfo = ref(null)

export const nickname = computed(() => {
  if (!merchantInfo.value) {
    return localStorage.getItem('nickname') || localStorage.getItem('username') || '工会商家'
  }
  return merchantInfo.value.companyName || merchantInfo.value.loginName || '工会商家'
})

export const avatarChar = computed(() => {
  const name = nickname.value.trim()
  return name ? name.charAt(0).toUpperCase() : '商'
})

export const setMerchantInfo = (info) => {
  merchantInfo.value = info
  if (info) {
    localStorage.setItem('merchant_info', JSON.stringify(info))
    localStorage.setItem('nickname', info.companyName || info.loginName || '工会商家')
  } else {
    localStorage.removeItem('merchant_info')
    localStorage.removeItem('nickname')
  }
}

export const loadMerchantInfoFromStorage = () => {
  const infoStr = localStorage.getItem('merchant_info')
  if (infoStr) {
    try {
      merchantInfo.value = JSON.parse(infoStr)
    } catch (e) {
      merchantInfo.value = null
    }
  }
}

export const clearMerchantInfo = () => {
  setMerchantInfo(null)
}
