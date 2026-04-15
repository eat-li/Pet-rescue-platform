<script setup>
import { ref } from 'vue'

// 使用指南数据
const guideList = ref([
  {
    id: 1,
    question: '如何注册账号？',
    answer: '点击右上角的“登录/注册”按钮，进入注册页面后填写用户名、密码等信息即可完成注册。注册后可以完善个人资料，上传头像。'
  },
  {
    id: 2,
    question: '如何浏览和领养宠物？',
    answer: '在首页点击“宠物领养”或直接访问领养社区，浏览待领养的宠物信息。看到心仪的宠物可以点击详情页查看详细信息，然后提交领养申请，等待管理员审核。'
  },
  {
    id: 3,
    question: '如何使用宠物服务？',
    answer: '访问“宠物服务”页面，可以看到各种服务类型（如美容、医疗、寄养等）。选择需要的服务查看详情，添加到购物车后统一结算预约时间。'
  },
  {
    id: 4,
    question: '如何发布帖子？',
    answer: '进入“宠物社区”后点击“发布帖子”按钮，选择帖子类型（宠物日常/求助问题/经验分享），填写标题和内容，可以上传图片，然后点击发布即可。'
  },
  {
    id: 5,
    question: '如何管理购物车和预约？',
    answer: '点击个人中心，选择“我的购物车”查看已添加的服务。确认无误后可以批量删除或结算。在“我的预约”中可以查看所有预约记录及其状态。'
  },
  {
    id: 6,
    question: '如何获取系统通知？',
    answer: '系统会在顶部导航栏显示通知图标，有未读通知时会有红点提示。点击通知图标可以查看系统公告、领养申请结果、预约提醒等重要信息。'
  }
])

// 当前展开的问题索引
const activeIndex = ref(null)
</script>

<template>
  <!-- Usage Guide Section -->
  <section class="guide-section">
    <!-- 区块标题 -->
    <div class="section-header">
      <div class="header-left">
        <span class="section-badge">📖 使用指南</span>
        <h2 class="section-title">快速上手</h2>
        <p class="section-sub">了解如何使用宠物服务平台的各项功能</p>
      </div>
    </div>

    <div class="guide-container">
      <!-- 左侧插图 -->
      <div class="guide-image">
        <div class="image-wrapper">
          <img src="@/assets/question.png" alt="使用指南插图" />
          <div class="image-overlay">
            <div class="overlay-content">
              <div class="icon-box">🐾</div>
              <p>开启您的<br/>宠物生活之旅</p>
            </div>
          </div>
        </div>
      </div>

      <!-- 右侧问答列表 -->
      <div class="guide-list">
        <div
          v-for="(item, index) in guideList"
          :key="item.id"
          class="guide-item"
          :class="{ active: activeIndex === index }"
          @click="activeIndex = activeIndex === index ? null : index"
        >
          <div class="guide-question">
            <span class="question-number">{{ String(item.id).padStart(2, '0') }}</span>
            <span class="question-text">{{ item.question }}</span>
            <svg class="expand-icon" width="20" height="20" viewBox="0 0 24 24" fill="none">
              <path d="M6 9L12 15L18 9" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </div>
          <div class="guide-answer">
            {{ item.answer }}
          </div>
        </div>
      </div>
    </div>
  </section>
</template>


<style lang="scss" scoped>
.guide-section {
  width: 100%;
  background: #ffffff;
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
      background: linear-gradient(135deg, #dbeafe, #bfdbfe);
      color: #2563eb;
      border: 1px solid #bfdbfe;
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

  // 主体容器
  .guide-container {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1fr 1.2fr;
    gap: 32px;
    align-items: stretch;

    // 左侧插图
    .guide-image {
      position: relative;

      .image-wrapper {
        position: relative;
        height: 100%;
        min-height: 400px;
        border-radius: 24px;
        overflow: hidden;
        box-shadow: 0 8px 32px rgba(37, 99, 235, 0.15);

        img {
          width: 100%;
          height: 100%;
          object-fit: cover;
          transition: transform 0.5s ease;
        }

        &:hover img {
          transform: scale(1.05);
        }

        // 遮罩层
        .image-overlay {
          position: absolute;
          inset: 0;
          background: linear-gradient(
            to bottom,
            rgba(37, 99, 235, 0.1) 0%,
            rgba(37, 99, 235, 0.3) 50%,
            rgba(37, 99, 235, 0.7) 100%
          );
          display: flex;
          align-items: center;
          justify-content: center;

          .overlay-content {
            text-align: center;
            color: #fff;

            .icon-box {
              font-size: 64px;
              margin-bottom: 16px;
              filter: drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2));
            }

            p {
              font-size: 20px;
              font-weight: 600;
              line-height: 1.4;
              text-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
            }
          }
        }
      }
    }

    // 右侧问答列表
    .guide-list {
      display: flex;
      flex-direction: column;
      gap: 12px;

      .guide-item {
        background: #fff;
        border-radius: 16px;
        overflow: hidden;
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
        transition: all 0.3s ease;
        border: 1.5px solid transparent;
        cursor: pointer;

        &:hover {
          box-shadow: 0 4px 16px rgba(37, 99, 235, 0.15);
          transform: translateY(-2px);
        }

        &.active {
          border-color: #2563eb;
          box-shadow: 0 6px 24px rgba(37, 99, 235, 0.2);
        }

        // 问题部分
        .guide-question {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 18px 20px;
          background: #fff;
          transition: background 0.3s ease;

          .active & {
            background: linear-gradient(135deg, #eff6ff, #dbeafe);
          }

          .question-number {
            font-size: 14px;
            font-weight: 700;
            color: #2563eb;
            background: linear-gradient(135deg, #dbeafe, #bfdbfe);
            padding: 4px 10px;
            border-radius: 12px;
            flex-shrink: 0;
          }

          .question-text {
            flex: 1;
            font-size: 15px;
            font-weight: 600;
            color: #1f2937;
            line-height: 1.4;
          }

          .expand-icon {
            flex-shrink: 0;
            color: #9ca3af;
            transition: transform 0.3s ease, color 0.3s ease;
          }

          &.active .expand-icon {
            transform: rotate(180deg);
            color: #2563eb;
          }
        }

        // 答案部分
        .guide-answer {
          max-height: 0;
          overflow: hidden;
          padding: 0 20px;
          background: #f9fafb;
          color: #4b5563;
          font-size: 14px;
          line-height: 1.6;
          transition: max-height 0.4s ease, padding 0.4s ease;
          border-top: 1px solid transparent;
        }

        &.active .guide-answer {
          max-height: 200px;
          padding: 16px 20px;
          border-top-color: #e5e7eb;
        }
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .guide-section {
    width: 100%;
    padding: 24px 16px;
    box-sizing: border-box;

    .section-header {
      .section-title { font-size: 20px; }
      .section-sub { display: none; }
    }

    .guide-container {
      grid-template-columns: 1fr;
      gap: 24px;

      .guide-image {
        .image-wrapper {
          min-height: 240px;

          .overlay-content {
            .icon-box { font-size: 48px; }
            p { font-size: 16px; }
          }
        }
      }

      .guide-list {
        .guide-item {
          .guide-question {
            padding: 14px 16px;

            .question-number { font-size: 12px; padding: 3px 8px; }
            .question-text { font-size: 14px; }
          }

          .guide-answer {
            font-size: 13px;
            padding: 12px 16px;
          }
        }
      }
    }
  }
}
</style>