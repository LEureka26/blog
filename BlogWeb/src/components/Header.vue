<template>
  <header class="header">
    <div class="header-container">
      <div class="header-left">
        <router-link to="/" class="logo">Blog</router-link>
        <nav class="nav">
          <router-link to="/" class="nav-item">首页</router-link>
          <router-link to="/categories" class="nav-item">分类</router-link>
        </nav>
        <div class="search-container">
          <el-input
            v-model="searchQuery"
            placeholder="搜索文章"
            @keyup.enter="handleSearch"
            class="search-input"
          >
            <template #append>
              <el-button @click="handleSearch"><el-icon><Search /></el-icon></el-button>
            </template>
          </el-input>
        </div>
      </div>
      <div class="header-right">
        <router-link v-if="!isLoggedIn" to="/login" class="nav-item">登录</router-link>
        <div v-else class="user-menu">
          <img :src="userAvatar" alt="用户头像" class="user-avatar" @click="toggleUserMenu">
          <div v-if="showUserMenu" class="user-menu-dropdown">
            <div class="user-menu-header">
              <img :src="userAvatar" alt="用户头像" class="menu-avatar">
              <span class="menu-username">{{ user?.username }}</span>
            </div>
            <div class="menu-divider"></div>
            <router-link to="/user" class="menu-item">个人中心</router-link>
            <a href="#" class="menu-item" @click.prevent="logout">退出登录</a>
          </div>
        </div>
        <router-link to="/articles/create" class="nav-item create-article-btn">写文章</router-link>
      </div>
    </div>
  </header>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../context/AuthContext'
import { ElInput, ElButton } from 'element-plus'
import { Search } from '@element-plus/icons-vue'
import defaultAvatar from '../assets/1.jpeg'

const router = useRouter()
const { isLoggedIn, logout: authLogout, user } = useAuth()
const showUserMenu = ref(false)
const searchQuery = ref('')

// 用户头像
const userAvatar = computed(() => {
  return user.value?.avatar || defaultAvatar
})

// 切换用户菜单
const toggleUserMenu = () => {
  showUserMenu.value = !showUserMenu.value
}

// 退出登录
const logout = async () => {
  await authLogout()
  showUserMenu.value = false
  router.push('/login')
}

// 处理搜索
const handleSearch = () => {
  if (searchQuery.value.trim()) {
    router.push(`/articles?search=${encodeURIComponent(searchQuery.value)}`)
  }
}

// 点击外部关闭用户菜单
const handleClickOutside = (event) => {
  const userMenu = document.querySelector('.user-menu')
  if (userMenu && !userMenu.contains(event.target)) {
    showUserMenu.value = false
  }
}

// 生命周期钩子
onMounted(() => {
  document.addEventListener('click', handleClickOutside)
})

onUnmounted(() => {
  document.removeEventListener('click', handleClickOutside)
})
</script>

<style scoped>
.header {
  background: #fff;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  width: 100%;
}

.header-container {
  width: 90%;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px;
  height: 60px;
}

.header-left {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
}

.search-container {
  width: 300px;
  flex-shrink: 0;
}

.search-input {
  width: 100%;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  text-decoration: none;
  flex-shrink: 0;
}

.nav {
  display: flex;
  gap: 20px;
  flex-shrink: 0;
}

.nav-item {
  color: #333;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
  padding: 8px 12px;
  border-radius: 4px;
  flex-shrink: 0;
}

.nav-item:hover {
  color: #409eff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
  flex-shrink: 0;
}

.create-article-btn {
  background: #409eff;
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  transition: background 0.3s;
  flex-shrink: 0;
}

.create-article-btn:hover {
  background: #66b1ff;
  color: #fff;
}

.user-menu {
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
}

.user-avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  object-fit: cover;
}

.user-menu-dropdown {
  position: absolute;
  top: 40px;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  min-width: 160px;
  padding: 8px 0;
  z-index: 1000;
}

.user-menu-header {
  display: flex;
  align-items: center;
  padding: 12px 16px;
  gap: 10px;
}

.menu-avatar {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  object-fit: cover;
}

.menu-username {
  font-size: 14px;
  font-weight: 500;
  color: #333;
}

.menu-divider {
  height: 1px;
  background: #e4e7ed;
  margin: 4px 0;
}

.menu-item {
  display: block;
  padding: 8px 16px;
  color: #333;
  text-decoration: none;
  font-size: 14px;
  transition: background 0.3s;
}

.menu-item:hover {
  background: #f5f7fa;
}
</style>