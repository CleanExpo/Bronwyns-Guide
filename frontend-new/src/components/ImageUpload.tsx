import { useCallback, useState } from 'react'
import { useDropzone } from 'react-dropzone'
import {
  Box,
  VStack,
  Text,
  Image,
  Button,
  Icon,
  useToast,
  Spinner,
  IconButton,
  HStack,
  Input
} from '../components/ui'
import { FiCamera, FiUpload, FiX, FiImage } from 'react-icons/fi'
import axios from 'axios'

interface ImageUploadProps {
  onImageUploaded: (url: string) => void
  maxSize?: number
}

function ImageUpload({ onImageUploaded, maxSize = 10 * 1024 * 1024 }: ImageUploadProps) {
  const [uploadedImage, setUploadedImage] = useState<string | null>(null)
  const [isUploading, setIsUploading] = useState(false)
  const [preview, setPreview] = useState<string | null>(null)
  const toast = useToast()

  const uploadImage = async (file: File) => {
    setIsUploading(true)
    const formData = new FormData()
    formData.append('image', file)

    try {
      const response = await axios.post('/api/recipes/upload-image', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      })
      
      const imageUrl = response.data.imageUrl
      setUploadedImage(imageUrl)
      onImageUploaded(imageUrl)
      
      toast({
        title: 'Image uploaded successfully',
        status: 'success',
        duration: 3000
      })
    } catch (error: any) {
      console.error('Upload error:', error);
      const errorMessage = error.response?.data?.error || error.message || 'Unknown error occurred';
      toast({
        title: 'Failed to upload image',
        description: errorMessage,
        status: 'error',
        duration: 5000
      })
    } finally {
      setIsUploading(false)
    }
  }

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    const file = acceptedFiles[0]
    if (file) {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      
      // Upload file
      await uploadImage(file)
    }
  }, [])

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.webp', '.heic', '.heif']
    },
    maxSize,
    multiple: false
  })

  const handleCameraCapture = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setPreview(reader.result as string)
      }
      reader.readAsDataURL(file)
      
      // Upload file
      uploadImage(file)
    }
  }

  const clearImage = () => {
    setUploadedImage(null)
    setPreview(null)
  }

  if (preview || uploadedImage) {
    return (
      <Box position="relative" w="full">
        <Image
          src={preview || uploadedImage || ''}
          alt="Recipe"
          borderRadius="lg"
          w="full"
          h={{ base: '250px', md: '400px' }}
          objectFit="cover"
        />
        <IconButton
          aria-label="Remove image"
          icon={<FiX />}
          position="absolute"
          top={2}
          right={2}
          colorScheme="red"
          onClick={clearImage}
          size="sm"
        />
        {isUploading && (
          <Box
            position="absolute"
            top="50%"
            left="50%"
            transform="translate(-50%, -50%)"
            bg="blackAlpha.700"
            p={4}
            borderRadius="md"
          >
            <Spinner size="xl" color="white" />
          </Box>
        )}
      </Box>
    )
  }

  return (
    <VStack spacing={4} w="full">
      <Box
        {...getRootProps()}
        w="full"
        p={{ base: 6, md: 8 }}
        border="2px dashed"
        borderColor={isDragActive ? 'purple.400' : 'gray.300'}
        borderRadius="lg"
        bg={isDragActive ? 'purple.50' : 'gray.50'}
        cursor="pointer"
        transition="all 0.2s"
        _hover={{ borderColor: 'purple.400', bg: 'purple.50' }}
      >
        <input {...getInputProps()} />
        <VStack spacing={3}>
          <Icon as={FiImage} boxSize={{ base: 10, md: 12 }} color="gray.400" />
          {isDragActive ? (
            <Text fontSize={{ base: 'sm', md: 'md' }} color="purple.600" fontWeight="medium">
              Drop the image here
            </Text>
          ) : (
            <>
              <Text fontSize={{ base: 'sm', md: 'md' }} color="gray.600" textAlign="center">
                Drag & drop an image here, or click to select
              </Text>
              <Text fontSize={{ base: 'xs', md: 'sm' }} color="gray.500">
                Maximum file size: 10MB
              </Text>
            </>
          )}
        </VStack>
      </Box>

      <HStack spacing={4} w="full" display={{ base: 'flex', md: 'none' }}>
        <Box flex={1}>
          <Input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraCapture}
            display="none"
            id="camera-input"
          />
          <Button
            as="label"
            htmlFor="camera-input"
            leftIcon={<FiCamera />}
            colorScheme="purple"
            variant="outline"
            w="full"
            size={{ base: 'md', md: 'lg' }}
          >
            Take Photo
          </Button>
        </Box>
        
        <Box flex={1}>
          <Input
            type="file"
            accept="image/*"
            onChange={handleCameraCapture}
            display="none"
            id="gallery-input"
          />
          <Button
            as="label"
            htmlFor="gallery-input"
            leftIcon={<FiUpload />}
            colorScheme="purple"
            variant="outline"
            w="full"
            size={{ base: 'md', md: 'lg' }}
          >
            From Gallery
          </Button>
        </Box>
      </HStack>

      {isUploading && (
        <HStack spacing={2}>
          <Spinner size="sm" color="purple.500" />
          <Text fontSize="sm" color="gray.600">Uploading image...</Text>
        </HStack>
      )}
    </VStack>
  )
}

export default ImageUpload