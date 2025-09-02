import { Link as RouterLink, useLocation } from 'react-router-dom'
import {
  Box,
  HStack,
  VStack,
  Text,
  Icon,
  IconButton
} from '@chakra-ui/react'
import {
  FiHome,
  FiBook,
  FiPlus,
  FiCalendar,
  FiShoppingCart
} from 'react-icons/fi'

const navItems = [
  { path: '/', label: 'Home', icon: FiHome },
  { path: '/recipes', label: 'Recipes', icon: FiBook },
  { path: '/recipes/new', label: 'Add', icon: FiPlus, isSpecial: true },
  { path: '/meal-plans', label: 'Plans', icon: FiCalendar },
  { path: '/shopping-lists', label: 'Shop', icon: FiShoppingCart }
]

function MobileNav() {
  const location = useLocation()

  return (
    <Box
      position="fixed"
      bottom={0}
      left={0}
      right={0}
      bg="white"
      borderTop="1px"
      borderColor="gray.200"
      px={2}
      py={2}
      display={{ base: 'block', md: 'none' }}
      zIndex={100}
    >
      <HStack justify="space-around" spacing={0}>
        {navItems.map((item) => {
          const isActive = location.pathname === item.path
          
          if (item.isSpecial) {
            return (
              <Box key={item.path} position="relative">
                <IconButton
                  as={RouterLink}
                  to={item.path}
                  aria-label={item.label}
                  icon={<Icon as={item.icon} boxSize={6} />}
                  colorScheme="purple"
                  size="lg"
                  borderRadius="full"
                  variant="solid"
                  transform="translateY(-8px)"
                  boxShadow="lg"
                  _hover={{ transform: 'translateY(-10px)' }}
                />
              </Box>
            )
          }

          return (
            <VStack
              key={item.path}
              as={RouterLink}
              to={item.path}
              spacing={1}
              flex={1}
              py={1}
              color={isActive ? 'purple.600' : 'gray.500'}
              transition="all 0.2s"
              _active={{ transform: 'scale(0.95)' }}
            >
              <Icon 
                as={item.icon} 
                boxSize={5}
                color={isActive ? 'purple.600' : 'gray.500'}
              />
              <Text 
                fontSize="xs" 
                fontWeight={isActive ? 'medium' : 'normal'}
              >
                {item.label}
              </Text>
            </VStack>
          )
        })}
      </HStack>
    </Box>
  )
}

export default MobileNav