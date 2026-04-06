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
import { AuthProvider } from './context/AuthContext'
import Header from './components/Header.vue'
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