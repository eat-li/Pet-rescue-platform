<script setup>
import PageContainer from '../../components/Common/PageContainer.vue'
import Mypagination from '../../components/Common/Mypagination.vue'
import { Search, Delete, Refresh, View } from '@element-plus/icons-vue'
import { ref, onMounted } from 'vue'
import { ElMessage, ElMessageBox } from 'element-plus'
import { useBookingData } from '../../hooks/useBookingData'
import { formatImageUrl } from '../../utils/imgformat'

const {
  bookingData,
  pagination,
  loading,
  selectedRows,
  searchText,
  filterStatus,
  stats,
  bookingStatusMap,
  showBatchActions,
  fetchBookingList,
  fetchBookingDetail,
  fetchBookingStats,
  handleStatusChange,
  handleDelete,
  handleBatchDelete,
  handleSelectionChange,
  handleClearSelection,
  handleSearch,
  handleReset,
  handlePageChange
} = useBookingData()

// 详情弹窗
const showDetailDialog = ref(false)
const detailLoading = ref(false)
const currentBooking = ref(null)

// 取消原因弹窗
const showCancelDialog = ref(false)
const cancelReason = ref('')
const cancellingBooking = ref(null)

// 打开详情
const openDetail = async (row) => {
  showDetailDialog.value = true
  detailLoading.value = true
  
  try {
    const detail = await fetchBookingDetail(row.id)
    if (detail) {
      currentBooking.value = detail
    }
  } finally {
    detailLoading.value = false
  }
}

// 确认预约
const confirmBooking = async (row) => {
  await handleStatusChange(row, 'confirmed')
}

// 完成预约
const completeBooking = async (row) => {
  await handleStatusChange(row, 'completed')
}

// 打开取消弹窗
const openCancelDialog = (row) => {
  cancellingBooking.value = row
  cancelReason.value = ''
  showCancelDialog.value = true
}

// 确认取消
const confirmCancel = async () => {
  if (!cancelReason.value.trim()) {
    ElMessage.warning('请输入取消原因')
    return
  }
  
  const success = await handleStatusChange(cancellingBooking.value, 'cancelled', cancelReason.value)
  if (success) {
    showCancelDialog.value = false
    cancelReason.value = ''
    cancellingBooking.value = null
  }
}

// 组件挂载时获取数据
onMounted(() => {
  fetchBookingList()
  fetchBookingStats()
})
</script>

<template>
  <PageContainer title="预约管理">
    <template #extra>
      <div class="header-actions">
        <el-input
          v-model="searchText"
          placeholder="搜索用户名..."
          class="search-input"
          @keyup.enter="handleSearch"
        >
          <template #prefix>
            <el-icon class="search-icon"><Search /></el-icon>
          </template>
        </el-input>

        <el-select
          v-model="filterStatus"
          placeholder="预约状态"
          class="filter-select"
          clearable
          @change="handleSearch"
        >
          <el-option label="待确认" value="pending" />
          <el-option label="已确认" value="confirmed" />
          <el-option label="已完成" value="completed" />
          <el-option label="已取消" value="cancelled" />
        </el-select>

        <el-button type="info" class="reset-button" @click="handleReset">
          <el-icon><Refresh /></el-icon>重置
        </el-button>
      </div>
    </template>

    <template #content>
      <div class="booking-content">
        <!-- 统计卡片 -->
        <div class="stats-row">
          <div class="stat-card pending">
            <div class="stat-num">{{ stats.pending }}</div>
            <div class="stat-label">待确认</div>
          </div>
          <div class="stat-card confirmed">
            <div class="stat-num">{{ stats.confirmed }}</div>
            <div class="stat-label">已确认</div>
          </div>
          <div class="stat-card completed">
            <div class="stat-num">{{ stats.completed }}</div>
            <div class="stat-label">已完成</div>
          </div>
          <div class="stat-card cancelled">
            <div class="stat-num">{{ stats.cancelled }}</div>
            <div class="stat-label">已取消</div>
          </div>
          <div class="stat-card total">
            <div class="stat-num">{{ stats.total }}</div>
            <div class="stat-label">共计</div>
          </div>
        </div>

        <!-- 批量操作栏 -->
        <div v-if="showBatchActions" class="batch-actions">
          <div class="batch-info">
            <span>已选中 <strong>{{ selectedRows.length }}</strong> 条记录</span>
          </div>
          <div class="batch-buttons">
            <el-button size="small" @click="handleClearSelection">取消选择</el-button>
            <el-button size="small" type="danger" @click="handleBatchDelete">
              <el-icon color="red"><Delete /></el-icon>批量删除
            </el-button>
          </div>
        </div>

        <div class="table-container">
          <el-table
            :data="bookingData"
            v-loading="loading"
            style="width: 100%"
            stripe
            :border="false"
            @selection-change="handleSelectionChange"
            height="460"
          >
            <!-- 选择 -->
            <el-table-column type="selection" width="50" fixed />

            <!-- 用户信息 -->
            <el-table-column label="预约用户" width="150" align="center">
              <template #default="{ row }">
                <div class="user-cell">
                  <el-avatar :src="formatImageUrl(row.user?.avatar)" :size="32" />
                  <span class="username">{{ row.user?.nickname || row.user?.username || '-' }}</span>
                </div>
              </template>
            </el-table-column>

            <!-- 服务信息 -->
            <el-table-column label="预约服务" width="150" align="center">
              <template #default="{ row }">
                <span class="service-name">{{ row.service?.name || '-' }}</span>
              </template>
            </el-table-column>

            <!-- 宠物信息 -->
            <el-table-column label="宠物信息" width="150" align="center">
              <template #default="{ row }">
                <div class="pet-info">
                  <div>{{ row.petName }}</div>
                  <div class="pet-weight">{{ row.petWeight }}kg</div>
                </div>
              </template>
            </el-table-column>

            <!-- 预约时间 -->
            <el-table-column label="预约时间" width="180" align="center">
              <template #default="{ row }">
                <div class="time-info">
                  <div>{{ row.appointmentDate }}</div>
                  <div class="time-slot">{{ row.appointmentTime }}</div>
                </div>
              </template>
            </el-table-column>

            <!-- 价格 -->
            <el-table-column label="总价" width="100" align="center">
              <template #default="{ row }">
                <span class="price-text">¥{{ row.total_price }}</span>
              </template>
            </el-table-column>

            <!-- 联系方式 -->
            <el-table-column prop="contact" label="联系方式" width="120" align="center" />

            <!-- 状态 -->
            <el-table-column label="状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag
                  :type="bookingStatusMap[row.status]?.type"
                  effect="light"
                  size="small"
                >
                  {{ bookingStatusMap[row.status]?.label }}
                </el-tag>
              </template>
            </el-table-column>

            <!-- 预约时间 -->
            <el-table-column prop="createdAt" label="下单时间" width="180" align="center" />

            <!-- 操作 -->
            <el-table-column label="操作" width="160" fixed="right" align="center">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button size="small" plain @click="openDetail(row)">
                    <el-icon><View /></el-icon>
                  </el-button>
                  <el-button
                    v-if="row.status === 'pending'"
                    size="small"
                    type="primary"
                    plain
                    @click="confirmBooking(row)"
                  >
                    确认
                  </el-button>
                  <el-button
                    v-if="row.status === 'confirmed'"
                    size="small"
                    type="success"
                    plain
                    @click="completeBooking(row)"
                  >
                    完成
                  </el-button>
                  <el-button
                    v-if="row.status === 'pending' || row.status === 'confirmed'"
                    size="small"
                    type="warning"
                    plain
                    @click="openCancelDialog(row)"
                  >
                    取消
                  </el-button>
                  <el-button size="small" type="danger" plain @click="handleDelete(row)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <!-- 分页 -->
          <Mypagination
            :current-page="pagination.currentPage"
            :page-size="pagination.pageSize"
            :total-items="pagination.totalItems"
            @page-change="handlePageChange"
          />
        </div>

        <!-- 详情弹窗 -->
        <el-dialog
          v-model="showDetailDialog"
          title="预约详情"
          width="600"
          align-center
        >
          <div v-if="currentBooking" v-loading="detailLoading" class="detail-content">
            <el-descriptions :column="2" border>
              <el-descriptions-item label="预约用户" :span="2">
                <div class="detail-user">
                  <el-avatar :src="formatImageUrl(currentBooking.user?.avatar)" :size="40" />
                  <span>{{ currentBooking.user?.nickname || currentBooking.user?.username }}</span>
                </div>
              </el-descriptions-item>
              
              <el-descriptions-item label="预约服务" :span="2">
                {{ currentBooking.service?.name }}
              </el-descriptions-item>
              
              <el-descriptions-item label="服务类型">
                {{ currentBooking.service?.type }}
              </el-descriptions-item>
              
              <el-descriptions-item label="服务价格">
                ¥{{ currentBooking.service?.price }}
              </el-descriptions-item>
              
              <el-descriptions-item label="宠物名称">
                {{ currentBooking.petName }}
              </el-descriptions-item>
              
              <el-descriptions-item label="宠物体重">
                {{ currentBooking.petWeight }}kg
              </el-descriptions-item>
              
              <el-descriptions-item label="预约日期">
                {{ currentBooking.appointmentDate }}
              </el-descriptions-item>
              
              <el-descriptions-item label="预约时段">
                {{ currentBooking.appointmentTime }}
              </el-descriptions-item>
              
              <el-descriptions-item label="联系方式" :span="2">
                {{ currentBooking.contact }}
              </el-descriptions-item>
              
              <el-descriptions-item label="订单总价">
                <span class="detail-price">¥{{ currentBooking.total_price }}</span>
              </el-descriptions-item>
              
              <el-descriptions-item label="订单状态">
                <el-tag :type="bookingStatusMap[currentBooking.status]?.type">
                  {{ bookingStatusMap[currentBooking.status]?.label }}
                </el-tag>
              </el-descriptions-item>
              
              <el-descriptions-item v-if="currentBooking.notes" label="用户备注" :span="2">
                {{ currentBooking.notes }}
              </el-descriptions-item>
              
              <el-descriptions-item v-if="currentBooking.cancelReason" label="取消原因" :span="2">
                <span style="color: #f56c6c;">{{ currentBooking.cancelReason }}</span>
              </el-descriptions-item>
              
              <el-descriptions-item label="下单时间">
                {{ currentBooking.createdAt }}
              </el-descriptions-item>
              
              <el-descriptions-item label="更新时间">
                {{ currentBooking.updatedAt }}
              </el-descriptions-item>
            </el-descriptions>
          </div>

          <template #footer>
            <div class="dialog-footer">
              <el-button @click="showDetailDialog = false">关闭</el-button>
            </div>
          </template>
        </el-dialog>

        <!-- 取消原因弹窗 -->
        <el-dialog
          v-model="showCancelDialog"
          title="取消预约"
          width="400"
          align-center
        >
          <el-form>
            <el-form-item label="取消原因" required>
              <el-input
                v-model="cancelReason"
                type="textarea"
                :rows="3"
                placeholder="请输入取消原因"
              />
            </el-form-item>
          </el-form>

          <template #footer>
            <div class="dialog-footer">
              <el-button @click="showCancelDialog = false">取消</el-button>
              <el-button type="danger" @click="confirmCancel">确认取消</el-button>
            </div>
          </template>
        </el-dialog>
      </div>
    </template>
  </PageContainer>
</template>

<style scoped lang="scss">
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.search-input {
  width: 220px;
  height: 40px;

  :deep(.el-input__wrapper) {
    background-color: #f8f9fa;
    border: 1px solid #e9ecef;
    border-radius: 8px;
    box-shadow: none;
    padding: 0 12px;
    height: 40px;
    transition: all 0.2s ease;

    &:hover { border-color: #d0d7de; }
    &.is-focus {
      border-color: #0969da;
      background-color: #fff;
      box-shadow: 0 0 0 3px rgba(9, 105, 218, 0.1);
    }
  }
}

.search-icon { color: #656d76; font-size: 16px; }

.filter-select {
  width: 130px;
  :deep(.el-input__wrapper) {
    border-radius: 8px;
    height: 40px;
    box-shadow: none;
    border: 1px solid #e9ecef;
    background: #f8f9fa;
    &:hover { border-color: #d0d7de; }
  }
}

.reset-button {
  background: #fff;
  border: 1px solid #d0d7de;
  color: #2563EB;
  border-radius: 6px;
  padding: 0 16px;
  height: 40px;
  font-size: 14px;
  font-weight: 500;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;

  &:hover { background: #1F2937; border-color: #d0d7de; color: #fff; }
}

/* 统计卡片 */
.stats-row {
  display: flex;
  gap: 12px;
  margin-bottom: 16px;
}

.stat-card {
  flex: 1;
  background: white;
  border-radius: 10px;
  padding: 14px 16px;
  text-align: center;
  border: 1px solid #f0f0f0;
  box-shadow: 0 1px 4px rgba(0,0,0,0.06);

  .stat-num {
    font-size: 26px;
    font-weight: 700;
    line-height: 1;
    margin-bottom: 4px;
  }

  .stat-label {
    font-size: 12px;
    color: #9ca3af;
  }

  &.pending  { .stat-num { color: #f59e0b; } border-top: 3px solid #f59e0b; }
  &.confirmed { .stat-num { color: #3b82f6; } border-top: 3px solid #3b82f6; }
  &.completed { .stat-num { color: #16a34a; } border-top: 3px solid #16a34a; }
  &.cancelled { .stat-num { color: #ef4444; } border-top: 3px solid #ef4444; }
  &.total    { .stat-num { color: #8470FF; } border-top: 3px solid #8470FF; }
}

.batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px 16px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
}

.batch-info {
  color: #495057;
  font-size: 14px;
  strong { color: #8470FF; font-weight: 600; }
}

.batch-buttons {
  display: flex;
  gap: 8px;
  .el-button { border-radius: 6px; }
}

.table-container {
  background: white;
  border-radius: 8px;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  border: 1px solid #f0f0f0;
}

.user-cell {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  
  .username {
    font-size: 12px;
    color: #6b7280;
  }
}

.service-name {
  font-weight: 500;
  color: #374151;
}

.pet-info {
  .pet-weight {
    font-size: 12px;
    color: #9ca3af;
  }
}

.time-info {
  .time-slot {
    font-size: 12px;
    color: #8470FF;
    font-weight: 500;
  }
}

.price-text {
  color: #f97316;
  font-weight: 600;
}

.action-buttons {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 4px;
  justify-items: center;

  .el-button {
    width: 100%;
    margin: 0 !important;
  }
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.detail-content {
  .detail-user {
    display: flex;
    align-items: center;
    gap: 8px;
  }
  
  .detail-price {
    color: #f97316;
    font-weight: 600;
    font-size: 16px;
  }
}

:deep(.el-table) {
  border: none;
  .el-table__inner-wrapper::before,
  .el-table__inner-wrapper::after { display: none; }
  th, td { border: none !important; }
}

:deep(.el-table .el-button) {
  border-radius: 8px;
  transition: all 0.2s ease;
  &.el-button--small { border-radius: 6px; }
}

:deep(.el-pagination) {
  display: flex;
  justify-content: center;
  margin-top: 20px;
}
</style>
