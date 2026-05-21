<template>
  <div class="home-container">
        <!-- 数据卡片行 -->
        <el-row :gutter="20" class="stat-row">
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-card shadow="hover" class="stat-card stat-primary">
              <div class="stat-header">
                <span>总营业额 (CNY)</span>
                <el-tag type="success" size="small">月度</el-tag>
              </div>
              <div class="stat-value">¥ 1,284,500</div>
              <div class="stat-footer">
                <span class="up"><el-icon><CaretTop /></el-icon> +12.5%</span> 环比上月
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-card shadow="hover" class="stat-card stat-success">
              <div class="stat-header">
                <span>商户总数</span>
                <el-tag type="info" size="small">实时</el-tag>
              </div>
              <div class="stat-value">384 家</div>
              <div class="stat-footer">
                <span class="up"><el-icon><CaretTop /></el-icon> +4</span> 本周新增
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-card shadow="hover" class="stat-card stat-warning">
              <div class="stat-header">
                <span>今日交易笔数</span>
                <el-tag type="warning" size="small">今日</el-tag>
              </div>
              <div class="stat-value">1,420 笔</div>
              <div class="stat-footer">
                <span class="down"><el-icon><CaretBottom /></el-icon> -2.1%</span> 环比昨日
              </div>
            </el-card>
          </el-col>
          <el-col :xs="24" :sm="12" :md="8" :lg="6">
            <el-card shadow="hover" class="stat-card stat-danger">
              <div class="stat-header">
                <span>平均客单价</span>
                <el-tag type="primary" size="small">分析</el-tag>
              </div>
              <div class="stat-value">¥ 904.5</div>
              <div class="stat-footer">
                <span class="up"><el-icon><CaretTop /></el-icon> +5.4%</span> 环比上月
              </div>
            </el-card>
          </el-col>
        </el-row>

        <!-- 数据表格 -->
        <el-card shadow="never" class="table-card">
          <template #header>
            <div class="table-header">
              <h3>商户名录</h3>
              <el-button type="primary" :icon="Plus" size="default">添加商户</el-button>
            </div>
          </template>
          <el-table :data="tableData" style="width: 100%" v-loading="loading">
            <el-table-column prop="id" label="商户ID" width="100" />
            <el-table-column prop="name" label="商户名称" min-width="180">
              <template #default="scope">
                <div class="merchant-name-cell">
                  <el-avatar :size="28" :src="scope.row.logo" />
                  <span class="m-name">{{ scope.row.name }}</span>
                </div>
              </template>
            </el-table-column>
            <el-table-column prop="category" label="经营类目" width="120" />
            <el-table-column prop="contact" label="联系人" width="120" />
            <el-table-column prop="phone" label="联系电话" width="150" />
            <el-table-column prop="sales" label="销售总额" width="150">
              <template #default="scope">
                <span>¥ {{ scope.row.sales.toLocaleString() }}</span>
              </template>
            </el-table-column>
            <el-table-column prop="status" label="状态" width="120">
              <template #default="scope">
                <el-tag :type="scope.row.status === '正常' ? 'success' : 'danger'">
                  {{ scope.row.status }}
                </el-tag>
              </template>
            </el-table-column>
            <el-table-column label="操作" width="160" fixed="right">
              <template #default>
                <el-button link type="primary" size="small">编辑</el-button>
                <el-button link type="danger" size="small">停用</el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { Plus } from '@element-plus/icons-vue'

defineOptions({
  name: 'Home'
})

const loading = ref(false)

const tableData = ref([
  {
    id: 'M001',
    name: '星巴克 (中心城店)',
    logo: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=50&q=80',
    category: '餐饮美食',
    contact: '张经理',
    phone: '13800138000',
    sales: 124500,
    status: '正常'
  },
  {
    id: 'M002',
    name: '优衣库 (时代广场店)',
    logo: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=50&q=80',
    category: '服装鞋帽',
    contact: '李经理',
    phone: '13900139000',
    sales: 458000,
    status: '正常'
  },
  {
    id: 'M003',
    name: '盒马鲜生 (新洲店)',
    logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=50&q=80',
    category: '生鲜超市',
    contact: '王店长',
    phone: '13700137000',
    sales: 682000,
    status: '正常'
  },
  {
    id: 'M004',
    name: '顺丰速运 (龙华分部)',
    logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=50&q=80',
    category: '快递物流',
    contact: '赵经理',
    phone: '13600136000',
    sales: 22000,
    status: '停用'
  }
])

onMounted(() => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
  }, 500)
})
</script>

<style scoped>
.home-container {
  width: 100%;
}

.stat-row {
  margin-bottom: 24px;
}

.stat-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.stat-card:hover {
  transform: translateY(-2px);
}

.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  color: #64748b;
  font-size: 13px;
  font-weight: 500;
}

.stat-value {
  font-size: 26px;
  font-weight: 700;
  margin: 15px 0 10px 0;
  color: #1e293b;
}

.stat-footer {
  font-size: 12px;
  color: #94a3b8;
  display: flex;
  align-items: center;
  gap: 5px;
}

.stat-footer .up {
  color: #10b981;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.stat-footer .down {
  color: #ef4444;
  font-weight: 600;
  display: flex;
  align-items: center;
}

.table-card {
  border-radius: 12px;
  border: 1px solid #e2e8f0;
}

.table-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.table-header h3 {
  margin: 0;
  font-size: 16px;
  color: #1e293b;
  font-weight: 600;
}

.merchant-name-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.m-name {
  font-weight: 500;
  color: #1e293b;
}

.logout-item {
  color: #ef4444 !important;
}
</style>
