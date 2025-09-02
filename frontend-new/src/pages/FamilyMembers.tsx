import { Box, Heading, Text, VStack, Button, HStack } from '@chakra-ui/react'
import { FiPlus } from 'react-icons/fi'

function FamilyMembers() {
  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Heading size="lg">Family Members</Heading>
        <Button leftIcon={<FiPlus />} colorScheme="orange">
          Add Member
        </Button>
      </HStack>
      <Box>
        <Text color="gray.600">Your family members will appear here...</Text>
      </Box>
    </VStack>
  )
}

export default FamilyMembers