<template>
  <div class="page-container">

        <!-- Common Layout Wrapper -->
        <CommonLayout>
          <!-- Search Bar -->
          <template #search>
            <el-form
              :inline="true"
              :model="searchForm"
              class="search-form"
              size="default"
            >
              <el-form-item label="商品名称">
                <el-input
                  v-model="searchForm.productName"
                  placeholder="请输入商品名称"
                  clearable
                  @keyup.enter="handleSearch"
                />
              </el-form-item>
              <el-form-item label="商品分类">
                <el-cascader
                  v-model="searchForm.categoryId"
                  :options="categories"
                  :props="{
                    value: 'id',
                    label: 'categoryName',
                    children: 'children',
                    emitPath: false,
                    checkStrictly: true
                  }"
                  placeholder="全分类"
                  clearable
                  style="width: 180px"
                />
              </el-form-item>
              <el-form-item label="商品状态">
                <el-select
                  v-model="searchForm.status"
                  placeholder="全部状态"
                  clearable
                  style="width: 140px"
                >
                  <el-option label="未上架" :value="0" />
                  <el-option label="已上架" :value="1" />
                  <el-option label="已下架" :value="2" />
                </el-select>
              </el-form-item>
              <el-form-item>
                <el-button
                  type="primary"
                  plain
                  :icon="Search"
                  @click="handleSearch"
                  >筛选</el-button
                >
                <el-button plain :icon="Refresh" @click="handleReset"
                  >重置</el-button
                >
              </el-form-item>
            </el-form>
          </template>

          <!-- Actions -->
          <template #actions>
            <el-button type="primary" plain :icon="Plus" @click="openCreateDrawer"
              >新增商品</el-button
            >
            <el-button plain :icon="Refresh" @click="loadProducts"
              >刷新列表</el-button
            >
          </template>

          <!-- Table -->
          <template #table>
            <el-table
              :data="tableData"
              style="width: 100%"
              height="100%"
              v-loading="loading"
              class="product-table"
            >
              <!-- 1. 商品ID列 -->
              <el-table-column label="商品ID" width="100" align="center">
                <template #default="scope">
                  <span class="product-id-text">{{ scope.row.id }}</span>
                </template>
              </el-table-column>

              <!-- 2. 商品封面列 -->
              <el-table-column label="封面" width="100" align="center">
                <template #default="scope">
                  <el-image
                    class="table-cover-img"
                    :src="resolveUrl(scope.row.coverUrl)"
                    :preview-src-list="[resolveUrl(scope.row.coverUrl)]"
                    preview-teleported
                    fit="cover"
                  >
                    <template #error>
                      <div class="image-error-slot">
                        <span>加载失败</span>
                      </div>
                    </template>
                  </el-image>
                </template>
              </el-table-column>

              <!-- 3. 商品名称列 -->
              <el-table-column label="商品名称" width="240" align="left">
                <template #default="scope">
                  <div class="product-name-cell">
                    <div class="product-title">{{ scope.row.productName }}</div>
                  </div>
                </template>
              </el-table-column>

              <!-- 2. 商品分类列（分列显示） -->
              <el-table-column label="商品分类" width="140" align="center">
                <template #default="scope">
                  <el-tag type="info" size="small" effect="plain">
                    {{ scope.row.categoryName || "未分类" }}
                  </el-tag>
                </template>
              </el-table-column>

              <!-- 3. 库存列（分列显示） -->
              <el-table-column label="总库存" width="100" align="center">
                <template #default="scope">
                  <span
                    :class="[
                      'stock-text',
                      { 'low-stock': scope.row.totalStock <= 10 },
                    ]"
                  >
                    {{ scope.row.totalStock }}
                  </span>
                </template>
              </el-table-column>

              <!-- 4. 发货地（分列显示，宽度约束，超出悬浮提示） -->
              <el-table-column
                label="发货地"
                width="160"
                align="center"
                show-overflow-tooltip
              >
                <template #default="scope">
                  <span>{{ scope.row.deliveryPlace || "-" }}</span>
                </template>
              </el-table-column>

              <!-- 5. 商品描述（单行省略号模式） -->
              <el-table-column label="商品描述" align="left" min-width="180">
                <template #default="scope">
                  <!-- 悬浮提示完整内容 -->
                  <el-tooltip
                    v-if="scope.row.description"
                    class="box-item"
                    effect="dark"
                    :content="scope.row.description"
                    placement="top"
                  >
                    <!-- 单行截断容器 -->
                    <div class="single-line-ellipsis">
                      {{ scope.row.description }}
                    </div>
                  </el-tooltip>
                  <!-- 无数据占位 -->
                  <span v-else class="text-placeholder">-</span>
                </template>
              </el-table-column>

              <el-table-column
                prop="status"
                label="状态"
                width="120"
                align="center"
              >
                <template #default="scope">
                  <el-tag
                    :type="scope.row.status === 1 ? 'success' : scope.row.status === 2 ? 'danger' : 'info'"
                    size="default"
                    effect="light"
                  >
                    {{ scope.row.status === 1 ? "已上架" : scope.row.status === 2 ? "已下架" : "未上架" }}
                  </el-tag>
                </template>
              </el-table-column>

              <el-table-column
                prop="updateTime"
                label="更新时间"
                width="200"
                align="center"
              >
                <template #default="scope">
                  <span>{{ formatDate(scope.row.updateTime) }}</span>
                </template>
              </el-table-column>

              <el-table-column
                label="操作"
                width="220"
                align="center"
                fixed="right"
              >
                <template #default="scope">
                  <el-button
                    link
                    type="primary"
                    size="default"
                    @click="handleView(scope.row)"
                  >
                    <el-icon><View /></el-icon>详情
                  </el-button>
                  <el-button
                    link
                    type="primary"
                    size="default"
                    @click="handleEdit(scope.row)"
                  >
                    <el-icon><Edit /></el-icon>编辑
                  </el-button>
                  <el-button
                    link
                    :type="scope.row.status === 1 ? 'warning' : 'success'"
                    size="default"
                    @click="toggleStatus(scope.row)"
                  >
                    <el-icon><SwitchButton /></el-icon>{{ scope.row.status === 1 ? "下架" : "上架" }}
                  </el-button>
                </template>
              </el-table-column>
            </el-table>
          </template>

          <!-- Pagination -->
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

    <!-- Create/Edit Dialog -->
    <el-dialog
      v-model="formDialogVisible"
      :title="isEditMode ? '修改商品信息' : '新增商品'"
      width="65%"
      align-center
      :destroy-on-close="true"
      class="product-form-dialog"
    >
      <el-form
        :model="productForm"
        :rules="formRules"
        ref="productFormRef"
        label-position="top"
        class="product-form"
      >
        <div class="form-split-container">
          <!-- Left side: Media Uploads -->
          <div class="left-media-section">
            <!-- Cover image upload card -->
            <div class="media-card cover-card">
              <div class="media-card-title">
                商品主图封面 <span class="required-star">*</span>
              </div>
              <div class="cover-upload-zone" @click="triggerCoverUpload">
                <el-image
                  v-if="productForm.coverUrl"
                  :src="resolveUrl(productForm.coverUrl)"
                  fit="cover"
                  class="cover-upload-preview"
                />
                <div v-else class="cover-upload-placeholder">
                  <el-icon class="cover-upload-icon"><Picture /></el-icon>
                  <span class="upload-text">点击上传主图</span>
                  <span class="cover-upload-hint">建议 1:1 分辨率，小于 5MB</span>
                </div>
                <div v-if="coverUploading" class="img-upload-loading">
                  <el-icon class="is-loading"><Loading /></el-icon>
                </div>
                <div v-if="productForm.coverUrl" class="cover-hover-mask">
                  <span class="mask-action"><el-icon><Edit /></el-icon> 更换封面</span>
                </div>
                <el-button
                  v-if="productForm.coverUrl"
                  type="danger"
                  :icon="Delete"
                  circle
                  size="small"
                  class="img-remove-btn"
                  @click.stop="productForm.coverUrl = ''"
                />
              </div>
              <input
                ref="coverInputRef"
                type="file"
                accept="image/*"
                style="display: none"
                @change="(e) => handleImgFileChange(e, 'cover')"
              />
            </div>

            <!-- Carousel images card -->
            <div class="media-card carousel-card">
              <div class="media-card-title">
                商品轮播展示图 <span class="img-field-hint">(最多 5 张)</span>
              </div>
              <div class="carousel-upload-grid">
                <div
                  v-for="(url, index) in productForm.carouselUrls"
                  :key="index"
                  class="carousel-upload-card"
                >
                  <el-image
                    v-if="url"
                    :src="resolveUrl(url)"
                    fit="cover"
                    class="carousel-card-img"
                  />
                  <div v-else class="carousel-card-placeholder">
                    <el-icon><Picture /></el-icon>
                  </div>
                  <div v-if="carouselUploading[index]" class="img-upload-loading">
                    <el-icon class="is-loading"><Loading /></el-icon>
                  </div>
                  <div class="carousel-card-actions">
                    <el-button
                      type="primary"
                      :icon="UploadFilled"
                      size="small"
                      circle
                      @click="triggerCarouselUpload(index)"
                    />
                    <el-button
                      type="danger"
                      :icon="Delete"
                      size="small"
                      circle
                      @click="removeCarouselUrl(index)"
                    />
                  </div>
                </div>
                <div
                  v-if="productForm.carouselUrls.length < 5"
                  class="carousel-upload-card carousel-add-card"
                  @click="addAndUploadCarousel"
                >
                  <el-icon class="carousel-add-icon"><Plus /></el-icon>
                  <span>添加图片</span>
                </div>
              </div>
              <input
                ref="carouselInputRef"
                type="file"
                accept="image/*"
                style="display: none"
                @change="(e) => handleImgFileChange(e, 'carousel')"
              />
            </div>
          </div>

          <!-- Right side: Basic Information -->
          <div class="right-info-section">
            <el-form-item label="商品名称" prop="productName">
              <el-input
                v-model="productForm.productName"
                placeholder="例如: 阳光玫瑰葡萄 5kg 特级箱装"
                maxLength="100"
                clearable
              />
            </el-form-item>

            <div class="info-row">
              <el-form-item label="商品分类" prop="categoryId" class="info-col">
                <el-cascader
                  v-model="productForm.categoryId"
                  :options="categories"
                  :props="{
                    value: 'id',
                    label: 'categoryName',
                    children: 'children',
                    emitPath: false,
                    checkStrictly: true
                  }"
                  placeholder="请选择分类"
                  filterable
                  @change="handleCategoryChange"
                  style="width: 100%"
                />
              </el-form-item>

              <el-form-item label="发货始发地" prop="deliveryPlace" class="info-col">
                <el-input
                  v-model="productForm.deliveryPlace"
                  placeholder="例如: 广东深圳"
                  clearable
                />
              </el-form-item>
            </div>

            <el-form-item label="上下架运营状态" prop="status">
              <el-radio-group v-model="productForm.status">
                <el-radio-button :label="0">未上架</el-radio-button>
                <el-radio-button :label="1">已上架</el-radio-button>
                <el-radio-button :label="2">已下架</el-radio-button>
              </el-radio-group>
            </el-form-item>

            <el-form-item label="商品详细描述" prop="description" class="desc-form-item">
              <el-input
                type="textarea"
                :rows="4"
                v-model="productForm.description"
                placeholder="请输入详细描述商品特点、规格参数、包装清单与售后服务等..."
                resize="none"
              />
            </el-form-item>
          </div>
        </div>

        <!-- 商品规格 -->
        <div class="specs-section-wrapper">
          <div class="specs-section-header">
            <span class="specs-section-title">
              <el-icon class="specs-title-icon"><List /></el-icon> 商品规格配置 (价格、库存、图片)
            </span>
            <el-button type="primary" size="small" plain :icon="Plus" @click="addSpec"
              >添加规格项</el-button
            >
          </div>
          <el-table
            :data="productForm.specs"
            class="specs-modern-table"
            style="width: 100%"
            border
            size="default"
          >
            <el-table-column label="规格属性名称" min-width="200">
              <template #default="scope">
                <el-input
                  v-model="scope.row.specName"
                  placeholder="输入规格 (如: 特大果 5kg 箱装)"
                  size="default"
                  clearable
                />
              </template>
            </el-table-column>
            <el-table-column label="规格图片" width="100" align="center">
              <template #default="scope">
                <div
                  class="spec-img-upload"
                  @click="triggerSpecUpload(scope.$index)"
                >
                  <el-image
                    v-if="scope.row.imageUrl"
                    :src="resolveUrl(scope.row.imageUrl)"
                    fit="cover"
                    class="spec-img-thumb"
                  />
                  <div v-else class="spec-img-placeholder">
                    <el-icon><Picture /></el-icon>
                  </div>
                  <div
                    v-if="specUploading[scope.$index]"
                    class="img-upload-loading spec-loading"
                  >
                    <el-icon class="is-loading"><Loading /></el-icon>
                  </div>
                </div>
                <input
                  :ref="(el) => (specInputRefs[scope.$index] = el)"
                  type="file"
                  accept="image/*"
                  style="display: none"
                  @change="(e) => handleImgFileChange(e, 'spec', scope.$index)"
                />
              </template>
            </el-table-column>
            <el-table-column label="单价 (元)" min-width="140">
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.price"
                  :precision="2"
                  :step="1"
                  :min="0"
                  size="default"
                  controls-position="right"
                  style="width: 100%"
                />
              </template>
            </el-table-column>
            <el-table-column label="库存数量" min-width="130">
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.stock"
                  :min="0"
                  :step="1"
                  size="default"
                  controls-position="right"
                  style="width: 100%"
                />
              </template>
            </el-table-column>
            <el-table-column label="排序值" min-width="110">
              <template #default="scope">
                <el-input-number
                  v-model="scope.row.sort"
                  :min="0"
                  size="default"
                  controls-position="right"
                  style="width: 100%"
                />
              </template>
            </el-table-column>
            <el-table-column label="操作" width="90" align="center">
              <template #default="scope">
                <el-button
                  type="danger"
                  link
                  :icon="Delete"
                  size="default"
                  @click="removeSpec(scope.$index)"
                  class="spec-delete-btn"
                >删除</el-button>
              </template>
            </el-table-column>
          </el-table>
        </div>
      </el-form>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="formDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="submitLoading" @click="submitForm"
            >发布并保存商品</el-button
          >
        </div>
      </template>
    </el-dialog>

    <!-- Detail Dialog -->
    <el-dialog
      v-model="detailDrawerVisible"
      title="商品详情"
      width="65%"
      align-center
      :destroy-on-close="true"
      class="product-detail-dialog"
    >
      <div v-if="detailData" class="product-detail">
        <div class="detail-split-container">
          <!-- Left side: Media Section -->
          <div class="detail-left-section">
            <!-- Cover image display -->
            <div class="detail-card cover-card">
              <div class="detail-card-title">商品封面</div>
              <div class="detail-cover-wrapper">
                <el-image
                  :src="resolveUrl(detailData.coverUrl)"
                  :preview-src-list="[resolveUrl(detailData.coverUrl)]"
                  preview-teleported
                  fit="cover"
                  class="detail-cover"
                />
                <div class="detail-status-tag">
                  <el-tag
                    :type="detailData.status === 1 ? 'success' : detailData.status === 2 ? 'danger' : 'info'"
                    effect="dark"
                  >
                    {{ detailData.status === 1 ? "已上架" : detailData.status === 2 ? "已下架" : "未上架" }}
                  </el-tag>
                </div>
              </div>
            </div>

            <!-- Carousel pictures display -->
            <div
              class="detail-card carousel-card"
              v-if="detailData.carouselUrls && detailData.carouselUrls.length"
            >
              <div class="detail-card-title">轮播展示图</div>
              <div class="detail-carousels">
                <el-image
                  v-for="(url, idx) in detailData.carouselUrls"
                  :key="idx"
                  :src="resolveUrl(url)"
                  fit="cover"
                  class="carousel-thumb"
                  :preview-src-list="detailData.carouselUrls.map(resolveUrl)"
                  :initial-index="idx"
                  preview-teleported
                />
              </div>
            </div>
          </div>

          <!-- Right side: Basic Information -->
          <div class="detail-right-section">
            <div class="detail-card info-card">
              <div class="detail-card-title">基本信息</div>
              
              <div class="detail-name-wrapper">
                <div class="detail-name-label">商品名称</div>
                <h3 class="detail-product-name">{{ detailData.productName }}</h3>
              </div>

              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">商品 ID</span>
                  <span class="info-value">{{ detailData.id }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">商品分类</span>
                  <span class="info-value">
                    <el-tag type="info" size="small" effect="plain">{{
                      detailData.categoryName || "未分类"
                    }}</el-tag>
                  </span>
                </div>
                <div class="info-item">
                  <span class="info-label">发货地点</span>
                  <span class="info-value">{{
                    detailData.deliveryPlace || "未知"
                  }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">总库存</span>
                  <span class="info-value">{{ detailData.totalStock }} 件</span>
                </div>
                <div class="info-item">
                  <span class="info-label">创建时间</span>
                  <span class="info-value">{{
                    formatDate(detailData.createTime)
                  }}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">更新时间</span>
                  <span class="info-value">{{
                    formatDate(detailData.updateTime)
                  }}</span>
                </div>
              </div>
            </div>

            <!-- Description -->
            <div class="detail-card desc-card">
              <div class="detail-card-title">商品描述</div>
              <p class="detail-description">
                {{ detailData.description || "暂无商品描述" }}
              </p>
            </div>
          </div>
        </div>

        <!-- Specifications Table -->
        <div class="detail-specs-section-wrapper">
          <div class="detail-specs-section-header">
            <span class="detail-specs-section-title">
              <el-icon class="specs-title-icon"><List /></el-icon> 商品规格配置 ({{
                detailData.specs ? detailData.specs.length : 0
              }})
            </span>
          </div>
          <el-table
            :data="detailData.specs"
            class="detail-specs-table"
            style="width: 100%"
            border
            size="default"
          >
            <el-table-column label="规格图片" width="100" align="center">
              <template #default="scope">
                <el-image
                  :src="resolveUrl(scope.row.imageUrl)"
                  :preview-src-list="[resolveUrl(scope.row.imageUrl)]"
                  preview-teleported
                  fit="cover"
                  class="spec-thumb-img"
                  v-if="scope.row.imageUrl"
                />
                <span v-else class="no-img-text">无图</span>
              </template>
            </el-table-column>
            <el-table-column prop="specName" label="规格属性名称" min-width="200" />
            <el-table-column prop="price" label="单价 (元)" min-width="140">
              <template #default="scope">
                <span class="price-text"
                  >¥ {{ (Number(scope.row.price) || 0).toFixed(2) }}</span
                >
              </template>
            </el-table-column>
            <el-table-column
              prop="stock"
              label="库存数量"
              min-width="130"
              align="center"
            />
            <el-table-column
              prop="sort"
              label="排序值"
              min-width="110"
              align="center"
            />
          </el-table>
        </div>
      </div>
      <template #footer>
        <div class="dialog-footer">
          <el-button @click="detailDrawerVisible = false">关闭</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from "vue";
import { ElMessage, ElMessageBox } from "element-plus";
import {
  Shop,
  Menu,
  List,
  ArrowDown,
  SwitchButton,
  Plus,
  Search,
  Refresh,
  Delete,
  Picture,
  View,
  Edit,
  UploadFilled,
  Loading,
} from "@element-plus/icons-vue";
import { removeToken } from "@/utils/token";
import {
  getProductPage,
  getProductDetail,
  addProduct,
  updateProduct,
  getProductCategoryTree,
} from "@/api/productApi";
import { merchantApis } from "@/api/merchantApplyApi";
import { baseUrl } from "@/utils/baseUrl.js";
import CommonLayout from "@/components/commonLayout.vue";

defineOptions({
  name: "Product"
});

// Resolve relative image URL to absolute
const resolveUrl = (url) => {
  if (!url) return "";
  if (
    url.startsWith("http://") ||
    url.startsWith("https://") ||
    url.startsWith("data:")
  )
    return url;
  const base = baseUrl().replace(/\/$/, "");
  return url.startsWith("/") ? `${base}${url}` : `${base}/${url}`;
};
const loading = ref(false);
const submitLoading = ref(false);

// Categories tree list
const categories = ref([]);

// Helper to recursively find category node in tree
const findCategoryInTree = (nodes, id) => {
  if (!nodes) return null;
  for (const node of nodes) {
    if (node.id === id) {
      return node;
    }
    if (node.children && node.children.length > 0) {
      const found = findCategoryInTree(node.children, id);
      if (found) return found;
    }
  }
  return null;
};

// Clean category tree children array to prevent empty cascader lists
const cleanCategoryTree = (nodes) => {
  if (!nodes || !nodes.length) return undefined;
  return nodes.map((node) => {
    const cleanNode = { ...node };
    if (cleanNode.children && cleanNode.children.length > 0) {
      cleanNode.children = cleanCategoryTree(cleanNode.children);
    } else {
      delete cleanNode.children;
    }
    return cleanNode;
  });
};

const loadCategoryTree = async () => {
  try {
    const res = await getProductCategoryTree();
    if (res && (res.code === 0 || res.code === 200) && res.data) {
      categories.value = cleanCategoryTree(res.data) || [];
    }
  } catch (err) {
    console.error("加载商品分类树失败:", err);
  }
};


// Date Formatter helper
const formatDate = (dateVal) => {
  if (!dateVal) return "-";
  if (typeof dateVal === "string") return dateVal;
  try {
    const d = new Date(dateVal);
    if (isNaN(d.getTime())) return "-";
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const r = String(d.getDate()).padStart(2, "0");
    const hh = String(d.getHours()).padStart(2, "0");
    const mm = String(d.getMinutes()).padStart(2, "0");
    const ss = String(d.getSeconds()).padStart(2, "0");
    return `${y}-${m}-${r} ${hh}:${mm}:${ss}`;
  } catch (e) {
    return "-";
  }
};

// Image upload helpers
const coverInputRef = ref(null);
const carouselInputRef = ref(null);
const specInputRefs = reactive({});
const coverUploading = ref(false);
const carouselUploading = reactive({});
const specUploading = reactive({});
let pendingCarouselIndex = -1;

const uploadImage = async (file) => {
  if (file.size > 5 * 1024 * 1024) {
    ElMessage.warning("图片大小不能超过 5MB");
    return null;
  }
  const res = await merchantApis.uploadFile(file);
  if (res && (res.code === 0 || res.code === 200) && res.data) {
    return res.data.filePath || res.data.url || res.data;
  }
  throw new Error(res?.message || "上传失败");
};

const triggerCoverUpload = () => coverInputRef.value?.click();

const triggerCarouselUpload = (index) => {
  pendingCarouselIndex = index;
  carouselInputRef.value?.click();
};

const addAndUploadCarousel = () => {
  productForm.carouselUrls.push("");
  pendingCarouselIndex = productForm.carouselUrls.length - 1;
  carouselInputRef.value?.click();
};

const triggerSpecUpload = (index) => {
  specInputRefs[index]?.click();
};

const handleImgFileChange = async (e, type, specIndex) => {
  const file = e.target.files?.[0];
  if (!file) return;
  e.target.value = "";
  try {
    if (type === "cover") {
      coverUploading.value = true;
      const url = await uploadImage(file);
      if (url) productForm.coverUrl = url;
    } else if (type === "carousel") {
      const idx = pendingCarouselIndex;
      carouselUploading[idx] = true;
      const url = await uploadImage(file);
      if (url) productForm.carouselUrls[idx] = url;
    } else if (type === "spec") {
      specUploading[specIndex] = true;
      const url = await uploadImage(file);
      if (url) productForm.specs[specIndex].imageUrl = url;
    }
  } catch (err) {
    ElMessage.error(err.message || "图片上传失败");
  } finally {
    if (type === "cover") coverUploading.value = false;
    else if (type === "carousel")
      carouselUploading[pendingCarouselIndex] = false;
    else if (type === "spec") specUploading[specIndex] = false;
  }
};

// Search form reactive state
const searchForm = reactive({
  productName: "",
  categoryId: "",
  status: "",
});

// Table & Pagination state
const tableData = ref([]);
const total = ref(0);
const pageNum = ref(1);
const pageSize = ref(10);

// Load product records
const loadProducts = async () => {
  loading.value = true;
  const params = {
    pageNum: pageNum.value,
    pageSize: pageSize.value,
    productName: searchForm.productName || undefined,
    categoryId: searchForm.categoryId || undefined,
    status: searchForm.status !== "" ? searchForm.status : undefined,
  };

  try {
    const res = await getProductPage(params);
    if (res && (res.code === 200 || res.code === 0) && res.data) {
      tableData.value = res.data.records || [];
      total.value = Number(res.data.total) || 0;
    } else {
      throw new Error(res?.message || "接口错误");
    }
  } catch (err) {
    console.error("获取商品列表失败:", err);
    ElMessage.error(err.message || "获取商品列表失败");
  } finally {
    loading.value = false;
  }
};

// Search trigger
const handleSearch = () => {
  pageNum.value = 1;
  loadProducts();
};

// Reset search
const handleReset = () => {
  searchForm.productName = "";
  searchForm.categoryId = "";
  searchForm.status = "";
  pageNum.value = 1;
  loadProducts();
};

// Pagination triggers
const handleSizeChange = (val) => {
  pageSize.value = val;
  pageNum.value = 1;
  loadProducts();
};
const handleCurrentChange = (val) => {
  pageNum.value = val;
  loadProducts();
};

// Product detail view drawer state
const detailDrawerVisible = ref(false);
const detailData = ref(null);

const handleView = async (row) => {
  try {
    const res = await getProductDetail(row.id);
    if (res && (res.code === 200 || res.code === 0) && res.data) {
      detailData.value = res.data;
      detailDrawerVisible.value = true;
    } else {
      throw new Error(res?.message || "详情获取失败");
    }
  } catch (err) {
    ElMessage.error(err.message || "获取商品详情失败");
  }
};

// Create/Edit form dialog state
const formDialogVisible = ref(false);
const isEditMode = ref(false);
const editingId = ref(null);
const productFormRef = ref(null);

const productForm = reactive({
  productName: "",
  coverUrl: "",
  carouselUrls: [""],
  description: "",
  deliveryPlace: "",
  categoryId: "",
  categoryName: "",
  status: 1,
  specs: [],
});

const formRules = {
  productName: [{ required: true, message: "请输入商品名称", trigger: "blur" }],
  categoryId: [
    { required: true, message: "请选择商品分类", trigger: "change" },
  ],
  coverUrl: [
    { required: true, message: "请输入商品封面图链接", trigger: "blur" },
  ],
};

// Dialog openers
const openCreateDrawer = () => {
  isEditMode.value = false;
  editingId.value = null;
  Object.assign(productForm, {
    productName: "",
    coverUrl: "",
    carouselUrls: [""],
    description: "",
    deliveryPlace: "",
    categoryId: "",
    categoryName: "",
    status: 1,
    specs: [
      { specName: "默认规格", imageUrl: "", price: 9.9, stock: 100, sort: 1 },
    ],
  });
  formDialogVisible.value = true;
};

const handleEdit = async (row) => {
  isEditMode.value = true;
  editingId.value = row.id;

  try {
    const res = await getProductDetail(row.id);
    if (res && (res.code === 200 || res.code === 0) && res.data) {
      const data = res.data;
      Object.assign(productForm, {
        productName: data.productName || "",
        coverUrl: data.coverUrl || "",
        carouselUrls:
          data.carouselUrls && data.carouselUrls.length
            ? [...data.carouselUrls]
            : [""],
        description: data.description || "",
        deliveryPlace: data.deliveryPlace || "",
        categoryId: data.categoryId || "",
        categoryName: data.categoryName || "",
        status: data.status !== undefined ? data.status : 1,
        specs:
          data.specs && data.specs.length
            ? data.specs.map((s) => ({ ...s }))
            : [],
      });
      formDialogVisible.value = true;
    } else {
      throw new Error(res?.message || "未获取到商品数据");
    }
  } catch (err) {
    ElMessage.error(err.message || "获取商品详情失败");
  }
};

// Carousel image list dynamic methods
const addCarouselUrl = () => {
  if (productForm.carouselUrls.length < 5) {
    productForm.carouselUrls.push("");
  }
};
const removeCarouselUrl = (index) => {
  productForm.carouselUrls.splice(index, 1);
};

// Specification list dynamic methods
const addSpec = () => {
  productForm.specs.push({
    specName: "",
    imageUrl: "",
    price: 0,
    stock: 0,
    sort: productForm.specs.length + 1,
  });
};
const removeSpec = (index) => {
  productForm.specs.splice(index, 1);
};

// Handle Category change to sync category ID
const handleCategoryChange = (val) => {
  if (val) {
    const matched = findCategoryInTree(categories.value, val);
    if (matched) {
      productForm.categoryId = matched.id;
      productForm.categoryName = matched.categoryName;
    } else {
      productForm.categoryId = "";
      productForm.categoryName = "";
    }
  } else {
    productForm.categoryId = "";
    productForm.categoryName = "";
  }
};

// Form Submission
const submitForm = async () => {
  if (!productFormRef.value) return;
  await productFormRef.value.validate(async (valid) => {
    if (!valid) return;

    // Filters empty string in carousels
    const cleanCarousels = productForm.carouselUrls.filter(
      (url) => url.trim() !== ""
    );

    // Sum stock
    const calculatedTotalStock = productForm.specs.reduce(
      (acc, curr) => acc + (curr.stock || 0),
      0
    );

    const payload = {
      productName: productForm.productName,
      coverUrl: productForm.coverUrl,
      carouselUrls: cleanCarousels,
      description: productForm.description,
      deliveryPlace: productForm.deliveryPlace,
      categoryId: Number(productForm.categoryId) || 1,
      categoryName: productForm.categoryName,
      status: productForm.status,
      specs: productForm.specs.map((s) => ({
        specName: s.specName || "默认规格",
        imageUrl: s.imageUrl || "",
        price: Number(s.price) || 0,
        stock: Number(s.stock) || 0,
        sort: Number(s.sort) || 1,
      })),
    };

    submitLoading.value = true;
    try {
      if (isEditMode.value) {
        // Send API PUT request
        const res = await updateProduct(editingId.value, payload);
        if (res && (res.code === 200 || res.code === 0)) {
          ElMessage.success("商品信息更新成功");
        } else {
          throw new Error(res?.message || "更新失败");
        }
      } else {
        // Send API POST request
        const res = await addProduct(payload);
        if (res && (res.code === 200 || res.code === 0)) {
          ElMessage.success("商品新增成功");
        } else {
          throw new Error(res?.message || "新增失败");
        }
      }
      formDialogVisible.value = false;
      loadProducts();
    } catch (err) {
      console.error(err);
      ElMessage.error(err.message || "操作失败，请检查网络连接");
    } finally {
      submitLoading.value = false;
    }
  });
};

// Toggle Online/Offline status
const toggleStatus = async (row) => {
  const newStatus = row.status === 1 ? 2 : 1;
  const actionText = newStatus === 1 ? "上架" : "下架";

  ElMessageBox.confirm(
    `确定要${actionText}商品「${row.productName}」吗？`,
    "提示",
    {
      confirmButtonText: "确定",
      cancelButtonText: "取消",
      type: "warning",
    }
  )
    .then(async () => {
      try {
        const resDetail = await getProductDetail(row.id);
        if (
          !resDetail ||
          !(resDetail.code === 200 || resDetail.code === 0) ||
          !resDetail.data
        ) {
          throw new Error("未获取到商品最新数据");
        }
        const fullData = resDetail.data;
        const updatePayload = {
          productName: fullData.productName,
          coverUrl: fullData.coverUrl,
          carouselUrls: fullData.carouselUrls,
          description: fullData.description,
          deliveryPlace: fullData.deliveryPlace,
          categoryId: fullData.categoryId,
          categoryName: fullData.categoryName,
          status: newStatus,
          specs: fullData.specs,
        };
        const resUpdate = await updateProduct(row.id, updatePayload);
        if (resUpdate && (resUpdate.code === 200 || resUpdate.code === 0)) {
          ElMessage.success(`商品已${actionText}`);
          loadProducts();
        } else {
          throw new Error(resUpdate?.message || "修改状态失败");
        }
      } catch (err) {
        ElMessage.error(`操作失败: ${err.message}`);
      }
    })
    .catch(() => {});
};

onMounted(() => {
  loadCategoryTree();
  loadProducts();
});
</script>

<style scoped>
/* Main Layout Container */
.page-container {
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
}

/* 单行文本省略号样式 */
.single-line-ellipsis {
  white-space: nowrap; /* 强制不换行 */
  overflow: hidden; /* 超出部分隐藏 */
  text-overflow: ellipsis; /* 超出显示省略号 */
  font-size: 13px; /* 保持与表格其他文本一致 */
  color: #475569; /* 深灰色，比标题浅，比占位符深 */
  line-height: 20px; /* 垂直居中微调 */
  padding: 0; /* 去除内边距，防止省略号太靠右 */
  margin: 0;
}

/* 表格内占位符样式优化 */
.text-placeholder {
  font-size: 13px;
  color: #cbd5e1; /* 浅灰色，表示无数据 */
  font-style: italic; /* 斜体，更显眼 */
}






.btn-create {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  border: none;
  box-shadow: 0 2px 6px rgba(99, 102, 241, 0.3);
}

.btn-create:hover {
  background: linear-gradient(135deg, #4f46e5 0%, #3730a3 100%);
}

/* Search panel styling */
.search-form :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 18px;
}

.product-table {
  flex: 1;
  min-height: 0;
}

.table-cover-img {
  width: 72px;
  height: 72px;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  display: block;
}

.image-error-slot {
  width: 100%;
  height: 100%;
  background-color: #f1f5f9;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  text-align: center;
  border-radius: 6px;
}

.low-stock {
  color: #ef4444;
  font-weight: bold;
}

.pagination-container {
  display: flex;
  justify-content: flex-end;
  margin-top: 16px;
  flex-shrink: 0;
}

/* ===== Dialog Form Layout (Optimized & Premium) ===== */
.product-form {
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
}

.form-split-container {
  display: flex;
  gap: 24px;
  padding: 24px;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
}

/* Left Media Section */
.left-media-section {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.media-card {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.02), 0 1px 2px -1px rgba(0, 0, 0, 0.02);
}

.media-card-title {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.required-star {
  color: #ef4444;
  margin-left: 2px;
  font-weight: bold;
}

.img-field-hint {
  font-size: 11px;
  color: #94a3b8;
  font-weight: 400;
}

/* Cover Upload Zone */
.cover-upload-zone {
  width: 100%;
  height: 200px;
  border: 2px dashed #e2e8f0;
  border-radius: 10px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  background: #fafafa;
}

.cover-upload-zone:hover {
  border-color: #6366f1;
  background: #f5f3ff;
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.06);
}

.cover-upload-preview {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.3s ease;
}

.cover-upload-zone:hover .cover-upload-preview {
  transform: scale(1.03);
}

.cover-upload-placeholder {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  color: #64748b;
  text-align: center;
  padding: 16px;
}

.cover-upload-icon {
  font-size: 32px;
  color: #94a3b8;
  transition: color 0.25s ease, transform 0.25s ease;
}

.cover-upload-zone:hover .cover-upload-icon {
  color: #6366f1;
  transform: translateY(-2px);
}

.upload-text {
  font-size: 13px;
  font-weight: 500;
}

.cover-upload-hint {
  font-size: 11px;
  color: #94a3b8;
  line-height: 1.4;
}

/* Hover mask on cover image */
.cover-hover-mask {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.6);
  opacity: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.2s ease;
  backdrop-filter: blur(2px);
}

.cover-upload-zone:hover .cover-hover-mask {
  opacity: 1;
}

.mask-action {
  color: #ffffff;
  font-size: 13px;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: 1px solid rgba(255, 255, 255, 0.4);
  border-radius: 20px;
  background: rgba(255, 255, 255, 0.1);
  transition: all 0.2s;
}

.mask-action:hover {
  background: #ffffff;
  color: #0f172a;
  border-color: #ffffff;
}

/* Right Info Section */
.right-info-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.info-row {
  display: flex;
  gap: 16px;
}

.info-col {
  flex: 1;
  margin-bottom: 0 !important;
}

.form-item-block {
  margin-bottom: 0 !important;
}

/* Form Item deep overrides */
.product-form :deep(.el-form-item) {
  margin-bottom: 0;
}

.product-form :deep(.el-form-item__label) {
  font-size: 13px;
  color: #475569;
  font-weight: 600;
  padding-bottom: 6px;
  line-height: 1.2;
}

.product-form :deep(.el-input__wrapper),
.product-form :deep(.el-textarea__inner),
.product-form :deep(.el-select__wrapper),
.product-form :deep(.el-select .el-input__wrapper) {
  box-shadow: 0 0 0 1px #e2e8f0 inset;
  border-radius: 8px;
  padding: 8px 12px;
  transition: all 0.2s ease;
  background-color: transparent;
}

.product-form :deep(.el-input__wrapper:hover),
.product-form :deep(.el-textarea__inner:hover),
.product-form :deep(.el-select__wrapper:hover),
.product-form :deep(.el-select .el-input__wrapper:hover) {
  box-shadow: 0 0 0 1px #cbd5e1 inset;
  background-color: transparent;
}

.product-form :deep(.el-input__wrapper.is-focus),
.product-form :deep(.el-textarea__inner:focus),
.product-form :deep(.el-select__wrapper.is-focus),
.product-form :deep(.el-select .el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #6366f1 inset, 0 0 0 3px rgba(99, 102, 241, 0.1) !important;
  background-color: transparent;
}

.product-form :deep(.el-textarea__inner) {
  padding: 10px 14px;
  font-family: inherit;
  line-height: 1.5;
}


/* Carousel Section styling */
.carousel-upload-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.carousel-upload-card {
  width: 100%;
  aspect-ratio: 1;
  border: 1.5px dashed #e2e8f0;
  border-radius: 8px;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  cursor: pointer;
  transition: all 0.2s ease;
}

.carousel-upload-card:hover {
  border-color: #6366f1;
  background: #f5f3ff;
}

.carousel-card-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: transform 0.2s ease;
}

.carousel-upload-card:hover .carousel-card-img {
  transform: scale(1.05);
}

.carousel-card-placeholder {
  color: #94a3b8;
  font-size: 20px;
}

.carousel-card-actions {
  position: absolute;
  inset: 0;
  background: rgba(15, 23, 42, 0.65);
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.2s ease;
  backdrop-filter: blur(1px);
}

.carousel-upload-card:hover .carousel-card-actions {
  opacity: 1;
}

.carousel-add-card {
  flex-direction: column;
  gap: 4px;
  font-size: 11px;
  font-weight: 500;
  color: #64748b;
  border-style: dashed;
}

.carousel-add-icon {
  font-size: 18px;
  color: #94a3b8;
  transition: transform 0.2s ease;
}

.carousel-add-card:hover .carousel-add-icon {
  transform: scale(1.15) rotate(90deg);
  color: #6366f1;
}

/* Specs Section styling */
.specs-section-wrapper {
  padding: 24px;
  background-color: #f8fafc;
}

.specs-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.specs-section-title {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
}

.specs-title-icon {
  color: #6366f1;
  font-size: 16px;
}

.specs-modern-table {
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  border: 1px solid #e2e8f0;
  background: #ffffff;
}

.specs-modern-table :deep(th.el-table__cell) {
  background-color: #f1f5f9;
  color: #475569;
  font-weight: 600;
  font-size: 12px;
  padding: 10px 0;
}

.specs-modern-table :deep(td.el-table__cell) {
  padding: 8px 0;
}

.specs-modern-table :deep(.el-input__wrapper) {
  box-shadow: none !important;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: transparent;
  padding: 4px 8px;
}

.specs-modern-table :deep(.el-input__wrapper:hover) {
  border-color: #cbd5e1;
}

.specs-modern-table :deep(.el-input__wrapper.is-focus) {
  border-color: #6366f1;
  box-shadow: 0 0 0 2px rgba(99, 102, 241, 0.1) !important;
}

/* Spec image mini-uploader */
.spec-img-upload {
  width: 40px;
  height: 40px;
  border: 1.5px dashed #cbd5e1;
  border-radius: 6px;
  cursor: pointer;
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  margin: 0 auto;
  transition: all 0.2s ease;
}

.spec-img-upload:hover {
  border-color: #6366f1;
  background: #f5f3ff;
}

.spec-img-thumb {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.spec-img-placeholder {
  color: #94a3b8;
  font-size: 16px;
}

.spec-delete-btn {
  font-size: 12px;
  font-weight: 500;
}

.spec-delete-btn:hover {
  color: #ef4444 !important;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
  padding: 16px 24px;
  background-color: #ffffff;
  border-top: 1px solid #e2e8f0;
  border-radius: 0 0 16px 16px;
}

/* ===== Dialog Detail Layout (Optimized & Premium) ===== */
.product-detail {
  display: flex;
  flex-direction: column;
  background-color: #f8fafc;
}

.detail-split-container {
  display: flex;
  gap: 24px;
  padding: 24px;
  background-color: #ffffff;
  border-bottom: 1px solid #e2e8f0;
}

.detail-left-section {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.detail-card {
  background: #ffffff;
  border: 1px solid #f1f5f9;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.02), 0 1px 2px -1px rgba(0, 0, 0, 0.02);
}

.detail-card-title {
  font-size: 13px;
  font-weight: 600;
  color: #334155;
  margin-bottom: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.detail-cover-wrapper {
  position: relative;
  border-radius: 10px;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #fafafa;
  width: 100%;
  height: 200px;
  border: 1px solid #e2e8f0;
}

.detail-cover {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.detail-status-tag {
  position: absolute;
  top: 12px;
  right: 12px;
  z-index: 10;
}

.detail-carousels {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}

.carousel-thumb {
  width: 100%;
  aspect-ratio: 1;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
  cursor: pointer;
  object-fit: cover;
  transition: transform 0.2s ease;
}

.carousel-thumb:hover {
  transform: scale(1.05);
}

.detail-right-section {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-width: 0;
}

.detail-name-wrapper {
  margin-bottom: 16px;
}

.detail-name-label {
  font-size: 12px;
  color: #64748b;
  margin-bottom: 6px;
  font-weight: 600;
}

.detail-product-name {
  font-size: 18px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
  line-height: 1.4;
}

.info-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 16px;
  background-color: #f8fafc;
  padding: 16px;
  border-radius: 8px;
  border: 1px solid #e2e8f0;
}

.info-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.info-label {
  font-size: 11px;
  color: #64748b;
  font-weight: 600;
}

.info-value {
  font-size: 13px;
  color: #1e293b;
  font-weight: 500;
}

.detail-description {
  font-size: 13px;
  color: #475569;
  line-height: 1.6;
  margin: 0;
  white-space: pre-wrap;
}

.detail-specs-section-wrapper {
  padding: 24px;
  background-color: #f8fafc;
}

.detail-specs-section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.detail-specs-section-title {
  font-size: 14px;
  font-weight: 700;
  color: #1e293b;
  display: flex;
  align-items: center;
  gap: 8px;
}

.detail-specs-table {
  border-radius: 10px;
  overflow: hidden;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.02);
  border: 1px solid #e2e8f0;
  background: #ffffff;
}

.detail-specs-table :deep(th.el-table__cell) {
  background-color: #f1f5f9;
  color: #475569;
  font-weight: 600;
  font-size: 12px;
  padding: 10px 0;
}

.detail-specs-table :deep(td.el-table__cell) {
  padding: 8px 0;
}

.spec-thumb-img {
  width: 40px;
  height: 40px;
  border-radius: 6px;
  object-fit: cover;
  display: block;
  margin: 0 auto;
}

.no-img-text {
  font-size: 11px;
  color: #94a3b8;
}

.price-text {
  color: #6366f1;
  font-weight: 600;
}

.action-card {
  margin-bottom: 8px;
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.action-card :deep(.el-card__body) {
  padding: 12px 16px;
  display: flex;
  gap: 12px;
}

.product-info-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 4px 0;
}

.product-title {
  font-size: 14px;
  font-weight: 700;
  color: #0f172a;
  margin-bottom: 2px;
}

.product-meta {
  font-size: 12px;
  color: #64748b;
}

.product-id-text {
  font-family: Menlo, Monaco, Consolas, "Courier New", monospace;
  font-size: 13px;
  color: #64748b;
  font-weight: 600;
}
</style>

<style>
.product-form-dialog,
.product-detail-dialog {
  --el-dialog-border-radius: 16px !important;
}

.product-form-dialog .el-dialog__body,
.product-detail-dialog .el-dialog__body {
  padding: 0 !important;
  max-height: 78vh;
  overflow-y: auto;
}

.product-form-dialog .el-dialog__body::-webkit-scrollbar,
.product-detail-dialog .el-dialog__body::-webkit-scrollbar {
  width: 5px;
}

.product-form-dialog .el-dialog__body::-webkit-scrollbar-track,
.product-detail-dialog .el-dialog__body::-webkit-scrollbar-track {
  background: transparent;
}

.product-form-dialog .el-dialog__body::-webkit-scrollbar-thumb,
.product-detail-dialog .el-dialog__body::-webkit-scrollbar-thumb {
  background: #e2e8f0;
  border-radius: 10px;
}

.product-form-dialog .el-dialog__body::-webkit-scrollbar-thumb:hover,
.product-detail-dialog .el-dialog__body::-webkit-scrollbar-thumb:hover {
  background: #cbd5e1;
}
</style>
