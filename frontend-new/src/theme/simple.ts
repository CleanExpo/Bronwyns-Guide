import { extendTheme } from '@chakra-ui/react'

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors: {
    purple: {
      500: '#805AD5',
      600: '#6B46C1',
      700: '#553C9A',
    }
  }
})

export default theme