<script setup>
import { ref, onMounted, computed } from 'vue'
import { useOrdersStore } from '../stores/orders'

const ordersStore = useOrdersStore()

const statusFilter = ref('')
const actionError = ref('')

onMounted(() => {
  ordersStore.fetchAllOrders()
  ordersStore.fetchStatuses()
})

const filteredOrders = computed(() => {
  if (!statusFilter.value) return ordersStore.orders
  return ordersStore.orders.filter(o => o.status_id === parseInt(statusFilter.value))
})

// tylko niezatwierdzone i zatwierdzone
const pendingOrders = computed(() => {
  return ordersStore.orders.filter(o => {
    const status = getStatusName(o.status_id)
    return status === 'NIEZATWIERDZONE' || status === 'ZATWIERDZONE'
  })
})

function getStatusName(statusId) {
  return ordersStore.statuses.find(s => s.id === statusId)?.name || '-'
}

function getStatusClass(statusId) {
  const name = getStatusName(statusId)
  const classes = {
    'NIEZATWIERDZONE': 'bg-warning text-dark',
    'ZATWIERDZONE': 'bg-info',
    'ZREALIZOWANE': 'bg-success',
    'ANULOWANE': 'bg-danger'
  }
  return classes[name] || 'bg-secondary'
}

function calculateTotal(items) {
  if (!items) return 0
  return items.reduce((sum, item) => sum + parseFloat(item.unit_price) * item.quantity, 0)
}

async function changeStatus(orderId, newStatus) {
  actionError.value = ''
  try {
    await ordersStore.changeOrderStatus(orderId, newStatus)
    await ordersStore.fetchAllOrders()
  } catch (error) {
    actionError.value = error.response?.data?.detail || 'Błąd zmiany statusu'
  }
}
</script>

<template>
  <div>
    <h2 class="mb-4">Zarządzanie zamówieniami</h2>
    
    <div v-if="actionError" class="alert alert-danger alert-dismissible">
      {{ actionError }}
      <button type="button" class="btn-close" @click="actionError = ''"></button>
    </div>
    
    <!-- filtry -->
    <div class="row mb-4">
      <div class="col-md-4">
        <select v-model="statusFilter" class="form-select">
          <option value="">Wszystkie statusy</option>
          <option v-for="status in ordersStore.statuses" :key="status.id" :value="status.id">
            {{ status.name }}
          </option>
        </select>
      </div>
    </div>
    
    <!-- niezrealizowane (szybki dostęp) -->
    <div v-if="!statusFilter && pendingOrders.length > 0" class="card mb-4 border-warning">
      <div class="card-header bg-warning text-dark">
        <h5 class="mb-0">Do realizacji ({{ pendingOrders.length }})</h5>
      </div>
      <div class="card-body p-0">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead>
              <tr>
                <th>ID</th>
                <th>Data</th>
                <th>Produkty</th>
                <th class="text-end">Wartość</th>
                <th>Status</th>
                <th>Akcje</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in pendingOrders" :key="order.id">
                <td>#{{ order.id }}</td>
                <td>{{ order.approved_at ? new Date(order.approved_at).toLocaleDateString('pl') : '-' }}</td>
                <td>
                  <ul class="list-unstyled mb-0 small">
                    <li v-for="item in order.items" :key="item.id">
                      {{ item.product?.name }} x{{ item.quantity }}
                    </li>
                  </ul>
                </td>
                <td class="text-end">{{ calculateTotal(order.items).toFixed(2) }} zł</td>
                <td><span class="badge" :class="getStatusClass(order.status_id)">{{ getStatusName(order.status_id) }}</span></td>
                <td>
                  <div class="btn-group btn-group-sm">
                    <button class="btn btn-success" @click="changeStatus(order.id, 'ZREALIZOWANE')">
                      Zrealizuj
                    </button>
                    <button class="btn btn-danger" @click="changeStatus(order.id, 'ANULOWANE')">
                      Anuluj
                    </button>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
    
    <!-- wszystkie zamówienia -->
    <div class="card">
      <div class="card-header">
        <h5 class="mb-0">Wszystkie zamówienia</h5>
      </div>
      <div class="card-body p-0">
        <div v-if="ordersStore.loading" class="text-center py-4">
          <div class="spinner-border"></div>
        </div>
        
        <div v-else-if="filteredOrders.length === 0" class="text-center py-4 text-muted">
          Brak zamówień
        </div>
        
        <div v-else class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-light">
              <tr>
                <th>ID</th>
                <th>Użytkownik</th>
                <th>Data</th>
                <th>Produkty</th>
                <th class="text-end">Wartość</th>
                <th>Status</th>
                <th>Opinia</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="order in filteredOrders" :key="order.id">
                <td>#{{ order.id }}</td>
                <td>{{ order.user?.username || '-' }}</td>
                <td>{{ order.approved_at ? new Date(order.approved_at).toLocaleDateString('pl') : '-' }}</td>
                <td>
                  <ul class="list-unstyled mb-0 small">
                    <li v-for="item in order.items" :key="item.id">
                      {{ item.product?.name }} x{{ item.quantity }}
                    </li>
                  </ul>
                </td>
                <td class="text-end">{{ calculateTotal(order.items).toFixed(2) }} zł</td>
                <td><span class="badge" :class="getStatusClass(order.status_id)">{{ getStatusName(order.status_id) }}</span></td>
                <td>
                  <div v-if="order.opinions?.length" class="small">
                    <strong>{{ order.opinions[0].rating }}/5</strong>
                    <p class="mb-0 text-muted">{{ order.opinions[0].content }}</p>
                  </div>
                  <span v-else class="text-muted">-</span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>
