import { defineStore } from 'pinia'
import api from '../api'

export const useOrdersStore = defineStore('orders', {
  state: () => ({
    orders: [],
    userOrders: [],
    statuses: [],
    loading: false,
    error: null
  }),

  actions: {
    async fetchStatuses() {
      try {
        const { data } = await api.get('/status')
        this.statuses = data
      } catch (error) {
        console.error('Błąd ładowania statusów:', error)
      }
    },

    async createOrder(orderData) {
      const { data } = await api.post('/orders', orderData)
      return data
    },

    async fetchAllOrders() {
      this.loading = true
      try {
        const { data } = await api.get('/orders')
        this.orders = data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Błąd ładowania zamówień'
      } finally {
        this.loading = false
      }
    },

    async fetchOrdersByStatus(statusId) {
      this.loading = true
      try {
        const { data } = await api.get(`/orders/status/${statusId}`)
        return data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Błąd ładowania zamówień'
        return []
      } finally {
        this.loading = false
      }
    },

    async fetchUserOrders() {
      this.loading = true
      try {
        const { data } = await api.get('/orders/user')
        this.userOrders = data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Błąd ładowania zamówień'
      } finally {
        this.loading = false
      }
    },

    async changeOrderStatus(orderId, status) {
      const { data } = await api.patch(`/orders/${orderId}`, { status })
      // aktualizuj lokalnie
      const index = this.orders.findIndex(o => o.id === orderId)
      if (index > -1) {
        this.orders[index] = data
      }
      return data
    },

    async addOpinion(orderId, opinion) {
      const { data } = await api.post(`/orders/${orderId}/opinions`, opinion)
      return data
    }
  }
})
