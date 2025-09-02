import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import axios from 'axios'

interface User {
  userId: string
  email: string
  firstName: string
  lastName: string
}

interface AuthState {
  user: User | null
  token: string | null
  isAuthenticated: boolean
  login: (email: string, password: string) => Promise<void>
  register: (data: RegisterData) => Promise<void>
  logout: () => void
  updateUser: (user: User) => void
}

interface RegisterData {
  email: string
  password: string
  firstName: string
  lastName: string
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (email: string, password: string) => {
        try {
          const response = await axios.post('/api/auth/login', { email, password })
          const { user, token } = response.data
          
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          set({
            user,
            token,
            isAuthenticated: true
          })
        } catch (error) {
          console.error('Login failed:', error)
          throw error
        }
      },

      register: async (data: RegisterData) => {
        try {
          const response = await axios.post('/api/auth/register', data)
          const { user, token } = response.data
          
          axios.defaults.headers.common['Authorization'] = `Bearer ${token}`
          
          set({
            user,
            token,
            isAuthenticated: true
          })
        } catch (error) {
          console.error('Registration failed:', error)
          throw error
        }
      },

      logout: () => {
        delete axios.defaults.headers.common['Authorization']
        set({
          user: null,
          token: null,
          isAuthenticated: false
        })
      },

      updateUser: (user: User) => {
        set({ user })
      }
    }),
    {
      name: 'auth-storage'
    }
  )
)

if (useAuthStore.getState().token) {
  axios.defaults.headers.common['Authorization'] = `Bearer ${useAuthStore.getState().token}`
}