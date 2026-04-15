<script setup>
import PageContainer from '../../components/Common/PageContainer.vue'
import Mypagination from '../../components/Common/Mypagination.vue'
import { Plus, Search, Delete, Edit, View, Refresh } from '@element-plus/icons-vue'
import { ref, reactive, onMounted } from 'vue'
import { ElMessage } from 'element-plus'
import { usePetData } from '../../hooks/usePetData'
import { getUserListAPI } from '@/api/user'
import { formatImageUrl } from '@/utils/imgformat'

const {
  petData, pagination, searchText, loading, selectedRows, showBatchActions,
  fetchPetList, fetchPetDetail, handleCreatePet, handleUpdatePet, uploadPetImage,
  handleDelete, handleBatchDelete, handleSelectionChange,
  handleSearch, handleReset, handlePageChange, handleSizeChange
} = usePetData()

// ===== 类型/状态辅助 =====
const typeTextMap    = { dog: '狗', cat: '猫', bird: '鸟', other: '其他' }
const typeTagTypeMap = { dog: 'primary', cat: 'success', bird: 'warning', other: 'info' }
const vaccineTagMap  = {
  unvaccinated: { label: '未接种', type: 'danger' },
  one_dose:     { label: '一针',   type: 'warning' },
  two_doses:    { label: '两针',   type: '' },
  three_doses:  { label: '三针',   type: 'primary' },
  completed:    { label: '已完成', type: 'success' }
}
const getTypeText     = (t) => typeTextMap[t]    || t
const getTypeTagType  = (t) => typeTagTypeMap[t]  || 'info'
const getVaccineLabel = (s) => vaccineTagMap[s]?.label || s
const getVaccineType  = (s) => vaccineTagMap[s]?.type  || 'info'

// 预定义选项
const natureOptions = ['活泼', '温顺', '黏人', '独立', '爱撒娇', '聪明', '警惕', '顽皮']
const hobbyOptions  = ['玩耍', '睡觉', '吃东西', '运动', '游泳', '追球', '梳毛', '爬高']

// ===== 查看弹窗 =====
const showViewDialog = ref(false)
const viewPet = ref(null)

const handleView = (row) => {
  viewPet.value = row
  showViewDialog.value = true
}

// ===== 新增/编辑弹窗 =====
const showFormDialog  = ref(false)
const dialogTitle     = ref('新增宠物')
const isEditing       = ref(false)
const editingId       = ref(null)
const dialogLoading   = ref(false)
const formRef         = ref(null)

const petForm = reactive({
  userId:        null,
  nickName:      '',
  type:          '',
  breed:         '',
  sex:           true,
  birthday:      '',
  vaccineStatus: 'unvaccinated',
  image:         '',
  nature:        [],
  hobby:         [],
  other_msg:     ''
})

const rules = {
  userId:        [{ required: true, message: '请选择宠物主人', trigger: 'change' }],
  nickName:      [{ required: true, message: '请输入宠物名称', trigger: 'blur' }],
  type:          [{ required: true, message: '请选择宠物类型', trigger: 'change' }],
  breed:         [{ required: true, message: '请输入品种',     trigger: 'blur' }],
  birthday:      [{ required: true, message: '请选择出生日期', trigger: 'change' }],
  vaccineStatus: [{ required: true, message: '请选择疫苗状态', trigger: 'change' }],
  image:         [{ required: true, message: '请上传宠物图片', trigger: 'change' }],
}

// ===== 用户搜索 =====
const userSearchLoading = ref(false)
const userOptions       = ref([])

const searchUsers = async (query) => {
  if (!query?.trim()) { userOptions.value = []; return }
  userSearchLoading.value = true
  try {
    const res = await getUserListAPI({ search: query, limit: 20 })
    if (res.code === 200) userOptions.value = res.data.users || []
  } catch { /* ignore */ } finally {
    userSearchLoading.value = false
  }
}

// ===== 弹窗操作 =====
const resetForm = () => {
  Object.assign(petForm, {
    userId: null, nickName: '', type: '', breed: '', sex: true,
    birthday: '', vaccineStatus: 'unvaccinated', image: '',
    nature: [], hobby: [], other_msg: ''
  })
  userOptions.value = []
  formRef.value?.clearValidate()
}

const handleAdd = () => {
  dialogTitle.value = '新增宠物'
  isEditing.value = false
  editingId.value = null
  resetForm()
  showFormDialog.value = true
}

const handleEdit = async (row) => {
  dialogTitle.value = '编辑宠物'
  isEditing.value = true
  editingId.value = row.id
  dialogLoading.value = true
  showFormDialog.value = true
  try {
    const detail = await fetchPetDetail(row.id)
    const src = detail || row
    // 预填用户选项
    userOptions.value = [{ id: src.userId, username: row.username || '', nickname: row.nickname || '' }]
    Object.assign(petForm, {
      userId:        src.userId,
      nickName:      src.nickName      || '',
      type:          src.type          || '',
      breed:         src.breed         || '',
      sex:           src.sex           ?? true,
      birthday:      src.birthday ? src.birthday.split('T')[0] : '',
      vaccineStatus: src.vaccineStatus || 'unvaccinated',
      image:         src.image         || '',
      nature:        Array.isArray(src.nature) ? src.nature : [],
      hobby:         Array.isArray(src.hobby)  ? src.hobby  : [],
      other_msg:     src.other_msg     || ''
    })
  } finally {
    dialogLoading.value = false
  }
}

const handleSave = async () => {
  if (!formRef.value) return
  await formRef.value.validate(async (valid) => {
    if (!valid) return
    const success = isEditing.value
      ? await handleUpdatePet(editingId.value, petForm)
      : await handleCreatePet(petForm)
    if (success) { showFormDialog.value = false; resetForm() }
  })
}

// ===== 图片上传 =====
const handleImageUpload = async (options) => {
  const result = await uploadPetImage(options.file)
  if (result.success) {
    petForm.image = result.url
    formRef.value?.clearValidate('image')
  }
}

onMounted(() => fetchPetList())
</script>

<template>
  <PageContainer title="宠物管理">
    <template #extra>
      <div class="header-actions">
        <el-input v-model="searchText.search" placeholder="搜索宠物名称..." class="search-input"
          @keyup.enter="handleSearch" clearable>
          <template #prefix><el-icon><Search /></el-icon></template>
        </el-input>

        <el-select v-model="searchText.type" placeholder="宠物类型" clearable class="filter-select"
          @change="handleSearch">
          <el-option label="狗" value="dog" />
          <el-option label="猫" value="cat" />
          <el-option label="鸟" value="bird" />
          <el-option label="其他" value="other" />
        </el-select>

        <el-input v-model="searchText.breed" placeholder="品种" clearable class="breed-input"
          @keyup.enter="handleSearch" />

        <el-button type="info" plain @click="handleReset">
          <el-icon><Refresh /></el-icon>重置
        </el-button>
        <el-button type="primary" class="add-button" @click="handleAdd">
          <el-icon><Plus /></el-icon>新增宠物
        </el-button>
      </div>
    </template>

    <template #content>
      <div class="pet-content">
        <!-- 批量操作 -->
        <div v-if="showBatchActions" class="batch-actions">
          <span class="batch-info">已选中 <strong>{{ selectedRows.length }}</strong> 条记录</span>
          <div class="batch-buttons">
            <el-button size="small" type="danger" @click="handleBatchDelete">
              <el-icon><Delete /></el-icon>批量删除
            </el-button>
          </div>
        </div>

        <!-- 表格 -->
        <div class="table-container">
          <el-table :data="petData" v-loading="loading" stripe height="500"
            @selection-change="handleSelectionChange" style="width:100%" :border="false">
            <el-table-column type="selection" width="50" fixed />

            <!-- 宠物图片 -->
            <el-table-column label="照片" width="80" align="center">
              <template #default="{ row }">
                <el-image v-if="row.cover" :src="row.cover" :preview-src-list="[row.cover]"
                  fit="cover" style="width:50px;height:50px;border-radius:8px;" />
                <div v-else class="no-image">无图</div>
              </template>
            </el-table-column>

            <el-table-column prop="nickName" label="宠物名称" width="120" show-overflow-tooltip />

            <!-- 主人信息 -->
            <el-table-column label="主人" width="160" align="center">
              <template #default="{ row }">
                <div class="owner-cell">
                  <el-avatar :src="row.avatar" :size="28" />
                  <div class="owner-text">
                    <div class="owner-name">{{ row.username }}</div>
                    <div class="owner-nick">{{ row.nickname }}</div>
                  </div>
                </div>
              </template>
            </el-table-column>

            <!-- 类型 -->
            <el-table-column label="类型" width="80" align="center">
              <template #default="{ row }">
                <el-tag :type="getTypeTagType(row.type)" size="small" effect="light">
                  {{ getTypeText(row.type) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="breed" label="品种" width="100" show-overflow-tooltip />

            <!-- 性别 -->
            <el-table-column label="性别" width="70" align="center">
              <template #default="{ row }">
                <span :class="row.sex ? 'sex-male' : 'sex-female'">
                  {{ row.sex ? '♂ 雄' : '♀ 雌' }}
                </span>
              </template>
            </el-table-column>

            <el-table-column prop="age" label="年龄" width="100" align="center" />

            <!-- 疫苗 -->
            <el-table-column label="疫苗状态" width="100" align="center">
              <template #default="{ row }">
                <el-tag :type="getVaccineType(row.vaccineStatus)" size="small" effect="light">
                  {{ getVaccineLabel(row.vaccineStatus) }}
                </el-tag>
              </template>
            </el-table-column>

            <el-table-column prop="create_time" label="创建时间" width="175" align="center" />

            <!-- 操作 -->
            <el-table-column label="操作" width="130" fixed="right" align="center">
              <template #default="{ row }">
                <div class="action-buttons">
                  <el-button size="small" plain @click="handleView(row)">
                    <el-icon><View /></el-icon>
                  </el-button>
                  <el-button size="small" plain @click="handleEdit(row)">
                    <el-icon><Edit /></el-icon>
                  </el-button>
                  <el-button size="small" type="danger" plain @click="handleDelete(row.id)">
                    <el-icon><Delete /></el-icon>
                  </el-button>
                </div>
              </template>
            </el-table-column>
          </el-table>

          <Mypagination :current-page="pagination.currentPage" :page-size="pagination.pageSize"
            :total-items="pagination.totalItems" @page-change="handlePageChange" />
        </div>

        <!-- ===== 查看弹窗 ===== -->
        <el-dialog v-model="showViewDialog" title="宠物详情" width="640" align-center>
          <div v-if="viewPet" class="view-content">
            <div class="view-header">
              <el-image v-if="viewPet.cover" :src="viewPet.cover" fit="cover" class="view-img" />
              <div v-else class="view-img-empty">暂无图片</div>
              <div class="view-main-info">
                <div class="view-name">{{ viewPet.nickName }}</div>
                <div class="view-tags">
                  <el-tag :type="getTypeTagType(viewPet.type)" effect="dark" size="small">
                    {{ getTypeText(viewPet.type) }}
                  </el-tag>
                  <el-tag :type="getVaccineType(viewPet.vaccineStatus)" size="small" effect="light">
                    疫苗：{{ getVaccineLabel(viewPet.vaccineStatus) }}
                  </el-tag>
                  <span :class="viewPet.sex ? 'sex-male' : 'sex-female'" style="font-size:14px;">
                    {{ viewPet.sex ? '♂ 雄性' : '♀ 雌性' }}
                  </span>
                </div>
              </div>
            </div>

            <el-descriptions :column="2" border size="small" class="view-desc">
              <el-descriptions-item label="品种">{{ viewPet.breed }}</el-descriptions-item>
              <el-descriptions-item label="年龄">{{ viewPet.age }}</el-descriptions-item>
              <el-descriptions-item label="主人账号">{{ viewPet.username }}</el-descriptions-item>
              <el-descriptions-item label="主人昵称">{{ viewPet.nickname }}</el-descriptions-item>
              <el-descriptions-item label="创建时间" :span="2">{{ viewPet.create_time }}</el-descriptions-item>

              <el-descriptions-item v-if="viewPet.nature?.length" label="性格" :span="2">
                <el-tag v-for="n in viewPet.nature" :key="n" size="small" style="margin:2px;">{{ n }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item v-if="viewPet.hobby?.length" label="爱好" :span="2">
                <el-tag v-for="h in viewPet.hobby" :key="h" type="success" size="small" style="margin:2px;">{{ h }}</el-tag>
              </el-descriptions-item>
              <el-descriptions-item v-if="viewPet.other_msg" label="其他信息" :span="2">
                {{ viewPet.other_msg }}
              </el-descriptions-item>
            </el-descriptions>
          </div>
          <template #footer>
            <el-button @click="showViewDialog = false">关闭</el-button>
          </template>
        </el-dialog>

        <!-- ===== 新增/编辑弹窗 ===== -->
        <el-dialog v-model="showFormDialog" :title="dialogTitle" width="620" align-center
          @close="resetForm" destroy-on-close>
          <el-form ref="formRef" :model="petForm" :rules="rules" label-width="90px"
            v-loading="dialogLoading" class="pet-form">

            <!-- 绑定主人 -->
            <el-form-item label="宠物主人" prop="userId">
              <el-select v-model="petForm.userId" filterable remote :remote-method="searchUsers"
                :loading="userSearchLoading" placeholder="输入用户名搜索并选择" style="width:100%"
                loading-text="搜索中..." no-data-text="无匹配用户，请继续输入"
                :disabled="isEditing">
                <el-option v-for="u in userOptions" :key="u.id"
                  :label="`${u.username}（${u.nickname}）`" :value="u.id" />
              </el-select>
              <div v-if="isEditing" class="form-tip">编辑时不可更换主人</div>
            </el-form-item>

            <div class="form-row">
              <el-form-item label="宠物名称" prop="nickName" class="form-half">
                <el-input v-model="petForm.nickName" placeholder="请输入宠物名称" maxlength="30" show-word-limit />
              </el-form-item>
              <el-form-item label="宠物类型" prop="type" class="form-half">
                <el-select v-model="petForm.type" placeholder="请选择" style="width:100%">
                  <el-option label="狗" value="dog" />
                  <el-option label="猫" value="cat" />
                  <el-option label="鸟" value="bird" />
                  <el-option label="其他" value="other" />
                </el-select>
              </el-form-item>
            </div>

            <div class="form-row">
              <el-form-item label="品种" prop="breed" class="form-half">
                <el-input v-model="petForm.breed" placeholder="请输入品种" maxlength="30" />
              </el-form-item>
              <el-form-item label="性别" class="form-half">
                <el-radio-group v-model="petForm.sex">
                  <el-radio :value="true">♂ 雄性</el-radio>
                  <el-radio :value="false">♀ 雌性</el-radio>
                </el-radio-group>
              </el-form-item>
            </div>

            <div class="form-row">
              <el-form-item label="出生日期" prop="birthday" class="form-half">
                <el-date-picker v-model="petForm.birthday" type="date" placeholder="选择日期"
                  format="YYYY-MM-DD" value-format="YYYY-MM-DD" style="width:100%" />
              </el-form-item>
              <el-form-item label="疫苗状态" prop="vaccineStatus" class="form-half">
                <el-select v-model="petForm.vaccineStatus" style="width:100%">
                  <el-option label="未接种"   value="unvaccinated" />
                  <el-option label="一针"     value="one_dose" />
                  <el-option label="两针"     value="two_doses" />
                  <el-option label="三针"     value="three_doses" />
                  <el-option label="全程完成" value="completed" />
                </el-select>
              </el-form-item>
            </div>

            <!-- 图片 -->
            <el-form-item label="宠物图片" prop="image">
              <el-upload class="pet-uploader" action="#" :http-request="handleImageUpload"
                :show-file-list="false" accept="image/*">
                <img v-if="petForm.image" :src="formatImageUrl(petForm.image)" class="pet-upload-img" />
                <div v-else class="upload-placeholder">
                  <el-icon :size="28" style="color:#c0c4cc"><Plus /></el-icon>
                  <div style="font-size:12px;color:#9ca3af;margin-top:6px">点击上传</div>
                </div>
              </el-upload>
            </el-form-item>

            <!-- 性格 -->
            <el-form-item label="宠物性格">
              <el-checkbox-group v-model="petForm.nature" class="tag-check-group">
                <el-checkbox-button v-for="n in natureOptions" :key="n" :value="n">{{ n }}</el-checkbox-button>
              </el-checkbox-group>
            </el-form-item>

            <!-- 爱好 -->
            <el-form-item label="宠物爱好">
              <el-checkbox-group v-model="petForm.hobby" class="tag-check-group">
                <el-checkbox-button v-for="h in hobbyOptions" :key="h" :value="h">{{ h }}</el-checkbox-button>
              </el-checkbox-group>
            </el-form-item>

            <!-- 其他 -->
            <el-form-item label="其他信息">
              <el-input v-model="petForm.other_msg" type="textarea" :rows="3"
                placeholder="填写其他补充信息（可选）" />
            </el-form-item>
          </el-form>

          <template #footer>
            <div class="dialog-footer">
              <el-button @click="showFormDialog = false; resetForm()">取消</el-button>
              <el-button type="primary" @click="handleSave" :loading="loading">
                {{ isEditing ? '保存修改' : '确认添加' }}
              </el-button>
            </div>
          </template>
        </el-dialog>
      </div>
    </template>
  </PageContainer>
</template>

<style scoped lang="scss">
.header-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.search-input { width: 200px; }
.filter-select { width: 120px; }
.breed-input { width: 100px; }

.add-button {
  background: #CEDDF6;
  border: 1px solid #d0d7de;
  color: #2563EB;
  border-radius: 6px;
  height: 40px;
  &:hover { background: #1F2937; border-color: #d0d7de; color: #fff; }
}

.pet-content { display: flex; flex-direction: column; gap: 16px; }

.batch-actions {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: #f8f9fa;
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 12px 16px;
  .batch-info { color: #495057; font-size: 14px; strong { color: #8470FF; font-weight: 600; } }
  .batch-buttons { display: flex; gap: 8px; }
}

.table-container {
  background: white;
  border-radius: 8px;
  padding: 0 20px;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
  border: 1px solid #f0f0f0;
}

.no-image {
  width: 50px; height: 50px;
  background: #f5f5f5; border-radius: 6px;
  display: flex; align-items: center; justify-content: center;
  color: #999; font-size: 11px;
}

.owner-cell {
  display: flex; align-items: center; gap: 8px;
  .owner-text { text-align: left; }
  .owner-name { font-size: 13px; font-weight: 500; color: #374151; }
  .owner-nick { font-size: 11px; color: #9ca3af; }
}

.sex-male   { color: #3b82f6; font-weight: 600; }
.sex-female { color: #ec4899; font-weight: 600; }

.action-buttons {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 4px;
  .el-button { width: 100%; margin: 0 !important; }
}

:deep(.el-table) {
  border: none;
  .el-table__inner-wrapper::before,
  .el-table__inner-wrapper::after { display: none; }
  th, td { border: none !important; }
}

:deep(.el-pagination) { display: flex; justify-content: center; margin-top: 20px; }

/* ===== 查看弹窗 ===== */
.view-header {
  display: flex;
  gap: 20px;
  align-items: flex-start;
  margin-bottom: 16px;
}

.view-img {
  width: 120px; height: 120px;
  border-radius: 12px;
  object-fit: cover;
  flex-shrink: 0;
  box-shadow: 0 4px 12px rgba(0,0,0,0.12);
}

.view-img-empty {
  width: 120px; height: 120px;
  background: #f3f4f6; border-radius: 12px;
  display: flex; align-items: center; justify-content: center;
  color: #9ca3af; font-size: 13px; flex-shrink: 0;
}

.view-name {
  font-size: 22px;
  font-weight: 700;
  color: #1f2937;
  margin-bottom: 10px;
}

.view-tags { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; }

.view-desc { margin-top: 4px; }

/* ===== 表单弹窗 ===== */
.pet-form {
  max-height: 500px;
  overflow-y: auto;
  padding-right: 8px;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0 12px;
}

.form-half {
  :deep(.el-form-item__content) { display: block; }
}

.form-tip { font-size: 12px; color: #9ca3af; margin-top: 4px; }

.tag-check-group {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  :deep(.el-checkbox-button__inner) {
    border-radius: 6px !important;
    border: 1px solid #e5e7eb !important;
    padding: 4px 12px;
    font-size: 12px;
  }
  :deep(.el-checkbox-button.is-checked .el-checkbox-button__inner) {
    background: #8470FF;
    border-color: #8470FF !important;
    box-shadow: none !important;
  }
}

.pet-uploader {
  :deep(.el-upload) {
    border: 2px dashed #e5e7eb;
    border-radius: 10px;
    cursor: pointer;
    overflow: hidden;
    transition: border-color 0.2s;
    &:hover { border-color: #8470FF; }
  }
}

.pet-upload-img {
  width: 160px; height: 110px;
  display: block; object-fit: cover;
}

.upload-placeholder {
  width: 160px; height: 110px;
  display: flex; flex-direction: column;
  align-items: center; justify-content: center;
}

.dialog-footer { display: flex; justify-content: flex-end; gap: 8px; }
</style>
