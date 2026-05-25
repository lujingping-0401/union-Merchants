<template>
  <div class="page-container">
    <CommonLayout>
      <!-- Search Bar -->
      <template #search>
        <el-form :inline="true" :model="searchForm" class="search-form" size="default">
          <el-form-item label="申请状态">
            <el-select
              v-model="searchForm.status"
              placeholder="全部状态"
              clearable
              style="width: 160px"
              @change="handleSearch"
            >
              <el-option label="草稿" :value="0" />
              <el-option label="审核中" :value="1" />
              <el-option label="已通过" :value="2" />
              <el-option label="已拒绝" :value="3" />
            </el-select>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" plain :icon="Search" @click="handleSearch">筛选</el-button>
            <el-button plain :icon="Refresh" @click="handleReset">重置</el-button>
          </el-form-item>
        </el-form>
      </template>

      <!-- Action Buttons -->
      <template #actions>
        <el-button type="primary" plain :icon="Plus" @click="openCreateDialog">新建上架申请</el-button>
        <el-button plain :icon="Refresh" @click="loadApplies">刷新列表</el-button>
      </template>

      <!-- Table Section -->
      <template #table>
        <el-table
          :data="tableData"
          style="width: 100%"
          height="100%"
          v-loading="loading"
          class="apply-table"
        >
          <!-- 1. 申请ID -->
          <el-table-column label="申请ID" width="80" align="center">
            <template #default="scope">
              <span class="apply-id-text">{{ scope.row.id }}</span>
            </template>
          </el-table-column>

          <!-- 2. 申请名称 -->
          <el-table-column label="申请名称" min-width="240" align="left" show-overflow-tooltip>
            <template #default="scope">
              <span class="apply-title-text">{{ scope.row.applyName }}</span>
            </template>
          </el-table-column>

          <!-- 3. 包含商品数量 & 缩略图预览 -->
          <el-table-column label="申请商品" min-width="200" align="center">
            <template #default="scope">
              <div class="apply-products-preview">
                <div class="product-avatars">
                  <el-image
                    v-for="(item, idx) in scope.row.items.slice(0, 3)"
                    :key="idx"
                    class="product-avatar-img"
                    :src="resolveUrl(item.coverUrl)"
                    fit="cover"
                  />
                  <div v-if="scope.row.items.length > 3" class="product-avatar-more">
                    +{{ scope.row.items.length - 3 }}
                  </div>
                </div>
                <div class="product-count-hint">共 {{ scope.row.items.length }} 件商品</div>
              </div>
            </template>
          </el-table-column>

          <!-- 4. 状态 -->
          <el-table-column prop="status" label="状态" width="100" align="center">
            <template #default="scope">
              <el-tag :type="getStatusTagType(scope.row.status)" size="default" effect="light">
                {{ getStatusText(scope.row.status) }}
              </el-tag>
            </template>
          </el-table-column>

          <!-- 5. 创建时间 -->
          <el-table-column label="提交时间" width="180" align="center">
            <template #default="scope">
              <span>{{ formatDate(scope.row.createTime) }}</span>
            </template>
          </el-table-column>

          <!-- 6. 操作栏 -->
          <el-table-column label="操作" width="180" align="center" fixed="right">
            <template #default="scope">
              <el-button link type="primary" size="default" :icon="View" @click="handleView(scope.row)">
                详情
              </el-button>
              <el-button
                v-if="scope.row.status === 0"
                link
                type="success"
                size="default"
                :icon="Promotion"
                @click="handleSubmit(scope.row)"
              >
                提交审批
              </el-button>
            </template>
          </el-table-column>
        </el-table>
      </template>

      <!-- Pagination Section -->
      <template #pagination>
        <div style="display: flex; justify-content: flex-end;">
          <el-pagination
            v-model:current-page="pageNum"
            v-model:page-size="pageSize"
            :page-sizes="[5, 10, 20, 50]"
            layout="total, sizes, prev, pager, next, jumper"
            :total="total"
            @size-change="handleSizeChange"
            @current-change="handleCurrentChange"
          />
        </div>
      </template>
    </CommonLayout>

    <!-- Create Application Dialog -->
    <el-dialog
      v-model="createDialogVisible"
      title="新建商品上架申请"
      width="60%"
      align-center
      :destroy-on-close="true"
      class="apply-form-dialog"
    >
      <el-form
        :model="applyForm"
        :rules="formRules"
        ref="applyFormRef"
        label-position="top"
        class="apply-form"
      >
        <el-form-item label="申请单名称" prop="applyName">
          <el-input
            v-model="applyForm.applyName"
            placeholder="例如: 2026年夏季数码新品及相关配件上架申请"
            maxLength="100"
            clearable
          />
        </el-form-item>

        <!-- Product Selection Area -->
        <div class="product-selection-section">
          <div class="section-title">
            <span>选择待上架商品 <span class="required-star">*</span></span>
            <span class="sub-hint">（只能选择“未上架”且未绑定其他申请的商品）</span>
          </div>

          <el-table
            ref="productSelectTableRef"
            :data="availableProducts"
            style="width: 100%"
            max-height="300"
            v-loading="productsLoading"
            @selection-change="handleSelectionChange"
            class="product-select-table"
            border
          >
            <el-table-column type="selection" width="55" align="center" />
            <el-table-column label="商品封面" width="100" align="center">
              <template #default="scope">
                <el-image
                  class="select-product-img"
                  :src="resolveUrl(scope.row.coverUrl)"
                  fit="cover"
                />
              </template>
            </el-table-column>
            <el-table-column prop="productName" label="商品名称" align="left" show-overflow-tooltip />
            <el-table-column prop="categoryName" label="商品分类" width="150" align="center">
              <template #default="scope">
                <el-tag type="info" size="small" effect="plain">{{ scope.row.categoryName || '未分类' }}</el-tag>
              </template>
            </el-table-column>
            <el-table-column prop="totalStock" label="库存" width="100" align="center" />
          </el-table>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="createDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="submitCreateForm">保存草稿</el-button>
        </div>
      </template>
    </el-dialog>

    <!-- Detail Dialog -->
    <el-dialog
      v-model="detailDialogVisible"
      title="申请单详情"
      width="65%"
      align-center
      :destroy-on-close="true"
      class="apply-detail-dialog"
    >
      <div v-if="detailData" class="apply-detail-content">
        <div class="detail-split-layout">
          <!-- Left Column: Details & Progress Timeline -->
          <div class="detail-left-col">
            <div class="detail-section-card basic-info-card">
              <div class="section-card-title">基本信息</div>
              <div class="detail-info-row">
                <span class="info-label">申请名称：</span>
                <span class="info-value apply-name-highlight">{{ detailData.applyName }}</span>
              </div>
              <div class="detail-info-row">
                <span class="info-label">申请单 ID：</span>
                <span class="info-value">{{ detailData.id }}</span>
              </div>
              <div class="detail-info-row">
                <span class="info-label">申请状态：</span>
                <span class="info-value">
                  <el-tag :type="getStatusTagType(detailData.status)" size="small">
                    {{ getStatusText(detailData.status) }}
                  </el-tag>
                </span>
              </div>
              <div class="detail-info-row">
                <span class="info-label">创建时间：</span>
                <span class="info-value">{{ formatDate(detailData.createTime) }}</span>
              </div>
              <div class="detail-info-row">
                <span class="info-label">更新时间：</span>
                <span class="info-value">{{ formatDate(detailData.updateTime) }}</span>
              </div>
            </div>

            <!-- Workflow Timeline -->
            <div class="detail-section-card workflow-card">
              <div class="section-card-title">审批流程跟踪</div>
              <el-timeline class="timeline-container">
                <el-timeline-item
                  timestamp="创建时间"
                  placement="top"
                  type="success"
                  :icon="CircleCheck"
                >
                  <h4>暂存草稿成功</h4>
                  <p class="timeline-time">{{ formatDate(detailData.createTime) }}</p>
                </el-timeline-item>
                
                <el-timeline-item
                  timestamp="审批流状态"
                  placement="top"
                  :type="detailData.status >= 1 ? 'success' : 'info'"
                  :icon="detailData.status >= 1 ? CircleCheck : InfoFilled"
                >
                  <h4>提交上架审批</h4>
                  <p v-if="detailData.status >= 1" class="timeline-time">
                    已提交至数智工会运营审批平台
                  </p>
                  <p v-else class="timeline-time-pending">尚未提交审批</p>
                </el-timeline-item>

                <el-timeline-item
                  timestamp="平台审核结果"
                  placement="top"
                  :type="getWorkflowResultType(detailData.status)"
                  :icon="getWorkflowResultIcon(detailData.status)"
                >
                  <h4 v-if="detailData.status === 2">审批通过</h4>
                  <h4 v-else-if="detailData.status === 3">审批被驳回</h4>
                  <h4 v-else-if="detailData.status === 1">平台审核中</h4>
                  <h4 v-else>等待平台审核</h4>
                  <p v-if="detailData.status === 2" class="timeline-time-success">
                    商品已自动进入已上架状态，开启面向校内公开销售。
                  </p>
                  <p v-else-if="detailData.status === 3" class="timeline-time-error">
                    原因说明：商品主图清晰度不足，或资质材料存在缺失，请修改后重新提交。
                  </p>
                  <p v-else-if="detailData.status === 1" class="timeline-time">
                    工作流已分发给校工会审核专员，预计在1-2个工作日内完成审核。
                  </p>
                  <p v-else class="timeline-time-pending">未触发平台审核流程</p>
                </el-timeline-item>
              </el-timeline>
            </div>
          </div>

          <!-- Right Column: Products List Table -->
          <div class="detail-right-col">
            <div class="detail-section-card products-list-card">
              <div class="section-card-title">
                申请商品清单 <span class="goods-count">({{ detailData.items.length }}件)</span>
              </div>
              <el-table :data="detailData.items" border style="width: 100%" max-height="450">
                <el-table-column label="商品封面" width="90" align="center">
                  <template #default="scope">
                    <el-image
                      class="detail-product-img"
                      :src="resolveUrl(scope.row.coverUrl)"
                      fit="cover"
                      :preview-src-list="[resolveUrl(scope.row.coverUrl)]"
                      preview-teleported
                    />
                  </template>
                </el-table-column>
                <el-table-column prop="productName" label="商品名称" align="left" />
                <el-table-column prop="productId" label="商品ID" width="100" align="center" />
              </el-table>
            </div>
          </div>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDialogVisible = false">关闭</el-button>
          <el-button
            v-if="detailData && detailData.status === 0"
            type="success"
            :loading="submitLoading"
            @click="handleSubmit(detailData)"
          >
            提交审批
          </el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, onMounted } from 'vue';
import { ElMessage, ElMessageBox } from 'element-plus';
import {
  Search,
  Refresh,
  Plus,
  View,
  Promotion,
  CircleCheck,
  InfoFilled,
  WarningFilled,
  CircleCloseFilled
} from '@element-plus/icons-vue';
import { getProductPage } from '@/api/productApi';
import {
  getProductApplyPage,
  getProductApplyDetail,
  createProductApply,
  submitProductApply
} from '@/api/productApplyApi';
import { baseUrl } from '@/utils/baseUrl.js';
import CommonLayout from '@/components/commonLayout.vue';
import { formatDate } from '@/utils/date.js';

defineOptions({
  name: 'ProductApply'
});

// Helper: Resolve relative image URL to absolute
const resolveUrl = (url) => {
  if (!url) return '';
  if (url.startsWith('http://') || url.startsWith('https://') || url.startsWith('data:')) {
    return url;
  }
  const base = baseUrl().replace(/\/$/, '');
  return url.startsWith('/') ? `${base}${url}` : `${base}/${url}`;
};



// Filter forms
const searchForm = reactive({
  status: ''
});

// Paginated Table State
const tableData = ref([]);
const total = ref(0);
const pageNum = ref(1);
const pageSize = ref(10);
const loading = ref(false);

// Create dialog state
const createDialogVisible = ref(false);
const submitLoading = ref(false);
const availableProducts = ref([]);
const productsLoading = ref(false);
const selectedProductIds = ref([]);
const applyFormRef = ref(null);

const applyForm = reactive({
  applyName: '',
  productIds: []
});

const formRules = {
  applyName: [
    { required: true, message: '请输入申请单名称', trigger: 'blur' },
    { min: 3, max: 100, message: '长度在 3 到 100 个字符', trigger: 'blur' }
  ]
};

// Detail dialog state
const detailDialogVisible = ref(false);
const detailData = ref(null);

// Status Mapping
const getStatusText = (status) => {
  switch (status) {
    case 0: return '草稿';
    case 1: return '审核中';
    case 2: return '已通过';
    case 3: return '已拒绝';
    default: return '未知';
  }
};

const getStatusTagType = (status) => {
  switch (status) {
    case 0: return 'info';
    case 1: return 'warning';
    case 2: return 'success';
    case 3: return 'danger';
    default: return 'info';
  }
};

const getWorkflowResultType = (status) => {
  if (status === 2) return 'success';
  if (status === 3) return 'danger';
  if (status === 1) return 'primary';
  return 'info';
};

const getWorkflowResultIcon = (status) => {
  if (status === 2) return CircleCheck;
  if (status === 3) return CircleCloseFilled;
  if (status === 1) return InfoFilled;
  return WarningFilled;
};

// Load applies list
const loadApplies = async () => {
  loading.value = true;
  try {
    const res = await getProductApplyPage({
      pageNum: pageNum.value,
      pageSize: pageSize.value,
      status: searchForm.status !== '' ? searchForm.status : undefined
    });
    if (res && (res.code === 200 || res.code === 0) && res.data) {
      tableData.value = res.data.records || [];
      total.value = res.data.total || 0;
    } else {
      ElMessage.error(res?.message || '获取申请列表失败');
    }
  } catch (err) {
    console.error('获取上架申请错误:', err);
  } finally {
    loading.value = false;
  }
};

// Search actions
const handleSearch = () => {
  pageNum.value = 1;
  loadApplies();
};

const handleReset = () => {
  searchForm.status = '';
  pageNum.value = 1;
  loadApplies();
};

// Pagination actions
const handleSizeChange = (val) => {
  pageSize.value = val;
  pageNum.value = 1;
  loadApplies();
};

const handleCurrentChange = (val) => {
  pageNum.value = val;
  loadApplies();
};

// Load available products for selection (status = 0 - Not listed)
const loadAvailableProducts = async () => {
  productsLoading.value = true;
  try {
    const res = await getProductPage({
      pageNum: 1,
      pageSize: 100,
      status: 0 // 未上架
    });
    if (res && (res.code === 200 || res.code === 0) && res.data) {
      availableProducts.value = res.data.records || [];
    }
  } catch (err) {
    console.error('获取待选商品错误:', err);
  } finally {
    productsLoading.value = false;
  }
};

// Create dialog action
const openCreateDialog = async () => {
  createDialogVisible.value = true;
  applyForm.applyName = '';
  applyForm.productIds = [];
  selectedProductIds.value = [];
  await loadAvailableProducts();
};

const handleSelectionChange = (selection) => {
  selectedProductIds.value = selection.map(item => item.id);
};

// Save apply draft
const submitCreateForm = async () => {
  if (!applyFormRef.value) return;
  await applyFormRef.value.validate(async (valid) => {
    if (!valid) return;
    
    if (selectedProductIds.value.length === 0) {
      ElMessage.warning('请选择至少一个待上架商品');
      return;
    }

    submitLoading.value = true;
    try {
      applyForm.productIds = selectedProductIds.value;
      const res = await createProductApply(applyForm);
      if (res && (res.code === 200 || res.code === 0)) {
        ElMessage.success('暂存草稿成功');
        createDialogVisible.value = false;
        await loadApplies();
      } else {
        ElMessage.error(res?.message || '保存失败');
      }
    } catch (err) {
      console.error('创建上架申请错误:', err);
    } finally {
      submitLoading.value = false;
    }
  });
};

// View Details
const handleView = async (row) => {
  try {
    const res = await getProductApplyDetail(row.id);
    if (res && (res.code === 200 || res.code === 0) && res.data) {
      detailData.value = res.data;
      detailDialogVisible.value = true;
    } else {
      ElMessage.error(res?.message || '获取详情失败');
    }
  } catch (err) {
    console.error('获取申请单详情错误:', err);
  }
};

// Submit for Approval
const handleSubmit = async (row) => {
  ElMessageBox.confirm(
    `确定要向运营平台正式提交“${row.applyName}”的商品上架审批吗？提交后将无法修改选定的商品。`,
    '确认提交审批',
    {
      confirmButtonText: '确定提交',
      cancelButtonText: '取消',
      type: 'warning'
    }
  ).then(async () => {
    submitLoading.value = true;
    try {
      const res = await submitProductApply(row.id);
      if (res && (res.code === 200 || res.code === 0)) {
        ElMessage.success('提交审批成功！');
        // Refresh details if visible
        if (detailDialogVisible.value && detailData.value?.id === row.id) {
          const detailRes = await getProductApplyDetail(row.id);
          if (detailRes && detailRes.data) {
            detailData.value = detailRes.data;
          }
        }
        await loadApplies();
      } else {
        ElMessage.error(res?.message || '提交审批失败');
      }
    } catch (err) {
      console.error('提交审批出错:', err);
    } finally {
      submitLoading.value = false;
    }
  }).catch(() => {});
};

onMounted(() => {
  loadApplies();
});
</script>

<style scoped>
.page-container {
  height: calc(100vh - 110px);
  display: flex;
  flex-direction: column;
}

.apply-table {
  border-radius: 12px;
  overflow: hidden;
}

.apply-id-text {
  font-family: monospace;
  font-weight: bold;
  color: #64748b;
  font-size: 13px;
}

.apply-title-text {
  font-weight: 600;
  color: #0f172a;
}

.apply-products-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.product-avatars {
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-avatar-img {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 2px solid #ffffff;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  margin-right: -8px;
  transition: transform 0.2s;
}

.product-avatar-img:hover {
  transform: translateY(-2px);
  z-index: 10;
}

.product-avatar-more {
  width: 32px;
  height: 32px;
  border-radius: 6px;
  border: 2px solid #ffffff;
  background-color: #f1f5f9;
  color: #64748b;
  font-size: 11px;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.08);
  margin-left: -2px;
  z-index: 5;
}

.product-count-hint {
  font-size: 12px;
  color: #94a3b8;
}

.product-selection-section {
  margin-top: 15px;
  border-top: 1px solid #f1f5f9;
  padding-top: 20px;
}

.section-title {
  display: flex;
  align-items: center;
  margin-bottom: 12px;
}

.section-title span:first-child {
  font-size: 15px;
  font-weight: bold;
  color: #334155;
}

.required-star {
  color: #f56c6c;
  margin-left: 2px;
}

.sub-hint {
  font-size: 12px;
  color: #94a3b8;
  margin-left: 8px;
}

.select-product-img {
  width: 48px;
  height: 48px;
  border-radius: 6px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.05);
}

.product-select-table {
  border-radius: 8px;
  overflow: hidden;
}

/* Detail dialog split view layout */
.detail-split-layout {
  display: flex;
  gap: 20px;
}

.detail-left-col {
  width: 45%;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.detail-right-col {
  width: 55%;
}

.detail-section-card {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 14px;
  padding: 20px;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.02);
}

.section-card-title {
  font-size: 16px;
  font-weight: bold;
  color: #1e293b;
  margin-bottom: 16px;
  border-left: 4px solid #00a86b;
  padding-left: 10px;
  display: flex;
  align-items: center;
  gap: 8px;
}

.goods-count {
  font-size: 13px;
  color: #94a3b8;
  font-weight: normal;
}

.detail-info-row {
  display: flex;
  padding: 8px 0;
  border-bottom: 1px dashed #f8fafc;
}

.detail-info-row:last-child {
  border-bottom: none;
}

.info-label {
  width: 100px;
  color: #64748b;
  font-size: 14px;
  flex-shrink: 0;
}

.info-value {
  color: #1e293b;
  font-size: 14px;
  font-weight: 500;
}

.apply-name-highlight {
  font-weight: bold;
  color: #0f172a;
}

.timeline-container {
  padding-top: 10px;
  padding-left: 5px;
}

.timeline-time {
  font-size: 12px;
  color: #94a3b8;
  margin: 4px 0 0 0;
}

.timeline-time-pending {
  font-size: 12px;
  color: #cbd5e1;
  margin: 4px 0 0 0;
  font-style: italic;
}

.timeline-time-success {
  font-size: 12px;
  color: #10b981;
  margin: 4px 0 0 0;
  line-height: 1.4;
}

.timeline-time-error {
  font-size: 12px;
  color: #ef4444;
  margin: 4px 0 0 0;
  line-height: 1.4;
}

.detail-product-img {
  width: 50px;
  height: 50px;
  border-radius: 6px;
  cursor: pointer;
  transition: transform 0.2s;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.05);
}

.detail-product-img:hover {
  transform: scale(1.05);
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

:deep(.el-timeline-item__content h4) {
  margin: 0;
  color: #334155;
  font-size: 14px;
  font-weight: bold;
}
</style>
