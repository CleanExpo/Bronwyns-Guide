import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Icon,
  Image,
  useColorModeValue
} from '../components/ui'
import { 
  FiPlus, 
  FiSearch, 
  FiInbox, 
  FiBook, 
  FiCalendar,
  FiShoppingCart,
  FiUsers,
  FiWifiOff,
  FiAlertCircle
} from 'react-icons/fi'
import { Link as RouterLink } from 'react-router-dom'

interface EmptyStateProps {
  icon?: React.ElementType
  title: string
  description: string
  actionLabel?: string
  onAction?: () => void
  actionLink?: string
  image?: string
}

const EmptyState: React.FC<EmptyStateProps> = ({
  icon: IconComponent = FiInbox,
  title,
  description,
  actionLabel,
  onAction,
  actionLink,
  image
}) => {
  const bgColor = useColorModeValue('gray.50', 'gray.900')
  const textColor = useColorModeValue('gray.600', 'gray.400')
  const iconColor = useColorModeValue('gray.400', 'gray.600')

  return (
    <Box
      p={8}
      bg={bgColor}
      borderRadius="lg"
      textAlign="center"
      minH="300px"
      display="flex"
      alignItems="center"
      justifyContent="center"
    >
      <VStack spacing={4} maxW="md">
        {image ? (
          <Image 
            src={image} 
            alt={title}
            maxW="200px"
            opacity={0.8}
          />
        ) : (
          <Icon 
            as={IconComponent} 
            w={16} 
            h={16} 
            color={iconColor}
          />
        )}
        <Heading size="md">{title}</Heading>
        <Text color={textColor}>{description}</Text>
        {actionLabel && (actionLink || onAction) && (
          actionLink ? (
            <Button
              as={RouterLink}
              to={actionLink}
              colorScheme="purple"
              leftIcon={<FiPlus />}
            >
              {actionLabel}
            </Button>
          ) : (
            <Button
              colorScheme="purple"
              leftIcon={<FiPlus />}
              onClick={onAction}
            >
              {actionLabel}
            </Button>
          )
        )}
      </VStack>
    </Box>
  )
}

export const RecipesEmptyState = ({ onAdd }: { onAdd?: () => void }) => (
  <EmptyState
    icon={FiBook}
    title="No recipes yet"
    description="Start building your personal recipe collection by adding your first recipe."
    actionLabel="Add Recipe"
    actionLink="/recipes/new"
    onAction={onAdd}
  />
)

export const MealPlansEmptyState = () => (
  <EmptyState
    icon={FiCalendar}
    title="No meal plans created"
    description="Plan your meals ahead and stay organized with custom meal plans."
    actionLabel="Create Meal Plan"
    actionLink="/meal-plans/new"
  />
)

export const ShoppingListEmptyState = () => (
  <EmptyState
    icon={FiShoppingCart}
    title="No shopping lists"
    description="Generate shopping lists from your meal plans or create custom lists."
    actionLabel="Create Shopping List"
    actionLink="/shopping-lists/new"
  />
)

export const FamilyMembersEmptyState = () => (
  <EmptyState
    icon={FiUsers}
    title="No family members added"
    description="Add family members to track their dietary preferences and restrictions."
    actionLabel="Add Family Member"
    actionLink="/family-members/new"
  />
)

export const SearchEmptyState = ({ query }: { query: string }) => (
  <EmptyState
    icon={FiSearch}
    title="No results found"
    description={`We couldn't find anything matching "${query}". Try adjusting your search.`}
  />
)

export const OfflineEmptyState = () => (
  <EmptyState
    icon={FiWifiOff}
    title="You're offline"
    description="Check your internet connection to load new content. Cached content is still available."
  />
)

export const ErrorEmptyState = ({ onRetry }: { onRetry: () => void }) => (
  <EmptyState
    icon={FiAlertCircle}
    title="Something went wrong"
    description="We couldn't load the content. Please try again."
    actionLabel="Retry"
    onAction={onRetry}
  />
)

export const GenericEmptyState = ({ 
  title = "No data available",
  description = "There's nothing to show here yet."
}: { 
  title?: string
  description?: string 
}) => (
  <EmptyState
    icon={FiInbox}
    title={title}
    description={description}
  />
)

export default EmptyState