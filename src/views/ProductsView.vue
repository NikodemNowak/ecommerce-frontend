<script setup>
import { ref, computed, onMounted } from 'vue'
import { useProductsStore } from '../stores/products'
import { useCartStore } from '../stores/cart'
import { useAuthStore } from '../stores/auth'

const productsStore = useProductsStore()
const cartStore = useCartStore()
const authStore = useAuthStore()

const nameFilter = ref('')
const categoryFilter = ref('')

const filteredProducts = computed(() => 
  productsStore.filteredProducts(nameFilter.value, categoryFilter.value)
)

function addToCart(product) {
  cartStore.addItem(product)
}

onMounted(() => {
  if (authStore.isLoggedIn) {
    productsStore.fetchProducts()
    productsStore.fetchCategories()
  }
})
</script>

<template>
  <div>
    <h2 class="mb-4">Produkty</h2>
    
    <!-- wymagane logowanie -->
    <div v-if="!authStore.isLoggedIn" class="alert alert-info">
      <RouterLink to="/login">Zaloguj się</RouterLink> aby przeglądać produkty.
    </div>
    
    <template v-else>
      <!-- filtry -->
      <div class="row mb-4">
        <div class="col-md-6">
          <input 
            v-model="nameFilter"
            type="text" 
            class="form-control" 
            placeholder="Szukaj po nazwie..."
          >
        </div>
        <div class="col-md-6">
          <select v-model="categoryFilter" class="form-select">
            <option value="">Wszystkie kategorie</option>
            <option v-for="cat in productsStore.categories" :key="cat.id" :value="cat.id">
              {{ cat.name }}
            </option>
          </select>
        </div>
      </div>
      
      <!-- loader -->
      <div v-if="productsStore.loading" class="text-center py-4">
        <div class="spinner-border" role="status">
          <span class="visually-hidden">Ładowanie...</span>
        </div>
      </div>
      
      <!-- błąd -->
      <div v-else-if="productsStore.error" class="alert alert-danger">
        {{ productsStore.error }}
      </div>
      
      <!-- tabela produktów -->
      <div v-else class="table-responsive">
        <table class="table table-hover">
          <thead class="table-dark">
            <tr>
              <th>Nazwa</th>
              <th>Opis</th>
              <th>Kategoria</th>
              <th class="text-end">Cena</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="product in filteredProducts" :key="product.id">
              <td>{{ product.name }}</td>
              <td class="text-muted small">{{ product.description }}</td>
              <td>
                <span class="badge bg-secondary">
                  {{ productsStore.categories.find(c => c.id === product.category_id)?.name }}
                </span>
              </td>
              <td class="text-end fw-bold">{{ parseFloat(product.price).toFixed(2) }} zł</td>
              <td class="text-end">
                <button class="btn btn-sm btn-success" @click="addToCart(product)">
                  Kup
                </button>
              </td>
            </tr>
            <tr v-if="filteredProducts.length === 0">
              <td colspan="5" class="text-center text-muted py-4">
                Brak produktów do wyświetlenia
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </template>
  </div>
</template>
