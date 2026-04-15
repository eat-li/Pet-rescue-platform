<script setup>
import ArticleMenu from '../../components/Common/ArticleMenu.vue'
import ArticleCard from './Posts/ArticleCard.vue'
import SampleNav from '../../components/Common/SampleNav.vue'
import Loading from "../../components/Common/Loading.vue"
import Toast from "../../components/Common/Toast.vue"
import Addbutton from "../../components/Common/Addbutton.vue"
import { useArticleList } from '../../hooks/Article/useArticleList.js'
import { onMounted, ref, computed } from 'vue'
import { useUserStore } from '../../stores/user'



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
    icon: '🏠',
    type: 'all'
  },
  {
    title: '宠物日常',
    icon: '👤',
    type: 'pet_daily'
  },
  {
    title: '求助问题',
    icon: '⭐',
    type: 'help_question'
  },
  {
    title: '经验分享',
    icon: '🔔',
    type: 'experience_share'
  },
])

const personList = ref([
  {
    title: '我的点赞',
    icon: '👤',
    type: 'like'
  },
  {
    title: '我的收藏',
    icon: '⭐',
    type: 'collection'
  },
  {
    title: '我的发布',
    icon: '👤',
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
        <div class="join grid grid-cols-2">
          <button class="join-item btn btn-outline" @click="handlePreviousPage">上一页</button>
          <button class="join-item btn btn-outline" @click="handleNextPage">下一页</button>
        </div>
      </template>
    </ArticleMenu>

    <Toast :show-toast="showToast" :toast-message="toastMessage" :toast-type="toastType" />
    <Loading :is-show="loading" />
    <Addbutton :to="'/createpost'" />

  </section>
</template>

<style scoped></style>