import { useToast as useChakraToast, UseToastOptions } from '../components/ui'
import { FiCheckCircle, FiXCircle, FiAlertCircle, FiInfo } from 'react-icons/fi'

interface ToastOptions extends Omit<UseToastOptions, 'status'> {
  type?: 'success' | 'error' | 'warning' | 'info'
}

export const useToast = () => {
  const chakraToast = useChakraToast()

  const showToast = (message: string, options?: ToastOptions) => {
    const { type = 'info', ...restOptions } = options || {}

    const icons = {
      success: FiCheckCircle,
      error: FiXCircle,
      warning: FiAlertCircle,
      info: FiInfo
    }

    const Icon = icons[type]

    return chakraToast({
      description: message,
      status: type,
      duration: 3000,
      isClosable: true,
      position: 'bottom',
      ...restOptions,
      render: ({ onClose }) => (
        <div
          style={{
            padding: '12px 16px',
            borderRadius: '8px',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            backgroundColor: type === 'success' ? '#48BB78' : 
                           type === 'error' ? '#F56565' :
                           type === 'warning' ? '#ED8936' : '#4299E1',
            color: 'white',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
            maxWidth: '90vw',
            cursor: 'pointer'
          }}
          onClick={onClose}
        >
          <Icon size={20} />
          <span style={{ flex: 1 }}>{message}</span>
        </div>
      )
    })
  }

  return {
    success: (message: string, options?: Omit<ToastOptions, 'type'>) => 
      showToast(message, { ...options, type: 'success' }),
    error: (message: string, options?: Omit<ToastOptions, 'type'>) => 
      showToast(message, { ...options, type: 'error' }),
    warning: (message: string, options?: Omit<ToastOptions, 'type'>) => 
      showToast(message, { ...options, type: 'warning' }),
    info: (message: string, options?: Omit<ToastOptions, 'type'>) => 
      showToast(message, { ...options, type: 'info' }),
    show: showToast
  }
}

// Global toast functions for use outside components
let globalToast: ReturnType<typeof useChakraToast> | null = null

export const setGlobalToast = (toast: ReturnType<typeof useChakraToast>) => {
  globalToast = toast
}

export const toast = {
  success: (message: string) => {
    if (globalToast) {
      globalToast({
        title: message,
        status: 'success',
        duration: 3000,
        isClosable: true,
        position: 'bottom'
      })
    }
  },
  error: (message: string) => {
    if (globalToast) {
      globalToast({
        title: message,
        status: 'error',
        duration: 5000,
        isClosable: true,
        position: 'bottom'
      })
    }
  },
  warning: (message: string) => {
    if (globalToast) {
      globalToast({
        title: message,
        status: 'warning',
        duration: 4000,
        isClosable: true,
        position: 'bottom'
      })
    }
  },
  info: (message: string) => {
    if (globalToast) {
      globalToast({
        title: message,
        status: 'info',
        duration: 3000,
        isClosable: true,
        position: 'bottom'
      })
    }
  }
}