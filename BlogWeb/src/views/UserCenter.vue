<template>
  <div class="user-center">
    <div class="container">
      <div class="user-header">
        <div class="avatar-section">
          <img :src="user.avatar || defaultAvatar" alt="用户头像" class="avatar">
          <div class="avatar-actions">
            <el-button type="primary" size="small" @click="showAvatarDialog = true">更换头像</el-button>
          </div>
        </div>
        <div class="user-info">
          <h2 class="username">{{ user.username }}</h2>
          <p class="email">{{ user.email }}</p>
          <p class="join-date">加入时间：{{ formatDate(user.created_at) }}</p>
        </div>
      </div>

      <div class="user-stats">
        <div class="stat-item">
          <div class="stat-value">{{ userStats.articleCount }}</div>
          <div class="stat-label">文章数</div>
        </div>
        <div class="stat-item">
          <div class="stat-value">{{ userStats.totalViews }}</div>
          <div class="stat-label">总浏览</div>
        </div>
      </div>

      <div class="user-actions">
        <el-button type="primary" @click="navigateToEditProfile">编辑个人信息</el-button>
        <el-button @click="navigateToCreateArticle">写文章</el-button>
        <el-button type="danger" @click="handleLogout">退出登录</el-button>
      </div>

      <!-- 头像选择对话框 -->
      <el-dialog v-model="showAvatarDialog" title="选择头像" width="500px">
        <div class="avatar-preview">
          <img :src="selectedAvatar || defaultAvatar" alt="预览头像" class="preview-avatar">
          <p class="preview-text">当前选择</p>
        </div>
        <div class="avatar-grid">
          <div 
            v-for="(avatar, index) in defaultAvatars" 
            :key="index"
            class="avatar-option"
            :class="{ active: selectedAvatar === avatar }"
            @click="selectAvatar(avatar)"
          >
            <img :src="avatar" :alt="`头像 ${index + 1}`">
          </div>
        </div>
        <div class="avatar-upload">
          <el-upload
            :action="uploadUrl"
            :headers="uploadHeaders"
            :show-file-list="false"
            :on-success="handleUploadSuccess"
            :before-upload="beforeUpload"
            name="avatar"
          >
            <el-button type="primary">上传本地头像</el-button>
          </el-upload>
        </div>
        <template #footer>
          <el-button @click="showAvatarDialog = false">取消</el-button>
          <el-button type="primary" @click="saveAvatar">确定</el-button>
        </template>
      </el-dialog>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { ElMessage, ElButton, ElDialog, ElUpload } from 'element-plus'
import { authAPI } from '../utils/api'
import { useAuth } from '../context/AuthContext'

// 导入本地头像图片
import avatar1 from '../assets/1.jpeg'
import avatar2 from '../assets/2.jpeg'
import avatar3 from '../assets/3.jpeg'
import avatar4 from '../assets/4.jpeg'
import avatar5 from '../assets/5.jpeg'
import avatar6 from '../assets/6.jpeg'
import avatar7 from '../assets/7.jpg'
import avatar8 from '../assets/8.jpeg'
import avatar9 from '../assets/9.jpeg'
import avatar10 from '../assets/10.jpg'
import defaultAvatarImg from '../assets/1.jpeg'

const router = useRouter()
const { logout, user } = useAuth()
const userStats = ref({
  articleCount: 0,
  totalViews: 0
})
const showAvatarDialog = ref(false)
const selectedAvatar = ref('')
const defaultAvatar = defaultAvatarImg
const defaultAvatars = [
  avatar1,
  avatar2,
  avatar3,
  avatar4,
  avatar5,
  avatar6,
  avatar7,
  avatar8,
  avatar9,
  avatar10
]
const uploadUrl = 'http://localhost:3001/upload/avatar'
const uploadHeaders = {
  'Authorization': `Bearer ${localStorage.getItem('token')}`
}

// 格式化日期
const formatDate = (dateString) => {
  if (!dateString) return ''
  const date = new Date(dateString)
  return date.toLocaleDateString('zh-CN', {
    year: 'numeric',
    month: 'long'
  })
}

// 获取用户信息
const getUserInfo = async () => {
  try {
    const response = await authAPI.getUser()
    // 检查响应格式，确保使用正确的数据结构
    const userData = response.data || response
    user.value = userData
    selectedAvatar.value = userData.avatar || defaultAvatars[0]
    // 更新 localStorage 中的用户信息，确保数据一致性
    localStorage.setItem('user', JSON.stringify(userData))
  } catch (error) {
    console.error('获取用户信息失败:', error)
    ElMessage.error('获取用户信息失败')
  }
}

// 获取用户统计信息
const getUserStats = async () => {
  try {
    // 这里需要调用后端API获取用户统计信息
    // 暂时使用模拟数据
    userStats.value = {
      articleCount: 0,
      totalViews: 0
    }
  } catch (error) {
    console.error('获取用户统计信息失败:', error)
  }
}

// 选择头像
const selectAvatar = (avatar) => {
  selectedAvatar.value = avatar
}

// 保存头像
const saveAvatar = async () => {
  try {
    // 调用后端API保存头像
    const response = await authAPI.updateUser({ avatar: selectedAvatar.value })
    // 检查响应格式，确保使用正确的数据结构
    const responseData = response.data || response
    // 使用后端返回的完整用户信息
    if (responseData.user) {
      user.value = responseData.user
      // 更新 localStorage 中的用户信息，确保数据一致性
      localStorage.setItem('user', JSON.stringify(responseData.user))
    } else {
      user.value.avatar = selectedAvatar.value
      // 更新 localStorage 中的用户信息，确保数据一致性
      localStorage.setItem('user', JSON.stringify(user.value))
    }
    showAvatarDialog.value = false
    ElMessage.success('头像更新成功')
  } catch (error) {
    console.error('保存头像失败:', error)
    ElMessage.error('保存头像失败')
  }
}

// 上传前验证
const beforeUpload = (file) => {
  const isImage = file.type.startsWith('image/')
  const isLt2M = file.size / 1024 / 1024 < 2

  if (!isImage) {
    ElMessage.error('只能上传图片文件!')
    return false
  }
  if (!isLt2M) {
    ElMessage.error('图片大小不能超过 2MB!')
    return false
  }
  return true
}

// 上传成功
const handleUploadSuccess = (response) => {
  if (response.url) {
    selectedAvatar.value = response.url
    ElMessage.success('头像上传成功，请点击确定按钮保存')
  } else {
    ElMessage.error('头像上传失败')
  }
}

// 导航到编辑个人信息页面
const navigateToEditProfile = () => {
  router.push('/user/edit')
}

// 导航到写文章页面
const navigateToCreateArticle = () => {
  router.push('/articles/create')
}

// 退出登录
const handleLogout = async () => {
  try {
    await logout()
    router.push('/login')
    ElMessage.success('退出登录成功')
  } catch (error) {
    console.error('退出登录失败:', error)
    ElMessage.error('退出登录失败')
  }
}

// 初始化
onMounted(async () => {
  await getUserInfo()
  await getUserStats()
})
</script>

<style scoped>
.user-center {
  padding: 20px;
}

.container {
  max-width: 800px;
  margin: 0 auto;
}

.user-header {
  display: flex;
  align-items: center;
  gap: 30px;
  padding: 40px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.avatar-section {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 15px;
}

.avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 1px solid #409eff;
}

.avatar-actions {
  display: flex;
  gap: 10px;
}

.user-info {
  flex: 1;
}

.username {
  font-size: 28px;
  font-weight: bold;
  color: #333;
  margin-bottom: 10px;
}

.email {
  font-size: 16px;
  color: #666;
  margin-bottom: 5px;
}

.join-date {
  font-size: 14px;
  color: #999;
}

.user-stats {
  display: flex;
  gap: 20px;
  padding: 30px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  margin-bottom: 20px;
}

.stat-item {
  flex: 1;
  text-align: center;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.stat-value {
  font-size: 32px;
  font-weight: bold;
  color: #409eff;
  margin-bottom: 10px;
}

.stat-label {
  font-size: 14px;
  color: #666;
}

.user-actions {
  display: flex;
  gap: 15px;
  padding: 30px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.avatar-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 15px;
  margin-bottom: 20px;
}

.avatar-option {
  cursor: pointer;
  border: 3px solid transparent;
  border-radius: 8px;
  overflow: hidden;
  transition: all 0.3s;
}

.avatar-option:hover {
  border-color: #409eff;
  transform: scale(1.05);
}

.avatar-option.active {
  border-color: #409eff;
}

.avatar-option img {
  width: 100%;
  height: 80px;
  object-fit: cover;
  display: block;
}

.avatar-upload {
  text-align: center;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.avatar-preview {
  text-align: center;
  margin-bottom: 20px;
  padding: 20px;
  background: #f5f7fa;
  border-radius: 8px;
}

.preview-avatar {
  width: 120px;
  height: 120px;
  border-radius: 50%;
  object-fit: cover;
  border: 3px solid #409eff;
  margin-bottom: 10px;
}

.preview-text {
  font-size: 14px;
  color: #666;
  margin: 0;
}

@media (max-width: 768px) {
  .user-header {
    flex-direction: column;
    text-align: center;
  }
  
  .avatar-actions {
    width: 100%;
  }
  
  .user-stats {
    flex-direction: column;
  }
  
  .user-actions {
    flex-direction: column;
  }
  
  .avatar-grid {
    grid-template-columns: repeat(3, 1fr);
  }
}
</style>
