/**
 * Silver Shield API Client
 * Simple fetch-based HTTP client for the backend API
 * 
 * Usage:
 *   import { api } from './api-client.js'
 *   
 *   // Login
 *   const { token, user } = await api.login(email, password)
 *   
 *   // Fetch programs
 *   const programs = await api.get('/programs')
 *   
 *   // Create program (requires token)
 *   const newProgram = await api.post('/programs', data, token)
 *   
 *   // Upload file
 *   const result = await api.upload('/upload', formData, token)
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api'

class ApiClient {
  constructor(baseUrl = API_BASE_URL) {
    this.baseUrl = baseUrl
  }

  /**
   * Set base URL dynamically (e.g., for multi-environment support)
   */
  setBaseUrl(url) {
    this.baseUrl = url
  }

  /**
   * Generic HTTP request
   */
  async request(method, path, body = null, token = null, useFormData = false) {
    const url = `${this.baseUrl}${path}`
    const options = {
      method: method.toUpperCase(),
      headers: {
        ...(!useFormData && { 'Content-Type': 'application/json' }),
        ...(token && { 'Authorization': `Bearer ${token}` })
      }
    }

    if (body) {
      if (useFormData && body instanceof FormData) {
        options.body = body
      } else {
        options.body = JSON.stringify(body)
      }
    }

    try {
      const response = await fetch(url, options)
      
      // Handle errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const error = new Error(errorData?.message || `HTTP ${response.status}`)
        error.status = response.status
        error.data = errorData
        throw error
      }

      // Parse response
      const contentType = response.headers.get('content-type')
      if (contentType?.includes('application/json')) {
        return await response.json()
      }
      return response.text()
    } catch (error) {
      console.error(`API Error: ${method} ${path}`, error)
      throw error
    }
  }

  /**
   * GET request
   */
  get(path, token = null) {
    return this.request('GET', path, null, token)
  }

  /**
   * POST request
   */
  post(path, data = {}, token = null, useFormData = false) {
    return this.request('POST', path, data, token, useFormData)
  }

  /**
   * PUT request
   */
  put(path, data = {}, token = null) {
    return this.request('PUT', path, data, token)
  }

  /**
   * DELETE request
   */
  delete(path, token = null) {
    return this.request('DELETE', path, null, token)
  }

  /**
   * PATCH request
   */
  patch(path, data = {}, token = null) {
    return this.request('PATCH', path, data, token)
  }

  /**
   * Upload files
   */
  upload(path, formData, token = null) {
    return this.request('POST', path, formData, token, true)
  }

  /**
   * Authentication
   */
  async login(email, password) {
    const response = await this.post('/auth/login', { email, password })
    return {
      token: response.token,
      user: response.user
    }
  }

  /**
   * Get current user
   */
  me(token) {
    return this.get('/auth/me', token)
  }

  /**
   * Health check
   */
  async health() {
    return this.get('/health')
  }

  /**
   * Get programs
   */
  getPrograms() {
    return this.get('/programs')
  }

  /**
   * Get program by ID
   */
  getProgram(id) {
    return this.get(`/programs/${id}`)
  }

  /**
   * Create program
   */
  createProgram(data, token) {
    return this.post('/programs', data, token)
  }

  /**
   * Update program
   */
  updateProgram(id, data, token) {
    return this.put(`/programs/${id}`, data, token)
  }

  /**
   * Delete program
   */
  deleteProgram(id, token) {
    return this.delete(`/programs/${id}`, token)
  }

  /**
   * Get stories
   */
  getStories() {
    return this.get('/stories')
  }

  /**
   * Get story by ID
   */
  getStory(id) {
    return this.get(`/stories/${id}`)
  }

  /**
   * Create story
   */
  createStory(data, token) {
    return this.post('/stories', data, token)
  }

  /**
   * Update story
   */
  updateStory(id, data, token) {
    return this.put(`/stories/${id}`, data, token)
  }

  /**
   * Get events
   */
  getEvents() {
    return this.get('/events')
  }

  /**
   * Get about page
   */
  getAbout() {
    return this.get('/about')
  }

  /**
   * Get team members
   */
  getTeam() {
    return this.get('/team/members')
  }

  /**
   * Get board members
   */
  getBoard() {
    return this.get('/team/board')
  }

  /**
   * Register volunteer
   */
  registerVolunteer(data) {
    return this.post('/volunteers', data)
  }

  /**
   * Get volunteers
   */
  getVolunteers() {
    return this.get('/volunteers')
  }

  /**
   * Send message/contact form
   */
  sendMessage(data) {
    return this.post('/messages', data)
  }

  /**
   * Get messages (admin)
   */
  getMessages(token) {
    return this.get('/messages', token)
  }

  /**
   * Initiate donation
   */
  initiateDonation(data) {
    return this.post('/donations/initiate', data)
  }

  /**
   * Get donations (admin)
   */
  getDonations(token) {
    return this.get('/donations', token)
  }

  /**
   * Get M-Pesa payment details
   */
  getMpesaDetails() {
    return this.get('/donations/mpesa/details')
  }
}

// Export singleton instance
export const api = new ApiClient()

// Also export class for custom instances
export default ApiClient
