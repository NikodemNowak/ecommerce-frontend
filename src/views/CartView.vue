<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useCartStore } from '../stores/cart'
import { useOrdersStore } from '../stores/orders'

const cartStore = useCartStore()
const ordersStore = useOrdersStore()
const router = useRouter()

// dane kontaktowe
const contactData = ref({
  username: '',
  email: '',
  phone: ''
})

const errors = ref({})
const submitError = ref('')
const submitting = ref(false)
const orderSuccess = ref(false)

const totalPrice = computed(() => cartStore.totalPrice)

function validateForm() {
  errors.value = {}
  
  if (!contactData.value.username.trim()) {
    errors.value.username = 'Nazwa użytkownika jest wymagana'
  }
  
  if (!contactData.value.email.trim()) {
    errors.value.email = 'Email jest wymagany'
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactData.value.email)) {
    errors.value.email = 'Nieprawidłowy format email'
  }
  
  if (!contactData.value.phone.trim()) {
    errors.value.phone = 'Telefon jest wymagany'
  } else if (!/^\+?[\d\s-]{9,}$/.test(contactData.value.phone)) {
    errors.value.phone = 'Nieprawidłowy format telefonu'
  }
  
  if (cartStore.isEmpty) {
    errors.value.cart = 'Koszyk jest pusty'
  }
  
  return Object.keys(errors.value).length === 0
}

async function submitOrder() {
  if (!validateForm()) return
  
  submitting.value = true
  submitError.value = ''
  
  try {
    const orderData = {
      items: cartStore.items.map(item => ({
        productId: item.id,
        quantity: item.quantity
      })),
      contact: contactData.value
    }
    
    await ordersStore.createOrder(orderData)
    cartStore.clearCart()
    orderSuccess.value = true
  } catch (error) {
    submitError.value = error.response?.data?.detail || 'Błąd podczas składania zamówienia'
  } finally {
    submitting.value = false
  }
}

function increment(itemId) {
  const item = cartStore.items.find(i => i.id === itemId)
  if (item) {
    cartStore.updateQuantity(itemId, item.quantity + 1)
  }
}

function decrement(itemId) {
  const item = cartStore.items.find(i => i.id === itemId)
  if (item) {
    cartStore.updateQuantity(itemId, item.quantity - 1)
  }
}
</script>

<template>
  <div>
    <h2 class="mb-4">Koszyk</h2>
    
    <!-- sukces -->
    <div v-if="orderSuccess" class="alert alert-success">
      <h4>Zamówienie złożone!</h4>
      <p>Dziękujemy za zakup. Możesz śledzić status w zakładce "Moje zamówienia".</p>
      <RouterLink to="/orders" class="btn btn-outline-success">Zobacz zamówienia</RouterLink>
    </div>
    
    <template v-else>
      <!-- pusty koszyk -->
      <div v-if="cartStore.isEmpty" class="alert alert-info">
        Koszyk jest pusty. <RouterLink to="/">Przejdź do produktów</RouterLink>
      </div>
      
      <template v-else>
        <!-- tabela koszyka -->
        <div class="table-responsive mb-4">
          <table class="table">
            <thead class="table-light">
              <tr>
                <th>Produkt</th>
                <th class="text-center">Ilość</th>
                <th class="text-end">Cena jedn.</th>
                <th class="text-end">Suma</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in cartStore.items" :key="item.id">
                <td>{{ item.name }}</td>
                <td class="text-center">
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-outline-secondary" @click="decrement(item.id)">-</button>
                    <span class="btn btn-outline-secondary disabled">{{ item.quantity }}</span>
                    <button class="btn btn-outline-secondary" @click="increment(item.id)">+</button>
                  </div>
                </td>
                <td class="text-end">{{ item.price.toFixed(2) }} zł</td>
                <td class="text-end fw-bold">{{ (item.price * item.quantity).toFixed(2) }} zł</td>
                <td class="text-end">
                  <button class="btn btn-sm btn-outline-danger" @click="cartStore.removeItem(item.id)">
                    Usuń
                  </button>
                </td>
              </tr>
            </tbody>
            <tfoot class="table-dark">
              <tr>
                <td colspan="3" class="text-end"><strong>Razem:</strong></td>
                <td class="text-end"><strong>{{ totalPrice.toFixed(2) }} zł</strong></td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
        
        <!-- formularz kontaktowy -->
        <div class="card">
          <div class="card-header">
            <h5 class="mb-0">Dane kontaktowe</h5>
          </div>
          <div class="card-body">
            <div v-if="submitError" class="alert alert-danger">{{ submitError }}</div>
            
            <form @submit.prevent="submitOrder">
              <div class="row">
                <div class="col-md-4 mb-3">
                  <label class="form-label">Nazwa użytkownika</label>
                  <input 
                    v-model="contactData.username"
                    type="text" 
                    class="form-control"
                    :class="{ 'is-invalid': errors.username }"
                  >
                  <div class="invalid-feedback">{{ errors.username }}</div>
                </div>
                
                <div class="col-md-4 mb-3">
                  <label class="form-label">Email</label>
                  <input 
                    v-model="contactData.email"
                    type="email" 
                    class="form-control"
                    :class="{ 'is-invalid': errors.email }"
                  >
                  <div class="invalid-feedback">{{ errors.email }}</div>
                </div>
                
                <div class="col-md-4 mb-3">
                  <label class="form-label">Telefon</label>
                  <input 
                    v-model="contactData.phone"
                    type="tel" 
                    class="form-control"
                    :class="{ 'is-invalid': errors.phone }"
                  >
                  <div class="invalid-feedback">{{ errors.phone }}</div>
                </div>
              </div>
              
              <div class="d-flex justify-content-between align-items-center">
                <span class="fs-4">Do zapłaty: <strong>{{ totalPrice.toFixed(2) }} zł</strong></span>
                <button type="submit" class="btn btn-lg btn-success" :disabled="submitting">
                  <span v-if="submitting" class="spinner-border spinner-border-sm me-2"></span>
                  Złóż zamówienie
                </button>
              </div>
            </form>
          </div>
        </div>
      </template>
    </template>
  </div>
</template>
