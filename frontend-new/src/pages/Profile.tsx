import { Box, Heading, Text, VStack } from '@chakra-ui/react'
import { useAuthStore } from '../stores/authStore'

function Profile() {
  const user = useAuthStore((state) => state.user)

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg">Profile</Heading>
      <Box>
        <Text>Name: {user?.firstName} {user?.lastName}</Text>
        <Text>Email: {user?.email}</Text>
      </Box>
    </VStack>
  )
}

export default Profile