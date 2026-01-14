<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const authStore = useAuthStore()
const router = useRouter()

const username = ref('')
const password = ref('')
const email = ref('')
const error = ref('')
const success = ref(false)
const loading = ref(false)

async function register() {
  error.value = ''
  loading.value = true
  
  try {
    await authStore.register(username.value, password.value, email.value)
    success.value = true
  } catch (err) {
    error.value = err.response?.data?.detail || 'Błąd rejestracji'
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
          <h3 class="card-title text-center mb-4">Rejestracja</h3>
          
          <!-- sukces -->
          <div v-if="success" class="alert alert-success">
            <h5>Konto utworzone!</h5>
            <p class="mb-2">Możesz teraz się zalogować.</p>
            <RouterLink to="/login" class="btn btn-success">Przejdź do logowania</RouterLink>
          </div>
          
          <template v-else>
            <div v-if="error" class="alert alert-danger">{{ error }}</div>
            
            <form @submit.prevent="register">
              <div class="mb-3">
                <label class="form-label">Nazwa użytkownika</label>
                <input 
                  v-model="username"
                  type="text" 
                  class="form-control"
                  minlength="3"
                  required
                >
              </div>
              
              <div class="mb-3">
                <label class="form-label">Email</label>
                <input 
                  v-model="email"
                  type="email" 
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
                  minlength="6"
                  required
                >
                <small class="text-muted">Minimum 6 znaków</small>
              </div>
              
              <button type="submit" class="btn btn-dark w-100" :disabled="loading">
                <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
                Zarejestruj
              </button>
            </form>
            
            <p class="text-center mt-3 mb-0">
              Masz już konto? <RouterLink to="/login">Zaloguj się</RouterLink>
            </p>
          </template>
        </div>
      </div>
    </div>
  </div>
</template>
