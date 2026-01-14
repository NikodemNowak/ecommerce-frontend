<script setup>
import { ref, onMounted } from 'vue'
import { useProductsStore } from '../stores/products'

const productsStore = useProductsStore()

const editingProduct = ref(null)
const editForm = ref({})
const errors = ref({})
const serverError = ref('')
const saving = ref(false)
const optimizing = ref(false)

onMounted(() => {
  productsStore.fetchProducts()
  productsStore.fetchCategories()
})

function startEdit(product) {
  editingProduct.value = product.id
  editForm.value = {
    name: product.name,
    description: product.description,
    price: parseFloat(product.price),
    weight: parseFloat(product.weight),
    category_id: product.category_id
  }
  errors.value = {}
  serverError.value = ''
}

function cancelEdit() {
  editingProduct.value = null
  editForm.value = {}
}

async function saveProduct(productId) {
  saving.value = true
  serverError.value = ''
  errors.value = {}
  
  try {
    await productsStore.updateProduct(productId, editForm.value)
    editingProduct.value = null
  } catch (error) {
    // walidacja po stronie serwera
    if (error.response?.data) {
      const data = error.response.data
      serverError.value = data.detail || data.title || 'Błąd walidacji'
      
      // jeśli są szczegóły błędów pól
      if (data.errors) {
        errors.value = data.errors
      }
    } else {
      serverError.value = 'Błąd podczas zapisywania'
    }
  } finally {
    saving.value = false
  }
}

// D1: optymalizacja opisu AI
async function optimizeDescription(productId) {
  optimizing.value = true
  try {
    const optimized = await productsStore.getSeoDescription(productId)
    editForm.value.description = optimized
  } catch (error) {
    serverError.value = error.response?.data?.detail || 'Błąd optymalizacji opisu'
  } finally {
    optimizing.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="mb-4">Edycja produktów</h2>
    
    <div v-if="productsStore.loading" class="text-center py-4">
      <div class="spinner-border"></div>
    </div>
    
    <div v-else class="table-responsive">
      <table class="table table-hover">
        <thead class="table-dark">
          <tr>
            <th>ID</th>
            <th>Nazwa</th>
            <th>Opis</th>
            <th>Kategoria</th>
            <th class="text-end">Cena</th>
            <th class="text-end">Waga (kg)</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="product in productsStore.products" :key="product.id">
            <!-- tryb podglądu -->
            <template v-if="editingProduct !== product.id">
              <td>{{ product.id }}</td>
              <td>{{ product.name }}</td>
              <td class="text-muted small" style="max-width: 300px;">{{ product.description }}</td>
              <td>
                <span class="badge bg-secondary">
                  {{ productsStore.categories.find(c => c.id === product.category_id)?.name }}
                </span>
              </td>
              <td class="text-end">{{ parseFloat(product.price).toFixed(2) }} zł</td>
              <td class="text-end">{{ parseFloat(product.weight).toFixed(3) }}</td>
              <td>
                <button class="btn btn-sm btn-outline-primary" @click="startEdit(product)">
                  Edytuj
                </button>
              </td>
            </template>
            
            <!-- tryb edycji -->
            <template v-else>
              <td>{{ product.id }}</td>
              <td>
                <input v-model="editForm.name" type="text" class="form-control form-control-sm">
              </td>
              <td>
                <div class="d-flex gap-2">
                  <textarea 
                    v-model="editForm.description" 
                    class="form-control form-control-sm" 
                    rows="2"
                  ></textarea>
                  <button 
                    class="btn btn-sm btn-outline-secondary"
                    @click="optimizeDescription(product.id)"
                    :disabled="optimizing"
                    title="Optymalizuj opis (AI)"
                  >
                    <span v-if="optimizing" class="spinner-border spinner-border-sm"></span>
                    <span v-else>AI</span>
                  </button>
                </div>
              </td>
              <td>
                <select v-model="editForm.category_id" class="form-select form-select-sm">
                  <option v-for="cat in productsStore.categories" :key="cat.id" :value="cat.id">
                    {{ cat.name }}
                  </option>
                </select>
              </td>
              <td>
                <input 
                  v-model.number="editForm.price" 
                  type="number" 
                  step="0.01" 
                  min="0"
                  class="form-control form-control-sm text-end"
                  :class="{ 'is-invalid': errors.price }"
                >
              </td>
              <td>
                <input 
                  v-model.number="editForm.weight" 
                  type="number" 
                  step="0.001" 
                  min="0"
                  class="form-control form-control-sm text-end"
                  :class="{ 'is-invalid': errors.weight }"
                >
              </td>
              <td>
                <div class="btn-group btn-group-sm">
                  <button 
                    class="btn btn-success" 
                    @click="saveProduct(product.id)"
                    :disabled="saving"
                  >
                    <span v-if="saving" class="spinner-border spinner-border-sm"></span>
                    <span v-else>Zapisz</span>
                  </button>
                  <button class="btn btn-secondary" @click="cancelEdit">
                    Anuluj
                  </button>
                </div>
              </td>
            </template>
          </tr>
        </tbody>
      </table>
    </div>
    
    <!-- błąd serwera -->
    <div v-if="serverError" class="alert alert-danger mt-3">
      <strong>Błąd:</strong> {{ serverError }}
    </div>
  </div>
</template>
