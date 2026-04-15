<script setup>
import { AdminLoginAPI } from '@/api/admin'
import { useAdminStore } from '@/stores/admin'
import { useRouter } from 'vue-router'
import { ref, reactive } from 'vue'
import { ElMessage } from 'element-plus'

const router = useRouter()
const adminStore = useAdminStore()

// 表单数据
const loginForm = reactive({
    account: '',  // 修改：username -> account
    password: ''
})

// 表单验证规则
const formRules = {
    account: [  // 修改：username -> account
        { required: true, message: '请输入账号', trigger: 'blur' },
        {
            pattern: /^[a-zA-Z0-9_]{6,16}$/,
            message: '账号格式为6-16位字母数字下划线',
            trigger: 'blur'
        }
    ],
    password: [
        { required: true, message: '请输入密码', trigger: 'blur' },
        {
            pattern: /^[a-zA-Z0-9_]{6,16}$/,
            message: '密码格式为6-16位字母数字下划线',
            trigger: 'blur'
        }
    ]
}

const loading = ref(false)
const loginFormRef = ref(null)

// 表单验证
const validateForm = () => {
    return new Promise((resolve) => {
        if (!loginFormRef.value) {
            resolve(false)
            return
        }
        loginFormRef.value.validate((valid) => {
            resolve(valid)
        })
    })
}

// 登录处理
const handleLogin = async () => {
    // 表单验证
    const isValid = await validateForm()
    if (!isValid) {
        return
    }

    try {
        loading.value = true
        const response = await AdminLoginAPI(loginForm)
        console.log('登录响应:', response)


        // 检查响应数据结构
        if (response && response.data?.token) {
            adminStore.setToken(response.data.token)
            if (response.data.admin) {
                adminStore.setAdminInfo(response.data.admin)
            }
            ElMessage.success('登录成功')
            router.push('/admin')
        } else {
            ElMessage.error('登录响应数据格式错误')
        }
    } catch (error) {
        console.error('登录错误:', error)
        const errorMessage = error.message || '登录失败，请检查账号和密码'
        ElMessage.error(errorMessage)
    } finally {
        loading.value = false
    }
}

// 回车登录
const handleKeyup = (event) => {
    if (event.key === 'Enter') {
        handleLogin()
    }
}
</script>

<template>
    <div class="login-container">
        <!-- 左侧蓝色区域 -->
        <div class="login-left">
            <div class="welcome-content">
                <h1 class="welcome-title">欢迎使用</h1>
                <h2 class="system-name">宠物平台管理系统</h2>
                <p class="welcome-desc">为您提供专业的宠物管理服务</p>
                <div class="decorative-elements">
                    <div class="circle circle-1"></div>
                    <div class="circle circle-2"></div>
                    <div class="circle circle-3"></div>
                </div>
            </div>
        </div>

        <!-- 右侧登录区域 -->
        <div class="login-right">
            <div class="login-form-container">
                <div class="login-header">
                    <h3 class="login-title">登录</h3>
                </div>

                <el-form ref="loginFormRef" :model="loginForm" :rules="formRules" class="login-form"
                    @submit.prevent="handleLogin">
                    <el-form-item prop="account">
                        <el-input v-model="loginForm.account" placeholder="账号" size="large" class="login-input"
                            @keyup="handleKeyup" />
                    </el-form-item>

                    <el-form-item prop="password">
                        <el-input v-model="loginForm.password" type="password" placeholder="密码" size="large"
                            class="login-input" show-password @keyup="handleKeyup" />
                    </el-form-item>

                    <el-form-item>
                        <el-button type="primary" size="large" class="login-button" :loading="loading"
                            @click="handleLogin">
                            {{ loading ? '登录中...' : 'LOGIN' }}
                        </el-button>
                    </el-form-item>
                </el-form>
            </div>
        </div>
    </div>
</template>

<style scoped lang="scss">
.login-container {
    display: flex;
    height: 100vh;
    overflow: hidden;
}

.login-left {
    flex: 1;
    background: linear-gradient(135deg, #4A90E2 0%, #357ABD 50%, #2E5B8A 100%);
    position: relative;
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;

    &::before {
        content: '';
        position: absolute;
        top: 0;
        right: 0;
        width: 200px;
        height: 100%;
        background: linear-gradient(90deg, transparent 0%, rgba(255, 255, 255, 0.1) 100%);
        transform: skewX(-15deg);
        transform-origin: top right;
    }
}

.welcome-content {
    text-align: center;
    color: white;
    z-index: 2;
    position: relative;

    .welcome-title {
        font-size: 48px;
        font-weight: 300;
        margin: 0 0 16px 0;
        letter-spacing: 2px;
    }

    .system-name {
        font-size: 32px;
        font-weight: 600;
        margin: 0 0 24px 0;
        letter-spacing: 1px;
    }

    .welcome-desc {
        font-size: 18px;
        opacity: 0.9;
        margin: 0;
        font-weight: 300;
    }
}

.decorative-elements {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    pointer-events: none;

    .circle {
        position: absolute;
        border-radius: 50%;
        background: rgba(255, 255, 255, 0.1);

        &.circle-1 {
            width: 120px;
            height: 120px;
            top: 20%;
            left: 10%;
            animation: float 6s ease-in-out infinite;
        }

        &.circle-2 {
            width: 80px;
            height: 80px;
            top: 60%;
            left: 20%;
            animation: float 8s ease-in-out infinite reverse;
        }

        &.circle-3 {
            width: 60px;
            height: 60px;
            top: 30%;
            right: 15%;
            animation: float 7s ease-in-out infinite;
        }
    }
}

@keyframes float {

    0%,
    100% {
        transform: translateY(0px);
    }

    50% {
        transform: translateY(-20px);
    }
}

.login-right {
    flex: 1;
    background: #f8f9fa;
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 40px;
}

.login-form-container {
    width: 100%;
    max-width: 400px;
    background: white;
    border-radius: 16px;
    padding: 48px 40px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
}

.login-header {
    text-align: center;
    margin-bottom: 40px;

    .login-title {
        font-size: 28px;
        font-weight: 600;
        color: #2c3e50;
        margin: 0;
    }
}

.login-form {
    .form-item {
        margin-bottom: 24px;

        &:last-child {
            margin-bottom: 0;
        }
    }
}

.login-input {
    :deep(.el-input__wrapper) {
        background-color: #f8f9fa;
        border: 2px solid #e9ecef;
        border-radius: 12px;
        box-shadow: none;
        padding: 16px 20px;
        height: 56px;
        transition: all 0.3s ease;

        &:hover {
            border-color: #4A90E2;
        }

        &.is-focus {
            border-color: #4A90E2;
            background-color: #ffffff;
            box-shadow: 0 0 0 4px rgba(74, 144, 226, 0.1);
        }
    }

    :deep(.el-input__inner) {
        color: #2c3e50;
        font-size: 16px;
        font-weight: 400;
        height: 100%;

        &::placeholder {
            color: #95a5a6;
            font-weight: 400;
        }
    }
}

.login-button {
    width: 100%;
    height: 56px;
    background: linear-gradient(135deg, #4A90E2 0%, #357ABD 100%);
    border: none;
    border-radius: 12px;
    font-size: 16px;
    font-weight: 600;
    letter-spacing: 1px;
    transition: all 0.3s ease;

    &:hover {
        background: linear-gradient(135deg, #357ABD 0%, #2E5B8A 100%);
        transform: translateY(-2px);
        box-shadow: 0 8px 25px rgba(74, 144, 226, 0.3);
    }

    &:active {
        transform: translateY(0);
    }
}

@media (max-width: 768px) {
    .login-container {
        flex-direction: column;
    }

    .login-left {
        flex: 0 0 40%;

        .welcome-content {
            .welcome-title {
                font-size: 32px;
            }

            .system-name {
                font-size: 24px;
            }

            .welcome-desc {
                font-size: 16px;
            }
        }
    }

    .login-right {
        flex: 1;
        padding: 20px;
    }

    .login-form-container {
        padding: 32px 24px;
    }
}

// 保持原有的样式不变

// 添加表单验证错误样式
:deep(.el-form-item__error) {
    color: #f56c6c;
    font-size: 12px;
    line-height: 1;
    padding-top: 4px;
    position: absolute;
    top: 100%;
    left: 0;
}

:deep(.el-form-item) {
    position: relative;
    margin-bottom: 32px;
}

:deep(.el-form-item.is-error .el-input__wrapper) {
    border-color: #f56c6c;
}
</style>