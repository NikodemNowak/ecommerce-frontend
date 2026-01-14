import { defineStore } from 'pinia'
import api from '../api'

export const useProductsStore = defineStore('products', {
  state: () => ({
    products: [],
    categories: [],
    loading: false,
    error: null
  }),

  getters: {
    // filtrowanie produktów po nazwie i kategorii
    filteredProducts: (state) => (nameFilter, categoryId) => {
      return state.products.filter(product => {
        const matchesName = !nameFilter || 
          product.name.toLowerCase().includes(nameFilter.toLowerCase())
        const matchesCategory = !categoryId || 
          product.category_id === parseInt(categoryId)
        return matchesName && matchesCategory
      })
    }
  },

  actions: {
    async fetchProducts() {
      this.loading = true
      try {
        const { data } = await api.get('/products')
        this.products = data
      } catch (error) {
        this.error = error.response?.data?.detail || 'Błąd ładowania produktów'
      } finally {
        this.loading = false
      }
    },

    async fetchCategories() {
      try {
        const { data } = await api.get('/categories')
        this.categories = data
      } catch (error) {
        console.error('Błąd ładowania kategorii:', error)
      }
    },

    async updateProduct(id, productData) {
      const { data } = await api.put(`/products/${id}`, productData)
      const index = this.products.findIndex(p => p.id === id)
      if (index > -1) {
        this.products[index] = data
      }
      return data
    },

    async getSeoDescription(id) {
      const { data } = await api.get(`/products/${id}/seo-description`)
      return data.description
    }
  }
})
