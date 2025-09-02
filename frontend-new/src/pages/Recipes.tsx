import { useState } from 'react'
import {
  Box,
  Button,
  Grid,
  Heading,
  HStack,
  Input,
  InputGroup,
  InputLeftElement,
  Card,
  CardBody,
  CardHeader,
  Image,
  Text,
  Badge,
  VStack,
  useDisclosure,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalCloseButton,
  FormControl,
  FormLabel,
  Textarea,
  useToast
} from '@chakra-ui/react'
import { FiSearch, FiPlus, FiHeart, FiClock } from 'react-icons/fi'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Link as RouterLink } from 'react-router-dom'
import axios from 'axios'

function Recipes() {
  const [search, setSearch] = useState('')
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()
  const queryClient = useQueryClient()

  const { data: recipesData, isLoading } = useQuery({
    queryKey: ['recipes', search],
    queryFn: async () => {
      const params = new URLSearchParams()
      if (search) params.append('search', search)
      const response = await axios.get(`/api/recipes?${params}`)
      return response.data
    }
  })

  const toggleFavoriteMutation = useMutation({
    mutationFn: async ({ recipeId, isFavorite }: { recipeId: string; isFavorite: boolean }) => {
      const response = await axios.put(`/api/recipes/${recipeId}`, { isFavorite })
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      toast({
        title: 'Recipe updated',
        status: 'success',
        duration: 2000
      })
    }
  })

  const recipes = recipesData?.recipes || []

  return (
    <VStack spacing={6} align="stretch">
      <HStack justify="space-between">
        <Heading size={{ base: 'md', md: 'lg' }}>My Recipes</Heading>
        <Button 
          as={RouterLink}
          to="/recipes/new"
          leftIcon={<FiPlus />} 
          colorScheme="purple"
          size={{ base: 'sm', md: 'md' }}
        >
          Add Recipe
        </Button>
      </HStack>

      <InputGroup>
        <InputLeftElement pointerEvents="none">
          <FiSearch color="gray.300" />
        </InputLeftElement>
        <Input
          placeholder="Search recipes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </InputGroup>

      {isLoading ? (
        <Text>Loading recipes...</Text>
      ) : recipes.length === 0 ? (
        <Card>
          <CardBody>
            <VStack spacing={4} py={8}>
              <Text color="gray.500">No recipes found</Text>
              <Button colorScheme="purple" onClick={onOpen}>
                Add Your First Recipe
              </Button>
            </VStack>
          </CardBody>
        </Card>
      ) : (
        <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
          {recipes.map((recipe: any) => (
            <Card
              key={recipe.recipeId}
              as={RouterLink}
              to={`/recipes/${recipe.recipeId}`}
              _hover={{ shadow: 'lg' }}
              transition="all 0.2s"
            >
              {recipe.processedRecipe.image && (
                <Image
                  src={recipe.processedRecipe.image}
                  alt={recipe.processedRecipe.title}
                  h="200px"
                  objectFit="cover"
                />
              )}
              <CardHeader pb={2}>
                <HStack justify="space-between">
                  <Heading size="md">{recipe.processedRecipe.title}</Heading>
                  <Button
                    size="sm"
                    variant="ghost"
                    colorScheme={recipe.isFavorite ? 'red' : 'gray'}
                    onClick={(e) => {
                      e.preventDefault()
                      toggleFavoriteMutation.mutate({
                        recipeId: recipe.recipeId,
                        isFavorite: !recipe.isFavorite
                      })
                    }}
                  >
                    <FiHeart fill={recipe.isFavorite ? 'currentColor' : 'none'} />
                  </Button>
                </HStack>
              </CardHeader>
              <CardBody pt={2}>
                <VStack align="stretch" spacing={2}>
                  <Text noOfLines={2} color="gray.600">
                    {recipe.processedRecipe.description}
                  </Text>
                  <HStack spacing={4} fontSize="sm" color="gray.500">
                    {recipe.processedRecipe.prepTime && (
                      <HStack spacing={1}>
                        <FiClock />
                        <Text>{recipe.processedRecipe.prepTime}</Text>
                      </HStack>
                    )}
                    {recipe.processedRecipe.yield && (
                      <Text>Serves {recipe.processedRecipe.yield}</Text>
                    )}
                  </HStack>
                  <HStack spacing={2}>
                    {recipe.processedRecipe.isSafe ? (
                      <Badge colorScheme="green">Safe</Badge>
                    ) : (
                      <Badge colorScheme="red">Contains Restrictions</Badge>
                    )}
                    {recipe.processedRecipe.isModified && (
                      <Badge colorScheme="blue">Modified</Badge>
                    )}
                  </HStack>
                </VStack>
              </CardBody>
            </Card>
          ))}
        </Grid>
      )}

      <AddRecipeModal isOpen={isOpen} onClose={onClose} />
    </VStack>
  )
}

function AddRecipeModal({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const [recipeText, setRecipeText] = useState('')
  const [imageUrl, setImageUrl] = useState('')
  const toast = useToast()
  const queryClient = useQueryClient()

  const addRecipeMutation = useMutation({
    mutationFn: async () => {
      const aiResponse = await axios.post('/api/ai/analyze-recipe', {
        text: recipeText,
        imageUrl: imageUrl || undefined
      })

      const recipeData = {
        originalSource: {
          type: imageUrl ? 'image' : 'text',
          url: imageUrl || undefined,
          originalText: recipeText || undefined
        },
        aiAnalysis: aiResponse.data.analysis,
        processedRecipe: {
          ...aiResponse.data.analysis,
          isSafe: true,
          isModified: false
        }
      }

      const response = await axios.post('/api/recipes', recipeData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      toast({
        title: 'Recipe added successfully',
        status: 'success',
        duration: 3000
      })
      onClose()
      setRecipeText('')
      setImageUrl('')
    },
    onError: () => {
      toast({
        title: 'Failed to add recipe',
        status: 'error',
        duration: 3000
      })
    }
  })

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Add New Recipe</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <VStack spacing={4}>
            <FormControl>
              <FormLabel>Recipe Image URL (optional)</FormLabel>
              <Input
                placeholder="https://example.com/recipe-image.jpg"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            </FormControl>

            <FormControl>
              <FormLabel>Recipe Text</FormLabel>
              <Textarea
                placeholder="Paste your recipe here or describe it..."
                rows={8}
                value={recipeText}
                onChange={(e) => setRecipeText(e.target.value)}
              />
            </FormControl>

            <HStack w="full" justify="flex-end">
              <Button variant="ghost" onClick={onClose}>
                Cancel
              </Button>
              <Button
                colorScheme="purple"
                onClick={() => addRecipeMutation.mutate()}
                isLoading={addRecipeMutation.isPending}
                isDisabled={!recipeText && !imageUrl}
              >
                Analyze & Save
              </Button>
            </HStack>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  )
}

export default Recipes