<script setup>
import { useRouter } from 'vue-router'

const props = defineProps({
  adoption: {
    type: Object,
    required: true
  }
})

const router = useRouter()

// 后端 status: pending(待领养) / approved(已领养) / rejected(已取消)
const statusMap = {
  pending:  { label: '待领养', class: 'status-pending' },
  approved: { label: '已领养', class: 'status-adopted' },
  rejected: { label: '已取消', class: 'status-rejected' }
}

// 费用类型
const feeMap = {
  free:       { label: '无偿', class: 'fee-free' },
  paid:       { label: '有偿', class: 'fee-paid' },
  negotiable: { label: '面议', class: 'fee-negotiable' }
}

const vaccineMap = {
  unvaccinated: { label: '未接种', class: 'vaccine-no' },
  one_dose:     { label: '1剂',   class: 'vaccine-partial' },
  two_doses:    { label: '2剂',   class: 'vaccine-partial' },
  three_doses:  { label: '3剂',   class: 'vaccine-partial' },
  completed:    { label: '已完成', class: 'vaccine-done' }
}

// 计算年龄
const calculateAge = (birthday) => {
  if (!birthday) return '未知'
  const birth = new Date(birthday)
  const now = new Date()
  const ageInMs = now - birth
  const ageInYears = Math.floor(ageInMs / (1000 * 60 * 60 * 24 * 365))
  const ageInMonths = Math.floor((ageInMs % (1000 * 60 * 60 * 24 * 365)) / (1000 * 60 * 60 * 24 * 30))
  if (ageInYears > 0) return `${ageInYears}岁${ageInMonths > 0 ? ageInMonths + '个月' : ''}`
  return `${ageInMonths}个月`
}

const getImageUrl = (path) => {
  if (!path || path === '图片链接') return 'https://via.placeholder.com/400x300?text=暂无图片'
  if (path.startsWith('http')) return path
  return `http://localhost:3000${path}`
}

const goDetail = () => {
  router.push(`/adopt/${props.adoption.id}`)
}

// 从嵌套结构中提取宠物信息
const pet = props.adoption.pet || {}
const user = props.adoption.user || {}
const publisherName = user.nickname || user.username || '匿名用户'
const location = props.adoption.request?.location || '地点未填写'
</script>

<template>
  <div class="adoption-card" @click="goDetail">
    <!-- 图片区域 -->
    <div class="card-image">
      <img :src="getImageUrl(pet.image)" :alt="pet.nickName" />
      <!-- 状态徽章 -->
      <span class="status-badge" :class="statusMap[adoption.status]?.class">
        {{ statusMap[adoption.status]?.label }}
      </span>
      <!-- 费用徽章 -->
      <span class="fee-badge" :class="feeMap[adoption.fee]?.class">
        {{ feeMap[adoption.fee]?.label }}
        <template v-if="adoption.fee === 'paid' && adoption.money">
          · ¥{{ adoption.money }}
        </template>
      </span>
    </div>

    <!-- 内容区域 -->
    <div class="card-body">
      <!-- 宠物名 + 性别 -->
      <div class="card-title-row">
        <h3 class="pet-name">{{ pet.nickName }}</h3>
        <span class="sex-icon" :class="pet.sex ? 'male' : 'female'">
          {{ pet.sex ? '♂' : '♀' }}
        </span>
      </div>

      <!-- 品种 + 年龄 + 疫苗 -->
      <div class="info-tags">
        <span class="info-tag breed">{{ pet.type }}</span>
        <span class="info-tag age">{{ pet.breed }}</span>
        <span class="info-tag age-val">{{ calculateAge(pet.birthday) }}</span>
        <span class="info-tag vaccine" :class="vaccineMap[pet.vaccineStatus]?.class">
          💉 {{ vaccineMap[pet.vaccineStatus]?.label }}
        </span>
      </div>

      <!-- 领养说明 -->
      <p class="reason-text">{{ adoption.other_msg || '暂无说明' }}</p>

      <!-- 底部：位置 + 发布者 -->
      <div class="card-footer">
        <span class="location">📍 {{ location }}</span>
        <span class="publisher">{{ publisherName }}</span>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.adoption-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  border: 1px solid #f0f0f0;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  flex-direction: column;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.14);

    .card-image img {
      transform: scale(1.05);
    }
  }
}

.card-image {
  position: relative;
  height: 200px;
  overflow: hidden;

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: transform 0.4s ease;
  }

  .status-badge {
    position: absolute;
    top: 12px;
    right: 12px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;

    &.status-pending  { background: rgba(22, 163, 74, 0.9);  color: white; }
    &.status-adopted  { background: rgba(107, 114, 128, 0.9); color: white; }
    &.status-rejected { background: rgba(239, 68, 68, 0.9);   color: white; }
  }

  .fee-badge {
    position: absolute;
    top: 12px;
    left: 12px;
    padding: 4px 10px;
    border-radius: 20px;
    font-size: 12px;
    font-weight: 600;

    &.fee-free       { background: rgba(255,255,255,0.92); color: #16a34a; }
    &.fee-paid       { background: rgba(249, 115, 22, 0.9); color: white; }
    &.fee-negotiable { background: rgba(255,255,255,0.92); color: #d97706; }
  }
}

.card-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
  flex: 1;
}

.card-title-row {
  display: flex;
  align-items: center;
  justify-content: space-between;

  .pet-name { font-size: 18px; font-weight: 700; color: #1f2937; margin: 0; }
  .sex-icon { font-size: 20px; font-weight: 700; &.male { color: #3b82f6; } &.female { color: #ec4899; } }
}

.info-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;

  .info-tag {
    padding: 3px 8px;
    border-radius: 8px;
    font-size: 11px;
    font-weight: 500;

    &.breed    { background: #eff6ff; color: #1d4ed8; }
    &.age      { background: #f0fdf4; color: #166534; }
    &.age-val  { background: #fef3c7; color: #92400e; }
    &.vaccine {
      &.vaccine-done    { background: #dcfce7; color: #166534; }
      &.vaccine-partial { background: #fef9c3; color: #854d0e; }
      &.vaccine-no      { background: #fee2e2; color: #991b1b; }
    }
  }
}

.reason-text {
  font-size: 13px;
  color: #6b7280;
  line-height: 1.5;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  flex: 1;
}

.card-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding-top: 10px;
  border-top: 1px solid #f3f4f6;
  margin-top: auto;

  .location  { font-size: 12px; color: #9ca3af; }
  .publisher { font-size: 12px; color: #f97316; font-weight: 500; }
}
</style>
