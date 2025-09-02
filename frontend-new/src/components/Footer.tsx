import {
  Box,
  Container,
  Stack,
  Text,
  Link,
  VStack,
  HStack,
  Divider,
  Icon
} from '@chakra-ui/react'
import { FiMail, FiCode } from 'react-icons/fi'

function Footer() {
  return (
    <Box
      bg="white"
      borderTop="1px"
      borderColor="gray.200"
      mt="auto"
      py={4}
      px={4}
    >
      <Container maxW="container.xl">
        <VStack spacing={3}>
          <Divider />
          
          <Stack
            direction={{ base: 'column', md: 'row' }}
            spacing={4}
            align="center"
            justify="center"
            textAlign="center"
          >
            <HStack spacing={2}>
              <Icon as={FiCode} color="purple.500" />
              <Text fontSize="sm" color="gray.600">
                Developed by{' '}
                <Text as="span" fontWeight="bold" color="purple.600">
                  Zenith Software Engineers
                </Text>
              </Text>
            </HStack>
            
            <Text fontSize="sm" color="gray.500">
              Part of the{' '}
              <Text as="span" fontWeight="semibold">
                Unite-Group Agency
              </Text>
            </Text>
          </Stack>
          
          <HStack spacing={2}>
            <Icon as={FiMail} color="gray.400" boxSize={3} />
            <Link
              href="mailto:zenithfresh25@gmail.com"
              fontSize="sm"
              color="purple.500"
              _hover={{ color: 'purple.600', textDecoration: 'underline' }}
            >
              zenithfresh25@gmail.com
            </Link>
          </HStack>
          
          <Text fontSize="xs" color="gray.400">
            © {new Date().getFullYear()} Bronwyn's Guide. All rights reserved.
          </Text>
        </VStack>
      </Container>
    </Box>
  )
}

export default Footer