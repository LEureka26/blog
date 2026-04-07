<template>
  <AuthProvider>
    <div id="app">
      <Header :class="{ 'header-hidden': isHeaderHidden }" />
      <main class="main-content">
        <router-view></router-view>
      </main>
    </div>
  </AuthProvider>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { AuthProvider } from './context/AuthContext'
import Header from './components/Header.vue'

const isMobileDevice = ref(false)
const isHeaderHidden = ref(false)
let lastScrollY = 0
let headerHeight = 0
let debounceTimer = null

// 检测是否为移动设备（Android或iOS）
const detectMobileDevice = () => {
  const userAgent = navigator.userAgent.toLowerCase()
  return /android|iphone|ipad|ipod/.test(userAgent)
}

// 防抖处理
const debounce = (func, delay) => {
  return (...args) => {
    if (debounceTimer) clearTimeout(debounceTimer)
    debounceTimer = setTimeout(() => {
      func.apply(this, args)
    }, delay)
  }
}

// 滚动事件处理
const handleScroll = debounce(() => {
  const currentScrollY = window.scrollY || document.documentElement.scrollTop
  
  if (currentScrollY > headerHeight && currentScrollY > lastScrollY) {
    isHeaderHidden.value = true
  } else if (currentScrollY < lastScrollY - 50) {
    isHeaderHidden.value = false
  }
  
  lastScrollY = currentScrollY
}, 100)

onMounted(() => {
  isMobileDevice.value = detectMobileDevice()
  
  const headerEl = document.querySelector('header')
  if (headerEl) {
    headerHeight = headerEl.offsetHeight || 60
  }
  
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
  
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
  if (debounceTimer) clearTimeout(debounceTimer)
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
  background-image: url('./assets/background.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  background-repeat: no-repeat;
  filter: opacity(0.9);
  position: relative;

}

body::before {
  filter: opacity(0.1);
  content: '';
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.3);
  z-index: -1;
  pointer-events: none;
}

#app {
  width: 100%;
  min-height: 100vh;
  position: relative;
  z-index: 1;
}

.main-content {
  width: 100%;
  min-height: calc(100vh - 60px);
   /* 设置主内容区域的最小高度为视口高度减去60px（通常是头部导航栏的高度），
   确保内容区域至少占满屏幕剩余空间 */
}

.header-hidden {
  transform: translateY(-100%);
  opacity: 0;
  transition: transform 100ms ease-in-out, opacity 200ms ease-in-out;
  /* 当 header-hidden 类被添加或移除时，header 会在 100ms 内平滑地向上/向下滑动（transform），
     同时透明度会在 200ms 内渐变为 0 或 1。
     ease-in-out 表示动画开始和结束时较慢，中间较快 */
}
</style>