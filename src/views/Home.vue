<template>
  <div class="home-container">
    <!-- 数据看板头部标题与分析维度选择 -->
    <div class="dashboard-header">
      <div class="header-left">
        <h2 class="welcome-title">商户数据概览</h2>
        <p class="welcome-desc">实时监控商户经营动态与平台核心交易指标</p>
      </div>
      <div class="header-right">
        <el-radio-group v-model="timeRange" size="default" class="premium-radio-group" @change="handleTimeRangeChange">
          <el-radio-button value="7d">近 7 天</el-radio-button>
          <el-radio-button value="15d">近 15 天</el-radio-button>
          <el-radio-button value="30d">近 30 天</el-radio-button>
        </el-radio-group>
        <el-button type="primary" plain :icon="Refresh" @click="handleRefresh" class="header-refresh-btn">
          同步数据
        </el-button>
      </div>
    </div>

    <!-- 1. 统计卡片行（高档商务白底淡雅风） -->
    <el-row :gutter="20" class="stat-row">
      <el-col :xs="24" :sm="12" :md="12" :lg="6">
        <div class="stat-premium-card">
          <div class="card-inner">
            <div class="stat-meta">
              <span class="stat-label">总营业额 (CNY)</span>
              <span class="stat-icon-wrapper">
                <el-icon><Money /></el-icon>
              </span>
            </div>
            <div class="stat-number">
              <span class="currency-symbol">¥</span>1,284,500
            </div>
            <div class="stat-footer-info">
              <span class="trend-tag trend-up">
                <el-icon><CaretTop /></el-icon> 12.5%
              </span>
              <span class="trend-desc">环比上月增长</span>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="12" :lg="6">
        <div class="stat-premium-card">
          <div class="card-inner">
            <div class="stat-meta">
              <span class="stat-label">商户总数</span>
              <span class="stat-icon-wrapper">
                <el-icon><Shop /></el-icon>
              </span>
            </div>
            <div class="stat-number">384 <span class="unit-text">家</span></div>
            <div class="stat-footer-info">
              <span class="trend-tag trend-up">
                <el-icon><Plus /></el-icon> 4
              </span>
              <span class="trend-desc">本周新增</span>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="12" :lg="6">
        <div class="stat-premium-card">
          <div class="card-inner">
            <div class="stat-meta">
              <span class="stat-label">今日交易笔数</span>
              <span class="stat-icon-wrapper">
                <el-icon><Odometer /></el-icon>
              </span>
            </div>
            <div class="stat-number">1,420 <span class="unit-text">笔</span></div>
            <div class="stat-footer-info">
              <span class="trend-tag trend-down">
                <el-icon><CaretBottom /></el-icon> 2.1%
              </span>
              <span class="trend-desc">对比昨日同期</span>
            </div>
          </div>
        </div>
      </el-col>

      <el-col :xs="24" :sm="12" :md="12" :lg="6">
        <div class="stat-premium-card">
          <div class="card-inner">
            <div class="stat-meta">
              <span class="stat-label">客单价均值 (CNY)</span>
              <span class="stat-icon-wrapper">
                <el-icon><PieChart /></el-icon>
              </span>
            </div>
            <div class="stat-number">
              <span class="currency-symbol">¥</span>904.5
            </div>
            <div class="stat-footer-info">
              <span class="trend-tag trend-up">
                <el-icon><CaretTop /></el-icon> 5.4%
              </span>
              <span class="trend-desc">相较上季水平</span>
            </div>
          </div>
        </div>
      </el-col>
    </el-row>

    <!-- 2. ECharts 图表分析区域 -->
    <el-row :gutter="24" class="chart-row">
      <!-- 销售与交易趋势分析 -->
      <el-col :xs="24" :lg="16" class="chart-col">
        <el-card shadow="never" class="premium-chart-card">
          <template #header>
            <div class="chart-card-header">
              <div class="chart-title-group">
                <span class="title-decorator"></span>
                <span class="chart-card-title">交易走势与规模分析</span>
              </div>
              <div class="chart-legends-mock">
                <span class="legend-dot dot-sales"></span> 营业额
                <span class="legend-dot dot-orders"></span> 订单笔数
              </div>
            </div>
          </template>
          <div class="chart-container-wrapper">
            <div ref="trendChartRef" class="chart-dom"></div>
          </div>
        </el-card>
      </el-col>

      <!-- 经营类目分布分析 -->
      <el-col :xs="24" :lg="8" class="chart-col">
        <el-card shadow="never" class="premium-chart-card">
          <template #header>
            <div class="chart-card-header">
              <div class="chart-title-group">
                <span class="title-decorator"></span>
                <span class="chart-card-title">主营类目交易占比</span>
              </div>
            </div>
          </template>
          <div class="chart-container-wrapper">
            <div ref="categoryChartRef" class="chart-dom"></div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <!-- 3. 商户名录与排行榜表格 -->
    <el-card shadow="never" class="table-premium-card">
      <template #header>
        <div class="table-card-header">
          <div class="table-title-group">
            <h3>商户名录</h3>
            <span class="sub-title">管理并查看商户的基础状态与经营类目信息</span>
          </div>
          <div class="table-actions-group">
            <el-input
              v-model="searchQuery"
              placeholder="请输入商户名称..."
              clearable
              :prefix-icon="Search"
              class="search-input"
              @input="handleSearch"
            />
            <el-select v-model="filterCategory" placeholder="全类目" clearable style="width: 140px" @change="handleSearch">
              <el-option label="餐饮美食" value="餐饮美食" />
              <el-option label="服装鞋帽" value="服装鞋帽" />
              <el-option label="生鲜超市" value="生鲜超市" />
              <el-option label="快递物流" value="快递物流" />
            </el-select>
            <el-button type="primary" :icon="Plus" class="add-merchant-btn">添加商户</el-button>
          </div>
        </div>
      </template>

      <!-- 优雅表格组件 -->
      <el-table 
        :data="filteredTableData" 
        style="width: 100%" 
        v-loading="loading"
        class="premium-table"
      >
        <el-table-column prop="id" label="商户ID" width="100" align="center">
          <template #default="scope">
            <span class="merchant-id-code">{{ scope.row.id }}</span>
          </template>
        </el-table-column>
        
        <el-table-column prop="name" label="商户名称" min-width="220" align="left">
          <template #default="scope">
            <div class="merchant-profile-cell">
              <el-image 
                class="merchant-logo-img" 
                :src="scope.row.logo" 
                fit="cover" 
                lazy
              >
                <template #error>
                  <div class="logo-fallback-icon">
                    <el-icon><Shop /></el-icon>
                  </div>
                </template>
              </el-image>
              <div class="merchant-text-info">
                <span class="merchant-name-title">{{ scope.row.name }}</span>
                <span class="merchant-tag-sub">核销门店</span>
              </div>
            </div>
          </template>
        </el-table-column>

        <el-table-column prop="category" label="经营类目" width="130" align="center">
          <template #default="scope">
            <el-tag :type="getCategoryTagType(scope.row.category)" effect="light" round size="default">
              {{ scope.row.category }}
            </el-tag>
          </template>
        </el-table-column>

        <el-table-column prop="contact" label="核心联系人" width="130" align="center">
          <template #default="scope">
            <span class="contact-name-txt">{{ scope.row.contact }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="phone" label="联系电话" width="160" align="center">
          <template #default="scope">
            <span class="phone-number-txt">{{ scope.row.phone }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="sales" label="本期销售总额" width="160" align="right">
          <template #default="scope">
            <span class="sales-amount-txt">¥{{ scope.row.sales.toLocaleString() }}</span>
          </template>
        </el-table-column>

        <el-table-column prop="status" label="运营状态" width="120" align="center">
          <template #default="scope">
            <div class="status-indicator">
              <span :class="['dot-indicator', scope.row.status === '正常' ? 'dot-active' : 'dot-inactive']"></span>
              <span :class="['status-label-txt', scope.row.status === '正常' ? 'text-active' : 'text-inactive']">
                {{ scope.row.status }}
              </span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="看板操作" width="180" align="center" fixed="right">
          <template #default="scope">
            <el-button link type="primary" size="default" :icon="Edit" class="table-action-btn">
              编辑
            </el-button>
            <el-button 
              link 
              :type="scope.row.status === '正常' ? 'danger' : 'success'" 
              size="default" 
              :icon="scope.row.status === '正常' ? CircleClose : CircleCheck" 
              class="table-action-btn"
              @click="toggleStatus(scope.row)"
            >
              {{ scope.row.status === '正常' ? '停用' : '启用' }}
            </el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, onUnmounted } from 'vue'
import { 
  Plus, 
  Search, 
  Refresh, 
  Money, 
  Shop, 
  Odometer, 
  PieChart, 
  CaretTop, 
  CaretBottom,
  Edit,
  CircleClose,
  CircleCheck
} from '@element-plus/icons-vue'
import { ElMessage } from 'element-plus'
import * as echarts from 'echarts'

defineOptions({
  name: 'Home'
})

// 时间选择与基础搜索状态
const timeRange = ref('15d')
const searchQuery = ref('')
const filterCategory = ref('')
const loading = ref(false)

// 商户名录 Mock 数据
const tableData = ref([
  {
    id: 'M001',
    name: '星巴克 (中心城店)',
    logo: 'https://images.unsplash.com/photo-1544787219-7f47ccb76574?auto=format&fit=crop&w=150&q=80',
    category: '餐饮美食',
    contact: '张经理',
    phone: '13800138000',
    sales: 124500,
    status: '正常'
  },
  {
    id: 'M002',
    name: '优衣库 (时代广场店)',
    logo: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?auto=format&fit=crop&w=150&q=80',
    category: '服装鞋帽',
    contact: '李经理',
    phone: '13900139000',
    sales: 458000,
    status: '正常'
  },
  {
    id: 'M003',
    name: '盒马鲜生 (新洲店)',
    logo: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=150&q=80',
    category: '生鲜超市',
    contact: '王店长',
    phone: '13700137000',
    sales: 682000,
    status: '正常'
  },
  {
    id: 'M004',
    name: '顺丰速运 (龙华分部)',
    logo: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=150&q=80',
    category: '快递物流',
    contact: '赵经理',
    phone: '13600136000',
    sales: 22000,
    status: '停用'
  },
  {
    id: 'M005',
    name: '喜茶 (万象天地店)',
    logo: 'https://images.unsplash.com/photo-1556881286-fc6915169721?auto=format&fit=crop&w=150&q=80',
    category: '餐饮美食',
    contact: '刘经理',
    phone: '13588998899',
    sales: 98400,
    status: '正常'
  },
  {
    id: 'M006',
    name: '无印良品 (COCO Park店)',
    logo: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?auto=format&fit=crop&w=150&q=80',
    category: '服装鞋帽',
    contact: '陈经理',
    phone: '13144556677',
    sales: 185000,
    status: '正常'
  }
])

// 过滤计算属性
const filteredTableData = computed(() => {
  return tableData.value.filter(item => {
    const matchName = item.name.toLowerCase().includes(searchQuery.value.toLowerCase())
    const matchCategory = filterCategory.value ? item.category === filterCategory.value : true
    return matchName && matchCategory
  })
})

const getCategoryTagType = (cat) => {
  switch (cat) {
    case '餐饮美食': return 'primary';
    case '服装鞋帽': return 'success';
    case '生鲜超市': return 'warning';
    case '快递物流': return 'info';
    default: return '';
  }
}

// 模拟状态切换
const toggleStatus = (row) => {
  row.status = row.status === '正常' ? '停用' : '正常'
  ElMessage({
    type: row.status === '正常' ? 'success' : 'warning',
    message: `已成功${row.status === '正常' ? '启用' : '停用'}商户: ${row.name}`,
    duration: 2000
  })
  updateCategoryChart() // 表格数据改变后，同步更新图表
}

// ECharts 初始化逻辑
const trendChartRef = ref(null)
const categoryChartRef = ref(null)
let trendChart = null
let categoryChart = null

// 走势图数据配置生成器
const getTrendChartOption = (range) => {
  let dates = []
  let salesData = []
  let orderData = []
  
  const points = range === '7d' ? 7 : range === '15d' ? 15 : 30;
  
  // 生成最近天数
  for (let i = points - 1; i >= 0; i--) {
    const d = new Date()
    d.setDate(d.getDate() - i)
    dates.push(`${d.getMonth() + 1}/${d.getDate()}`)
  }

  // 根据天数生成合理幅度的数值
  if (points === 7) {
    salesData = [32000, 48000, 36000, 54000, 62000, 45000, 71000]
    orderData = [320, 410, 380, 560, 680, 490, 740]
  } else if (points === 15) {
    salesData = [28000, 31000, 45000, 38000, 52000, 61000, 49000, 57000, 68000, 55000, 72000, 84000, 67000, 78000, 92000]
    orderData = [290, 320, 430, 370, 510, 600, 470, 550, 640, 560, 690, 810, 650, 750, 890]
  } else {
    // 30 天
    salesData = [
      25000, 27000, 31000, 29000, 35000, 42000, 38000, 46000, 49000, 41000,
      48000, 55000, 51000, 59000, 63000, 57000, 66000, 71000, 64000, 73000,
      79000, 70000, 82000, 88000, 81000, 89000, 95000, 87000, 98000, 105000
    ]
    orderData = [
      260, 280, 300, 290, 340, 410, 370, 450, 480, 400,
      470, 530, 500, 570, 610, 550, 640, 690, 620, 710,
      760, 690, 800, 860, 790, 870, 930, 850, 960, 1020
    ]
  }

  return {
    tooltip: {
      trigger: 'axis',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderWidth: 0,
      borderRadius: 12,
      shadowColor: 'rgba(0, 0, 0, 0.08)',
      shadowBlur: 10,
      shadowOffsetY: 5,
      padding: [12, 16],
      textStyle: {
        color: '#1e293b',
        fontFamily: 'Inter, system-ui, sans-serif'
      },
      axisPointer: {
        type: 'line',
        lineStyle: {
          color: '#e2e8f0',
          width: 1,
          type: 'dashed'
        }
      }
    },
    grid: {
      left: '4%',
      right: '4%',
      top: '12%',
      bottom: '5%',
      containLabel: true
    },
    xAxis: {
      type: 'category',
      data: dates,
      axisLine: {
        lineStyle: {
          color: '#e2e8f0'
        }
      },
      axisLabel: {
        color: '#64748b',
        margin: 12,
        fontSize: 11
      },
      axisTick: {
        show: false
      }
    },
    yAxis: [
      {
        type: 'value',
        name: '营业额 (元)',
        nameTextStyle: {
          color: '#94a3b8',
          fontSize: 11,
          padding: [0, 0, 8, 0]
        },
        splitLine: {
          lineStyle: {
            color: '#f1f5f9'
          }
        },
        axisLabel: {
          color: '#64748b',
          fontSize: 11
        }
      },
      {
        type: 'value',
        name: '订单量 (笔)',
        nameTextStyle: {
          color: '#94a3b8',
          fontSize: 11,
          padding: [0, 0, 8, 0]
        },
        splitLine: {
          show: false
        },
        axisLabel: {
          color: '#64748b',
          fontSize: 11
        }
      }
    ],
    series: [
      {
        name: '营业额',
        type: 'line',
        smooth: true,
        showSymbol: false,
        symbolSize: 6,
        itemStyle: {
          color: '#00a86b'
        },
        lineStyle: {
          width: 3.5,
          shadowColor: 'rgba(0, 168, 107, 0.25)',
          shadowBlur: 10,
          shadowOffsetY: 5
        },
        areaStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: 'rgba(0, 168, 107, 0.16)' },
            { offset: 1, color: 'rgba(0, 168, 107, 0.00)' }
          ])
        },
        data: salesData
      },
      {
        name: '订单笔数',
        type: 'bar',
        yAxisIndex: 1,
        barWidth: '35%',
        itemStyle: {
          color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
            { offset: 0, color: '#94a3b8' },
            { offset: 1, color: '#cbd5e1' }
          ]),
          borderRadius: [4, 4, 0, 0]
        },
        data: orderData
      }
    ]
  }
}

// 饼图数据配置生成器
const getCategoryChartOption = () => {
  const rawData = {}
  tableData.value.forEach(item => {
    if (item.status === '正常') {
      rawData[item.category] = (rawData[item.category] || 0) + item.sales
    }
  })

  const chartData = Object.keys(rawData).map(key => ({
    name: key,
    value: rawData[key]
  }))

  // 兜底数据
  if (chartData.length === 0) {
    chartData.push({ name: '暂无正常商户', value: 0 })
  }

  return {
    tooltip: {
      trigger: 'item',
      backgroundColor: 'rgba(255, 255, 255, 0.95)',
      borderWidth: 0,
      borderRadius: 12,
      shadowColor: 'rgba(0, 0, 0, 0.08)',
      shadowBlur: 10,
      padding: [10, 14],
      textStyle: {
        color: '#1e293b'
      },
      formatter: '{b} : <b>¥{c}</b> ({d}%)'
    },
    legend: {
      bottom: '5%',
      left: 'center',
      icon: 'circle',
      itemWidth: 10,
      itemHeight: 10,
      itemGap: 18,
      textStyle: {
        color: '#64748b',
        fontSize: 11,
        fontFamily: 'Inter, system-ui, sans-serif'
      }
    },
    color: ['#00a86b', '#48c78e', '#7dd8a2', '#64748b'],
    series: [
      {
        name: '类目销售额占比',
        type: 'pie',
        radius: ['52%', '72%'],
        center: ['50%', '42%'],
        avoidLabelOverlap: false,
        padAngle: 3,
        itemStyle: {
          borderRadius: 8
        },
        label: {
          show: false
        },
        emphasis: {
          label: {
            show: false
          },
          itemStyle: {
            shadowBlur: 12,
            shadowColor: 'rgba(0, 0, 0, 0.12)'
          }
        },
        labelLine: {
          show: false
        },
        data: chartData
      }
    ]
  }
}

// 刷新图表
const updateCategoryChart = () => {
  if (categoryChart) {
    categoryChart.setOption(getCategoryChartOption(), true)
  }
}

const handleTimeRangeChange = (val) => {
  if (trendChart) {
    trendChart.setOption(getTrendChartOption(val), true)
  }
}

const handleSearch = () => {
  // 仅在表格中筛选
}

const handleRefresh = () => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    ElMessage.success('平台交易概览数据同步成功')
    if (trendChart) trendChart.setOption(getTrendChartOption(timeRange.value), true)
    updateCategoryChart()
  }, 600)
}

const handleResize = () => {
  trendChart?.resize()
  categoryChart?.resize()
}

onMounted(() => {
  loading.value = true
  setTimeout(() => {
    loading.value = false
    
    // 初始化趋势图
    if (trendChartRef.value) {
      trendChart = echarts.init(trendChartRef.value)
      trendChart.setOption(getTrendChartOption(timeRange.value))
    }
    
    // 初始化占比图
    if (categoryChartRef.value) {
      categoryChart = echarts.init(categoryChartRef.value)
      categoryChart.setOption(getCategoryChartOption())
    }
    
    window.addEventListener('resize', handleResize)
  }, 100)
})

onUnmounted(() => {
  window.removeEventListener('resize', handleResize)
  trendChart?.dispose()
  categoryChart?.dispose()
})
</script>

<style scoped>
.home-container {
  width: 100%;
  padding: 20px 20px 24px 20px;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

/* 顶部 Dashboard 标头 */
.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 0;
}

.welcome-title {
  font-size: 22px;
  font-weight: 700;
  color: #0f172a;
  margin: 0;
}

.welcome-desc {
  font-size: 13px;
  color: #64748b;
  margin: 6px 0 0 0;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 12px;
}

.premium-radio-group :deep(.el-radio-button__inner) {
  border-radius: 8px !important;
  border: 1px solid #e2e8f0;
  box-shadow: none !important;
  margin: 0 2px;
  transition: all 0.2s ease;
}

.premium-radio-group :deep(.el-radio-button__original-radio:checked + .el-radio-button__inner) {
  background-color: #00a86b;
  border-color: #00a86b;
  color: #ffffff;
}

.header-refresh-btn {
  border-radius: 8px;
  font-weight: 500;
  transition: all 0.25s ease;
}

.header-refresh-btn:hover {
  transform: translateY(-1px);
}

/* 统计卡片布局 - 雅致商业白底风 */
.stat-row {
  margin: 0;
}
@media (max-width: 1200px) {
  .stat-row {
    margin-bottom: -12px;
  }
}

.stat-premium-card {
  position: relative;
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  background-color: #ffffff;
  padding: 20px 24px;
  color: #0f172a;
  overflow: hidden;
  min-height: 130px;
  box-sizing: border-box;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.02);
  margin-bottom: 0;
}
@media (max-width: 1200px) {
  .stat-premium-card {
    margin-bottom: 12px;
  }
}

.stat-premium-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.06);
}

.card-inner {
  position: relative;
  z-index: 2;
  height: 100%;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.stat-meta {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.stat-label {
  font-size: 13px;
  font-weight: 600;
  color: #64748b;
}

.stat-icon-wrapper {
  background: rgba(0, 168, 107, 0.08);
  color: #00a86b;
  width: 38px;
  height: 38px;
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
}

.stat-number {
  font-size: 28px;
  font-weight: 700;
  color: #0f172a;
  margin: 6px 0;
  letter-spacing: -0.5px;
  line-height: 1.2;
}

.currency-symbol {
  font-size: 18px;
  margin-right: 4px;
  font-weight: 600;
  color: #0f172a;
}

.unit-text {
  font-size: 14px;
  margin-left: 2px;
  font-weight: 500;
  color: #475569;
}

.stat-footer-info {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 12px;
}

.trend-tag {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px 6px;
  border-radius: 6px;
  font-weight: 700;
}

.trend-up {
  background-color: rgba(0, 168, 107, 0.08);
  color: #00a86b;
}

.trend-down {
  background-color: rgba(239, 68, 68, 0.08);
  color: #ef4444;
}

.trend-desc {
  color: #94a3b8;
}

/* ECharts 图表行 */
.chart-row {
  margin: 0 !important;
}
@media (max-width: 1200px) {
  .chart-row {
    margin-bottom: -12px !important;
  }
}

.chart-col {
  padding-left: 0 !important;
  padding-right: 0 !important;
  margin-bottom: 0;
}
@media (max-width: 1200px) {
  .chart-col {
    margin-bottom: 12px;
  }
}

@media (min-width: 1200px) {
  .chart-col:first-child {
    padding-right: 12px !important;
  }
  .chart-col:last-child {
    padding-left: 12px !important;
  }
}

.premium-chart-card {
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  background-color: #ffffff;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.02);
  height: 100%;
}

.chart-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 4px 0;
}

.chart-title-group {
  display: flex;
  align-items: center;
  gap: 8px;
}

.title-decorator {
  width: 4px;
  height: 16px;
  background: #00a86b;
  border-radius: 2px;
}

.chart-card-title {
  font-size: 15px;
  font-weight: 700;
  color: #1e293b;
}

.chart-legends-mock {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 11px;
  color: #64748b;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}
.dot-sales {
  background-color: #00a86b;
}
.dot-orders {
  background-color: #94a3b8;
}

.chart-container-wrapper {
  width: 100%;
  height: 320px;
  position: relative;
}

.chart-dom {
  width: 100%;
  height: 100%;
}

/* 商户表格样式美化 */
.table-premium-card {
  border-radius: 16px;
  border: 1px solid #f1f5f9;
  background-color: #ffffff;
  box-shadow: 0 4px 16px rgba(15, 23, 42, 0.02);
}

.table-card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
  padding: 4px 0;
}

.table-title-group h3 {
  margin: 0;
  font-size: 16px;
  color: #0f172a;
  font-weight: 700;
}

.table-title-group .sub-title {
  font-size: 12px;
  color: #94a3b8;
  display: block;
  margin-top: 4px;
}

.table-actions-group {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-input {
  width: 220px;
}

.search-input :deep(.el-input__wrapper) {
  border-radius: 8px;
}

.add-merchant-btn {
  border-radius: 8px;
  font-weight: 600;
  background-color: #00a86b;
  border-color: #00a86b;
}

.add-merchant-btn:hover {
  background-color: #059669;
  border-color: #059669;
}

/* 高级表格特定样式 */
.premium-table {
  border-radius: 8px;
  overflow: hidden;
}

.merchant-id-code {
  font-family: monospace;
  font-weight: 700;
  color: #64748b;
  font-size: 12px;
}

.merchant-profile-cell {
  display: flex;
  align-items: center;
  gap: 12px;
}

.merchant-logo-img {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  border: 1px solid #f1f5f9;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.04);
}

.logo-fallback-icon {
  width: 36px;
  height: 36px;
  border-radius: 10px;
  background-color: #f1f5f9;
  color: #94a3b8;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
}

.merchant-text-info {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.merchant-name-title {
  font-weight: 600;
  color: #1e293b;
  font-size: 14px;
}

.merchant-tag-sub {
  font-size: 11px;
  color: #94a3b8;
}

.contact-name-txt {
  font-weight: 500;
  color: #334155;
}

.phone-number-txt {
  color: #64748b;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 13px;
}

.sales-amount-txt {
  font-weight: 700;
  color: #0f172a;
  font-family: system-ui, -apple-system, sans-serif;
  font-size: 14px;
}

/* 表格内部状态指示器 */
.status-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
}

.dot-indicator {
  width: 6px;
  height: 6px;
  border-radius: 50%;
}

.dot-active {
  background-color: #10b981;
  box-shadow: 0 0 8px #10b981;
}

.dot-inactive {
  background-color: #ef4444;
  box-shadow: 0 0 8px #ef4444;
}

.status-label-txt {
  font-size: 13px;
  font-weight: 600;
}

.text-active {
  color: #10b981;
}

.text-inactive {
  color: #ef4444;
}

.table-action-btn {
  font-weight: 600;
  transition: all 0.2s ease;
}

.table-action-btn:hover {
  transform: scale(1.05);
}
</style>
