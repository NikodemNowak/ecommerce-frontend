<script setup>
import { ref, onMounted } from 'vue'
import { useOrdersStore } from '../stores/orders'
import OpinionModal from '../components/OpinionModal.vue'

const ordersStore = useOrdersStore()

const selectedOrder = ref(null)
const showOpinionModal = ref(false)

onMounted(() => {
  ordersStore.fetchUserOrders()
  ordersStore.fetchStatuses()
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

// czy można dodać opinię
function canAddOpinion(order) {
  const status = getStatusName(order.status_id)
  const hasOpinion = order.opinions && order.opinions.length > 0
  return (status === 'ZREALIZOWANE' || status === 'ANULOWANE') && !hasOpinion
}

function openOpinionModal(order) {
  selectedOrder.value = order
  showOpinionModal.value = true
}

function onOpinionAdded() {
  showOpinionModal.value = false
  ordersStore.fetchUserOrders()
}
</script>

<template>
  <div>
    <h2 class="mb-4">Moje zamówienia</h2>
    
    <div v-if="ordersStore.loading" class="text-center py-4">
      <div class="spinner-border"></div>
    </div>
    
    <div v-else-if="ordersStore.userOrders.length === 0" class="alert alert-info">
      Nie masz jeszcze żadnych zamówień.
    </div>
    
    <div v-else class="table-responsive">
      <table class="table">
        <thead class="table-dark">
          <tr>
            <th>ID</th>
            <th>Data zatwierdzenia</th>
            <th>Produkty</th>
            <th class="text-end">Wartość</th>
            <th>Status</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in ordersStore.userOrders" :key="order.id">
            <td>#{{ order.id }}</td>
            <td>{{ order.approved_at ? new Date(order.approved_at).toLocaleDateString('pl') : '-' }}</td>
            <td>
              <ul class="list-unstyled mb-0 small">
                <li v-for="item in order.items" :key="item.id">
                  {{ item.product?.name || `Produkt #${item.product_id}` }} x{{ item.quantity }}
                </li>
              </ul>
            </td>
            <td class="text-end fw-bold">{{ calculateTotal(order.items).toFixed(2) }} zł</td>
            <td>
              <span class="badge" :class="getStatusClass(order.status_id)">
                {{ getStatusName(order.status_id) }}
              </span>
            </td>
            <td>
              <button 
                v-if="canAddOpinion(order)"
                class="btn btn-sm btn-outline-primary"
                @click="openOpinionModal(order)"
              >
                Dodaj opinię
              </button>
              <span v-else-if="order.opinions?.length" class="text-muted small">
                Opinia dodana
              </span>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    
    <OpinionModal 
      v-if="showOpinionModal && selectedOrder"
      :order="selectedOrder"
      @close="showOpinionModal = false"
      @added="onOpinionAdded"
    />
  </div>
</template>
