<script setup>
import CardTem from '../../../components/Common/CardTem.vue'
import SampleNav from '../../../components/Common/SampleNav.vue'
import Toast from '../../../components/Common/Toast.vue'
import Loading from '../../../components/Common/Loading.vue'
import MySelect from '../../../components/Common/MySelect.vue'
import { useToast } from '../../../hooks/Common/useToast.js'
import { useCreatePet } from '../../../hooks/Pet/useCreatePet.js'
import { onMounted, onUnmounted } from 'vue'

// 使用Toast功能
const { showToast, toastMessage, toastType } = useToast()

// 使用创建宠物hook
const {
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
} = useCreatePet()

// 组件挂载时初始化日期选择器
onMounted(() => {
  initDatePicker()
})

// 组件卸载时清理日期选择器
onUnmounted(() => {
  destroyDatePicker()
})
</script>

<template>
  <SampleNav />

  <CardTem title="创建宠物">
    <template #form>
      <div class="form-container">
        <main>
          <form class="form" @submit.prevent="handleSubmit">
            <!-- 宠物昵称 -->
            <section class="form-item">
              <label for="pet-nickname">宠物昵称</label>
              <input v-model="formData.nickName" type="text" id="pet-nickname" name="pet-nickname"
                class="input input-neutral" placeholder="请输入宠物昵称" />
            </section>

            <!-- 疫苗状态 -->
            <section class="form-item">
              <label for="vaccine-status">疫苗状态</label>
              <MySelect v-model="formData.vaccineStatus" :options="vaccineOptions" placeholder="请选择疫苗状态" />
            </section>

            <!-- 宠物性别 -->
            <section class="form-item">
              <label for="pet-sex">宠物性别</label>
              <MySelect v-model="formData.sex" :options="sexOptions" placeholder="请选择宠物性别" />
            </section>

            <!-- 宠物品种 -->
            <section class="form-item">
              <label for="pet-breed">宠物品种</label>
              <input v-model="formData.breed" type="text" id="pet-breed" name="pet-breed" class="input input-neutral"
                placeholder="请输入宠物品种，如：金毛、英短、布偶等" />
            </section>

            <!-- 宠物类型 -->
            <section class="form-item">
              <label for="pet-type">宠物类型</label>
              <MySelect v-model="formData.type" :options="typeOptions" placeholder="请选择宠物类型" />
            </section>

            <!-- 宠物生日 -->
            <section class="form-item">
              <label for="pet-birthday">宠物生日</label>
              <input 
                ref="birthdayInput"
                v-model="formData.birthday" 
                type="text" 
                id="pet-birthday" 
                name="pet-birthday"
                class="input input-neutral pika-single" 
                placeholder="请选择宠物生日"
                readonly
              />
            </section>

            <!-- 宠物性格 -->
            <section class="form-item tag-section">
              <label class="tag-label">宠物性格</label>
              <div class="tag-content">
                <!-- 已选择的性格标签 -->
                <div v-if="selectedNatureTags.length > 0" class="selected-tags">
                  <h4 class="selected-title">已选择性格 ({{ selectedNatureTags.length }}/5)</h4>
                  <div class="selected-tags-container">
                    <div v-for="tag in selectedNatureTags" :key="tag.id" class="selected-tag-item"
                      :class="{ 'custom-tag': tag.isCustom }">
                      <span class="tag-icon">#</span>
                      <span class="tag-name">{{ tag.name }}</span>
                      <button type="button" class="remove-tag-btn" @click="removeNatureTag(tag.id)">
                        ×
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 自定义性格标签输入 -->
                <div class="custom-tag-input">
                  <div class="custom-tags-container">
                    <div class="custom-input-container">
                      <input v-model="customNatureInput" type="text" placeholder="输入自定义性格标签"
                        class="custom-tag-input-field" @keydown="handleCustomNatureKeydown"
                        @blur="handleCustomNatureBlur" maxlength="10" />
                    </div>
                  </div>
                </div>

                <!-- 可选择的性格标签 -->
                <div class="available-tags">
                  <h4 class="available-title">推荐性格</h4>
                  <div class="available-tags-container">
                    <button v-for="tag in defaultNatureTags" :key="tag.id" type="button"
                      :class="['available-tag-btn', { 'selected': isNatureTagSelected(tag), 'disabled': selectedNatureTags.length >= 5 && !isNatureTagSelected(tag) }]"
                      @click="handleNatureTagClick(tag)"
                      :disabled="selectedNatureTags.length >= 5 && !isNatureTagSelected(tag)">
                      <span class="tag-icon">#</span>
                      <span class="tag-name">{{ tag.name }}</span>
                      <span v-if="isNatureTagSelected(tag)" class="check-icon">✓</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <!-- 宠物爱好 -->
            <section class="form-item tag-section">
              <label class="tag-label">宠物爱好</label>
              <div class="tag-content">
                <!-- 已选择的爱好标签 -->
                <div v-if="selectedHobbyTags.length > 0" class="selected-tags">
                  <h4 class="selected-title">已选择爱好 ({{ selectedHobbyTags.length }}/5)</h4>
                  <div class="selected-tags-container">
                    <div v-for="tag in selectedHobbyTags" :key="tag.id" class="selected-tag-item"
                      :class="{ 'custom-tag': tag.isCustom }">
                      <span class="tag-icon">#</span>
                      <span class="tag-name">{{ tag.name }}</span>
                      <button type="button" class="remove-tag-btn" @click="removeHobbyTag(tag.id)">
                        ×
                      </button>
                    </div>
                  </div>
                </div>

                <!-- 自定义爱好标签输入 -->
                <div class="custom-tag-input">
                  <div class="custom-tags-container">
                    <div class="custom-input-container">
                      <input v-model="customHobbyInput" type="text" placeholder="输入自定义爱好标签"
                        class="custom-tag-input-field" @keydown="handleCustomHobbyKeydown" @blur="handleCustomHobbyBlur"
                        maxlength="10" />
                    </div>
                  </div>
                </div>

                <!-- 可选择的爱好标签 -->
                <div class="available-tags">
                  <h4 class="available-title">推荐爱好</h4>
                  <div class="available-tags-container">
                    <button v-for="tag in defaultHobbyTags" :key="tag.id" type="button"
                      :class="['available-tag-btn', { 'selected': isHobbyTagSelected(tag), 'disabled': selectedHobbyTags.length >= 5 && !isHobbyTagSelected(tag) }]"
                      @click="handleHobbyTagClick(tag)"
                      :disabled="selectedHobbyTags.length >= 5 && !isHobbyTagSelected(tag)">
                      <span class="tag-icon">#</span>
                      <span class="tag-name">{{ tag.name }}</span>
                      <span v-if="isHobbyTagSelected(tag)" class="check-icon">✓</span>
                    </button>
                  </div>
                </div>
              </div>
            </section>

            <!-- 宠物照片 -->
            <section class="form-item form-imglist">
              <label class="upload-label">宠物照片</label>
              <div class="upload-area">
                <input type="file" id="pet-image" name="pet-image" class="file-input" accept="image/*"
                  @change="handleFileSelect">
                <label for="pet-image" class="upload-box">
                  <div class="upload-icon">+</div>
                  <div class="upload-text">点击上传宠物照片</div>
                  <div class="upload-hint">支持 JPG、PNG 格式</div>
                </label>
              </div>

              <!-- 图片预览区域 -->
              <div v-if="previewImage" class="image-preview">
                <div class="preview-item">
                  <img :src="previewImage" alt="宠物照片预览" class="preview-img">
                  <button type="button" class="remove-btn" @click="removeImage">
                    ×
                  </button>
                </div>
              </div>
            </section>

            <!-- 其他信息 -->
            <section class="form-item">
              <label for="other-msg">其他信息</label>
              <textarea v-model="formData.other_msg" id="other-msg" name="other-msg" class="input input-neutral"
                placeholder="请输入宠物的其他信息，如特殊习惯、健康状况等" rows="4"></textarea>
            </section>

            <!-- 提交按钮 -->
            <section class="form-item">
              <button type="submit" :disabled="isLoading">
                <span v-if="isLoading">创建中...</span>
                <span v-else>创建宠物</span>
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

        &:disabled {
          opacity: 0.6;
          cursor: not-allowed;
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
        display: flex;
        justify-content: center;
        width: 100%;

        .preview-item {
          position: relative;
          width: 200px;
          height: 200px;
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
          border-color: #FCB700;
          box-shadow: 0 0 0 3px rgba(252, 183, 0, 0.1);
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