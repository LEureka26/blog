<template>
  <AuthProvider>
    <div id="app">
      <Header />
      <main class="main-content">
        <router-view></router-view>
      </main>
    </div>
  </AuthProvider>
</template>

<script setup>
import { onMounted, ref } from 'vue'
import { AuthProvider } from './context/AuthContext'
import Header from './components/Header.vue'

const isMobileDevice = ref(false)

// 检测是否为移动设备（Android或iOS）
const detectMobileDevice = () => {
  const userAgent = navigator.userAgent.toLowerCase()
  return /android|iphone|ipad|ipod/.test(userAgent)
}

onMounted(() => {
  isMobileDevice.value = detectMobileDevice()
  
  if (isMobileDevice.value) {
    const appEl = document.getElementById('app')
    if (appEl) {
      appEl.style.width = '780px'
      appEl.style.minWidth = '700px'
      appEl.style.margin = '0 auto'
    }
    
    const htmlEl = document.documentElement
    const bodyEl = document.body
    
    htmlEl.style.width = '100%'
    bodyEl.style.width = '100%'
    bodyEl.style.overflowX = 'hidden'
  }
})
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
  background: #f5f7fa;
}

#app {
  width: 100%;
  min-height: 100vh;
}

.main-content {
  width: 100%;
  min-height: calc(100vh - 60px);
}
</style>