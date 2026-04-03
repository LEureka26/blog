<template>
  <header class="header">
    <div class="header-container">
      <div class="header-left">
        <router-link to="/" class="logo">Blog</router-link>
        <nav class="nav">
          <router-link to="/" class="nav-item">首页</router-link>
          <router-link to="/categories" class="nav-item">分类</router-link>
          <router-link to="/search" class="nav-item">搜索</router-link>
        </nav>
      </div>
      <div class="header-right">
        <router-link v-if="!isLoggedIn" to="/login" class="nav-item">登录</router-link>
        <div v-else class="user-menu">
          <img src="https://via.placeholder.com/32" alt="用户头像" class="user-avatar" @click="toggleUserMenu">
          <div v-if="showUserMenu" class="user-menu-dropdown">
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

const router = useRouter()
const { isLoggedIn, logout: authLogout } = useAuth()
const showUserMenu = ref(false)

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
}

.header-container {
  max-width: 1200px;
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
  gap: 40px;
}

.logo {
  font-size: 24px;
  font-weight: bold;
  color: #409eff;
  text-decoration: none;
}

.nav {
  display: flex;
  gap: 20px;
}

.nav-item {
  color: #333;
  text-decoration: none;
  font-size: 14px;
  transition: color 0.3s;
  padding: 8px 12px;
  border-radius: 4px;
}

.nav-item:hover {
  color: #409eff;
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

.create-article-btn {
  background: #409eff;
  color: #fff;
  padding: 8px 16px;
  border-radius: 4px;
  font-size: 14px;
  transition: background 0.3s;
}

.create-article-btn:hover {
  background: #66b1ff;
  color: #fff;
}

.user-menu {
  position: relative;
  cursor: pointer;
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
  right: 0;
  background: #fff;
  box-shadow: 0 2px 12px 0 rgba(0, 0, 0, 0.1);
  border-radius: 4px;
  min-width: 120px;
  padding: 8px 0;
  z-index: 1000;
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

@media (max-width: 768px) {
  .header-container {
    padding: 0 10px;
  }
  
  .header-left {
    gap: 20px;
  }
  
  .nav {
    gap: 10px;
  }
  
  .nav-item {
    font-size: 12px;
    padding: 6px 8px;
  }
  
  .header-right {
    gap: 10px;
  }
  
  .create-article-btn {
    font-size: 12px;
    padding: 6px 12px;
  }
}
</style>