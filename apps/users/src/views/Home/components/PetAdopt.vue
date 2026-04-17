<script setup>
import { ref, onMounted, inject, watch } from 'vue'
import { useRouter } from 'vue-router'
import AdoptionCard from '../../Adoption/Posts/AdoptionCard.vue'
import { getAdoptionListAPI } from '@/api/adoption'

const router = useRouter()

// 尝试从父组件获取共享数据
const homeData = inject('homeData', null)

const adoptionList = ref([])
const loading = ref(false)

const fetchAdoptions = async () => {
  // 如果父组件已提供数据，直接使用
  if (homeData && homeData.adoptions && homeData.adoptions.length > 0) {
    adoptionList.value = homeData.adoptions
    return
  }
  
  // 兼容独立使用的情况，自己请求数据
  try {
    loading.value = true
    const result = await getAdoptionListAPI({ page: 1, limit: 4, status: 'pending' })
    adoptionList.value = result?.adoptions || []
  } catch {
    adoptionList.value = []
  } finally {
    loading.value = false
  }
}

// 监听父组件数据变化
watch(
  () => homeData?.adoptions,
  (newAdoptions) => {
    if (newAdoptions && newAdoptions.length > 0) {
      adoptionList.value = newAdoptions
      loading.value = false
    }
  },
  { immediate: true }
)

onMounted(() => {
  // 如果父组件没有提供数据，自己请求
  if (!homeData || !homeData.adoptions || homeData.adoptions.length === 0) {
    fetchAdoptions()
  }
})
</script>

<template>
  <section class="adopt-section">
    <!-- 区块标题 -->
    <div class="section-header">
      <div class="header-left">
        <div class="section-badge">宠物领养</div>
        <h2 class="section-title">等待一个温暖的家</h2>
        <p class="section-sub">每一个毛孩子都值得被爱，给它们一个幸福的归宿</p>
      </div>
      <button class="view-all-btn" @click="router.push('/adopt')">
        查看全部 →
      </button>
    </div>

    <!-- 加载骨架 -->
    <div v-if="loading" class="cards-grid">
      <div v-for="i in 4" :key="i" class="skeleton-card">
        <div class="skeleton-img"></div>
        <div class="skeleton-body">
          <div class="skeleton-line wide"></div>
          <div class="skeleton-line"></div>
          <div class="skeleton-line short"></div>
        </div>
      </div>
    </div>

    <!-- 卡片列表 -->
    <div v-else-if="adoptionList.length > 0" class="cards-grid">
      <AdoptionCard
        v-for="item in adoptionList"
        :key="item.id"
        :adoption="item"
      />
    </div>

    <!-- 空状态 -->
    <div v-else class="empty-state">
      <span>🐾</span>
      <p>暂无待领养宠物，请稍后再来</p>
    </div>

    <!-- 底部按钮 -->
    <div class="section-footer">
      <button class="cta-btn" @click="router.push('/adopt')">
        🐾 查看更多领养信息
      </button>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.adopt-section {
  background: #fef7f0;
  padding: 60px 20px;
  width: 100%;
  box-sizing: border-box;
}

// ── 标题区域 ──────────────────────────────────────────────
.section-header {
  max-width: 1200px;
  margin: 0 auto 36px;
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 16px;
}

.header-left { flex: 1; min-width: 0; }

.section-badge {
  display: inline-block;
  padding: 4px 14px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: white;
  border-radius: 20px;
  font-size: 12px;
  font-weight: 600;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}

.section-title {
  font-size: 28px;
  font-weight: 800;
  color: #1a1a2e;
  margin: 0 0 8px;
  line-height: 1.3;
}

.section-sub {
  font-size: 14px;
  color: #9ca3af;
  margin: 0;
  line-height: 1.6;
}

.view-all-btn {
  padding: 10px 22px;
  background: white;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  color: #6b7280;
  cursor: pointer;
  font-weight: 500;
  white-space: nowrap;
  transition: all 0.2s;
  flex-shrink: 0;

  &:hover {
    border-color: #f97316;
    color: #f97316;
    background: #fff7ed;
  }
}

// ── 卡片网格 ──────────────────────────────────────────────
.cards-grid {
  max-width: 1200px;
  margin: 0 auto;
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;

  @media (max-width: 1024px) { grid-template-columns: repeat(2, 1fr); }
  @media (max-width: 600px)  { grid-template-columns: 1fr; }
}

// ── 骨架屏 ──────────────────────────────────────────────
.skeleton-card {
  background: white;
  border-radius: 16px;
  overflow: hidden;
  border: 1px solid #f0f0f0;
}

.skeleton-img {
  height: 200px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
}

.skeleton-body {
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.skeleton-line {
  height: 12px;
  border-radius: 6px;
  background: linear-gradient(90deg, #f0f0f0 25%, #e8e8e8 50%, #f0f0f0 75%);
  background-size: 200% 100%;
  animation: shimmer 1.5s infinite;
  width: 60%;

  &.wide  { width: 80%; }
  &.short { width: 40%; }
}

@keyframes shimmer {
  0%   { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}

// ── 空状态 ──────────────────────────────────────────────
.empty-state {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 60px 20px;
  span { font-size: 40px; }
  p { font-size: 14px; color: #9ca3af; margin: 12px 0 0; }
}

// ── 底部 CTA ──────────────────────────────────────────────
.section-footer {
  max-width: 1200px;
  margin: 32px auto 0;
  display: flex;
  justify-content: center;
}

.cta-btn {
  padding: 14px 40px;
  background: linear-gradient(135deg, #f97316, #ea580c);
  color: white;
  border: none;
  border-radius: 12px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 16px rgba(249, 115, 22, 0.3);

  &:hover {
    background: linear-gradient(135deg, #ea6c0a, #dc4e0a);
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(249, 115, 22, 0.4);
  }
}

@media (max-width: 640px) {
  .adopt-section { padding: 40px 16px; }
  .section-title { font-size: 22px; }
  .section-header { flex-direction: column; align-items: flex-start; }
  .view-all-btn { align-self: flex-start; }
}
</style>
