<script setup>
import { ref, reactive } from 'vue'
//导入注册接口
import { registerAPI, loginAPI } from '@/api/user'
import { ElMessage } from 'element-plus'
import { useRouter } from 'vue-router'
import { useUserStore } from '@/store/user.js'
const router = useRouter()
const userStore = useUserStore()
//登录和注册切换
const activeName = ref('login')
//登录和注册表单
const loginForm = ref()
const registerForm = ref()

const loginData = reactive({
  account: null,
  password: ''
})
// 添加角色选择
const roleOptions = [
  { label: '普通用户', value: 'user' },
  { label: '管理员', value: 'admin' }
]

const registerData = reactive({
  account: null,
  password: '',
  repassword: ''
})

//表单验证规则
const rules = {
  account: [
    { required: true, message: '请输入用户名', trigger: 'blur' },
    { min: 5, max: 13, message: '用户名必须是5-13位的字符', trigger: 'blur' }
  ],
  password: [
    { required: true, message: '请输入密码', trigger: 'blur' },
    {
      pattern: /^\S{6,15}$/,
      message: '密码必须是6-15位的非空字符',
      trigger: 'blur'
    }
  ],
  repassword: [
    { required: true, message: '请再次输入密码', trigger: 'blur' },
    {
      pattern: /^\S{6,15}$/,
      message: '密码必须是6-15的非空字符',
      trigger: 'blur'
    },
    //自定义验证规则，验证两次输入密码是否一致
    {
      validator: (rule, value, callback) => {
        if (value !== registerData.password) {
          callback(new Error('两次输入密码不一致!'))
        } else {
          callback()
        }
      },
      trigger: 'blur'
    }
  ]
}

const login = async () => {
  loginForm.value.validate(async (valid) => {
    if (valid) {
      try {
        const res = await loginAPI(loginData);
        if (!res) {
          throw new Error('登录请求失败');
        }
        const { user, token } = res;

        // 保存token
        userStore.setToken(token);
        // 保存用户信
        userStore.setUserInfo(user);
        // 验证角色匹配
        if (user.role !== loginData.role) {
          throw new Error('该账号没有此角色权限');
        }

        ElMessage.success('登录成功');

        // 根据角色跳转
        if (user.role === 'admin') {
          router.push('/admin');
        } else {
          router.push('/home');
        }
      } catch (error) {
        ElMessage.error(error.message);
      }
    }
  });
}
//注册服务
const register = async () => {
  registerForm.value.validate(async (valid) => {
    if (valid) {
      try {
        await registerAPI(registerData)
        ElMessage.success('注册成功')
        activeName.value = 'login'
      } catch (error) {
        ElMessage.error(error.message)
      }
    }
  })
}
</script>

<template>
  <div class="common-layout">
    <el-container>
      <el-header class="header-wrapped">
        <div class="header-content">
          <h3>宠物社区交流平台</h3>
          <span class="welcome">欢迎登录</span>
        </div>
      </el-header>
      <el-main>
        <div class="login-wrapped">
          <el-card class="box-card">
            <el-tabs v-model="activeName" class="demo-tabs" :stretch="true" name="login">
              <el-tab-pane label="登录" name="login">
                <el-form class="login-form" :model="loginData" :rules="rules" ref="loginForm">
                  <!-- 角色选择 -->
                  <el-form-item label="角色" prop="role">
                    <el-select v-model="loginData.role" placeholder="请选择角色">
                      <el-option v-for="item in roleOptions" :key="item.value" :label="item.label"
                        :value="item.value" />
                    </el-select>
                  </el-form-item>
                  <el-form-item label="账号" prop="account">
                    <el-input v-model="loginData.account" placeholder="请输入账号"></el-input>
                  </el-form-item>
                  <el-form-item label="密码" prop="password">
                    <el-input v-model="loginData.password" type="password" placeholder="请输入密码" show-password></el-input>
                  </el-form-item>
                  <div class="footer-wrapped">
                    <div class="footer-button">
                      <el-button type="primary" class="login-button" @click="login">登录</el-button>
                    </div>
                    <div class="footer-go-register">
                      还没有账号?<span class="go-register" @click="activeName = 'register'">去注册</span>
                    </div>
                  </div>
                </el-form>
              </el-tab-pane>

              <el-tab-pane label="注册" name="register">
                <el-form class="login-form" :model="registerData" :rules="rules" ref="registerForm">
                  <el-form-item label="账号" prop="account">
                    <el-input v-model="registerData.account" placeholder="账号长度5-10位"></el-input>
                  </el-form-item>
                  <el-form-item label="密码" prop="password">
                    <el-input v-model="registerData.password" type="password" placeholder="6-15位非空字符"
                      show-password></el-input>
                  </el-form-item>
                  <el-form-item label="确认密码" prop="repassword">
                    <el-input v-model="registerData.repassword" type="password" placeholder="请再次输入密码"
                      show-password></el-input>
                  </el-form-item>
                  <div class="footer-button">
                    <el-button type="primary" class="login-button" @click="register">注册</el-button>
                  </div>
                </el-form>
              </el-tab-pane>
            </el-tabs>
          </el-card>
        </div>
      </el-main>
      <el-footer class="footer-wrapped">
        <div class="footer-content">
          <div class="title">
            <span>成都锦城学院</span> |
            <span>成都锦城学院</span> |
            <span>成都锦城学院</span> |
            <span>成都锦城学院</span>
          </div>
        </div>
      </el-footer>
    </el-container>
  </div>
</template>

<style scoped lang="scss">
// 颜色变量定义
$primary-color: #409EFF; // 主色
$success-color: #67C23A; // 成功色
$warning-color: #E6A23C; // 警告色
$danger-color: #F56C6C; // 错误色
$text-primary: #303133; // 主要文字
$text-regular: #606266; // 常规文字
$border-color: #DCDFE6; // 边框色
$background-color: #f5f7fa; // 背景色

// 布局样式
.common-layout {
  height: 100vh;
  display: flex;
  flex-direction: column;

  .el-container {
    flex: 1;

    // Header样式
    .header-wrapped {
      border-bottom: 1px solid $border-color;
      background-color: white;

      .header-content {
        max-width: 1200px;
        margin: 0 auto;
        display: flex;
        justify-content: space-between;
        align-items: center;
        height: 100%;

        h3 {
          color: $primary-color;
          margin: 0;
        }

        .welcome {
          color: $text-regular;
          font-size: 14px;
        }
      }
    }

    // Main内容区
    .el-main {
      background-color: $background-color;
      display: flex;
      justify-content: center;
      align-items: center;

      .login-wrapped {
        width: 100%;
        max-width: 500px;
        padding: 20px;

        // 穿透修改卡片样式
        :deep(.el-card) {
          box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);

          .el-card__body {
            padding: 30px;
          }
        }

        // Tabs样式穿透
        :deep(.el-tabs) {
          .el-tabs__item {
            font-size: 18px;
            color: $text-regular;

            &.is-active {
              color: $primary-color;
            }
          }

          .el-tabs__active-bar {
            background-color: $primary-color;
          }
        }

        // 表单公共样式
        .login-form {
          .el-form-item {
            margin-bottom: 22px;

            // 标签样式
            :deep(.el-form-item__label) {
              color: $text-primary;
              padding-right: 20px;
            }

            // 输入框样式穿透
            :deep(.el-input .el-input__wrapper) {
              border-radius: 4px;

              &:hover {
                box-shadow: 0 0 0 1px $primary-color inset;
              }
            }
          }

          // 按钮容器
          .footer-wrapped {
            margin-top: 30px;

            .footer-button {
              :deep(.el-button) {
                width: 100%;
                height: 40px;
                font-size: 16px;
              }
            }

            .footer-go-register {
              text-align: center;
              margin-top: 15px;
              color: $text-regular;
              font-size: 14px;

              .go-register {
                color: $primary-color;
                margin-left: 5px;
                cursor: pointer;

                &:hover {
                  text-decoration: underline;
                }
              }
            }
          }
        }
      }
    }

    // Footer样式
    .el-footer.footer-wrapped {
      background-color: white;
      border-top: 1px solid $border-color;

      .footer-content {
        max-width: 1200px;
        margin: 0 auto;
        height: 100%;
        display: flex;
        align-items: center;
        justify-content: center;

        .title {
          color: $text-regular;
          font-size: 14px;

          span {
            margin: 0 10px;
          }
        }
      }
    }
  }
}

// 统一登录注册按钮样式
:deep(.login-button, .register-button) {
  width: 100% !important;
  padding: 12px 20px !important;
  font-size: 16px !important;
  transition: all 0.3s;

  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
}

// 响应式处理
@media (max-width: 768px) {
  .common-layout {
    .el-container {
      .header-wrapped .header-content {
        padding: 0 20px;
      }

      .el-main .login-wrapped {
        padding: 10px;

        :deep(.el-card .el-card__body) {
          padding: 20px;
        }
      }

      .el-footer .footer-content .title {
        font-size: 12px;
      }
    }
  }
}
</style>