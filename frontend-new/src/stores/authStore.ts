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

// Guest user for bypassing authentication
const GUEST_USER: User = {
  userId: 'guest-user',
  email: 'guest@bronwynsguide.com',
  firstName: 'Guest',
  lastName: 'User'
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: GUEST_USER, // Start with guest user
      token: 'guest-token',
      isAuthenticated: false, // Keep false to allow login option

      login: async (email: string, password: string) => {
        // Mock authentication for test users
        const mockUsers = [
          {
            email: 'bronwyn',
            password: 'Bron1234',
            user: {
              userId: 'user-1',
              email: 'bronwyn@example.com',
              firstName: 'Bronwyn',
              lastName: 'User'
            }
          },
          {
            email: 'kelly',
            password: 'Kelly1234',
            user: {
              userId: 'user-2',
              email: 'kelly@example.com',
              firstName: 'Kelly',
              lastName: 'User'
            }
          }
        ]

        // Check for mock users first (case-insensitive email)
        const mockUser = mockUsers.find(u => 
          u.email.toLowerCase() === email.toLowerCase() && 
          u.password === password
        )

        if (mockUser) {
          // Mock successful login
          const token = 'mock-token-' + Date.now()
          set({
            user: mockUser.user,
            token,
            isAuthenticated: true
          })
          return
        }

        // Fall back to real API if not a mock user
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
          // If API fails, check if it's a mock user with wrong password
          const isMockUser = mockUsers.some(u => 
            u.email.toLowerCase() === email.toLowerCase()
          )
          if (isMockUser) {
            throw new Error('Invalid password for test user')
          }
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