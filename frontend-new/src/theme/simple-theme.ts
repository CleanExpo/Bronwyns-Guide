import { extendTheme } from '../components/ui'

// Simple theme to prevent compatibility issues
const simpleTheme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    purple: {
      50: '#F7FAFC',
      100: '#EDF2F7',
      200: '#E2E8F0',
      300: '#CBD5E0',
      400: '#A0AEC0',
      500: '#6B4C93',
      600: '#805AD5',
      700: '#553C9A',
      800: '#44337A',
      900: '#322659',
    }
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'purple',
      },
    },
  },
})

export default simpleTheme