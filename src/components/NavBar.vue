<script setup>
import { RouterLink, useRouter } from 'vue-router'
import { useAuthStore } from '../stores/auth'
import { useCartStore } from '../stores/cart'

const authStore = useAuthStore()
const cartStore = useCartStore()
const router = useRouter()

function logout() {
  authStore.logout()
  router.push({ name: 'Login' })
}
</script>

<template>
  <nav class="navbar navbar-expand-lg navbar-dark bg-dark">
    <div class="container">
      <RouterLink class="navbar-brand" to="/">E-Sklep</RouterLink>
      
      <button class="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
        <span class="navbar-toggler-icon"></span>
      </button>
      
      <div class="collapse navbar-collapse" id="navbarNav">
        <ul class="navbar-nav me-auto">
          <li class="nav-item">
            <RouterLink class="nav-link" to="/">Produkty</RouterLink>
          </li>
          
          <template v-if="authStore.isLoggedIn">
            <li class="nav-item">
              <RouterLink class="nav-link" to="/orders">Moje zamówienia</RouterLink>
            </li>
            
            <!-- menu admina -->
            <li v-if="authStore.isAdmin" class="nav-item dropdown">
              <a class="nav-link dropdown-toggle" href="#" data-bs-toggle="dropdown">
                Admin
              </a>
              <ul class="dropdown-menu">
                <li><RouterLink class="dropdown-item" to="/admin/orders">Zarządzaj zamówieniami</RouterLink></li>
                <li><RouterLink class="dropdown-item" to="/admin/products">Edytuj produkty</RouterLink></li>
                <li><RouterLink class="dropdown-item" to="/admin/init">Inicjalizuj bazę</RouterLink></li>
              </ul>
            </li>
          </template>
        </ul>
        
        <ul class="navbar-nav">
          <li v-if="authStore.isLoggedIn" class="nav-item">
            <RouterLink class="nav-link" to="/cart">
              <i class="bi bi-cart"></i> Koszyk
              <span v-if="cartStore.totalItems > 0" class="badge bg-warning text-dark">
                {{ cartStore.totalItems }}
              </span>
            </RouterLink>
          </li>
          
          <template v-if="!authStore.isLoggedIn">
            <li class="nav-item">
              <RouterLink class="nav-link" to="/login">Zaloguj</RouterLink>
            </li>
            <li class="nav-item">
              <RouterLink class="nav-link" to="/register">Rejestracja</RouterLink>
            </li>
          </template>
          
          <template v-else>
            <li class="nav-item">
              <span class="nav-link text-light">{{ authStore.user?.username }}</span>
            </li>
            <li class="nav-item">
              <button class="nav-link btn btn-link" @click="logout">Wyloguj</button>
            </li>
          </template>
        </ul>
      </div>
    </div>
  </nav>
</template>
