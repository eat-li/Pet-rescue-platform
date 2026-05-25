<script setup>
import { markRaw } from 'vue'
import ArticleMenu from '../../components/Common/ArticleMenu.vue'
import ArticleCard from './Posts/ArticleCard.vue'
import SampleNav from '../../components/Common/SampleNav.vue'
import Loading from "../../components/Common/Loading.vue"
import Toast from "../../components/Common/Toast.vue"
import Addbutton from "../../components/Common/Addbutton.vue"
import { useArticleList } from '../../hooks/Article/useArticleList.js'
import { onMounted, ref, computed } from 'vue'
import { useUserStore } from '../../stores/user'
import { HomeIcon, UserIcon, StarIcon, BellIcon, HeartIcon, CollectionIcon } from '../../components/Icons'



// 使用文章列表 hook
const {
  articleList,
  loading,
  pagination,
  handleMenuType,
  handlePersonType,
  goToPreviousPage,
  goToNextPage,
  initializeList
} = useArticleList()

// 提示框
const showToast = ref(false)
const toastMessage = ref('')
const toastType = ref('')

// 获取文章的ref
const Mylist = ref(null)

// 菜单类型点击处理
const getMenuType = async (item) => {
  try {
    await handleMenuType(item, Mylist)
  } catch (err) {
    showErrorToast('获取文章列表失败')
  }
}

// 个人菜单点击处理
const getPersonType = async (item) => {
  try {
    await handlePersonType(item, Mylist)
  } catch (err) {
    showErrorToast('获取列表失败')
  }
}

// 上一页处理
const handlePreviousPage = async () => {
  try {
    await goToPreviousPage(Mylist)
  } catch (err) {
    showWarningToast(err.message)
  }
}

// 下一页处理
const handleNextPage = async () => {
  try {
    await goToNextPage(Mylist)
  } catch (err) {
    showWarningToast(err.message)
  }
}

// 显示错误提示
const showErrorToast = (message) => {
  showToast.value = true
  toastMessage.value = message
  toastType.value = 'error'
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

// 显示警告提示
const showWarningToast = (message) => {
  showToast.value = true
  toastMessage.value = message
  toastType.value = 'warning'
  setTimeout(() => {
    showToast.value = false
  }, 3000)
}

// 菜单配置
const menuList = ref([
  {
    title: '所有帖子',
    icon: markRaw(HomeIcon),
    type: 'all'
  },
  {
    title: '宠物日常',
    icon: markRaw(UserIcon),
    type: 'pet_daily'
  },
  {
    title: '求助问题',
    icon: markRaw(StarIcon),
    type: 'help_question'
  },
  {
    title: '经验分享',
    icon: markRaw(BellIcon),
    type: 'experience_share'
  },
])

const personList = ref([
  {
    title: '我的点赞',
    icon: markRaw(HeartIcon),
    type: 'like'
  },
  {
    title: '我的收藏',
    icon: markRaw(CollectionIcon),
    type: 'collection'
  },
  {
    title: '我的发布',
    icon: markRaw(UserIcon),
    type: 'publish'
  }
])

// 组件挂载时初始化
onMounted(async () => {
  try {
    await initializeList(Mylist)
  } catch (err) {
    showErrorToast('初始化文章列表失败')
  }
})
</script>

<template>
  <section>
    <SampleNav />

    <ArticleMenu title="宠物社区" :list="menuList" :person="personList" @menu-click="getMenuType"
      @person-click="getPersonType">
      <template #body>
        <div ref="Mylist">
          <ArticleCard :articleList="articleList" />
        </div>
      </template>

      <template #bottom>
        <div class="pagination">
          <button class="page-btn" @click="handlePreviousPage">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M15 18l-6-6 6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
            上一页
          </button>
          <button class="page-btn" @click="handleNextPage">
            下一页
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none">
              <path d="M9 18l6-6-6-6" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </template>
    </ArticleMenu>

    <Toast :show-toast="showToast" :toast-message="toastMessage" :toast-type="toastType" />
    <Loading :is-show="loading" />
    <Addbutton :to="'/createpost'" />

  </section>
</template>

<style lang="scss" scoped>
.pagination {
  display: flex;
  gap: 12px;

  .page-btn {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 10px 20px;
    background: #fff;
    border: 1.5px solid #e5e7eb;
    border-radius: 12px;
    color: #374151;
    font-size: 14px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.3s ease;

    svg {
      transition: transform 0.3s ease;
    }

    &:hover {
      background: #f97316;
      border-color: #f97316;
      color: #fff;
      box-shadow: 0 4px 12px rgba(249, 115, 22, 0.3);

      svg path { stroke: #fff; }
    }
  }
}
</style>