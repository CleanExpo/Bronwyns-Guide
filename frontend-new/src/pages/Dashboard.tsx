import {
  Box,
  Grid,
  GridItem,
  Heading,
  Text,
  VStack,
  HStack,
  Stat,
  StatLabel,
  StatNumber,
  StatHelpText,
  Card,
  CardBody,
  CardHeader,
  Icon,
  Button,
  useColorModeValue
} from '../components/ui'
import { FiBook, FiCalendar, FiShoppingCart, FiUsers, FiPlus } from 'react-icons/fi'
import { Link as RouterLink } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import axios from 'axios'
import { useAuthStore } from '../stores/authStore'

function Dashboard() {
  const user = useAuthStore((state) => state.user)
  const cardBg = useColorModeValue('white', 'gray.800')

  const { data: stats } = useQuery({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const [recipes, mealPlans, shoppingLists, familyMembers] = await Promise.all([
        axios.get('/api/recipes?limit=1'),
        axios.get('/api/meal-plans'),
        axios.get('/api/shopping-lists'),
        axios.get('/api/users/family-members')
      ])
      
      return {
        recipes: recipes.data.pagination?.total || 0,
        mealPlans: mealPlans.data.length || 0,
        shoppingLists: shoppingLists.data.length || 0,
        familyMembers: familyMembers.data.length || 0
      }
    }
  })

  const statCards = [
    {
      label: 'Saved Recipes',
      value: stats?.recipes || 0,
      icon: FiBook,
      color: 'purple',
      link: '/recipes'
    },
    {
      label: 'Meal Plans',
      value: stats?.mealPlans || 0,
      icon: FiCalendar,
      color: 'blue',
      link: '/meal-plans'
    },
    {
      label: 'Shopping Lists',
      value: stats?.shoppingLists || 0,
      icon: FiShoppingCart,
      color: 'green',
      link: '/shopping-lists'
    },
    {
      label: 'Family Members',
      value: stats?.familyMembers || 0,
      icon: FiUsers,
      color: 'orange',
      link: '/family-members'
    }
  ]

  return (
    <VStack spacing={6} align="stretch">
      <Box>
        <Heading size="lg" mb={2}>
          Welcome back, {user?.firstName}!
        </Heading>
        <Text color="gray.600">
          Here's an overview of your dietary management dashboard
        </Text>
      </Box>

      <Grid templateColumns={{ base: '1fr', md: 'repeat(2, 1fr)', lg: 'repeat(4, 1fr)' }} gap={6}>
        {statCards.map((stat) => (
          <GridItem key={stat.label}>
            <Card bg={cardBg} shadow="sm" _hover={{ shadow: 'md' }} transition="all 0.2s">
              <CardBody>
                <HStack justify="space-between">
                  <Stat>
                    <StatLabel color="gray.500">{stat.label}</StatLabel>
                    <StatNumber fontSize="2xl">{stat.value}</StatNumber>
                    <StatHelpText>
                      <Button
                        as={RouterLink}
                        to={stat.link}
                        size="sm"
                        variant="link"
                        colorScheme={stat.color}
                      >
                        View all
                      </Button>
                    </StatHelpText>
                  </Stat>
                  <Box
                    p={3}
                    bg={`${stat.color}.100`}
                    borderRadius="lg"
                  >
                    <Icon as={stat.icon} boxSize={6} color={`${stat.color}.600`} />
                  </Box>
                </HStack>
              </CardBody>
            </Card>
          </GridItem>
        ))}
      </Grid>

      <Grid templateColumns={{ base: '1fr', lg: 'repeat(2, 1fr)' }} gap={6}>
        <GridItem>
          <Card bg={cardBg}>
            <CardHeader>
              <HStack justify="space-between">
                <Heading size="md">Quick Actions</Heading>
              </HStack>
            </CardHeader>
            <CardBody>
              <VStack spacing={3}>
                <Button
                  as={RouterLink}
                  to="/recipes"
                  leftIcon={<FiPlus />}
                  colorScheme="purple"
                  variant="outline"
                  w="full"
                  justifyContent="flex-start"
                >
                  Add New Recipe
                </Button>
                <Button
                  as={RouterLink}
                  to="/meal-plans"
                  leftIcon={<FiPlus />}
                  colorScheme="blue"
                  variant="outline"
                  w="full"
                  justifyContent="flex-start"
                >
                  Create Meal Plan
                </Button>
                <Button
                  as={RouterLink}
                  to="/family-members"
                  leftIcon={<FiPlus />}
                  colorScheme="orange"
                  variant="outline"
                  w="full"
                  justifyContent="flex-start"
                >
                  Add Family Member
                </Button>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>

        <GridItem>
          <Card bg={cardBg}>
            <CardHeader>
              <Heading size="md">Recent Activity</Heading>
            </CardHeader>
            <CardBody>
              <VStack align="stretch" spacing={3}>
                <Text fontSize="sm" color="gray.600">
                  No recent activity to display
                </Text>
              </VStack>
            </CardBody>
          </Card>
        </GridItem>
      </Grid>
    </VStack>
  )
}

export default Dashboard