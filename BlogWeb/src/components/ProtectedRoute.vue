<template>
  <div v-if="loading.value">加载中...</div>
  <router-view v-else-if="isAuthenticated.value" />
  <div v-else class="unauthorized">
    <h2>请先登录</h2>
    <el-button type="primary" @click="goToLogin">去登录</el-button>
  </div>
</template>

<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '../context/AuthContext'

const router = useRouter()
const { isAuthenticated, loading } = useAuth()

const goToLogin = () => {
  router.push('/login')
}
</script>

<style scoped>
.unauthorized {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  gap: 20px;
}

.unauthorized h2 {
  color: #333;
  font-size: 24px;
}
</style>