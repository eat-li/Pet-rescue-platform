<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { createAdoptionAPI, uploadAdoptionImageAPI } from '@/api/adoption'
import { CameraIcon, GiftIcon, MoneyIcon, HandshakeIcon, WarningIcon } from '@/components/Icons'

const router = useRouter()

// ── 表单数据 ─────────────────────────────────────────────
const form = ref({
  // 宠物信息 → 对应后端 petInfo
  petName:      '',  // nickName
  type:         '',  // type
  breed:        '',  // breed
  sex:          null, // sex (boolean)
  birthday:     '',  // birthday
  vaccineStatus: 'unvaccinated',
  nature:       [],  // 性格 → nature
  hobby:        [],  // 爱好 → hobby
  petOtherMsg:  '',  // 宠物其他说明 → petInfo.other_msg

  // 领养信息 → 对应 Adoption 模型字段
  fee:          'free', // 费用类型
  money:        null,   // 金额（仅 paid 时有效）
  reason:       '',     // 领养说明 → other_msg

  // 领养要求 → 对应 request JSON
  location:     '',    // request.location
  contact:      '',    // request.contact
  requirements: '',   // request.requirements

  // 图片
  image:        ''  // 上传后填入 fileUrl
})

const petTypes    = ['猫', '狗', '兔子', '仓鼠', '其他']
const vaccineOpts = [
  { label: '未接种',   value: 'unvaccinated' },
  { label: '已接种1剂', value: 'one_dose' },
  { label: '已接种2剂', value: 'two_doses' },
  { label: '已接种3剂', value: 'three_doses' },
  { label: '全程完成',  value: 'completed' }
]
const natureTags  = ['活泼', '温顺', '独立', '亲人', '胆小', '勇敢', '好奇', '安静', '粘人', '聪明']
const hobbyTags   = ['玩耍', '睡觉', '晒太阳', '捉虫', '追球', '游泳', '爬树', '看窗外']

// 性格标签选择（最多 5 个）
const toggleNature = (tag) => {
  const idx = form.value.nature.indexOf(tag)
  if (idx > -1) {
    form.value.nature.splice(idx, 1)
  } else if (form.value.nature.length < 5) {
    form.value.nature.push(tag)
  }
}

// 爱好标签
const toggleHobby = (tag) => {
  const idx = form.value.hobby.indexOf(tag)
  if (idx > -1) {
    form.value.hobby.splice(idx, 1)
  } else {
    form.value.hobby.push(tag)
  }
}

// ── 图片上传 ─────────────────────────────────────────────
const imagePreview = ref(null)
const imageLoading = ref(false)
const imageError   = ref(null)

const handleImageChange = async (e) => {
  const file = e.target.files[0]
  if (!file) return

  // 本地预览
  imagePreview.value = URL.createObjectURL(file)
  imageLoading.value = true
  imageError.value = null

  try {
    const fd = new FormData()
    fd.append('adoption', file)
    const res = await uploadAdoptionImageAPI(fd)

    if (res.code === 200) {
      form.value.image = res.data.fileUrl
    } else {
      imageError.value = res.message || '上传失败'
      imagePreview.value = null
    }
  } catch (err) {
    imageError.value = '图片上传失败，请重试'
    imagePreview.value = null
  } finally {
    imageLoading.value = false
  }
}

// ── 提交 ─────────────────────────────────────────────────
const submitting = ref(false)
const submitError = ref(null)

const isValid = computed(() => {
  return form.value.petName &&
    form.value.type &&
    form.value.breed &&
    form.value.sex !== null &&
    form.value.birthday &&
    form.value.image &&
    form.value.fee &&
    form.value.contact &&
    !(form.value.fee === 'paid' && !form.value.money)
})

const handleSubmit = async () => {
  if (!isValid.value) {
    submitError.value = '请填写所有必填项（带 * 的字段）'
    return
  }

  submitError.value = null
  submitting.value = true

  try {
    const payload = {
      petInfo: {
        nickName:      form.value.petName,
        type:          form.value.type,
        breed:         form.value.breed,
        sex:           form.value.sex,
        birthday:      form.value.birthday,
        vaccineStatus: form.value.vaccineStatus,
        image:         form.value.image,
        nature:        form.value.nature,
        hobby:         form.value.hobby,
        other_msg:     form.value.petOtherMsg
      },
      fee:    form.value.fee,
      money:  form.value.fee === 'paid' ? Number(form.value.money) : null,
      other_msg: form.value.reason,
      request: {
        requirements: form.value.requirements,
        location:     form.value.location,
        contact:      form.value.contact
      }
    }

    const res = await createAdoptionAPI(payload)

    if (res.code === 201) {
      alert('发布成功！')
      router.push('/adopt')
    } else {
      submitError.value = res.message || '发布失败，请稍后再试'
    }
  } catch (err) {
    submitError.value = err.message || '发布失败，请稍后再试'
  } finally {
    submitting.value = false
  }
}
</script>

<template>
  <div class="create-page">
    <div class="create-wrap">
      <!-- 头部 -->
      <div class="page-header">
        <button class="back-btn" @click="$router.back()">← 返回</button>
        <h1>发布领养信息</h1>
      </div>

      <div class="step-indicator">
        <div class="step active">
          <span class="step-num">1</span>
          <span class="step-label">宠物信息</span>
        </div>
        <div class="step-line"></div>
        <div class="step active">
          <span class="step-num">2</span>
          <span class="step-label">领养信息</span>
        </div>
      </div>

      <div class="form-layout">
        <!-- ── 左列：宠物信息 ─────────────────────────── -->
        <div class="form-section">
          <h2 class="section-title">宠物基本信息</h2>

          <!-- 图片上传 -->
          <div class="form-item full-width">
            <label class="form-label">宠物照片 <span class="required">*</span></label>
            <div class="image-upload-area" :class="{ 'has-image': imagePreview }">
              <input type="file" id="pet-img" accept="image/*" @change="handleImageChange" style="display:none" />
              <label for="pet-img" class="upload-trigger">
                <div v-if="imageLoading" class="upload-loading">🔄 上传中...</div>
                <img v-else-if="imagePreview" :src="imagePreview" alt="宠物照片预览" class="preview-img" />
                <div v-else class="upload-placeholder">
                  <CameraIcon :size="36" color="#d1d5db" />
                  <p>点击上传宠物照片</p>
                  <p class="upload-hint">支持 jpg、png，最大 5MB</p>
                </div>
              </label>
              <p v-if="imageError" class="image-error">{{ imageError }}</p>
            </div>
          </div>

          <!-- 宠物名 -->
          <div class="form-item">
            <label class="form-label">宠物昵称 <span class="required">*</span></label>
            <input class="form-input" v-model="form.petName" placeholder="给宠物取个名字吧" />
          </div>

          <!-- 类型 + 品种 -->
          <div class="form-item">
            <label class="form-label">宠物类型 <span class="required">*</span></label>
            <select class="form-input" v-model="form.type">
              <option value="" disabled>请选择</option>
              <option v-for="t in petTypes" :key="t" :value="t">{{ t }}</option>
            </select>
          </div>

          <div class="form-item">
            <label class="form-label">宠物品种 <span class="required">*</span></label>
            <input class="form-input" v-model="form.breed" placeholder="如：英国短毛猫" />
          </div>

          <!-- 性别 + 出生日期 -->
          <div class="form-item">
            <label class="form-label">宠物性别 <span class="required">*</span></label>
            <div class="radio-group">
              <button
                :class="['radio-btn', { active: form.sex === true }]"
                @click="form.sex = true"
              >♂ 雄</button>
              <button
                :class="['radio-btn', { active: form.sex === false }]"
                @click="form.sex = false"
              >♀ 雌</button>
            </div>
          </div>

          <div class="form-item">
            <label class="form-label">出生日期 <span class="required">*</span></label>
            <input type="date" class="form-input" v-model="form.birthday" :max="new Date().toISOString().split('T')[0]" />
          </div>

          <!-- 疫苗 -->
          <div class="form-item full-width">
            <label class="form-label">疫苗接种状态</label>
            <select class="form-input" v-model="form.vaccineStatus">
              <option v-for="v in vaccineOpts" :key="v.value" :value="v.value">{{ v.label }}</option>
            </select>
          </div>

          <!-- 性格 -->
          <div class="form-item full-width">
            <label class="form-label">宠物性格 <small>（最多选5个）</small></label>
            <div class="tag-group">
              <button
                v-for="tag in natureTags"
                :key="tag"
                :class="['tag-btn', { active: form.nature.includes(tag) }]"
                @click="toggleNature(tag)"
              >{{ tag }}</button>
            </div>
          </div>

          <!-- 爱好 -->
          <div class="form-item full-width">
            <label class="form-label">宠物爱好</label>
            <div class="tag-group">
              <button
                v-for="tag in hobbyTags"
                :key="tag"
                :class="['tag-btn hobby', { active: form.hobby.includes(tag) }]"
                @click="toggleHobby(tag)"
              >{{ tag }}</button>
            </div>
          </div>

          <!-- 宠物其他说明 -->
          <div class="form-item full-width">
            <label class="form-label">宠物简介</label>
            <textarea class="form-input" v-model="form.petOtherMsg" placeholder="简单介绍宠物，如健康状况、生活习惯等..." rows="3" />
          </div>
        </div>

        <!-- ── 右列：领养信息 ────────────────────────── -->
        <div class="form-section">
          <h2 class="section-title">领养相关信息</h2>

          <!-- 费用类型 -->
          <div class="form-item full-width">
            <label class="form-label">费用类型 <span class="required">*</span></label>
            <div class="radio-group">
              <button :class="['radio-btn', { active: form.fee === 'free' }]" @click="form.fee = 'free'"><GiftIcon :size="14" /> 无偿</button>
              <button :class="['radio-btn', { active: form.fee === 'paid' }]" @click="form.fee = 'paid'"><MoneyIcon :size="14" /> 有偿</button>
              <button :class="['radio-btn', { active: form.fee === 'negotiable' }]" @click="form.fee = 'negotiable'"><HandshakeIcon :size="14" /> 面议</button>
            </div>
          </div>

          <!-- 金额（有偿时显示） -->
          <div v-if="form.fee === 'paid'" class="form-item full-width">
            <label class="form-label">金额（元） <span class="required">*</span></label>
            <input type="number" class="form-input" v-model="form.money" min="0" placeholder="请输入领养金额" />
          </div>

          <!-- 联系方式 -->
          <div class="form-item full-width">
            <label class="form-label">联系方式 <span class="required">*</span></label>
            <input class="form-input" v-model="form.contact" placeholder="手机号或微信号" />
          </div>

          <!-- 所在地点 -->
          <div class="form-item full-width">
            <label class="form-label">所在地点</label>
            <input class="form-input" v-model="form.location" placeholder="如：北京市朝阳区" />
          </div>

          <!-- 领养要求 -->
          <div class="form-item full-width">
            <label class="form-label">领养要求</label>
            <textarea class="form-input" v-model="form.requirements" placeholder="对领养人有哪些要求？如：有养宠经验、有独立住房等..." rows="3" />
          </div>

          <!-- 说明 -->
          <div class="form-item full-width">
            <label class="form-label">发布说明</label>
            <textarea class="form-input" v-model="form.reason" placeholder="说明发布领养的原因..." rows="3" />
          </div>

          <!-- 提交区 -->
          <div class="submit-area">
            <p v-if="submitError" class="submit-error"><WarningIcon :size="14" color="#ef4444" /> {{ submitError }}</p>
            <button
              class="submit-btn"
              :disabled="!isValid || submitting || imageLoading"
              @click="handleSubmit"
            >
              {{ submitting ? '发布中...' : (imageLoading ? '图片上传中...' : '发布领养信息') }}
            </button>
            <p class="submit-hint">发布后可在「我的发布」中管理</p>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.create-page {
  min-height: 100vh;
  background: #f8f9fb;
  padding: 24px 20px 60px;
}

.create-wrap {
  max-width: 1100px;
  margin: 0 auto;
}

.page-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 28px;

  h1 { font-size: 24px; font-weight: 800; color: #1f2937; margin: 0; }
}

.back-btn {
  padding: 8px 20px;
  background: white;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  flex-shrink: 0;
  &:hover { border-color: #f97316; color: #f97316; }
}

// ── 步骤指示器 ──────────────────────────────────────
.step-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0;
  margin-bottom: 28px;
  padding: 0 20px;
}

.step {
  display: flex;
  align-items: center;
  gap: 8px;
  opacity: 0.4;
  transition: opacity 0.3s;

  &.active { opacity: 1; }
}

.step-num {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #e5e7eb;
  color: #9ca3af;
  font-size: 13px;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;

  .active & {
    background: linear-gradient(135deg, #ff9a3c, #f97316);
    color: white;
  }
}

.step-label {
  font-size: 14px;
  font-weight: 600;
  color: #9ca3af;

  .active & { color: #1f2937; }
}

.step-line {
  width: 60px;
  height: 2px;
  background: linear-gradient(90deg, #f97316, #ff9a3c);
  margin: 0 12px;
  border-radius: 1px;
}

.form-layout {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  align-items: start;

  @media (max-width: 768px) { grid-template-columns: 1fr; }
}

.form-section {
  background: white;
  border-radius: 20px;
  padding: 28px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.06);
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  align-items: start;

  @media (max-width: 500px) { grid-template-columns: 1fr; }
}

.section-title {
  grid-column: 1 / -1;
  font-size: 17px;
  font-weight: 700;
  color: #1f2937;
  margin: 0;
  padding-bottom: 16px;
  padding-left: 14px;
  border-bottom: 2px solid #f3f4f6;
  border-left: 3px solid #f97316;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 6px;

  &.full-width { grid-column: 1 / -1; }
}

.form-label {
  font-size: 14px;
  font-weight: 600;
  color: #374151;

  .required { color: #ef4444; }
  small { font-size: 12px; color: #9ca3af; font-weight: 400; }
}

.form-input {
  padding: 10px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  font-size: 14px;
  color: #1f2937;
  outline: none;
  transition: border-color 0.2s, box-shadow 0.2s, background 0.2s;
  font-family: inherit;
  background: white;

  &:focus {
    border-color: #f97316;
    box-shadow: 0 0 0 3px rgba(249, 115, 22, 0.1);
    background: #fffdf9;
  }
  &::placeholder { color: #d1d5db; }
}

textarea.form-input { resize: vertical; }

/* 图片上传 */
.image-upload-area {
  border: 2px dashed #d1d5db;
  border-radius: 14px;
  overflow: hidden;
  transition: border-color 0.3s, background 0.3s, transform 0.2s;

  &:hover {
    border-color: #f97316;
    background: #fffbeb;
    transform: translateY(-1px);
  }

  &.has-image {
    border-color: #f97316;
    border-style: solid;
  }
}

.upload-trigger {
  display: block;
  cursor: pointer;
}

.upload-placeholder {
  padding: 32px;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;

  p { font-size: 14px; color: #9ca3af; margin: 0; }
  .upload-hint { font-size: 12px; }
}

.upload-loading {
  padding: 32px;
  text-align: center;
  font-size: 14px;
  color: #f97316;
}

.preview-img {
  width: 100%;
  height: 200px;
  object-fit: cover;
  display: block;
}

.image-error {
  font-size: 12px;
  color: #ef4444;
  margin: 6px 0 0;
  padding: 0 12px 8px;
}

/* 单选按钮组 */
.radio-group {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.radio-btn {
  padding: 8px 20px;
  border: 1.5px solid #e5e7eb;
  border-radius: 10px;
  background: white;
  font-size: 14px;
  font-weight: 500;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
  display: inline-flex;
  align-items: center;
  gap: 6px;

  &:hover  { border-color: #f97316; color: #f97316; }
  &.active {
    background: linear-gradient(135deg, #ff9a3c, #f97316);
    border-color: transparent;
    color: white;
    box-shadow: 0 2px 8px rgba(249, 115, 22, 0.3);
  }
}

/* 标签组 */
.tag-group {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-btn {
  padding: 6px 14px;
  border: 1.5px solid #e5e7eb;
  border-radius: 20px;
  background: white;
  font-size: 13px;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;

  &:hover  { border-color: #3b82f6; color: #3b82f6; }
  &.active { background: #eff6ff; border-color: #3b82f6; color: #1d4ed8; }
  &.hobby:hover  { border-color: #16a34a; color: #16a34a; }
  &.hobby.active { background: #f0fdf4; border-color: #16a34a; color: #166534; }
}

/* 提交区 */
.submit-area {
  grid-column: 1 / -1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  margin-top: 8px;
}

.submit-error {
  font-size: 13px;
  color: #ef4444;
  margin: 0;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 4px;
}

.submit-btn {
  width: 100%;
  padding: 16px;
  background: linear-gradient(135deg, #ff9a3c, #f97316);
  color: white;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  box-shadow: 0 4px 16px rgba(249,115,22,0.35);
  transition: all 0.3s;

  &:hover:not(:disabled) { transform: translateY(-2px); box-shadow: 0 6px 24px rgba(249,115,22,0.5); }
  &:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
}

.submit-hint {
  font-size: 12px;
  color: #9ca3af;
  margin: 0;
}
</style>
