import React, { useState } from 'react'
import {
  Box,
  VStack,
  HStack,
  Text,
  Button,
  Image,
  Input,
  useToast,
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Spinner,
  Badge,
  Wrap,
  WrapItem,
  Card,
  CardBody,
  CardHeader,
  Heading,
  List,
  ListItem,
  ListIcon,
  IconButton,
  Tabs,
  TabList,
  TabPanels,
  Tab,
  TabPanel,
  Progress,
  Alert,
  AlertIcon,
  useDisclosure,
  Divider,
  SimpleGrid,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Tooltip
} from '../components/ui'
import { 
  FiCamera, 
  FiUpload, 
  FiX, 
  FiSearch,
  FiShoppingCart,
  FiBook,
  FiInfo,
  FiCheckCircle,
  FiAlertCircle,
  FiPlus,
  FiHeart
} from 'react-icons/fi'
import axios from 'axios'

interface SmartImageAnalysisProps {
  onRecipeExtracted?: (recipe: any) => void
  onIngredientsIdentified?: (ingredients: string[]) => void
  dietaryRestrictions?: string[]
}

export const SmartImageAnalysis: React.FC<SmartImageAnalysisProps> = ({
  onRecipeExtracted,
  onIngredientsIdentified,
  dietaryRestrictions = []
}) => {
  const [selectedImage, setSelectedImage] = useState<File | null>(null)
  const [imagePreview, setImagePreview] = useState<string>('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [analysisResults, setAnalysisResults] = useState<any>(null)
  const { isOpen, onOpen, onClose } = useDisclosure()
  const toast = useToast()

  const handleImageSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedImage(file)
      const reader = new FileReader()
      reader.onloadend = () => {
        setImagePreview(reader.result as string)
        onOpen()
      }
      reader.readAsDataURL(file)
    }
  }

  const analyzeImage = async () => {
    if (!selectedImage) return

    setIsAnalyzing(true)
    const formData = new FormData()
    formData.append('image', selectedImage)
    formData.append('dietary_restrictions', JSON.stringify(dietaryRestrictions))

    try {
      const response = await axios.post('/api/image/analyze', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      setAnalysisResults(response.data)
      
      // Notify parent components
      if (response.data.ingredients?.ingredients && onIngredientsIdentified) {
        onIngredientsIdentified(response.data.ingredients.ingredients)
      }

      toast({
        title: 'Image analyzed successfully!',
        description: `Found ${response.data.ingredients?.ingredients?.length || 0} ingredients`,
        status: 'success',
        duration: 3000
      })
    } catch (error: any) {
      console.error('Analysis error:', error)
      toast({
        title: 'Analysis failed',
        description: error.response?.data?.message || 'Could not analyze image',
        status: 'error',
        duration: 5000
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const extractRecipe = async () => {
    if (!selectedImage) return

    setIsAnalyzing(true)
    const formData = new FormData()
    formData.append('image', selectedImage)

    try {
      const response = await axios.post('/api/image/extract-recipe', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })

      if (response.data.recipe && onRecipeExtracted) {
        onRecipeExtracted(response.data.recipe)
      }

      toast({
        title: 'Recipe extracted!',
        description: response.data.recipe?.title || 'Recipe successfully extracted from image',
        status: 'success',
        duration: 3000
      })

      onClose()
    } catch (error: any) {
      console.error('Extraction error:', error)
      toast({
        title: 'Extraction failed',
        description: error.response?.data?.message || 'Could not extract recipe',
        status: 'error',
        duration: 5000
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const saveRecipeSuggestion = async (recipe: any) => {
    try {
      const recipeData = {
        originalSource: { type: 'ai_suggestion', data: recipe },
        processedRecipe: {
          title: recipe.title,
          description: recipe.description,
          ingredients: analysisResults?.ingredients?.ingredients || [],
          instructions: [recipe.instructions_summary],
          prepTime: recipe.time,
          difficulty: recipe.difficulty,
          healthScore: recipe.health_score,
          suitableFor: recipe.suitable_for
        },
        tags: [...recipe.suitable_for, recipe.difficulty],
        aiAnalysis: {
          generatedFrom: 'image_analysis',
          timestamp: new Date().toISOString()
        }
      }

      await axios.post('/api/recipes', recipeData)
      
      toast({
        title: 'Recipe saved!',
        description: `${recipe.title} has been added to your collection`,
        status: 'success',
        duration: 3000
      })
    } catch (error) {
      toast({
        title: 'Failed to save recipe',
        status: 'error',
        duration: 3000
      })
    }
  }

  return (
    <>
      <VStack spacing={4} align="stretch">
        <Card>
          <CardHeader>
            <Heading size="md">Smart Food Recognition</Heading>
            <Text fontSize="sm" color="gray.600" mt={2}>
              Take a photo of ingredients or recipes to get instant analysis
            </Text>
          </CardHeader>
          <CardBody>
            <VStack spacing={4}>
              <HStack spacing={4} width="full">
                <Input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  onChange={handleImageSelect}
                  display="none"
                  id="smart-camera-input"
                />
                <Button
                  as="label"
                  htmlFor="smart-camera-input"
                  leftIcon={<FiCamera />}
                  colorScheme="purple"
                  size="lg"
                  flex={1}
                >
                  Take Photo
                </Button>
                <Button
                  as="label"
                  htmlFor="smart-camera-input"
                  leftIcon={<FiUpload />}
                  variant="outline"
                  size="lg"
                  flex={1}
                >
                  Upload Image
                </Button>
              </HStack>

              <Alert status="info" borderRadius="md">
                <AlertIcon />
                <Box>
                  <Text fontWeight="bold">AI-Powered Features:</Text>
                  <List spacing={1} mt={2}>
                    <ListItem fontSize="sm">• Identify ingredients in photos</ListItem>
                    <ListItem fontSize="sm">• Extract recipes from recipe cards</ListItem>
                    <ListItem fontSize="sm">• Get recipe suggestions based on what you have</ListItem>
                    <ListItem fontSize="sm">• Nutritional analysis of dishes</ListItem>
                  </List>
                </Box>
              </Alert>
            </VStack>
          </CardBody>
        </Card>
      </VStack>

      <Modal isOpen={isOpen} onClose={onClose} size="xl">
        <ModalOverlay />
        <ModalContent maxW="90vw" maxH="90vh">
          <ModalHeader>Image Analysis</ModalHeader>
          <ModalCloseButton />
          <ModalBody overflowY="auto">
            {imagePreview && (
              <Box mb={4}>
                <Image 
                  src={imagePreview} 
                  alt="Selected image"
                  maxH="300px"
                  mx="auto"
                  borderRadius="md"
                />
              </Box>
            )}

            {!isAnalyzing && !analysisResults && (
              <VStack spacing={4}>
                <Text textAlign="center">What would you like to do with this image?</Text>
                <SimpleGrid columns={{ base: 1, md: 2 }} spacing={4} w="full">
                  <Button
                    leftIcon={<FiSearch />}
                    onClick={analyzeImage}
                    colorScheme="purple"
                    size="lg"
                  >
                    Identify Ingredients
                  </Button>
                  <Button
                    leftIcon={<FiBook />}
                    onClick={extractRecipe}
                    variant="outline"
                    size="lg"
                  >
                    Extract Recipe
                  </Button>
                </SimpleGrid>
              </VStack>
            )}

            {isAnalyzing && (
              <VStack spacing={4} py={8}>
                <Spinner size="xl" color="purple.500" />
                <Text>Analyzing image with AI...</Text>
                <Progress size="xs" isIndeterminate colorScheme="purple" w="full" />
              </VStack>
            )}

            {analysisResults && (
              <Tabs colorScheme="purple">
                <TabList>
                  <Tab>Ingredients</Tab>
                  <Tab>Recipe Suggestions</Tab>
                  <Tab>Analysis</Tab>
                </TabList>

                <TabPanels>
                  <TabPanel>
                    <VStack align="stretch" spacing={4}>
                      <Heading size="sm">Identified Ingredients:</Heading>
                      <Wrap>
                        {analysisResults.ingredients?.ingredients?.map((ingredient: string, idx: number) => (
                          <WrapItem key={idx}>
                            <Badge colorScheme="green" px={3} py={1} borderRadius="full">
                              {ingredient}
                            </Badge>
                          </WrapItem>
                        ))}
                      </Wrap>
                      
                      {analysisResults.ingredients?.quantities && (
                        <>
                          <Divider />
                          <Heading size="sm">Estimated Quantities:</Heading>
                          <List spacing={2}>
                            {Object.entries(analysisResults.ingredients.quantities).map(([item, qty]) => (
                              <ListItem key={item}>
                                <ListIcon as={FiCheckCircle} color="green.500" />
                                {item}: {qty as string}
                              </ListItem>
                            ))}
                          </List>
                        </>
                      )}

                      <Alert status="info" mt={4}>
                        <AlertIcon />
                        <Box>
                          <Text fontWeight="bold">Freshness: </Text>
                          <Text>{analysisResults.ingredients?.freshness || 'Good condition'}</Text>
                        </Box>
                      </Alert>
                    </VStack>
                  </TabPanel>

                  <TabPanel>
                    <VStack align="stretch" spacing={4}>
                      {analysisResults.recipeSuggestions?.recipes?.map((recipe: any, idx: number) => (
                        <Card key={idx} variant="outline">
                          <CardBody>
                            <HStack justify="space-between" mb={2}>
                              <Heading size="sm">{recipe.title}</Heading>
                              <HStack>
                                <Badge colorScheme={
                                  recipe.difficulty === 'easy' ? 'green' : 
                                  recipe.difficulty === 'medium' ? 'yellow' : 'red'
                                }>
                                  {recipe.difficulty}
                                </Badge>
                                <Badge colorScheme="purple">
                                  {recipe.time} min
                                </Badge>
                              </HStack>
                            </HStack>
                            
                            <Text fontSize="sm" color="gray.600" mb={3}>
                              {recipe.description}
                            </Text>

                            <Stat size="sm" mb={3}>
                              <StatLabel>Health Score</StatLabel>
                              <StatNumber>{recipe.health_score}/10</StatNumber>
                              <StatHelpText>
                                {recipe.suitable_for?.join(', ')}
                              </StatHelpText>
                            </Stat>

                            <Text fontSize="sm" fontStyle="italic" mb={3}>
                              {recipe.instructions_summary}
                            </Text>

                            <HStack>
                              <Button
                                size="sm"
                                colorScheme="purple"
                                leftIcon={<FiPlus />}
                                onClick={() => saveRecipeSuggestion(recipe)}
                              >
                                Save Recipe
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                leftIcon={<FiHeart />}
                              >
                                Favorite
                              </Button>
                            </HStack>
                          </CardBody>
                        </Card>
                      ))}
                    </VStack>
                  </TabPanel>

                  <TabPanel>
                    <VStack align="stretch" spacing={4}>
                      <Alert status="success">
                        <AlertIcon />
                        <Box>
                          <Text fontWeight="bold">AI Analysis Complete</Text>
                          <Text fontSize="sm" mt={1}>
                            {analysisResults.analysis?.raw_analysis || 
                             'Successfully analyzed image and identified food items'}
                          </Text>
                        </Box>
                      </Alert>
                      
                      {analysisResults.analysis?.potential_dish && (
                        <Box>
                          <Heading size="sm" mb={2}>Potential Dish:</Heading>
                          <Text>{analysisResults.analysis.potential_dish}</Text>
                        </Box>
                      )}
                    </VStack>
                  </TabPanel>
                </TabPanels>
              </Tabs>
            )}
          </ModalBody>

          <ModalFooter>
            <Button variant="ghost" mr={3} onClick={onClose}>
              Close
            </Button>
            {analysisResults && (
              <Button
                colorScheme="purple"
                onClick={() => {
                  setAnalysisResults(null)
                  setSelectedImage(null)
                  setImagePreview('')
                }}
                leftIcon={<FiCamera />}
              >
                Analyze Another
              </Button>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>
    </>
  )
}

export default SmartImageAnalysis