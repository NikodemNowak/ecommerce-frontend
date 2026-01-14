<script setup>
import { ref } from 'vue'
import { useOrdersStore } from '../stores/orders'

const props = defineProps({
  order: { type: Object, required: true }
})

const emit = defineEmits(['close', 'added'])

const ordersStore = useOrdersStore()

const rating = ref(5)
const content = ref('')
const error = ref('')
const loading = ref(false)

async function submitOpinion() {
  if (!content.value.trim()) {
    error.value = 'Treść opinii jest wymagana'
    return
  }
  
  loading.value = true
  error.value = ''
  
  try {
    await ordersStore.addOpinion(props.order.id, {
      rating: rating.value,
      content: content.value
    })
    emit('added')
  } catch (err) {
    error.value = err.response?.data?.detail || 'Błąd dodawania opinii'
  } finally {
    loading.value = false
  }
}
</script>

<template>
  <div class="modal-backdrop show" @click.self="emit('close')">
    <div class="modal d-block" tabindex="-1">
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Dodaj opinię - Zamówienie #{{ order.id }}</h5>
            <button type="button" class="btn-close" @click="emit('close')"></button>
          </div>
          <div class="modal-body">
            <div v-if="error" class="alert alert-danger">{{ error }}</div>
            
            <div class="mb-3">
              <label class="form-label">Ocena</label>
              <div class="d-flex gap-2">
                <button 
                  v-for="n in 5" 
                  :key="n"
                  type="button"
                  class="btn btn-lg"
                  :class="n <= rating ? 'btn-warning' : 'btn-outline-secondary'"
                  @click="rating = n"
                >
                  {{ n }}
                </button>
              </div>
            </div>
            
            <div class="mb-3">
              <label class="form-label">Treść opinii</label>
              <textarea 
                v-model="content"
                class="form-control"
                rows="4"
                placeholder="Opisz swoje doświadczenie..."
              ></textarea>
            </div>
          </div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" @click="emit('close')">
              Anuluj
            </button>
            <button 
              type="button" 
              class="btn btn-primary"
              @click="submitOpinion"
              :disabled="loading"
            >
              <span v-if="loading" class="spinner-border spinner-border-sm me-2"></span>
              Dodaj opinię
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1040;
}

.modal {
  z-index: 1050;
}
</style>
