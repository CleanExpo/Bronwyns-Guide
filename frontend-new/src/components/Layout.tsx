import { Outlet, Link as RouterLink, useLocation } from 'react-router-dom'
import MobileNav from './MobileNav'
import Footer from './Footer'
import {
  Box,
  Flex,
  HStack,
  VStack,
  Text,
  IconButton,
  Avatar,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuDivider,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  Button,
  Icon
} from '../components/ui'
import {
  FiMenu,
  FiHome,
  FiBook,
  FiCalendar,
  FiShoppingCart,
  FiUsers,
  FiUser,
  FiLogOut
} from 'react-icons/fi'
import { useAuthStore } from '../stores/authStore'

const navItems = [
  { path: '/', label: 'Dashboard', icon: FiHome },
  { path: '/recipes', label: 'Recipes', icon: FiBook },
  { path: '/meal-plans', label: 'Meal Plans', icon: FiCalendar },
  { path: '/shopping-lists', label: 'Shopping Lists', icon: FiShoppingCart },
  { path: '/family-members', label: 'Family Members', icon: FiUsers }
]

function Layout() {
  const { isOpen, onOpen, onClose } = useDisclosure()
  const location = useLocation()
  const { user, logout } = useAuthStore()

  const handleLogout = () => {
    logout()
    window.location.href = '/login'
  }

  return (
    <Flex h="100vh">
      <Box
        display={{ base: 'none', md: 'block' }}
        w="250px"
        bg="white"
        borderRight="1px"
        borderColor="gray.200"
      >
        <VStack h="full" p={4} spacing={4}>
          <Text fontSize="xl" fontWeight="bold" color="purple.600">
            Bronwyn's Guide
          </Text>
          
          <VStack w="full" spacing={2} flex={1}>
            {navItems.map((item) => (
              <Button
                key={item.path}
                as={RouterLink}
                to={item.path}
                w="full"
                leftIcon={<Icon as={item.icon} />}
                justifyContent="flex-start"
                variant={location.pathname === item.path ? 'solid' : 'ghost'}
                colorScheme={location.pathname === item.path ? 'purple' : 'gray'}
              >
                {item.label}
              </Button>
            ))}
          </VStack>
        </VStack>
      </Box>

      <Flex flex={1} direction="column">
        <Box bg="white" px={4} py={3} borderBottom="1px" borderColor="gray.200">
          <Flex justify="space-between" align="center">
            <IconButton
              display={{ base: 'flex', md: 'none' }}
              onClick={onOpen}
              variant="ghost"
              aria-label="Open menu"
              icon={<FiMenu />}
            />
            
            <Text
              display={{ base: 'block', md: 'none' }}
              fontSize="lg"
              fontWeight="bold"
              color="purple.600"
            >
              Bronwyn's Guide
            </Text>

            <Box flex={1} />

            <Menu>
              <MenuButton>
                <HStack spacing={3}>
                  <Avatar size="sm" name={user ? `${user.firstName} ${user.lastName}` : ''} />
                  <VStack display={{ base: 'none', md: 'flex' }} alignItems="flex-start" spacing={0}>
                    <Text fontSize="sm" fontWeight="medium">
                      {user ? `${user.firstName} ${user.lastName}` : 'User'}
                    </Text>
                    <Text fontSize="xs" color="gray.600">
                      {user?.email}
                    </Text>
                  </VStack>
                </HStack>
              </MenuButton>
              <MenuList>
                <MenuItem as={RouterLink} to="/profile" icon={<FiUser />}>
                  Profile
                </MenuItem>
                <MenuDivider />
                <MenuItem onClick={handleLogout} icon={<FiLogOut />} color="red.500">
                  Logout
                </MenuItem>
              </MenuList>
            </Menu>
          </Flex>
        </Box>

        <Box flex={1} overflow="auto" bg="gray.50">
          <Box minH="calc(100vh - 64px)" p={{ base: 4, md: 6 }} pb={{ base: 20, md: 6 }}>
            <Outlet />
          </Box>
          <Footer />
        </Box>
      </Flex>

      <MobileNav />

      <Drawer isOpen={isOpen} placement="left" onClose={onClose}>
        <DrawerOverlay />
        <DrawerContent>
          <DrawerCloseButton />
          <DrawerHeader>Menu</DrawerHeader>
          <DrawerBody>
            <VStack spacing={2}>
              {navItems.map((item) => (
                <Button
                  key={item.path}
                  as={RouterLink}
                  to={item.path}
                  w="full"
                  leftIcon={<Icon as={item.icon} />}
                  justifyContent="flex-start"
                  variant={location.pathname === item.path ? 'solid' : 'ghost'}
                  colorScheme={location.pathname === item.path ? 'purple' : 'gray'}
                  onClick={onClose}
                >
                  {item.label}
                </Button>
              ))}
            </VStack>
          </DrawerBody>
        </DrawerContent>
      </Drawer>
    </Flex>
  )
}

export default Layout