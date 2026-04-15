import { ref, nextTick, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../stores/user.js'
import { useToast } from '../Common/useToast.js'
import throttle from '../../utils/throttle.js'
import { createPetAPI, uploadPetImageAPI } from '../../api/pet.js'
import Pikaday from 'pikaday'

export function useCreatePet() {
  const router = useRouter()
  const userStore = useUserStore()
  const { showSuccess, showError, showWarning } = useToast()

  // 加载状态
  const isLoading = ref(false)

  // 疫苗状态选项
  const vaccineOptions = [
    { value: 'unvaccinated', label: '未接种' },
    { value: 'one_dose', label: '一针' },
    { value: 'two_doses', label: '两针' },
    { value: 'three_doses', label: '三针' },
    { value: 'completed', label: '已完成' }
  ]

  // 性别选项
  const sexOptions = [
    { value: true, label: '公' },
    { value: false, label: '母' }
  ]

  // 宠物类型选项
  const typeOptions = [
    { value: 'dog', label: '狗狗' },
    { value: 'cat', label: '猫咪' },
    { value: 'bird', label: '鸟类' },
    { value: 'rabbit', label: '兔子' },
    { value: 'hamster', label: '仓鼠' },
    { value: 'fish', label: '鱼类' },
    { value: 'other', label: '其他' }
  ]

  // 表单数据
  const formData = ref({
    nickName: '',
    vaccineStatus: 'unvaccinated',
    sex: true,
    breed: '',
    type: 'dog',
    birthday: '',
    image: '',
    nature: [],
    hobby: [],
    other_msg: ''
  })

  // 默认性格标签
  const defaultNatureTags = [
    { id: 1, name: '温顺' },
    { id: 2, name: '活泼' },
    { id: 3, name: '聪明' },
    { id: 4, name: '粘人' },
    { id: 5, name: '独立' },
    { id: 6, name: '胆小' },
    { id: 7, name: '勇敢' },
    { id: 8, name: '安静' },
    { id: 9, name: '调皮' },
    { id: 10, name: '乖巧' }
  ]

  // 默认爱好标签
  const defaultHobbyTags = [
    { id: 1, name: '玩球' },
    { id: 2, name: '散步' },
    { id: 3, name: '游泳' },
    { id: 4, name: '睡觉' },
    { id: 5, name: '吃零食' },
    { id: 6, name: '晒太阳' },
    { id: 7, name: '玩玩具' },
    { id: 8, name: '看电视' },
    { id: 9, name: '跑步' },
    { id: 10, name: '捉迷藏' }
  ]

  // 选中的标签
  const selectedNatureTags = ref([])
  const selectedHobbyTags = ref([])

  // 自定义标签输入
  const customNatureInput = ref('')
  const showCustomNatureInput = ref(false)
  const customHobbyInput = ref('')
  const showCustomHobbyInput = ref(false)

  // 图片相关
  const previewImage = ref('')
  const selectedFile = ref(null)

  // 生日选择器
  const birthdayInput = ref(null)
  let pikadayInstance = null

  // 检查登录状态
  const checkLoginStatus = () => {
    const token = userStore.token
    if (!token) {
      showError('请先登录后再创建宠物')
      return false
    }
    return true
  }

  // 处理自定义性格标签输入
  const addCustomNatureTag = () => {
    const tagName = customNatureInput.value.trim()
    if (!tagName) {
      return
    }
    const exists = selectedNatureTags.value.some(tag => tag.name === tagName)
    if (exists) {
      showWarning('性格标签已存在')
      return
    }
    if (selectedNatureTags.value.length >= 5) {
      showWarning('最多添加五个性格标签')
      return
    }
    const newTag = {
      id: Date.now(),
      name: tagName,
      isCustom: true
    }
    selectedNatureTags.value.push(newTag)
    customNatureInput.value = ''
    showCustomNatureInput.value = false
  }

  // 处理自定义爱好标签输入
  const addCustomHobbyTag = () => {
    const tagName = customHobbyInput.value.trim()
    if (!tagName) {
      return
    }
    const exists = selectedHobbyTags.value.some(tag => tag.name === tagName)
    if (exists) {
      showWarning('爱好标签已存在')
      return
    }
    if (selectedHobbyTags.value.length >= 5) {
      showWarning('最多添加五个爱好标签')
      return
    }
    const newTag = {
      id: Date.now(),
      name: tagName,
      isCustom: true
    }
    selectedHobbyTags.value.push(newTag)
    customHobbyInput.value = ''
    showCustomHobbyInput.value = false
  }

  // 处理性格标签点击
  const handleNatureTagClick = (tag) => {
    const isSelected = selectedNatureTags.value.some(selectedTag => selectedTag.id === tag.id)
    if (isSelected) {
      selectedNatureTags.value = selectedNatureTags.value.filter(selectedTag => selectedTag.id !== tag.id)
    } else {
      if (selectedNatureTags.value.length < 5) {
        selectedNatureTags.value.push(tag)
      }
    }
  }

  // 处理爱好标签点击
  const handleHobbyTagClick = (tag) => {
    const isSelected = selectedHobbyTags.value.some(selectedTag => selectedTag.id === tag.id)
    if (isSelected) {
      selectedHobbyTags.value = selectedHobbyTags.value.filter(selectedTag => selectedTag.id !== tag.id)
    } else {
      if (selectedHobbyTags.value.length < 5) {
        selectedHobbyTags.value.push(tag)
      }
    }
  }

  // 移除标签
  const removeNatureTag = (tagId) => {
    selectedNatureTags.value = selectedNatureTags.value.filter(tag => tag.id !== tagId)
  }

  const removeHobbyTag = (tagId) => {
    selectedHobbyTags.value = selectedHobbyTags.value.filter(tag => tag.id !== tagId)
  }

  // 检查标签是否被选中
  const isNatureTagSelected = (tag) => {
    return selectedNatureTags.value.some(selectedTag => selectedTag.id === tag.id)
  }

  const isHobbyTagSelected = (tag) => {
    return selectedHobbyTags.value.some(selectedTag => selectedTag.id === tag.id)
  }

  // 处理文件选择
  const handleFileSelect = (event) => {
    const file = event.target.files[0]
    if (file) {
      selectedFile.value = file
      if (file.type.startsWith('image/')) {
        const reader = new FileReader()
        reader.onload = (e) => {
          previewImage.value = e.target.result
        }
        reader.readAsDataURL(file)
      }
    }
  }

  // 删除图片
  const removeImage = () => {
    previewImage.value = ''
    selectedFile.value = null
    formData.value.image = ''
  }

  // 处理输入框回车
  const handleCustomNatureKeydown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      addCustomNatureTag()
    }
  }

  const handleCustomHobbyKeydown = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault()
      addCustomHobbyTag()
    }
  }

  // 处理自定义标签输入框失去焦点
  const handleCustomNatureBlur = () => {
    if (customNatureInput.value.trim()) {
      addCustomNatureTag()
    }
    showCustomNatureInput.value = false
  }

  const handleCustomHobbyBlur = () => {
    if (customHobbyInput.value.trim()) {
      addCustomHobbyTag()
    }
    showCustomHobbyInput.value = false
  }

  // 重置表单
  const resetForm = () => {
    formData.value = {
      nickName: '',
      vaccineStatus: 'unvaccinated',
      sex: true,
      breed: '',
      type: 'dog',
      birthday: '',
      image: '',
      nature: [],
      hobby: [],
      other_msg: ''
    }
    selectedNatureTags.value = []
    selectedHobbyTags.value = []
    previewImage.value = ''
    selectedFile.value = null
  }

  // 表单验证
  const validateForm = () => {
    // 同步选中的标签到formData
    formData.value.nature = selectedNatureTags.value.map(tag => tag.name)
    formData.value.hobby = selectedHobbyTags.value.map(tag => tag.name)

    // 验证必填字段
    if (!formData.value.nickName?.trim()) {
      showError('请输入宠物昵称')
      return false
    }
    if (!formData.value.breed?.trim()) {
      showError('请输入宠物品种')
      return false
    }
    if (!formData.value.birthday) {
      showError('请选择宠物生日')
      return false
    }
    if (!selectedFile.value) {
      showError('请上传宠物照片')
      return false
    }

    // 验证生日不能是未来日期
    const selectedDate = new Date(formData.value.birthday)
    const today = new Date()
    if (selectedDate > today) {
      showError('宠物生日不能是未来日期')
      return false
    }

    return true
  }

  // 原始提交函数
  const _handleSubmit = async () => {
    if (!checkLoginStatus()) {
      return
    }

    if (!validateForm()) {
      return
    }

    try {
      isLoading.value = true
      const file = new FormData()
      file.append('pet', selectedFile.value)
      if (selectedFile.value) {
        // 先进行图片上传
        const res = await uploadPetImageAPI(file)
        formData.value.image = res.data.fileUrl
      }
      const response = await createPetAPI(formData.value)
      showSuccess(response.message || '宠物信息创建成功！')

      // 延迟跳转
      setTimeout(() => {
        router.push('/pet')
      }, 1500)

    } catch (err) {
      console.error('创建宠物失败:', err)
      showError(err.message || '创建失败，请重试')
    } finally {
      isLoading.value = false
      resetForm()
    }
  }

  // 节流版本的提交函数，防止重复提交
  const handleSubmit = throttle(_handleSubmit, 2000)

  // 初始化生日选择器
  const initDatePicker = () => {
    nextTick(() => {
      if (birthdayInput.value) {
        pikadayInstance = new Pikaday({
          field: birthdayInput.value,
          format: 'YYYY-MM-DD',
          yearRange: [1990, new Date().getFullYear()],
          maxDate: new Date(), // 不能选择未来日期
          i18n: {
            previousMonth: '上个月',
            nextMonth: '下个月',
            months: ['一月', '二月', '三月', '四月', '五月', '六月', '七月', '八月', '九月', '十月', '十一月', '十二月'],
            weekdays: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
            weekdaysShort: ['日', '一', '二', '三', '四', '五', '六']
          },
          onSelect: function (date) {
            // 格式化日期为YYYY-MM-DD格式
            const year = date.getFullYear()
            const month = String(date.getMonth() + 1).padStart(2, '0')
            const day = String(date.getDate()).padStart(2, '0')
            formData.value.birthday = `${year}-${month}-${day}`
          }
        })
      }
    })
  }

  // 清理生日选择器
  const destroyDatePicker = () => {
    if (pikadayInstance) {
      pikadayInstance.destroy()
    }
  }

  return {
    // 响应式数据
    isLoading,
    formData,
    selectedNatureTags,
    selectedHobbyTags,
    customNatureInput,
    showCustomNatureInput,
    customHobbyInput,
    showCustomHobbyInput,
    previewImage,
    selectedFile,
    birthdayInput,

    // 选项数据
    vaccineOptions,
    sexOptions,
    typeOptions,
    defaultNatureTags,
    defaultHobbyTags,

    // 方法
    addCustomNatureTag,
    addCustomHobbyTag,
    handleNatureTagClick,
    handleHobbyTagClick,
    removeNatureTag,
    removeHobbyTag,
    isNatureTagSelected,
    isHobbyTagSelected,
    handleFileSelect,
    removeImage,
    handleCustomNatureKeydown,
    handleCustomHobbyKeydown,
    handleCustomNatureBlur,
    handleCustomHobbyBlur,
    handleSubmit,
    resetForm,
    initDatePicker,
    destroyDatePicker
  }
}