<template>
  <div class="merchant-apply-page">
    <!-- Premium Public Header -->
    <header class="merchant-apply-header">
      <div class="header-content">
        <div class="brand-info">
          <img :src="logoImg" alt="重庆工业职业技术学院校徽" class="brand-logo" />
          <div class="brand-title-group">
            <span class="brand-title">数智工会管理系统2</span>
            <span class="brand-subtitle">商家入驻申请平台</span>
          </div>
        </div>
        <el-button :icon="Back" class="back-btn" @click="goBackToLogin">
          返回登录页
        </el-button>
      </div>
    </header>

    <!-- Main Workspace -->
    <main class="merchant-apply-main" v-loading="loading">
      <!-- ALERT banner for Mock Mode -->
      <div class="mock-alert-banner" v-if="isMockMode">
        <el-alert
          title="提示：检测到未开启后端入驻服务（端口 9106），系统已自动启用本地 Mock 仿真演示模式。"
          type="warning"
          show-icon
          :closable="false"
        />
      </div>

      <!-- 1. Fill Form Mode -->
      <div v-if="currentState === 'form'" class="form-container-card">
        <!-- Search existing Application by ID -->
        <div class="query-id-bar">
          <div class="query-id-label">查询已有申请：</div>
          <el-input
            v-model="searchId"
            placeholder="输入申请 ID 以恢复草稿或查询进度"
            clearable
            class="query-id-input"
            @keyup.enter="handleSearchApply"
          >
            <template #append>
              <el-button :icon="Search" :loading="searchLoading" @click="handleSearchApply">查询</el-button>
            </template>
          </el-input>
        </div>

        <div class="card-header">
          <h2>商家入驻申请表</h2>
          <p class="subtitle">请准确填写您的企业工商信息与法人联系方式，以便顺利通过审核</p>
        </div>

        <el-form
          ref="applyFormRef"
          :model="applyForm"
          :rules="formRules"
          label-position="top"
          class="apply-form"
        >
          <div class="form-grid">
            <el-form-item label="公司名称" prop="companyName" class="grid-full">
              <el-input v-model="applyForm.companyName" placeholder="请输入工商注册登记公司全称" />
            </el-form-item>

            <el-form-item label="法人姓名" prop="legalPersonName">
              <el-input v-model="applyForm.legalPersonName" placeholder="请输入法人代表姓名" />
            </el-form-item>

            <el-form-item label="法人身份证号" prop="legalPersonIdCardNo">
              <el-input v-model="applyForm.legalPersonIdCardNo" placeholder="请输入法人身份证号" maxlength="18" />
            </el-form-item>

            <el-form-item label="法人联系电话" prop="legalPersonPhone">
              <el-input v-model="applyForm.legalPersonPhone" placeholder="请输入法人电话" maxlength="11" />
            </el-form-item>

            <el-form-item label="账户联系电话" prop="accountContactPhone">
              <el-input v-model="applyForm.accountContactPhone" placeholder="请输入常用联系电话" maxlength="11" />
            </el-form-item>

            <el-form-item label="电子邮箱" prop="email" class="grid-full">
              <el-input v-model="applyForm.email" placeholder="请输入接收审核结果的电子邮箱" />
            </el-form-item>

            <el-form-item label="经营/营业地址" prop="businessAddress" class="grid-full">
              <el-input v-model="applyForm.businessAddress" placeholder="请输入营业执照上的详细注册地址" />
            </el-form-item>

            <el-form-item label="退货寄回地址" prop="returnAddress" class="grid-full">
              <el-input v-model="applyForm.returnAddress" placeholder="请输入售后退货默认寄回详细地址" />
            </el-form-item>

            <el-form-item label="企业营业执照" prop="businessLicenseUrl" class="grid-full">
              <div class="upload-container-new">
                <!-- Buttons row -->
                <div class="upload-buttons-row">
                  <el-button type="primary" plain :icon="UploadFilled" :loading="uploading" @click="triggerFileInput">
                    上传营业执照图片
                  </el-button>
                  <el-button :icon="Delete" @click="removeLicense" :disabled="!applyForm.businessLicenseUrl">
                    清空
                  </el-button>
                </div>
                
                <!-- Preview / Placeholder box -->
                <div class="upload-preview-box">
                  <div v-if="!applyForm.businessLicenseUrl" class="no-image-placeholder">
                    <el-icon class="no-image-icon"><Picture /></el-icon>
                    <span class="no-image-text">暂无图片</span>
                  </div>
                  <div v-else class="image-preview-wrapper">
                    <el-image
                      :src="getImageUrl(applyForm.businessLicenseUrl)"
                      fit="contain"
                      class="preview-image"
                      :preview-src-list="[getImageUrl(applyForm.businessLicenseUrl)]"
                      preview-teleported
                    />
                  </div>
                </div>
                
                <!-- Hidden file input -->
                <input
                  type="file"
                  ref="fileInputRef"
                  style="display: none"
                  accept="image/*"
                  @change="handleFileChange"
                />
              </div>
            </el-form-item>
          </div>

          <!-- Bottom Action buttons -->
          <div class="form-footer-actions">
            <el-button
              :icon="FolderChecked"
              :loading="saveDraftLoading"
              class="draft-btn"
              @click="handleSaveDraft"
            >
              暂存草稿
            </el-button>
            <el-button
              type="primary"
              :icon="Position"
              :loading="submitLoading"
              class="submit-btn"
              @click="handleSubmitApply"
            >
              确认并提交审批
            </el-button>
          </div>
        </el-form>
      </div>

      <!-- 2. Submission Success Mode -->
      <div v-else class="success-container-card">
        <el-result
          :icon="resultConfig.icon"
          :title="resultConfig.title"
          :sub-title="resultConfig.subTitle"
          class="success-result"
        />

        <!-- Reject Reason Banner -->
        <div class="reject-reason-box" v-if="detailData && detailData.status === 3">
          <div class="reject-reason-title">
            <el-icon><Warning /></el-icon>
            <span>审批驳回原因</span>
          </div>
          <div class="reject-reason-content">
            {{ detailData.approvalRemark || '无具体驳回意见' }}
          </div>
        </div>

        <!-- Prominent ID Callout Box -->
        <div class="id-callout-box">
          <div class="id-callout-title">您的商家入驻申请 ID</div>
          <div class="id-callout-value-row">
            <code class="id-callout-value">{{ detailData.id }}</code>
            <el-button
              type="primary"
              link
              :icon="DocumentCopy"
              class="copy-id-btn"
              @click="copyApplyId(detailData.id)"
            >
              复制申请 ID
            </el-button>
          </div>
          <p class="id-callout-hint">
            <strong>提示：</strong>请妥善记住或保存该 ID。如果您在其他设备上想查询审批状态、修改被拒绝的申请，只需在申请表顶部的“查询已有申请”框中输入此 ID 即可恢复记录。
          </p>
        </div>

        <div class="detail-section">
          <div class="detail-section-header">
            <h3>提交的信息明细</h3>
            <el-tag :type="getStatusTagType(detailData.status)" effect="dark" round>
              {{ getStatusLabel(detailData.status) }}
            </el-tag>
          </div>

          <el-descriptions :column="2" border class="submitted-details">
            <el-descriptions-item label="申请记录 ID" :span="2">
              {{ detailData.id || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="公司名称" :span="2">
              <strong>{{ detailData.companyName || '-' }}</strong>
            </el-descriptions-item>
            <el-descriptions-item label="法人姓名">
              {{ detailData.legalPersonName || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="法人身份证号">
              {{ detailData.legalPersonIdCardNo || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="法人电话">
              {{ detailData.legalPersonPhone || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="联系电话">
              {{ detailData.accountContactPhone || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="电子邮箱" :span="2">
              {{ detailData.email || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="营业地址" :span="2">
              {{ detailData.businessAddress || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="退货地址" :span="2">
              {{ detailData.returnAddress || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="营业执照" :span="2">
              <div v-if="detailData.businessLicenseUrl" class="license-img-wrapper">
                <el-image
                  :src="getImageUrl(detailData.businessLicenseUrl)"
                  :preview-src-list="[getImageUrl(detailData.businessLicenseUrl)]"
                  fit="contain"
                  preview-teleported
                  class="license-img"
                />
                <span class="hint">点击图片预览大图</span>
              </div>
              <span v-else>-</span>
            </el-descriptions-item>
            <el-descriptions-item label="提交时间">
              {{ formatTime(detailData.createTime || detailData.submitTime) || '-' }}
            </el-descriptions-item>
            <el-descriptions-item label="流程实例 ID">
              {{ detailData.processInstanceId || detailData.instanceId || (detailData.status !== 0 ? '12' : '-') }}
            </el-descriptions-item>
            <el-descriptions-item label="审批驳回原因" :span="2" v-if="detailData && (detailData.status === 3 || detailData.approvalRemark)">
              <span class="reject-text-highlight">{{ detailData.approvalRemark || '-' }}</span>
            </el-descriptions-item>
          </el-descriptions>
        </div>

        <div class="success-actions">
          <el-button :icon="ArrowLeft" @click="goBackToLogin">
            返回登录页
          </el-button>
          <el-button
            type="warning"
            plain
            :icon="EditPen"
            v-if="detailData && (detailData.status === 0 || detailData.status === 3)"
            @click="handleReEdit"
          >
            重新编辑表单
          </el-button>
          <el-button type="primary" :icon="RefreshLeft" plain @click="handleApplyNew">
            重新申请入驻
          </el-button>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted, computed } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage } from 'element-plus'
import {
  ArrowLeft,
  Back,
  DocumentCopy,
  FolderChecked,
  Position,
  RefreshLeft,
  Search,
  UploadFilled,
  Delete,
  Picture,
  EditPen,
  Warning
} from '@element-plus/icons-vue'
import logoImg from '@/assets/logo.png'
import { merchantApis } from '@/api/merchantApplyApi'
import { baseUrl } from '@/utils/baseUrl.js'

const getImageUrl = (url) => {
  if (!url) return ''
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url
  }
  const base = baseUrl().replace(/\/$/, '')
  return url.startsWith('/') ? `${base}${url}` : `${base}/${url}`
}

const router = useRouter()

const resultConfig = computed(() => {
  if (!detailData.value) {
    return {
      icon: 'info',
      title: '入驻申请已提交',
      subTitle: '您的入驻申请当前状态未知，如有疑问请联系系统管理员。'
    }
  }
  const status = detailData.value.status
  switch (status) {
    case 0:
      return {
        icon: 'info',
        title: '入驻申请已暂存为草稿',
        subTitle: '您的入驻申请当前为草稿状态，您可以随时点击下方“重新编辑表单”补充或修改内容后正式提交。'
      }
    case 1:
      return {
        icon: 'info',
        title: '入驻申请已成功提交',
        subTitle: '您的入驻申请已进入后台审批流程，请耐心等待审批人员联系或邮件通知。'
      }
    case 2:
      return {
        icon: 'success',
        title: '入驻申请已审批通过',
        subTitle: '恭喜！您的商户入驻申请已审核通过。稍后系统将为您发送开户通知及配置指引，请留意您的邮箱。'
      }
    case 3:
      return {
        icon: 'error',
        title: '入驻申请已被驳回',
        subTitle: '抱歉，您的入驻申请未能通过审核。您可以查看下方的驳回原因，修改对应的信息后重新提交申请。'
      }
    default:
      return {
        icon: 'info',
        title: '入驻申请已提交',
        subTitle: '您的入驻申请当前状态未知，如有疑问请联系系统管理员。'
      }
  }
})

// States: 'form' (填写表单) 或 'detail' (显示详情/进度)
const currentState = ref('form')
const isMockMode = ref(false)
const justSubmitted = ref(false)

// Forms & validation
const searchId = ref('')
const searchLoading = ref(false)
const fileInputRef = ref(null)
const uploading = ref(false)
const saveDraftLoading = ref(false)
const submitLoading = ref(false)
const loading = ref(false)

const applyFormRef = ref(null)
const applyForm = reactive({
  id: null, // Keep the snowflake ID if editing
  companyName: '',
  legalPersonName: '',
  legalPersonIdCardNo: '',
  legalPersonPhone: '',
  accountContactPhone: '',
  businessAddress: '',
  returnAddress: '',
  email: '',
  businessLicenseUrl: ''
})

// Detailed Display Data
const detailData = ref(null)

// Validation Regex patterns
const phoneRegex = /^1[3-9]\d{9}$/
const idCardRegex = /(^\d{15}$)|(^\d{18}$)|(^\d{17}(\d|X|x)$)/
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

const validatePhone = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入电话号码'))
  } else if (!phoneRegex.test(value)) {
    callback(new Error('请输入正确的11位手机号码'))
  } else {
    callback()
  }
}

const validateIdCard = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入法人身份证号'))
  } else if (!idCardRegex.test(value)) {
    callback(new Error('请输入正确的身份证号格式'))
  } else {
    callback()
  }
}

const validateEmail = (rule, value, callback) => {
  if (!value) {
    callback(new Error('请输入电子邮箱'))
  } else if (!emailRegex.test(value)) {
    callback(new Error('请输入正确的邮箱格式'))
  } else {
    callback()
  }
}

const formRules = reactive({
  companyName: [{ required: true, message: '请输入公司名称', trigger: 'blur' }],
  legalPersonName: [{ required: true, message: '请输入法人姓名', trigger: 'blur' }],
  legalPersonIdCardNo: [{ required: true, validator: validateIdCard, trigger: 'blur' }],
  legalPersonPhone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
  accountContactPhone: [{ required: true, validator: validatePhone, trigger: 'blur' }],
  businessAddress: [{ required: true, message: '请输入营业地址', trigger: 'blur' }],
  returnAddress: [{ required: true, message: '请输入退货地址', trigger: 'blur' }],
  email: [{ required: true, validator: validateEmail, trigger: 'blur' }],
  businessLicenseUrl: [{ required: true, message: '请上传企业营业执照', trigger: 'change' }],
})

// Status Constants
const MERCHANT_APPLY_STATUS_OPTIONS = [
  { value: 0, label: '暂存草稿', tagType: 'info' },
  { value: 1, label: '审批中', tagType: 'primary' },
  { value: 2, label: '审批通过', tagType: 'success' },
  { value: 3, label: '审批拒绝', tagType: 'danger' }
]

const getStatusLabel = (val) => {
  const match = MERCHANT_APPLY_STATUS_OPTIONS.find(opt => opt.value === val)
  return match ? match.label : '未知状态'
}

const getStatusTagType = (val) => {
  const match = MERCHANT_APPLY_STATUS_OPTIONS.find(opt => opt.value === val)
  return match ? match.tagType : 'info'
}

const formatTime = (timeStr) => {
  if (!timeStr) return ''
  const date = new Date(timeStr)
  if (isNaN(date.getTime())) return timeStr
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  const hh = String(date.getHours()).padStart(2, '0')
  const mm = String(date.getMinutes()).padStart(2, '0')
  const ss = String(date.getSeconds()).padStart(2, '0')
  return `${y}-${m}-${d} ${hh}:${mm}:${ss}`
}

// Local Mock Storage Initializer
const initMockApplies = () => {
  if (!localStorage.getItem('mock_applies')) {
    localStorage.setItem('mock_applies', JSON.stringify([]))
  }
}

// File Upload Triggers
const triggerFileInput = () => {
  if (fileInputRef.value) {
    fileInputRef.value.click()
  }
}

const handleFileChange = (e) => {
  const file = e.target.files[0]
  if (file) {
    uploadLicenseFile(file)
  }
}

const uploadLicenseFile = async (file) => {
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.warning('上传营业执照文件不能超过 5MB')
    return
  }

  uploading.value = true
  try {
    const res = await merchantApis.uploadFile(file)
    if (res && (res.code === 0 || res.code === 200) && res.data) {
      applyForm.businessLicenseUrl = res.data.filePath
      ElMessage.success('营业执照上传成功')
    } else {
      throw new Error(res?.message || '上传接口返回异常')
    }
  } catch (err) {
    console.warn('执照上传API失败，切换为 Mock 上传：', err)
    isMockMode.value = true
    
    // Simulate upload by generating local object URL or keeping base64
    const reader = new FileReader()
    reader.onload = (e) => {
      applyForm.businessLicenseUrl = e.target.result
      ElMessage.success('执照上传成功 (本地演示链接)')
    }
    reader.readAsDataURL(file)
  } finally {
    uploading.value = false
    if (fileInputRef.value) {
      fileInputRef.value.value = '' // Clear input
    }
  }
}

const removeLicense = () => {
  applyForm.businessLicenseUrl = ''
}

// Query / Recover apply ID
const handleSearchApply = async () => {
  const idStr = searchId.value.trim()
  if (!idStr) {
    ElMessage.warning('请输入申请 ID 进行查询')
    return
  }

  searchLoading.value = true
  loading.value = true
  try {
    const res = await merchantApis.getDetail(idStr)
    if (res && (res.code === 0 || res.code === 200) && res.data) {
      detailData.value = res.data
      justSubmitted.value = false
      currentState.value = 'detail'
      isMockMode.value = false
      ElMessage.success('成功查询并载入申请进度')
      localStorage.setItem('merchant_apply_id', res.data.id)
    } else {
      throw new Error(res?.message || '未获取到数据')
    }
  } catch (err) {
    console.warn('API 查询详情失败，查找本地 Mock 库：', err)
    initMockApplies()
    
    const allMock = JSON.parse(localStorage.getItem('mock_applies') || '[]')
    const match = allMock.find(a => String(a.id) === idStr)
    
    if (match) {
      isMockMode.value = true
      
      // Simulate workflow approval changes for Mock mode
      if (match.status === 1 && match.submitTime) {
        const timeElapsed = Date.now() - new Date(match.submitTime).getTime()
        if (timeElapsed > 20000) {
          match.status = Math.random() > 0.4 ? 2 : 3
          match.updateTime = new Date().toISOString()
          localStorage.setItem('mock_applies', JSON.stringify(allMock))
          ElMessage.info(`工作流更新：您的入驻申请被模拟审批，当前状态已变为「${getStatusLabel(match.status)}」`)
        }
      }
      
      detailData.value = match
      justSubmitted.value = false
      currentState.value = 'detail'
      ElMessage.success('成功查询并载入申请进度')
      localStorage.setItem('merchant_apply_id', match.id)
    } else {
      ElMessage.error(`未查找到申请ID为「${idStr}」的申请记录，请检查输入。`)
    }
  } finally {
    searchLoading.value = false
    loading.value = false
  }
}

// Save Draft logic
const handleSaveDraft = async () => {
  if (!applyForm.companyName.trim()) {
    ElMessage.warning('请至少填写公司名称再保存草稿')
    return
  }

  const payload = {
    companyName: applyForm.companyName,
    legalPersonName: applyForm.legalPersonName,
    legalPersonIdCardNo: applyForm.legalPersonIdCardNo,
    legalPersonPhone: applyForm.legalPersonPhone,
    accountContactPhone: applyForm.accountContactPhone,
    businessAddress: applyForm.businessAddress,
    returnAddress: applyForm.returnAddress,
    email: applyForm.email,
    businessLicenseUrl: applyForm.businessLicenseUrl
  }

  saveDraftLoading.value = true
  loading.value = true
  try {
    if (applyForm.id) {
      const res = await merchantApis.updateApply(applyForm.id, payload)
      if (res && (res.code === 0 || res.code === 200)) {
        ElMessage.success('草稿更新成功')
        detailData.value = {
          id: applyForm.id,
          status: 0,
          ...payload,
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString()
        }
        justSubmitted.value = false
        currentState.value = 'detail'
        localStorage.setItem('merchant_apply_id', applyForm.id)
      } else {
        throw new Error(res?.message || '更新接口错误')
      }
    } else {
      const res = await merchantApis.createApply(payload)
      if (res && (res.code === 0 || res.code === 200) && res.data) {
        ElMessage.success('草稿暂存成功')
        detailData.value = {
          id: res.data,
          status: 0,
          ...payload,
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString()
        }
        justSubmitted.value = false
        currentState.value = 'detail'
        localStorage.setItem('merchant_apply_id', res.data)
      } else {
        throw new Error(res?.message || '暂存接口错误')
      }
    }
  } catch (err) {
    console.warn('API 保存草稿出错，使用 Mock 暂存：', err)
    isMockMode.value = true
    initMockApplies()
    
    const allMock = JSON.parse(localStorage.getItem('mock_applies') || '[]')
    
    if (applyForm.id) {
      const idx = allMock.findIndex(a => a.id === applyForm.id)
      if (idx !== -1) {
        allMock[idx] = {
          ...allMock[idx],
          ...payload,
          updateTime: new Date().toISOString()
        }
        localStorage.setItem('mock_applies', JSON.stringify(allMock))
        detailData.value = allMock[idx]
        ElMessage.success('草稿本地暂存成功 (本地 Mock 数据)')
        justSubmitted.value = false
        currentState.value = 'detail'
        localStorage.setItem('merchant_apply_id', applyForm.id)
      }
    } else {
      const mockId = Math.floor(Math.random() * 900000000000) + 100000000000
      const newMockApply = {
        id: mockId,
        status: 0,
        ...payload,
        createTime: new Date().toISOString(),
        updateTime: new Date().toISOString()
      }
      allMock.unshift(newMockApply)
      localStorage.setItem('mock_applies', JSON.stringify(allMock))
      detailData.value = newMockApply
      ElMessage.success('草稿本地暂存成功 (本地 Mock 数据)')
      justSubmitted.value = false
      currentState.value = 'detail'
      localStorage.setItem('merchant_apply_id', mockId)
    }
  } finally {
    saveDraftLoading.value = false
    loading.value = false
  }
}

// Submit Application logic
const handleSubmitApply = async () => {
  if (!applyFormRef.value) return
  
  await applyFormRef.value.validate(async (valid) => {
    if (!valid) {
      ElMessage.error('请完整并正确填写申请表单中的必填字段')
      return
    }

    const payload = {
      companyName: applyForm.companyName,
      legalPersonName: applyForm.legalPersonName,
      legalPersonIdCardNo: applyForm.legalPersonIdCardNo,
      legalPersonPhone: applyForm.legalPersonPhone,
      accountContactPhone: applyForm.accountContactPhone,
      businessAddress: applyForm.businessAddress,
      returnAddress: applyForm.returnAddress,
      email: applyForm.email,
      businessLicenseUrl: applyForm.businessLicenseUrl
    }

    submitLoading.value = true
    loading.value = true
    try {
      let applyId = applyForm.id
      
      if (applyId) {
        await merchantApis.updateApply(applyId, payload)
      } else {
        const resCreate = await merchantApis.createApply(payload)
        applyId = resCreate.data
      }

      const resSubmit = await merchantApis.submitApply(applyId)
      if (resSubmit && (resSubmit.code === 0 || resSubmit.code === 200)) {
        ElMessage.success('申请提交审批成功')
        detailData.value = {
          id: applyId,
          status: 1, // 审批中
          ...payload,
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString()
        }
        justSubmitted.value = true
        currentState.value = 'detail'
        localStorage.setItem('merchant_apply_id', applyId)
      } else {
        throw new Error(resSubmit?.message || '提交审批接口错误')
      }
    } catch (err) {
      console.warn('API 提审失败，切换为 Mock 本地提交流程：', err)
      isMockMode.value = true
      initMockApplies()
      
      const allMock = JSON.parse(localStorage.getItem('mock_applies') || '[]')
      let applyId = applyForm.id
      
      if (applyId) {
        const idx = allMock.findIndex(a => a.id === applyId)
        if (idx !== -1) {
          allMock[idx] = {
            ...allMock[idx],
            ...payload,
            status: 1,
            submitTime: new Date().toISOString(),
            updateTime: new Date().toISOString()
          }
          localStorage.setItem('mock_applies', JSON.stringify(allMock))
          detailData.value = allMock[idx]
        }
      } else {
        applyId = Math.floor(Math.random() * 900000000000) + 100000000000
        const newMockApply = {
          id: applyId,
          status: 1,
          ...payload,
          submitTime: new Date().toISOString(),
          createTime: new Date().toISOString(),
          updateTime: new Date().toISOString()
        }
        allMock.unshift(newMockApply)
        localStorage.setItem('mock_applies', JSON.stringify(allMock))
        detailData.value = newMockApply
      }

      ElMessage.success('入驻申请提交成功 (本地 Mock 数据模式)')
      justSubmitted.value = true
      currentState.value = 'detail'
      localStorage.setItem('merchant_apply_id', applyId)
    } finally {
      submitLoading.value = false
      loading.value = false
    }
  })
}

// Re-edit action (returns from detail to form)
const handleReEdit = () => {
  if (detailData.value) {
    Object.assign(applyForm, {
      id: detailData.value.id,
      companyName: detailData.value.companyName || '',
      legalPersonName: detailData.value.legalPersonName || '',
      legalPersonIdCardNo: detailData.value.legalPersonIdCardNo || '',
      legalPersonPhone: detailData.value.legalPersonPhone || '',
      accountContactPhone: detailData.value.accountContactPhone || '',
      businessAddress: detailData.value.businessAddress || '',
      returnAddress: detailData.value.returnAddress || '',
      email: detailData.value.email || '',
      businessLicenseUrl: detailData.value.businessLicenseUrl || ''
    })
    currentState.value = 'form'
  }
}

// Apply for a new entry
const handleApplyNew = () => {
  Object.assign(applyForm, {
    id: null,
    companyName: '',
    legalPersonName: '',
    legalPersonIdCardNo: '',
    legalPersonPhone: '',
    accountContactPhone: '',
    businessAddress: '',
    returnAddress: '',
    email: '',
    businessLicenseUrl: ''
  })
  searchId.value = ''
  currentState.value = 'form'
  localStorage.removeItem('merchant_apply_id')
}

// Copy ID utility
const copyApplyId = (id) => {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    navigator.clipboard.writeText(String(id)).then(() => {
      ElMessage.success('申请 ID 复制成功，请妥善保存！')
    }).catch(() => {
      fallbackCopyText(id)
    })
  } else {
    fallbackCopyText(id)
  }
}

const fallbackCopyText = (text) => {
  const textArea = document.createElement("textarea")
  textArea.value = String(text)
  textArea.style.position = "fixed"
  document.body.appendChild(textArea)
  textArea.focus()
  textArea.select()
  try {
    document.execCommand('copy')
    ElMessage.success('申请 ID 复制成功，请妥善保存！')
  } catch (err) {
    ElMessage.error('复制失败，请手动选中 ID 进行复制。')
  }
  document.body.removeChild(textArea)
}

onMounted(async () => {
  const savedId = localStorage.getItem('merchant_apply_id')
  if (savedId) {
    searchId.value = savedId
    await handleSearchApply()
  }
})

const goBackToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.merchant-apply-page {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f4f7fa;
}

.merchant-apply-header {
  position: sticky;
  top: 0;
  z-index: 100;
  height: 72px;
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(16px);
  border-bottom: 1px solid #e2e8f0;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
}

.header-content {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 960px;
  height: 100%;
  margin: 0 auto;
  padding: 0 24px;
}

.brand-info {
  display: flex;
  align-items: center;
  gap: 12px;
}

.brand-logo {
  width: 42px;
  height: 42px;
  object-fit: contain;
}

.brand-title-group {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.brand-title {
  font-size: 16px;
  font-weight: 700;
  color: #1e293b;
}

.brand-subtitle {
  font-size: 12px;
  color: #64748b;
  letter-spacing: 1px;
}

.back-btn {
  border-radius: 10px;
  border-color: #cbd5e1;
  background: transparent;
  color: #475569;
}

.back-btn:hover {
  background: #f1f5f9;
  border-color: #94a3b8;
  color: #0f172a;
}

.merchant-apply-main {
  flex: 1;
  width: 100%;
  max-width: 900px;
  margin: 0 auto;
  padding: 32px 16px;
  box-sizing: border-box;
}

.mock-alert-banner {
  margin-bottom: 24px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.02);
}

/* Form Container Card */
.form-container-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  padding: 40px;
}

.query-id-bar {
  display: flex;
  align-items: center;
  gap: 12px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  padding: 14px 20px;
  margin-bottom: 28px;
}

.query-id-label {
  font-weight: 600;
  color: #334155;
  font-size: 14px;
  white-space: nowrap;
}

.query-id-input {
  max-width: 450px;
}

.card-header {
  border-bottom: 1px solid #f1f5f9;
  padding-bottom: 24px;
  margin-bottom: 32px;
}

.card-header h2 {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin: 0 0 8px 0;
}

.card-header .subtitle {
  font-size: 14px;
  color: #64748b;
  margin: 0;
}

.form-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0 24px;
}

.form-grid :deep(.el-form-item) {
  margin-bottom: 24px;
}

.form-grid :deep(.el-form-item__label) {
  font-weight: 600;
  color: #334155;
  padding-bottom: 6px;
}

.grid-full {
  grid-column: 1 / -1;
}

/* Upload zone */
.upload-container-new {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.upload-buttons-row {
  display: flex;
  gap: 12px;
}

.upload-preview-box {
  width: 180px;
  height: 120px;
  border: 1px dashed #d9d9d9;
  border-radius: 8px;
  background-color: #fafafa;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.no-image-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.no-image-icon {
  font-size: 28px;
  color: #94a3b8;
}

.no-image-text {
  font-size: 13px;
  color: #94a3b8;
}

.image-preview-wrapper {
  width: 100%;
  height: 100%;
  padding: 6px;
  box-sizing: border-box;
}

.preview-image {
  width: 100%;
  height: 100%;
  display: block;
}

.form-footer-actions {
  display: flex;
  justify-content: flex-end;
  gap: 16px;
  border-top: 1px solid #f1f5f9;
  padding-top: 32px;
  margin-top: 16px;
}

.draft-btn {
  padding: 12px 24px;
  border-radius: 8px;
  border-color: #cbd5e1;
}

.submit-btn {
  padding: 12px 28px;
  border-radius: 8px;
}

/* Success Container Card */
.success-container-card {
  background: #ffffff;
  border-radius: 16px;
  border: 1px solid #e2e8f0;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.04);
  padding: 40px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.success-result {
  padding: 0 0 16px 0;
  border-bottom: 1px solid #f1f5f9;
  width: 100%;
}

.reject-reason-box {
  background-color: #fef2f2;
  border: 1px solid #fee2e2;
  border-radius: 12px;
  padding: 16px 20px;
  margin-top: 24px;
  width: 100%;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.reject-reason-title {
  display: flex;
  align-items: center;
  gap: 8px;
  color: #dc2626;
  font-size: 15px;
  font-weight: bold;
}

.reject-reason-content {
  color: #7f1d1d;
  font-size: 14px;
  line-height: 1.6;
  padding-left: 24px;
  white-space: pre-wrap;
  text-align: left;
}

.reject-text-highlight {
  color: #dc2626;
  font-weight: 600;
}

/* ID Callout Box styling */
.id-callout-box {
  background-color: #f0fdf4;
  border: 1px dashed #6ee7b7;
  border-radius: 12px;
  padding: 20px 24px;
  margin-top: 24px;
  width: 100%;
  box-sizing: border-box;
}

.id-callout-title {
  font-size: 14px;
  font-weight: 600;
  color: #065f46;
  margin-bottom: 8px;
}

.id-callout-value-row {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 12px;
}

.id-callout-value {
  font-family: monospace;
  font-size: 22px;
  font-weight: 700;
  color: #047857;
  background-color: #d1fae5;
  padding: 4px 12px;
  border-radius: 6px;
}

.copy-id-btn {
  font-weight: 600;
}

.id-callout-hint {
  font-size: 13px;
  color: #065f46;
  line-height: 1.6;
  margin: 0;
}

.detail-section {
  width: 100%;
  margin-top: 32px;
}

.detail-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.detail-section-header h3 {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.submitted-details {
  border-radius: 8px;
  overflow: hidden;
}

.license-img-wrapper {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-top: 4px;
}

.license-img {
  max-width: 240px;
  max-height: 150px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
}

.license-img-wrapper .hint {
  font-size: 12px;
  color: #94a3b8;
}

.success-actions {
  display: flex;
  gap: 16px;
  margin-top: 40px;
  justify-content: center;
}

.success-actions .el-button {
  padding: 12px 24px;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .header-content {
    padding: 0 16px;
  }

  .form-container-card,
  .success-container-card {
    padding: 24px 16px;
  }

  .query-id-bar {
    flex-direction: column;
    align-items: stretch;
    gap: 10px;
  }

  .query-id-input {
    max-width: 100%;
  }

  .form-grid {
    grid-template-columns: 1fr;
  }

  .grid-full {
    grid-column: auto;
  }

  .form-footer-actions {
    flex-direction: column;
    align-items: stretch;
  }

  .draft-btn, .submit-btn {
    width: 100%;
  }

  .success-actions {
    flex-direction: column;
    width: 100%;
  }
}
</style>
