import React, { useCallback, useState } from 'react'
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
      <Box position="relative" w="full" className="image-upload-container">
        <Image
          src={preview || uploadedImage || ''}
          alt="Recipe"
          className="image-preview"
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
        className={`dropzone ${isDragActive ? 'active' : ''}`}
        w="full"
      >
        <input {...getInputProps()} />
        <VStack spacing={3}>
          <Icon as={FiImage} className="dropzone-icon" />
          {isDragActive ? (
            <Text className="dropzone-text" style={{ color: '#0891b2', fontWeight: '600' }}>
              Drop the image here
            </Text>
          ) : (
            <>
              <Text className="dropzone-text">
                Drag & drop an image here, or click to select
              </Text>
              <Text className="dropzone-text" style={{ fontSize: '0.75rem', opacity: 0.8 }}>
                Maximum file size: 10MB
              </Text>
            </>
          )}
        </VStack>
      </Box>

      <div className="mobile-upload-buttons" style={{ display: window.innerWidth <= 768 ? 'flex' : 'none' }}>
        <div style={{ flex: 1 }}>
          <input
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCameraCapture}
            style={{ display: 'none' }}
            id="camera-input"
          />
          <label
            htmlFor="camera-input"
            className="mobile-upload-button"
          >
            <FiCamera style={{ fontSize: '1.2rem' }} />
            Take Photo
          </label>
        </div>
        
        <div style={{ flex: 1 }}>
          <input
            type="file"
            accept="image/*"
            onChange={handleCameraCapture}
            style={{ display: 'none' }}
            id="gallery-input"
          />
          <label
            htmlFor="gallery-input"
            className="mobile-upload-button"
          >
            <FiUpload style={{ fontSize: '1.2rem' }} />
            From Gallery
          </label>
        </div>
      </div>

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