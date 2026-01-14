<script setup>
import { ref } from 'vue'
import api from '../api'

const fileContent = ref('')
const fileName = ref('')
const error = ref('')
const validationErrors = ref([])
const success = ref(false)
const loading = ref(false)

function handleFileSelect(event) {
  const file = event.target.files[0]
  if (!file) return
  
  fileName.value = file.name
  error.value = ''
  validationErrors.value = []
  
  const reader = new FileReader()
  reader.onload = (e) => {
    fileContent.value = e.target.result
  }
  reader.readAsText(file)
}

// walidacja po stronie klienta
function validateContent() {
  validationErrors.value = []
  
  if (!fileContent.value.trim()) {
    validationErrors.value.push('Plik jest pusty')
    return false
  }
  
  try {
    let products
    
    // sprawdź czy to JSON
    if (fileContent.value.trim().startsWith('[') || fileContent.value.trim().startsWith('{')) {
      const parsed = JSON.parse(fileContent.value)
      products = Array.isArray(parsed) ? parsed : parsed.products
    } else {
      // CSV
      const lines = fileContent.value.trim().split('\n')
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      
      if (!headers.includes('name') || !headers.includes('price')) {
        validationErrors.value.push('CSV musi zawierać kolumny: name, price')
        return false
      }
      
      products = lines.slice(1).map((line, idx) => {
        const values = line.split(',')
        const product = {}
        headers.forEach((h, i) => product[h] = values[i]?.trim())
        return { ...product, _line: idx + 2 }
      })
    }
    
    if (!Array.isArray(products) || products.length === 0) {
      validationErrors.value.push('Brak produktów w pliku')
      return false
    }
    
    // waliduj każdy produkt
    products.forEach((p, idx) => {
      const lineNum = p._line || idx + 1
      
      if (!p.name || !p.name.trim()) {
        validationErrors.value.push(`Linia ${lineNum}: brak nazwy produktu`)
      }
      
      if (p.price === undefined || isNaN(parseFloat(p.price)) || parseFloat(p.price) < 0) {
        validationErrors.value.push(`Linia ${lineNum}: nieprawidłowa cena`)
      }
      
      if (p.weight !== undefined && (isNaN(parseFloat(p.weight)) || parseFloat(p.weight) < 0)) {
        validationErrors.value.push(`Linia ${lineNum}: nieprawidłowa waga`)
      }
    })
    
    return validationErrors.value.length === 0
    
  } catch (e) {
    validationErrors.value.push('Nieprawidłowy format pliku (oczekiwano JSON lub CSV)')
    return false
  }
}

async function initDatabase() {
  error.value = ''
  
  if (!validateContent()) return
  
  loading.value = true
  
  try {
    // wyślij jako JSON
    let data
    if (fileContent.value.trim().startsWith('[') || fileContent.value.trim().startsWith('{')) {
      data = JSON.parse(fileContent.value)
    } else {
      // konwertuj CSV do JSON
      const lines = fileContent.value.trim().split('\n')
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase())
      data = lines.slice(1).map(line => {
        const values = line.split(',')
        const product = {}
        headers.forEach((h, i) => product[h] = values[i]?.trim())
        return {
          name: product.name,
          description: product.description || '',
          price: parseFloat(product.price),
          weight: parseFloat(product.weight) || 0.1,
          category_id: parseInt(product.category_id) || 1
        }
      })
    }
    
    await api.post('/init', Array.isArray(data) ? data : data.products)
    success.value = true
  } catch (err) {
    error.value = err.response?.data?.detail || 'Błąd inicjalizacji bazy danych'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div>
    <h2 class="mb-4">Inicjalizacja bazy danych</h2>
    
    <div v-if="success" class="alert alert-success">
      <h5>Baza danych zainicjalizowana!</h5>
      <RouterLink to="/admin/products" class="btn btn-success mt-2">
        Zobacz produkty
      </RouterLink>
    </div>
    
    <template v-else>
      <div class="card">
        <div class="card-body">
          <p class="text-muted mb-4">
            Prześlij plik JSON lub CSV z produktami. Dane zostaną zwalidowane przed wysłaniem.
          </p>
          
          <div class="mb-3">
            <label class="form-label">Wybierz plik</label>
            <input 
              type="file" 
              class="form-control"
              accept=".json,.csv"
              @change="handleFileSelect"
            >
            <small v-if="fileName" class="text-muted">Wybrany: {{ fileName }}</small>
          </div>
          
          <div v-if="fileContent" class="mb-3">
            <label class="form-label">Podgląd zawartości</label>
            <textarea 
              v-model="fileContent"
              class="form-control font-monospace"
              rows="10"
            ></textarea>
          </div>
          
          <!-- błędy walidacji -->
          <div v-if="validationErrors.length > 0" class="alert alert-warning">
            <strong>Błędy walidacji:</strong>
            <ul class="mb-0 mt-2">
              <li v-for="(err, i) in validationErrors" :key="i">{{ err }}</li>
            </ul>
          </div>
          
          <!-- błąd serwera -->
          <div v-if="error" class="alert alert-danger">{{ error }}</div>
          
          <button 
            class="btn btn-dark"
            @click="initDatabase"
            :disabled="!fileContent || loading"
          >
            <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
            Zainicjalizuj bazę
          </button>
        </div>
      </div>
      
      <!-- przykład formatu -->
      <div class="card mt-4">
        <div class="card-header">Przykładowy format JSON</div>
        <div class="card-body">
          <pre class="mb-0"><code>[
  {
    "name": "Laptop",
    "description": "Szybki laptop do pracy",
    "price": 3499.99,
    "weight": 2.1,
    "category_id": 1
  }
]</code></pre>
        </div>
      </div>
    </template>
  </div>
</template>
