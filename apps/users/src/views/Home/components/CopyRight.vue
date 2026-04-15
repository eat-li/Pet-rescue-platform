<script setup>
import { ref } from 'vue'

const currentYear = new Date().getFullYear()
</script>

<template>
  <footer class="copyright-footer">
    <div class="footer-content">
      <!-- 左侧 Logo 和标题 -->
      <div class="footer-left">
        <div class="logo-box">
          <svg width="40" height="40" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill-rule="evenodd"
            clip-rule="evenodd" class="fill-current">
            <path
              d="M22.672 15.226l-2.432.811.841 2.515c.33 1.019-.209 2.127-1.23 2.456-1.15.325-2.148-.321-2.463-1.226l-.84-2.518-5.013 1.677.84 2.517c.391 1.203-.434 2.542-1.831 2.542-.88 0-1.601-.564-1.86-1.314l-.842-2.516-2.431.809c-1.135.328-2.145-.317-2.463-1.229-.329-1.018.211-2.127 1.231-2.456l2.432-.809-1.621-4.823-2.432.808c-1.355.384-2.558-.59-2.558-1.839 0-.817.509-1.582 1.327-1.846l2.433-.809-.842-2.515c-.33-1.02.211-2.129 1.232-2.458 1.02-.329 2.13.209 2.461 1.229l.842 2.515 5.011-1.677-.839-2.517c-.403-1.238.484-2.553 1.843-2.553.819 0 1.585.509 1.85 1.326l.841 2.517 2.431-.81c1.02-.33 2.131.211 2.461 1.229.332 1.018-.21 2.126-1.23 2.456l-2.433.809 1.622 4.823 2.433-.809c1.242-.401 2.557.484 2.557 1.838 0 .819-.51 1.583-1.328 1.847m-8.992-6.428l-5.01 1.675 1.619 4.828 5.011-1.674-1.62-4.829z">
            </path>
          </svg>
        </div>
        <div class="footer-info">
          <h3 class="school-name">成都锦城学院</h3>
          <p class="project-title">毕业设计 · 宠物综合服务平台</p>
          <p class="author-info">作者：李鑫杰 | 专业：计算机科学与技术</p>
        </div>
      </div>

      <!-- 右侧链接 -->
      <div class="footer-right">
        <nav class="footer-nav">
          <h6 class="nav-title">平台功能</h6>
          <router-link to="/pets">宠物领养</router-link>
          <router-link to="/service">宠物服务</router-link>
          <router-link to="/posts">宠物社区</router-link>
          <router-link to="/adopt">领养中心</router-link>
        </nav>

        <nav class="footer-nav">
          <h6 class="nav-title">个人中心</h6>
          <router-link to="/profile/cart">购物车</router-link>
          <router-link to="/profile/record">我的记录</router-link>
          <router-link to="/profile/settings">个人设置</router-link>
        </nav>

        <nav class="footer-nav">
          <h6 class="nav-title">联系方式</h6>
          <a href="mailto:contact@petplatform.com">联系我们</a>
          <a href="#">帮助中心</a>
          <a href="#">隐私政策</a>
        </nav>
      </div>
    </div>

    <!-- 底部版权信息 -->
    <div class="footer-bottom">
      <p>© {{ currentYear }} 成都锦城学院 - 计算机科学与技术系 | 毕业设计作品</p>
      <p>Powered by Vue 3 + Express + MySQL | Built with ❤️ for Pets</p>
    </div>
  </footer>
</template>

<style lang="scss" scoped>
.copyright-footer {
  background: linear-gradient(135deg, #f1f5f9 0%, #e8eef5 100%);
  padding: 48px 20px 24px;
  width: 100%;
  box-sizing: border-box;

  .footer-content {
    max-width: 1200px;
    margin: 0 auto;
    display: grid;
    grid-template-columns: 1.2fr 1fr;
    gap: 48px;
    margin-bottom: 32px;

    // 左侧信息
    .footer-left {
      display: flex;
      gap: 20px;
      align-items: flex-start;

      .logo-box {
        flex-shrink: 0;
        width: 60px;
        height: 60px;
        background: linear-gradient(135deg, #f97316, #ea580c);
        border-radius: 16px;
        display: flex;
        align-items: center;
        justify-content: center;
        box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);

        svg {
          fill: #fff;
          width: 32px;
          height: 32px;
        }
      }

      .footer-info {
        .school-name {
          font-size: 20px;
          font-weight: 700;
          color: #1e293b;
          margin: 0 0 8px 0;
        }

        .project-title {
          font-size: 15px;
          color: #64748b;
          margin: 0 0 6px 0;
          font-weight: 500;
        }

        .author-info {
          font-size: 14px;
          color: #94a3b8;
          margin: 0;
        }
      }
    }

    // 右侧链接
    .footer-right {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 24px;

      .footer-nav {
        display: flex;
        flex-direction: column;
        gap: 10px;

        .nav-title {
          font-size: 14px;
          font-weight: 700;
          color: #334155;
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        a, router-link {
          font-size: 14px;
          color: #64748b;
          text-decoration: none;
          transition: color 0.3s ease;
          line-height: 1.6;

          &:hover {
            color: #f97316;
          }
        }
      }
    }
  }

  // 底部版权条
  .footer-bottom {
    max-width: 1200px;
    margin: 0 auto;
    padding-top: 24px;
    border-top: 1px solid #e2e8f0;
    text-align: center;

    p {
      margin: 8px 0;
      font-size: 13px;
      color: #94a3b8;

      &:first-child {
        font-weight: 500;
        color: #64748b;
      }
    }
  }
}

@media screen and (max-width: 768px) {
  .copyright-footer {
    padding: 32px 16px 16px;

    .footer-content {
      grid-template-columns: 1fr;
      gap: 32px;

      .footer-left {
        .logo-box {
          width: 50px;
          height: 50px;

          svg {
            width: 28px;
            height: 28px;
          }
        }

        .footer-info {
          .school-name { font-size: 18px; }
          .project-title { font-size: 14px; }
          .author-info { font-size: 13px; }
        }
      }

      .footer-right {
        grid-template-columns: 1fr;
        gap: 20px;

        .footer-nav {
          .nav-title { font-size: 13px; }
          a, router-link { font-size: 13px; }
        }
      }
    }

    .footer-bottom {
      p { font-size: 12px; }
    }
  }
}
</style>