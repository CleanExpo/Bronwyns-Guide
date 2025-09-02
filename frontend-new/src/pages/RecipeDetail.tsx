import { useParams } from 'react-router-dom'
import { Box, Heading, Text, VStack } from '../components/ui'

function RecipeDetail() {
  const { id } = useParams()

  return (
    <VStack spacing={6} align="stretch">
      <Heading size="lg">Recipe Details</Heading>
      <Text>Recipe ID: {id}</Text>
      <Box>
        <Text color="gray.600">Recipe detail view coming soon...</Text>
      </Box>
    </VStack>
  )
}

export default RecipeDetail