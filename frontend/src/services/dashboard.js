import { apiClient } from './api'

export async function getDashboardStats() {
  return apiClient('/api/dashboard/stats')
}
