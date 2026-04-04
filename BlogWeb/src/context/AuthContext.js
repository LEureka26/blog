import { ref, computed, onMounted, provide, inject } from 'vue'

const AuthContextSymbol = Symbol('AuthContext')

export const useAuth = () => {
  const context = inject(AuthContextSymbol)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export const AuthProvider = {
  setup(props, { slots }) {
    const user = ref(null)
    const token = ref(null)
    const loading = ref(true)

    onMounted(() => {
      const storedToken = localStorage.getItem('token')
      const storedUser = localStorage.getItem('user')
      
      if (storedToken && storedUser) {
        token.value = storedToken
        user.value = JSON.parse(storedUser)
      }
      loading.value = false
    })

    const login = (userData, tokenValue) => {
      user.value = userData
      token.value = tokenValue
      localStorage.setItem('token', tokenValue)
      localStorage.setItem('user', JSON.stringify(userData))
    }

    const logout = () => {
      user.value = null
      token.value = null
      localStorage.removeItem('token')
      localStorage.removeItem('user')
    }

    const isAuthenticated = computed(() => {
      return !!token.value
    })

    const value = {
      user,
      token,
      loading,
      login,
      logout,
      isAuthenticated,
      isLoggedIn: isAuthenticated
    }

    provide(AuthContextSymbol, value)

    return () => {
      return slots.default ? slots.default() : null
    }
  }
}