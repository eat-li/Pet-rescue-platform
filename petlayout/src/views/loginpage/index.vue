<template>
  <div class="register-container">
    <el-card class="register-card">
      <h2 class="title">用户注册</h2>
      <el-form ref="formRef" :model="form" :rules="rules" label-position="top" @keyup.enter="handleRegister">
        <!-- 用户名输入 -->
        <el-form-item prop="username" label="用户名">
          <el-input v-model="form.username" placeholder="5-15位字母/数字/下划线" clearable :prefix-icon="User" />
        </el-form-item>

        <!-- 密码输入 -->
        <el-form-item prop="password" label="密码">
          <el-input v-model="form.password" type="password" placeholder="至少6位字符" show-password :prefix-icon="Lock" />
        </el-form-item>

        <!-- 确认密码 -->
        <el-form-item prop="confirmPassword" label="确认密码">
          <el-input v-model="form.confirmPassword" type="password" placeholder="请再次输入密码" show-password
            :prefix-icon="Lock" />
        </el-form-item>

        <!-- 昵称输入 -->
        <el-form-item prop="nickname" label="昵称">
          <el-input v-model="form.nickname" placeholder="输入你的个性昵称" clearable :prefix-icon="User" />
        </el-form-item>

        <!-- 注册按钮 -->
        <el-form-item>
          <el-button type="primary" :loading="loading" class="submit-btn" @click="handleRegister">
            {{ loading ? '注册中...' : '立即注册' }}
          </el-button>
        </el-form-item>
      </el-form>

      <div class="login-link">
        已有账号？
        <el-link type="primary" @click="$router.push('/login')">立即登录</el-link>
      </div>
    </el-card>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { User, Lock } from '@element-plus/icons-vue';
import { ElMessage } from 'element-plus';
import { useRouter } from 'vue-router';
import { register } from '@/api/user.js'; // 您的注册API

const router = useRouter();
const formRef = ref(null);
const loading = ref(false);

// 表单数据
const form = ref({
  username: '',
  password: '',
  confirmPassword: '',
  nickname: ''
});


// 处理注册
const handleRegister = async () => {
  try {
    await formRef.value.validate();
    if (form.password !== form.confirmPassword) {
      ElMessage.error('两次输入的密码不一致');
      return;
    }
    loading.value = true;
    await register(form);
    ElMessage.success('注册成功');
    router.push('/login');
  } catch (error) {
    console.error(error);
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.register-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  background: #f5f7fa;
}

.register-card {
  width: 480px;
  padding: 30px 40px;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
}

.title {
  text-align: center;
  margin-bottom: 30px;
  color: #303133;
}

.submit-btn {
  width: 100%;
  height: 40px;
  margin-top: 10px;
}

.login-link {
  text-align: center;
  margin-top: 20px;
  color: #909399;
}
</style>