import { Box, Heading, Text, VStack, Button, HStack } from '../components/ui'
import { FiPlus } from 'react-icons/fi'

function ShoppingLists() {
  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg">Shopping Lists</Heading>
        <Button leftIcon={<FiPlus />} colorScheme="green">
          Generate List
        </Button>
      </HStack>
      <Box>
        <Text color="gray.600">Your shopping lists will appear here...</Text>
      </Box>
    </VStack>
  )
}

export default ShoppingLists