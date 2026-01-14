<script setup>
import { ref } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()

const username = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function login() {
  error.value = ''
  loading.value = true
  
  try {
    await authStore.login(username.value, password.value)
    const redirect = route.query.redirect || '/'
    router.push(redirect)
  } catch (err) {
    error.value = err.response?.data?.detail || 'Nieprawidłowa nazwa użytkownika lub hasło'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="row justify-content-center">
    <div class="col-md-6 col-lg-4">
      <div class="card shadow-sm">
        <div class="card-body p-4">
          <h3 class="card-title text-center mb-4">Logowanie</h3>
          
          <div v-if="error" class="alert alert-danger">{{ error }}</div>
          
          <form @submit.prevent="login">
            <div class="mb-3">
              <label class="form-label">Nazwa użytkownika</label>
              <input 
                v-model="username"
                type="text" 
                class="form-control"
                required
              >
            </div>
            
            <div class="mb-3">
              <label class="form-label">Hasło</label>
              <input 
                v-model="password"
                type="password" 
                class="form-control"
                required
              >
            </div>
            
            <button type="submit" class="btn btn-dark w-100" :disabled="loading">
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              Zaloguj
            </button>
          </form>
          
          <p class="text-center mt-3 mb-0">
            Nie masz konta? <RouterLink to="/register">Zarejestruj się</RouterLink>
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
