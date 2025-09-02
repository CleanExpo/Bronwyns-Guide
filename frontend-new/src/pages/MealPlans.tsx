import { Box, Heading, Text, VStack, Button, HStack } from '@chakra-ui/react'
import { FiPlus } from 'react-icons/fi'

function MealPlans() {
  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg">Meal Plans</Heading>
        <Button leftIcon={<FiPlus />} colorScheme="blue">
          Create Meal Plan
        </Button>
      </HStack>
      <Box>
        <Text color="gray.600">Your meal plans will appear here...</Text>
      </Box>
    </VStack>
  )
}

export default MealPlans