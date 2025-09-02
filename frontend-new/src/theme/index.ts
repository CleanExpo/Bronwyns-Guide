import { extendTheme, type ThemeConfig } from '@chakra-ui/react'

const config: ThemeConfig = {
  initialColorMode: 'system',
  useSystemColorMode: true,
}

const theme = extendTheme({
  config,
  colors: {
    brand: {
      50: '#f5f3ff',
      100: '#ede9fe',
      200: '#ddd6fe',
      300: '#c4b5fd',
      400: '#a78bfa',
      500: '#8b5cf6',
      600: '#7c3aed',
      700: '#6d28d9',
      800: '#5b21b6',
      900: '#4c1d95',
    },
    purple: {
      50: '#faf5ff',
      100: '#f3e8ff',
      200: '#e9d5ff',
      300: '#d8b4fe',
      400: '#c084fc',
      500: '#a855f7',
      600: '#9333ea',
      700: '#7e22ce',
      800: '#6b21a8',
      900: '#581c87',
    }
  },
  fonts: {
    heading: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
    body: `'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif`,
  },
  components: {
    Button: {
      defaultProps: {
        colorScheme: 'purple',
      },
      baseStyle: {
        fontWeight: 'medium',
        borderRadius: 'lg',
      },
      sizes: {
        lg: {
          h: '12',
          minW: '12',
          fontSize: 'md',
          px: '6',
        },
      },
    },
    Card: {
      baseStyle: {
        container: {
          borderRadius: 'lg',
          boxShadow: 'sm',
          _dark: {
            bg: 'gray.800',
            borderWidth: '1px',
            borderColor: 'gray.700',
          },
        },
      },
    },
    Input: {
      defaultProps: {
        focusBorderColor: 'purple.500',
      },
      baseStyle: {
        field: {
          borderRadius: 'md',
          _dark: {
            bg: 'gray.800',
            borderColor: 'gray.600',
          },
        },
      },
    },
    Select: {
      defaultProps: {
        focusBorderColor: 'purple.500',
      },
      baseStyle: {
        field: {
          borderRadius: 'md',
          _dark: {
            bg: 'gray.800',
            borderColor: 'gray.600',
          },
        },
      },
    },
    Textarea: {
      defaultProps: {
        focusBorderColor: 'purple.500',
      },
      baseStyle: {
        borderRadius: 'md',
        _dark: {
          bg: 'gray.800',
          borderColor: 'gray.600',
        },
      },
    },
    Modal: {
      baseStyle: {
        dialog: {
          borderRadius: 'lg',
          _dark: {
            bg: 'gray.800',
          },
        },
      },
    },
    Drawer: {
      baseStyle: {
        dialog: {
          _dark: {
            bg: 'gray.800',
          },
        },
      },
    },
    Alert: {
      baseStyle: {
        container: {
          borderRadius: 'md',
        },
      },
    },
    Tag: {
      baseStyle: {
        container: {
          borderRadius: 'full',
        },
      },
    },
    Skeleton: {
      baseStyle: {
        _dark: {
          startColor: 'gray.700',
          endColor: 'gray.600',
        },
      },
    },
  },
  styles: {
    global: (props: any) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'gray.900' : 'gray.50',
        color: props.colorMode === 'dark' ? 'gray.100' : 'gray.900',
      },
      '*': {
        WebkitTapHighlightColor: 'transparent',
      },
      '::-webkit-scrollbar': {
        width: '8px',
        height: '8px',
      },
      '::-webkit-scrollbar-track': {
        bg: props.colorMode === 'dark' ? 'gray.800' : 'gray.100',
      },
      '::-webkit-scrollbar-thumb': {
        bg: props.colorMode === 'dark' ? 'gray.600' : 'gray.400',
        borderRadius: 'full',
      },
      '::-webkit-scrollbar-thumb:hover': {
        bg: props.colorMode === 'dark' ? 'gray.500' : 'gray.500',
      },
    }),
  },
  breakpoints: {
    sm: '30em', // 480px
    md: '48em', // 768px
    lg: '62em', // 992px
    xl: '80em', // 1280px
    '2xl': '96em', // 1536px
  },
})

export default theme