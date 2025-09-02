import {
  Skeleton,
  SkeletonText,
  SkeletonCircle,
  Box,
  VStack,
  HStack,
  Grid,
  Card,
  CardBody,
  Spinner,
  Center,
  Text
} from '@chakra-ui/react'

export const RecipeCardSkeleton = () => (
  <Card>
    <Skeleton height="200px" />
    <CardBody>
      <SkeletonText mt="4" noOfLines={2} spacing="4" />
      <HStack mt={4} spacing={2}>
        <Skeleton height="20px" width="60px" />
        <Skeleton height="20px" width="60px" />
        <Skeleton height="20px" width="60px" />
      </HStack>
    </CardBody>
  </Card>
)

export const RecipeListSkeleton = () => (
  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(3, 1fr)' }} gap={6}>
    {[...Array(6)].map((_, i) => (
      <RecipeCardSkeleton key={i} />
    ))}
  </Grid>
)

export const ProfileSkeleton = () => (
  <VStack spacing={4} align="stretch">
    <HStack spacing={4}>
      <SkeletonCircle size="20" />
      <VStack align="start" flex={1}>
        <Skeleton height="30px" width="200px" />
        <Skeleton height="20px" width="150px" />
      </VStack>
    </HStack>
    <Box>
      <SkeletonText mt="4" noOfLines={4} spacing="4" />
    </Box>
  </VStack>
)

export const ListItemSkeleton = () => (
  <HStack p={4} borderWidth={1} borderRadius="md" spacing={4}>
    <Skeleton height="40px" width="40px" />
    <VStack align="start" flex={1}>
      <Skeleton height="20px" width="60%" />
      <Skeleton height="16px" width="40%" />
    </VStack>
  </HStack>
)

export const TableSkeleton = ({ rows = 5 }: { rows?: number }) => (
  <VStack spacing={2} align="stretch">
    <HStack p={3} bg="gray.100" borderRadius="md">
      <Skeleton height="20px" width="30%" />
      <Skeleton height="20px" width="30%" />
      <Skeleton height="20px" width="20%" />
      <Skeleton height="20px" width="20%" />
    </HStack>
    {[...Array(rows)].map((_, i) => (
      <HStack key={i} p={3} borderWidth={1} borderRadius="md">
        <Skeleton height="16px" width="30%" />
        <Skeleton height="16px" width="30%" />
        <Skeleton height="16px" width="20%" />
        <Skeleton height="16px" width="20%" />
      </HStack>
    ))}
  </VStack>
)

export const FormSkeleton = () => (
  <VStack spacing={4} align="stretch">
    {[...Array(4)].map((_, i) => (
      <Box key={i}>
        <Skeleton height="20px" width="100px" mb={2} />
        <Skeleton height="40px" />
      </Box>
    ))}
    <Skeleton height="40px" width="120px" alignSelf="flex-end" />
  </VStack>
)

export const DashboardStatsSkeleton = () => (
  <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={4}>
    {[...Array(4)].map((_, i) => (
      <Card key={i}>
        <CardBody>
          <HStack justify="space-between">
            <VStack align="start">
              <Skeleton height="16px" width="80px" />
              <Skeleton height="32px" width="60px" />
              <Skeleton height="14px" width="100px" />
            </VStack>
            <SkeletonCircle size="12" />
          </HStack>
        </CardBody>
      </Card>
    ))}
  </Grid>
)

export const LoadingSpinner = ({ text = 'Loading...' }: { text?: string }) => (
  <Center minH="200px">
    <VStack>
      <Spinner size="xl" color="purple.500" thickness="4px" />
      <Text color="gray.600" mt={2}>{text}</Text>
    </VStack>
  </Center>
)

export const PageLoadingSkeleton = () => (
  <VStack spacing={6} align="stretch" p={4}>
    <Skeleton height="40px" width="200px" />
    <SkeletonText noOfLines={2} spacing="4" />
    <RecipeListSkeleton />
  </VStack>
)