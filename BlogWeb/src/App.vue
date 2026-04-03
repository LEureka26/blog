<template>
  <AuthProvider>
    <div id="app">
      <router-view></router-view>
    </div>
  </AuthProvider>
</template>

<script setup>
import { AuthProvider } from './context/AuthContext'
</script>

<style>
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: Arial, sans-serif;
}

#app {
  width: 100%;
  min-height: 100vh;
}
</style>