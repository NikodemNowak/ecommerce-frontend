import { defineStore } from 'pinia'
import api from '../api'

function getAccessToken() {
  return localStorage.getItem('accessToken') || localStorage.getItem('token')
}

function clearLegacyTokens() {
  localStorage.removeItem('token')
}

export const useAuthStore = defineStore('auth', {
  state: () => ({
    token: getAccessToken(),
    refreshToken: localStorage.getItem('refreshToken'),
    user: JSON.parse(localStorage.getItem('user') || 'null')
  }),

  getters: {
    isLoggedIn: (state) => !!state.token,
    isAdmin: (state) => state.user?.role === 'ADMIN'
  },

  actions: {
    async login(username, password) {
      const { data } = await api.post('/login', { username, password })
      this.setAuth(data)
      return data
    },

    async register(username, password, email) {
      const { data } = await api.post('/register', { username, password, email })
      return data
    },

    async refresh() {
      const { data } = await api.post('/refresh', { refreshToken: this.refreshToken })
      this.token = data.accessToken
      this.refreshToken = data.refreshToken
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      return data
    },

    setAuth(data) {
      this.token = data.accessToken
      this.refreshToken = data.refreshToken
      this.user = data.user
      localStorage.setItem('accessToken', data.accessToken)
      localStorage.setItem('refreshToken', data.refreshToken)
      localStorage.setItem('user', JSON.stringify(data.user))
      clearLegacyTokens()
    },

    logout() {
      this.token = null
      this.refreshToken = null
      this.user = null
      localStorage.removeItem('accessToken')
      localStorage.removeItem('refreshToken')
      localStorage.removeItem('user')
      clearLegacyTokens()
    }
  }
})
