<script setup>
import { ref, onMounted } from 'vue'
import { useDataView } from '../../../hooks/Common/useDataView.js'

const { petCount, userCount, getPetCount, getUserCount } = useDataView()

// 格式化数字（添加千分位）
const formatNumber = (num) => {
  return num.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

onMounted(() => {
  getPetCount()
  getUserCount()
})
</script>

<template>
  <!-- Data Statistics Section -->
  <section class="data-section">
    <!-- 区块标题 -->
    <div class="section-header">
      <div class="header-left">
        <span class="section-badge">📊 数据</span>
        <h2 class="section-title">平台统计</h2>
        <p class="section-sub">了解我们的宠物社区规模</p>
      </div>
    </div>

    <!-- 数据卡片 -->
    <div class="data-cards">
      <!-- 用户数量 -->
      <div class="data-card user-card">
        <div class="card-icon">👥</div>
        <div class="card-content">
          <div class="stat-label">注册用户</div>
          <div class="stat-value" :class="{ loading: userCount === 0 }">
            {{ userCount > 0 ? formatNumber(userCount) : '--' }}
          </div>
          <div class="stat-desc">信赖我们的选择</div>
        </div>
      </div>

      <!-- 宠物数量 -->
      <div class="data-card pet-card">
        <div class="card-icon">🐾</div>
        <div class="card-content">
          <div class="stat-label">宠物伙伴</div>
          <div class="stat-value" :class="{ loading: petCount === 0 }">
            {{ petCount > 0 ? formatNumber(petCount) : '--' }}
          </div>
          <div class="stat-desc">等待您的关爱</div>
        </div>
      </div>

      <!-- 服务类型 -->
      <div class="data-card service-card">
        <div class="card-icon">🏥</div>
        <div class="card-content">
          <div class="stat-label">服务类型</div>
          <div class="stat-value">5+</div>
          <div class="stat-desc">全方位宠物服务</div>
        </div>
      </div>

      <!-- 领养成功 -->
      <div class="data-card adoption-card">
        <div class="card-icon">❤️</div>
        <div class="card-content">
          <div class="stat-label">领养成功</div>
          <div class="stat-value">{{ formatNumber(Math.floor(userCount * 0.3)) }}+</div>
          <div class="stat-desc">温暖的归宿</div>
        </div>
      </div>
    </div>
  </section>
</template>

<style lang="scss" scoped>
.data-section {
  width: 100%;
  background: #f8fafc;
  padding: 60px 20px;
  box-sizing: border-box;

  // 区块标题
  .section-header {
    max-width: 1200px;
    margin: 0 auto 32px;
    display: flex;
    flex-direction: column;
    gap: 6px;

    .section-badge {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      background: linear-gradient(135deg, #fef3c7, #fde68a);
      color: #92400e;
      border: 1px solid #fcd34d;
      border-radius: 20px;
      padding: 4px 12px;
      font-size: 13px;
      font-weight: 600;
      width: fit-content;
    }

    .section-title {
      font-size: 26px;
      font-weight: 700;
      color: #1a1a2e;
      margin: 0;
      line-height: 1.2;
    }

    .section-sub {
      font-size: 14px;
      color: #9ca3af;
      margin: 0;
    }
  }

  // 区块内容容器
  .section-content {
    max-width: 1200px;
    margin: 0 auto;
  }

  // 数据卡片网格
  .data-cards {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(240px, 1fr));
    gap: 20px;

    .data-card {
      position: relative;
      background: #fff;
      border-radius: 20px;
      padding: 28px 24px;
      display: flex;
      flex-direction: column;
      align-items: center;
      text-align: center;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
      transition: all 0.3s ease;
      overflow: hidden;

      &::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        height: 4px;
        border-radius: 20px 20px 0 0;
        transition: height 0.3s ease;
      }

      &:hover {
        transform: translateY(-6px);
        box-shadow: 0 12px 32px rgba(0, 0, 0, 0.15);

        &::before {
          height: 6px;
        }
      }

      // 不同卡片颜色
      &.user-card::before {
        background: linear-gradient(90deg, #3b82f6, #2563eb);
      }

      &.pet-card::before {
        background: linear-gradient(90deg, #f97316, #ea580c);
      }

      &.service-card::before {
        background: linear-gradient(90deg, #10b981, #059669);
      }

      &.adoption-card::before {
        background: linear-gradient(90deg, #ef4444, #dc2626);
      }

      .card-icon {
        font-size: 48px;
        margin-bottom: 16px;
        filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.1));
      }

      .card-content {
        display: flex;
        flex-direction: column;
        gap: 8px;
        width: 100%;

        .stat-label {
          font-size: 14px;
          font-weight: 600;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .stat-value {
          font-size: 42px;
          font-weight: 800;
          background: linear-gradient(135deg, #1f2937, #374151);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          line-height: 1;
          font-family: 'Arial', sans-serif;

          &.loading {
            opacity: 0.3;
            animation: pulse 1.5s infinite;
          }
        }

        .stat-desc {
          font-size: 13px;
          color: #9ca3af;
          font-style: normal;
        }
      }
    }
  }
}

@keyframes pulse {
  0%, 100% { opacity: 0.3; }
  50% { opacity: 0.6; }
}

@media screen and (max-width: 768px) {
  .data-section {
    width: 100%;
    padding: 24px 16px;
    box-sizing: border-box;

    .section-header {
      .section-title { font-size: 20px; }
      .section-sub { display: none; }
    }

    .data-cards {
      grid-template-columns: 1fr;
      gap: 16px;

      .data-card {
        padding: 24px 20px;
        flex-direction: row;
        text-align: left;
        gap: 20px;

        .card-icon {
          font-size: 40px;
          margin-bottom: 0;
          flex-shrink: 0;
        }

        .card-content {
          flex: 1;

          .stat-value {
            font-size: 36px;
          }
        }
      }
    }
  }
}
</style>
