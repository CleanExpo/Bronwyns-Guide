import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  Box,
  VStack,
  Heading,
  Button,
  Textarea,
  useToast,
  Container,
  Text,
  FormControl,
  FormLabel,
  Input,
  IconButton,
  HStack,
  Divider,
  useBreakpointValue,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useDisclosure
} from '../components/ui'
import { FiArrowLeft, FiSave, FiEdit } from 'react-icons/fi'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import axios from 'axios'
import ImageUpload from '../components/ImageUpload'
import SmartImageAnalysis from '../components/SmartImageAnalysis'

function RecipeCapture() {
  const [imageUrl, setImageUrl] = useState<string>('')
  const [recipeText, setRecipeText] = useState('')
  const [recipeTitle, setRecipeTitle] = useState('')
  const [notes, setNotes] = useState('')
  const [ingredients, setIngredients] = useState<any[]>([])
  const [nutritionInfo, setNutritionInfo] = useState<any>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const { isOpen, onOpen, onClose } = useDisclosure()
  
  const navigate = useNavigate()
  const toast = useToast()
  const queryClient = useQueryClient()
  const isMobile = useBreakpointValue({ base: true, md: false })

  const saveRecipeMutation = useMutation({
    mutationFn: async () => {
      // Analyze recipe with AI
      const aiResponse = await axios.post('/api/ai/analyze-recipe', {
        imageUrl: imageUrl || undefined,
        text: recipeText || undefined
      })

      // Save recipe
      const recipeData = {
        originalSource: {
          type: imageUrl ? 'image' : 'text',
          url: imageUrl || undefined,
          originalText: recipeText || undefined
        },
        aiAnalysis: aiResponse.data.analysis,
        processedRecipe: {
          ...aiResponse.data.analysis,
          title: recipeTitle || aiResponse.data.analysis.title,
          ingredients: ingredients.length > 0 ? ingredients : aiResponse.data.analysis.ingredients,
          nutritionInfo: nutritionInfo || aiResponse.data.analysis.nutritionInfo,
          isSafe: true,
          isModified: false
        },
        tags: []
      }

      const response = await axios.post('/api/recipes', recipeData)
      return response.data
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['recipes'] })
      toast({
        title: 'Recipe saved successfully!',
        description: 'Your recipe has been analyzed and saved',
        status: 'success',
        duration: 3000,
        isClosable: true
      })
      navigate('/recipes')
    },
    onError: () => {
      toast({
        title: 'Failed to save recipe',
        description: 'Please try again',
        status: 'error',
        duration: 5000,
        isClosable: true
      })
    }
  })

  const handleSave = () => {
    if (!imageUrl && !recipeText) {
      toast({
        title: 'Please add a recipe',
        description: 'Upload an image or enter recipe text',
        status: 'warning',
        duration: 3000
      })
      return
    }
    saveRecipeMutation.mutate()
  }

  const RecipeForm = () => (
    <VStack spacing={6} align="stretch">
      <FormControl>
        <FormLabel fontSize={{ base: 'sm', md: 'md' }}>
          Recipe Image
        </FormLabel>
        <ImageUpload onImageUploaded={(url) => {
          setImageUrl(url)
          setShowAnalysis(true)
        }} />
        {imageUrl && showAnalysis && (
          <Box mt={4}>
            <SmartImageAnalysis 
              imageUrl={imageUrl}
              onIngredientsIdentified={setIngredients}
              onNutritionAnalyzed={setNutritionInfo}
            />
          </Box>
        )}
      </FormControl>

      <Divider />

      <FormControl>
        <FormLabel fontSize={{ base: 'sm', md: 'md' }}>
          Recipe Title (Optional)
        </FormLabel>
        <Input
          placeholder="Give your recipe a name"
          value={recipeTitle}
          onChange={(e) => setRecipeTitle(e.target.value)}
          size={{ base: 'md', md: 'lg' }}
        />
      </FormControl>

      <FormControl>
        <FormLabel fontSize={{ base: 'sm', md: 'md' }}>
          Recipe Text (Optional)
        </FormLabel>
        <Textarea
          placeholder="Paste recipe text or describe the dish..."
          value={recipeText}
          onChange={(e) => setRecipeText(e.target.value)}
          rows={6}
          size={{ base: 'md', md: 'lg' }}
        />
      </FormControl>

      <FormControl>
        <FormLabel fontSize={{ base: 'sm', md: 'md' }}>
          Notes (Optional)
        </FormLabel>
        <Textarea
          placeholder="Add any personal notes or modifications..."
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={3}
          size={{ base: 'md', md: 'lg' }}
        />
      </FormControl>
    </VStack>
  )

  if (isMobile) {
    return (
      <Box minH="100vh" bg="white">
        {/* Mobile Header */}
        <Box
          position="sticky"
          top={0}
          zIndex={10}
          bg="white"
          borderBottom="1px"
          borderColor="gray.200"
          px={4}
          py={3}
        >
          <HStack justify="space-between">
            <HStack spacing={3}>
              <IconButton
                aria-label="Go back"
                icon={<FiArrowLeft />}
                variant="ghost"
                onClick={() => navigate('/recipes')}
              />
              <Heading size="md">Add Recipe</Heading>
            </HStack>
            <Button
              colorScheme="purple"
              size="sm"
              onClick={handleSave}
              isLoading={saveRecipeMutation.isPending}
              leftIcon={<FiSave />}
            >
              Save
            </Button>
          </HStack>
        </Box>

        {/* Mobile Content */}
        <Box p={4}>
          <RecipeForm />
        </Box>

        {/* Mobile Bottom Action Bar */}
        <Box
          position="fixed"
          bottom={0}
          left={0}
          right={0}
          bg="white"
          borderTop="1px"
          borderColor="gray.200"
          p={4}
          display={{ base: 'block', md: 'none' }}
        >
          <Button
            colorScheme="purple"
            size="lg"
            w="full"
            onClick={handleSave}
            isLoading={saveRecipeMutation.isPending}
            leftIcon={<FiSave />}
          >
            Save Recipe
          </Button>
        </Box>
      </Box>
    )
  }

  // Desktop Layout
  return (
    <Container maxW="container.md" py={8}>
      <VStack spacing={8} align="stretch">
        <HStack justify="space-between">
          <HStack spacing={4}>
            <IconButton
              aria-label="Go back"
              icon={<FiArrowLeft />}
              variant="ghost"
              onClick={() => navigate('/recipes')}
            />
            <Heading size="lg">Add New Recipe</Heading>
          </HStack>
        </HStack>

        <Box bg="white" p={8} borderRadius="lg" boxShadow="sm">
          <RecipeForm />
          
          <HStack justify="flex-end" mt={8} spacing={4}>
            <Button variant="outline" onClick={() => navigate('/recipes')}>
              Cancel
            </Button>
            <Button
              colorScheme="purple"
              onClick={handleSave}
              isLoading={saveRecipeMutation.isPending}
              leftIcon={<FiSave />}
            >
              Save Recipe
            </Button>
          </HStack>
        </Box>
      </VStack>
    </Container>
  )
}

export default RecipeCapture