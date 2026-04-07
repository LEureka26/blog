<template>
  <div class="edit-profile">
    <div class="container">
      <h1>编辑个人信息</h1>
      <el-form :model="form" label-width="100px" :rules="rules" ref="formRef">
        <el-form-item label="用户名" prop="username">
          <el-input v-model="form.username" placeholder="请输入用户名" />
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input v-model="form.email" type="email" placeholder="请输入邮箱" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleSubmit">保存修改</el-button>
          <el-button @click="handleCancel">取消</el-button>
        </el-form-item>
      </el-form>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, reactive } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElForm, ElFormItem, ElInput, ElButton } from 'element-plus'
import { authAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'

const router = useRouter()
const { user } = useAuth()
const formRef = ref(null)

const form = reactive({
  username: '',
  email: ''
})

const rules = {
  username: [
    { min: 3, max: 20, message: '用户名长度必须在 3-20 字符之间', trigger: 'blur' }
  ],
  email: [
    { type: 'email', message: '请输入正确的邮箱格式', trigger: 'blur' }
  ]
}

// 获取用户信息
const getUserInfo = async () => {
  try {
    const response = await authAPI.getUser()
    if (response.data && typeof response.data === 'object') {
      form.username = response.data.username
      form.email = response.data.email
    } else {
      form.username = response.username
      form.email = response.email
    }
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  }
}

// 提交表单
const handleSubmit = async () => {
  if (!formRef.value) return
  try {
    await formRef.value.validate()
    const response = await authAPI.updateUser(form)
    // 检查响应格式，确保使用正确的数据结构
    const responseData = response.data || response
    // 更新 AuthContext 中的用户信息
    if (responseData.user) {
      user.value = responseData.user
      // 更新 localStorage 中的用户信息，确保数据一致性
      localStorage.setItem('user', JSON.stringify(responseData.user))
    } else if (user.value) {
      // 如果后端没有返回完整的用户信息，只更新表单中的字段
      if (form.username) {
        user.value.username = form.username
      }
      if (form.email) {
        user.value.email = form.email
      }
      // 更新 localStorage 中的用户信息，确保数据一致性
      localStorage.setItem('user', JSON.stringify(user.value))
    }
    ElMessage.success('个人信息更新成功')
    router.push('/user')
  } catch (error) {
    console.error('更新个人信息失败:', error)
    if (error.response && error.response.data && error.response.data.error) {
      ElMessage.error(error.response.data.error)
    } else {
      ElMessage.error('更新个人信息失败')
    }
  }
}

// 取消
const handleCancel = () => {
  router.push('/user')
}

// 初始化
onMounted(async () => {
  await getUserInfo()
})
</script>

<style scoped>
.edit-profile {
  padding: 20px;
}

.container {
  max-width: 600px;
  margin: 0 auto;
  background: #fff;
  padding: 40px;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

h1 {
  font-size: 24px;
  font-weight: bold;
  color: #333;
  margin-bottom: 30px;
  text-align: center;
}

/* 保持平板布局尺寸，不随窗口缩放改变 */
</style>