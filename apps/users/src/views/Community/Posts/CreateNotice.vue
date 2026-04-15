<script setup>
import CardTem from '../../../components/Common/CardTem.vue'
import SampleNav from '../../../components/Common/SampleNav.vue'
import Editor from '../../../components/Editor/Editor.vue'
import Toast from '../../../components/Common/Toast.vue'
import Loading from '../../../components/Common/Loading.vue'
import { useToast } from '../../../hooks/Common/useToast.js'
import { useRouter } from 'vue-router'
import { useUserStore } from '../../../stores/user.js'
import {
  uploadArticleImageAPI,
  postArticleAPI
} from '../../../api/article'
import { nextTick, ref } from 'vue'
import MySelect from '../../../components/Common/MySelect.vue'
import throttle from '../../../utils/throttle'

const userStore = useUserStore()
// 帖子类型选项
const typeOptions = [
  { value: 'pet_daily', label: '萌宠日常' },
  { value: 'help_question', label: '求助问题' },
  { value: 'experience_share', label: '经验分享' }
]


const formData = ref({
  title: '',
  type: 'pet_daily',
  tag: [],
  images: [],
  content: '',
})

// 添加路由和Toast功能
const router = useRouter()
const { showSuccess, showError, showWarning, showToast, toastMessage, toastType } = useToast()

// 添加加载状态
const isLoading = ref(false)

const defaultTags = [
  { id: 1, name: '萌宠日常' },
  { id: 2, name: '撸猫时刻' },
  { id: 3, name: '狗狗日记' },
  { id: 4, name: '铲屎官的日常' },
  { id: 5, name: '养宠经验' },
  { id: 6, name: '宠物问题' },
  { id: 7, name: '宠物健康' },
  { id: 8, name: '宠物美食' },
  { id: 9, name: '宠物训练' },
  { id: 10, name: '治愈小狗' }
]

// 选中的标签
const selectedTags = ref([])

// 自定义标签输入
const customTagInput = ref('')
const showCustomInput = ref(false)
const customInputRef = ref(null)

// 处理自定义标签输入
const addCustomTag = () => {
  const tagName = customTagInput.value.trim()
  if (!tagName) {
    return
  }
  const exists = selectedTags.value.some(tag => {
    return tag.name === tagName
  })
  if (exists) {
    showWarning('标签已存在')
    return
  }
  // 最多添加五个
  if (selectedTags.value.length >= 5) {
    showWarning('最多添加五个标签')
    return
  }
  // 生成新的标签id
  const newTag = {
    id: Date.now(),
    name: tagName,
    isCustom: true
  }
  selectedTags.value.push(newTag)
  customTagInput.value = ''
  showCustomInput.value = false
}

// 处理输入框回车
const handleCustomTagKeydown = (event) => {
  if (event.key === 'Enter') {
    event.preventDefault()
    addCustomTag()
  }
}

// 处理自定义标签输入框失去焦点
const handleCustomTagBlur = () => {
  if (customTagInput.value.trim()) {
    addCustomTag()
  }
  showCustomInput.value = false
}

// 添加标签选择功能
const handleTagClick = (tag) => {
  // 检查标签是否已经被选中
  const isSelected = selectedTags.value.some(selectedTag => selectedTag.id === tag.id)

  if (isSelected) {
    // 如果已选中，则移除
    selectedTags.value = selectedTags.value.filter(selectedTag => selectedTag.id !== tag.id)
  } else {
    // 如果未选中，则添加（限制最多选择5个标签）
    if (selectedTags.value.length < 5) {
      selectedTags.value.push(tag)
    }
  }
}


// 移除标签功能
const removeTag = (tagId) => {
  selectedTags.value = selectedTags.value.filter(tag => tag.id !== tagId)
}

// 检查标签是否被选中
const isTagSelected = (tag) => {
  return selectedTags.value.some(selectedTag => selectedTag.id === tag.id)
}


// 图片预览相关
const previewImages = ref([])
const selectedFiles = ref([])

// 处理文件选择
const handleFileSelect = (event) => {
  const files = Array.from(event.target.files)
  selectedFiles.value = files

  // 生成预览图片
  previewImages.value = []
  files.forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader()
      reader.onload = (e) => {
        previewImages.value.push(e.target.result)
      }
      reader.readAsDataURL(file)
    }
  })
}

// 删除图片
const removeImage = (index) => {
  previewImages.value.splice(index, 1)
  selectedFiles.value.splice(index, 1)
}

// 富文本内容
const content = ref('')


const checkLoginStatus = () => {
  const token = userStore.token
  if (!token) {
    showError('请先登录后再发布帖子')
    return false
  }
  return true
}

// 原始提交函数
const _handleSubmit = async () => {
  // 检查登录状态
  if (!checkLoginStatus()) {
    return
  }

  const imgData = new FormData()
  try {
    isLoading.value = true

    // 同步富文本内容到formData
    formData.value.content = content.value
    // 同步选中的标签到formData
    formData.value.tag = selectedTags.value.map(tag => tag.name)

    // 验证必填字段
    if (!formData.value.title?.trim()) {
      showError('请输入帖子标题')
      return
    }
    if (!formData.value.type) {
      showError('请选择帖子类型')
      return
    }
    if (!formData.value.content?.trim()) {
      showError('请输入帖子内容')
      return
    }
    if (selectedTags.value.length === 0) {
      showWarning('建议至少选择一个标签')
    }

    // 先构建上传图片form
    if (selectedFiles.value.length > 0) {
      selectedFiles.value.forEach((file, index) => {
        imgData.append('articles', file)
      })
      // 上传图片
      const res = await uploadArticleImageAPI(imgData)
      formData.value.images = res.data.fileUrls
    }

    // 发布帖子
    const res2 = await postArticleAPI(formData.value)

    // 获取创建的帖子的id
    const postId = res2.data?.id
    if (postId) {
      showSuccess('帖子发布成功！')

      // 延迟跳转，让用户看到成功提示
      setTimeout(() => {
        // 跳转到帖子详情页，假设返回的数据中有帖子ID
        router.push(`/posts/${postId}`)
      }, 1500)
    } else {
      showError('发布失败，请重试')
    }

  } catch (err) {
    console.error('发布帖子失败:', err)
    showError(err.response?.data?.message || err.message || '发布失败，请重试')
  } finally {
    isLoading.value = false
    // 清空表单数据
    formData.value = {
      title: '',
      type: '',
      content: '',
      tag: [],
      images: []
    }
  }
}

// 节流版本的提交函数，防止重复提交
const handleSubmit = throttle(_handleSubmit, 2000)
</script>

<template>
  <SampleNav />

  <CardTem title="创建帖子">
    <template #form>
      <div class="form-container">
        <main>
          <form class="form" @submit.prevent="handleSubmit">
            <!-- 帖子标题 -->
            <section class="form-item">
              <label for="post-title">帖子标题</label>
              <input v-model="formData.title" type="text" id="post-title" name="post-title" class="input input-neutral"
                placeholder="请输入帖子标题" />

            </section>
            <!-- 帖子类型 -->
            <section class="form-item">
              <label for="post-type">帖子类型</label>
              <MySelect v-model="formData.type" :options="typeOptions" placeholder="请选择帖子类型" />
            </section>

            <!-- 帖子标签 -->
            <section class="form-item tag-section">
              <label class="tag-label">帖子标签</label>
              <div class="tag-content">
                <!-- 已选择的标签 -->
                <div v-if="selectedTags.length > 0" class="selected-tags">
                  <h4 class="selected-title">已选择标签 ({{ selectedTags.length }}/5)</h4>
                  <div class="selected-tags-container">
                    <div v-for="tag in selectedTags" :key="tag.id" class="selected-tag-item"
                      :class="{ 'custom-tag': tag.isCustom }">
                      <span class="tag-icon">#</span>
                      <span class="tag-name">{{ tag.name }}</span>
                      <button type="button" class="remove-tag-btn" @click="removeTag(tag.id)">
                        ×
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 自定义标签输入 -->
                <div class="custom-tag-input">
                  <div class="custom-tags-container">
                    <!-- 添加自定义标签按钮 -->

                    <!-- 自定义标签输入框 -->
                    <div class="custom-input-container">
                      <input ref="customInputRef" v-model="customTagInput" type="text" placeholder="输入自定义标签名称"
                        class="custom-tag-input-field" @keydown="handleCustomTagKeydown" @blur="handleCustomTagBlur"
                        maxlength="10" />
                    </div>
                  </div>
                </div>

                <!-- 可选择的标签 -->
                <div class="available-tags">
                  <h4 class="available-title">推荐标签</h4>
                  <div class="available-tags-container">
                    <button v-for="tag in defaultTags" :key="tag.id" type="button"
                      :class="['available-tag-btn', { 'selected': isTagSelected(tag), 'disabled': selectedTags.length >= 5 && !isTagSelected(tag) }]"
                      @click="handleTagClick(tag)" :disabled="selectedTags.length >= 5 && !isTagSelected(tag)">
                      <span class="tag-icon">#</span>
                      <span class="tag-name">{{ tag.name }}</span>
                      <span v-if="isTagSelected(tag)" class="check-icon">✓</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <!-- 帖子图片 -->
            <section class="form-item form-imglist">
              <label class="upload-label">帖子图片</label>
              <div class="upload-area">
                <input type="file" id="post-image" name="post-image" class="file-input" multiple accept="image/*"
                  @change="handleFileSelect">
                <label for="post-image" class="upload-box">
                  <div class="upload-icon">+</div>
                  <div class="upload-text">点击上传图片</div>
                  <div class="upload-hint">支持多张图片上传</div>
                </label>
              </div>

              <!-- 图片预览区域 -->
              <div v-if="previewImages.length > 0" class="image-preview">
                <div v-for="(image, index) in previewImages" :key="index" class="preview-item">
                  <img :src="image" alt="预览图片" class="preview-img">
                  <button type="button" class="remove-btn" @click="removeImage(index)">
                    ×
                  </button>
                </div>
              </div>
            </section>

            <!-- 帖子内容 -->
            <section class="form-item">
              <label for="post-content">帖子内容</label>
              <Editor v-model:content="content" />
            </section>

            <!-- 帖子发布 -->
            <section class="form-item">
              <button type="submit" :disabled="isLoading">
                <span v-if="isLoading">发布中...</span>
                <span v-else>发布帖子</span>
              </button>
            </section>
          </form>
        </main>
      </div>
    </template>
  </CardTem>

  <!-- Toast组件 -->
  <Toast :show-toast="showToast" :toast-message="toastMessage" :toast-type="toastType"
    @hide-toast="() => showToast = false" />

  <!-- Loading组件 -->
  <Loading :is-show="isLoading" />
</template>

<style scoped>
.form-container {
  main {
    display: flex;
    flex-direction: column;
    align-items: center;

    .form-item {
      border: 1px solid #e5e7eb;
      border-radius: 12px;
      margin-bottom: 20px;
      margin-top: 20px;
      min-height: 70px;
      display: flex;
      align-items: center;
      padding: 20px;
      background: white;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
      transition: all 0.2s ease;
      width: 100%;
      max-width: 800px;

      &:hover {
        border-color: #d1d5db;
        box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      }

      label {
        font-weight: 500;
        color: #374151;
        margin-right: 12px;
        min-width: 80px;
      }

      &.tag-section {
        flex-direction: column;
        align-items: stretch;
        min-height: auto;
        padding: 20px;

        .tag-label {
          font-weight: 500;
          color: #374151;
          margin-bottom: 16px;
          align-self: flex-start;
          margin-right: 0;
        }

        .tag-content {
          width: 100%;

          .selected-tags {
            margin-bottom: 20px;

            .selected-title {
              font-size: 14px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 12px;
              letter-spacing: -0.025em;
            }

            .selected-tags-container {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;

              .selected-tag-item {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 6px 12px;
                background-color: #eff6ff;
                color: #2563eb;
                border: none;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 500;
                box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);

                .tag-icon {
                  font-weight: 600;
                  opacity: 0.8;
                  font-size: 11px;
                }

                .tag-name {
                  white-space: nowrap;
                  font-weight: 500;
                }

                .custom-badge {
                  font-size: 9px;
                  padding: 1px 4px;
                  background: rgba(219, 39, 119, 0.1);
                  border-radius: 3px;
                  margin-left: 2px;
                }

                .remove-tag-btn {
                  margin-left: 4px;
                  width: 16px;
                  height: 16px;
                  border-radius: 50%;
                  background: rgba(239, 68, 68, 0.1);
                  color: #dc2626;
                  border: none;
                  font-size: 12px;
                  font-weight: bold;
                  cursor: pointer;
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  transition: all 0.2s ease;

                  &:hover {
                    background: rgba(239, 68, 68, 0.2);
                    transform: scale(1.1);
                  }
                }
              }
            }
          }

          .available-tags {
            .available-title {
              font-size: 14px;
              font-weight: 600;
              color: #1f2937;
              margin-bottom: 12px;
              letter-spacing: -0.025em;
            }

            .available-tags-container {
              display: flex;
              flex-wrap: wrap;
              gap: 8px;

              .available-tag-btn {
                display: inline-flex;
                align-items: center;
                gap: 4px;
                padding: 6px 12px;
                border: none;
                border-radius: 6px;
                font-size: 12px;
                font-weight: 500;
                cursor: pointer;
                transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
                letter-spacing: -0.025em;
                outline: none;
                position: relative;
                overflow: hidden;
                box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                background-color: #f8fafc;
                color: #475569;

                .tag-icon {
                  font-weight: 600;
                  opacity: 0.8;
                  font-size: 11px;
                }

                .tag-name {
                  white-space: nowrap;
                  font-weight: 500;
                }

                .check-icon {
                  margin-left: 4px;
                  font-size: 10px;
                  color: #16a34a;
                  font-weight: bold;
                }

                &:hover:not(.disabled) {
                  background-color: #f1f5f9;
                  transform: translateY(-1px);
                  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
                }

                &.selected {
                  background-color: #dcfce7;
                  color: #16a34a;
                  box-shadow: 0 2px 4px -1px rgba(22, 163, 74, 0.1);

                  &:hover {
                    background-color: #bbf7d0;
                  }
                }

                &.disabled {
                  opacity: 0.5;
                  cursor: not-allowed;
                  background-color: #f1f5f9;
                  color: #9ca3af;

                  &:hover {
                    transform: none;
                    box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                  }
                }

                &:active:not(.disabled) {
                  transform: translateY(0);
                  box-shadow: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
                }

                &:focus-visible {
                  outline: 2px solid #3b82f6;
                  outline-offset: 2px;
                }
              }
            }
          }
        }
      }


      input,
      select,
      textarea {
        flex: 1;
        border-color: #FCB700;
        border: 1px solid;
        border-radius: 6px;
        padding: 8px 12px;
        font-size: 14px;
        transition: border-color 0.2s ease;

        &:focus {
          outline: none;
          border-color: #FCB700;
          box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.1);
        }
      }

      textarea {
        min-height: 80px;
        resize: vertical;
      }

      button[type="submit"] {
        background: #FCB700;
        color: white;
        border: none;
        border-radius: 6px;
        padding: 10px 20px;
        font-weight: 500;
        cursor: pointer;
        transition: background 0.2s ease;

        &:hover {
          background: #FCB700;
        }
      }
    }

    .form-imglist {
      min-height: 200px;
      flex-direction: column;
      align-items: stretch;
      padding: 20px;

      .upload-label {
        font-weight: 500;
        color: #374151;
        margin-bottom: 12px;
        align-self: flex-start;
      }

      .upload-area {
        position: relative;
        width: 100%;
        margin-bottom: 16px;

        .file-input {
          position: absolute;
          width: 100%;
          height: 100%;
          opacity: 0;
          cursor: pointer;
          z-index: 2;
        }

        .upload-box {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          width: 100%;
          height: 120px;
          border: 2px dashed #d1d5db;
          border-radius: 8px;
          background: #f9fafb;
          cursor: pointer;
          transition: all 0.2s ease;

          &:hover {
            border-color: #FCB700;
            background: #eff6ff;
          }

          .upload-icon {
            font-size: 32px;
            color: #9ca3af;
            margin-bottom: 8px;
            font-weight: 300;
          }

          .upload-text {
            font-size: 14px;
            color: #374151;
            font-weight: 500;
            margin-bottom: 4px;
          }

          .upload-hint {
            font-size: 12px;
            color: #6b7280;
          }
        }
      }

      .image-preview {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(100px, 1fr));
        gap: 12px;
        width: 100%;

        .preview-item {
          position: relative;
          aspect-ratio: 1;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid #e5e7eb;

          .preview-img {
            width: 100%;
            height: 100%;
            object-fit: cover;
          }

          .remove-btn {
            position: absolute;
            top: 4px;
            right: 4px;
            width: 20px;
            height: 20px;
            border-radius: 50%;
            background: rgba(239, 68, 68, 0.9);
            color: white;
            border: none;
            font-size: 12px;
            font-weight: bold;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            transition: background 0.2s ease;

            &:hover {
              background: rgba(220, 38, 38, 0.9);
            }
          }
        }
      }
    }
  }
}

.custom-tag-input {
  margin-bottom: 20px;

  .custom-tags-container {
    .add-custom-tag-btn {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 8px 16px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 13px;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.3s ease;
      box-shadow: 0 2px 4px rgba(102, 126, 234, 0.3);

      .plus-icon {
        font-size: 16px;
        font-weight: bold;
      }

      &:hover:not(:disabled) {
        transform: translateY(-2px);
        box-shadow: 0 4px 8px rgba(102, 126, 234, 0.4);
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
        background: #9ca3af;

        &:hover {
          transform: none;
          box-shadow: 0 2px 4px rgba(156, 163, 175, 0.3);
        }
      }
    }

    .custom-input-container {
      display: flex;
      flex-direction: column;
      gap: 8px;

      .custom-tag-input-field {
        padding: 10px 12px;
        border: 2px solid #e5e7eb;
        border-radius: 8px;
        font-size: 14px;
        transition: border-color 0.2s ease;

        &:focus {
          outline: none;
          box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
        }
      }

      .custom-input-actions {
        display: flex;
        gap: 8px;

        .confirm-btn {
          padding: 6px 12px;
          background: #10b981;
          color: white;
          border: none;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 500;
          cursor: pointer;
          transition: background 0.2s ease;

          &:hover {
            background: #059669;
          }

        }
      }
    }
  }
}


/* 响应式设计 */
@media (max-width: 768px) {
  .form-container main .form-item {
    max-width: 100%;
    padding: 16px;

    &.tag-section {
      .tag-content {
        .selected-tags {
          .selected-tags-container {
            gap: 6px;

            .selected-tag-item {
              padding: 4px 8px;
              font-size: 11px;

              .tag-icon {
                font-size: 10px;
              }

              .remove-tag-btn {
                width: 14px;
                height: 14px;
                font-size: 10px;
              }
            }
          }
        }

        .available-tags {
          .available-tags-container {
            gap: 6px;

            .available-tag-btn {
              padding: 4px 8px;
              font-size: 11px;

              .tag-icon {
                font-size: 10px;
              }

              .check-icon {
                font-size: 9px;
              }
            }
          }
        }
      }
    }
  }
}
</style>
