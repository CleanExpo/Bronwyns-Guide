import React, { useState, useEffect } from 'react';
import {
  Box,
  VStack,
  HStack,
  Text,
  Badge,
  Button,
  Alert,
  AlertIcon,
  Divider,
  useToast,
  Collapse,
  useDisclosure,
  Icon,
  Spinner,
  Card,
  CardBody,
  CardHeader,
  Heading,
  List,
  ListItem,
  ListIcon
} from './ui';
import {
  FiAlertTriangle,
  FiCheckCircle,
  FiXCircle,
  FiRefreshCw,
  FiChevronDown,
  FiChevronUp,
  FiShield,
  FiAlertCircle
} from 'react-icons/fi';
import axios from 'axios';

interface HealthAdaptedRecipeProps {
  recipe: any;
  healthProfile: any;
  onIngredientSubstitute?: (original: string, substitute: string) => void;
}

const HealthAdaptedRecipe: React.FC<HealthAdaptedRecipeProps> = ({
  recipe,
  healthProfile,
  onIngredientSubstitute
}) => {
  const [adaptation, setAdaptation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [showDetails, setShowDetails] = useState(false);
  const [showAdapted, setShowAdapted] = useState(false);
  const { isOpen, onToggle } = useDisclosure();
  const toast = useToast();

  useEffect(() => {
    if (recipe && healthProfile) {
      analyzeRecipe();
    }
  }, [recipe, healthProfile]);

  const analyzeRecipe = async () => {
    setLoading(true);
    try {
      const response = await axios.post('/api/adapt/recipe', {
        recipe,
        healthProfile
      });

      setAdaptation(response.data.adaptation);
      
      // Auto-show adapted version if recipe is not compliant
      if (!response.data.adaptation.isCompliant) {
        setShowAdapted(true);
      }
    } catch (error) {
      console.error('Failed to analyze recipe:', error);
      toast({
        title: 'Analysis Failed',
        description: 'Could not analyze recipe for health compliance',
        status: 'error',
        duration: 3000
      });
    } finally {
      setLoading(false);
    }
  };

  const getSafetyColor = (score: number) => {
    if (score >= 80) return 'green';
    if (score >= 60) return 'yellow';
    if (score >= 40) return 'orange';
    return 'red';
  };

  const getSafetyIcon = (score: number) => {
    if (score >= 80) return FiCheckCircle;
    if (score >= 40) return FiAlertTriangle;
    return FiXCircle;
  };

  const handleSubstitution = (original: string, substitute: string) => {
    if (onIngredientSubstitute) {
      onIngredientSubstitute(original, substitute);
    }
    toast({
      title: 'Ingredient Substituted',
      description: `Replaced ${original} with ${substitute}`,
      status: 'success',
      duration: 2000
    });
  };

  if (loading) {
    return (
      <Card>
        <CardBody>
          <HStack justify="center" py={8}>
            <Spinner size="lg" color="purple.500" />
            <Text>Analyzing recipe for your health profile...</Text>
          </HStack>
        </CardBody>
      </Card>
    );
  }

  if (!adaptation) {
    return null;
  }

  const SafetyIcon = getSafetyIcon(adaptation.safetyScore);

  return (
    <VStack spacing={4} align="stretch">
      {/* Safety Score Card */}
      <Card borderColor={getSafetyColor(adaptation.safetyScore)} borderWidth={2}>
        <CardHeader>
          <HStack justify="space-between">
            <HStack>
              <Icon as={SafetyIcon} boxSize={6} color={`${getSafetyColor(adaptation.safetyScore)}.500`} />
              <VStack align="start" spacing={0}>
                <Text fontWeight="bold">Health Safety Score</Text>
                <Text fontSize="2xl" fontWeight="bold" color={`${getSafetyColor(adaptation.safetyScore)}.600`}>
                  {adaptation.safetyScore}%
                </Text>
              </VStack>
            </HStack>
            <Badge
              colorScheme={adaptation.isCompliant ? 'green' : 'red'}
              fontSize="md"
              px={3}
              py={1}
              borderRadius="full"
            >
              {adaptation.isCompliant ? 'Safe to Eat' : 'Modifications Needed'}
            </Badge>
          </HStack>
        </CardHeader>
      </Card>

      {/* Critical Warnings */}
      {adaptation.warnings.filter((w: any) => w.severity === 'critical').length > 0 && (
        <Alert status="error" borderRadius="md">
          <AlertIcon />
          <VStack align="start" spacing={2} flex={1}>
            <Text fontWeight="bold">⚠️ Critical Health Warnings</Text>
            {adaptation.warnings
              .filter((w: any) => w.severity === 'critical')
              .map((warning: any, idx: number) => (
                <Text key={idx} fontSize="sm">
                  • {warning.reason}
                </Text>
              ))}
          </VStack>
        </Alert>
      )}

      {/* Health Considerations */}
      {adaptation.healthConsiderations.length > 0 && (
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <HStack>
                <Icon as={FiShield} />
                <Text fontWeight="bold">Your Health Conditions</Text>
              </HStack>
              <Button size="sm" variant="ghost" onClick={onToggle}>
                {isOpen ? <FiChevronUp /> : <FiChevronDown />}
              </Button>
            </HStack>
          </CardHeader>
          <Collapse in={isOpen}>
            <CardBody pt={0}>
              {adaptation.healthConsiderations.map((consideration: any, idx: number) => (
                <Box key={idx} mb={3}>
                  <Text fontWeight="semibold" color="purple.600">
                    {consideration.condition}
                  </Text>
                  <Text fontSize="sm" color="gray.600">
                    Avoiding: {consideration.restrictions.slice(0, 5).join(', ')}
                    {consideration.restrictions.length > 5 && ` +${consideration.restrictions.length - 5} more`}
                  </Text>
                </Box>
              ))}
            </CardBody>
          </Collapse>
        </Card>
      )}

      {/* Ingredient Substitutions */}
      {adaptation.substitutions.length > 0 && (
        <Card>
          <CardHeader>
            <HStack>
              <Icon as={FiRefreshCw} />
              <Text fontWeight="bold">Required Substitutions</Text>
            </HStack>
          </CardHeader>
          <CardBody>
            <VStack spacing={3} align="stretch">
              {adaptation.substitutions.map((sub: any, idx: number) => (
                <Box
                  key={idx}
                  p={3}
                  borderWidth={1}
                  borderRadius="md"
                  borderColor="gray.200"
                  bg="gray.50"
                >
                  <HStack justify="space-between" mb={2}>
                    <VStack align="start" spacing={1} flex={1}>
                      <HStack>
                        <Text fontSize="sm" color="red.600" textDecoration="line-through">
                          {sub.original}
                        </Text>
                        <Text fontSize="sm">→</Text>
                        <Text fontSize="sm" color="green.600" fontWeight="bold">
                          {sub.substitute}
                        </Text>
                      </HStack>
                      <Text fontSize="xs" color="gray.600">
                        Reason: {sub.reason}
                      </Text>
                    </VStack>
                    <Button
                      size="sm"
                      colorScheme="green"
                      onClick={() => handleSubstitution(sub.original, sub.substitute)}
                    >
                      Apply
                    </Button>
                  </HStack>
                  {sub.alternatives && sub.alternatives.length > 1 && (
                    <Box mt={2} pt={2} borderTopWidth={1} borderColor="gray.200">
                      <Text fontSize="xs" color="gray.600">
                        Other options: {sub.alternatives.slice(1).join(', ')}
                      </Text>
                    </Box>
                  )}
                </Box>
              ))}
            </VStack>
          </CardBody>
        </Card>
      )}

      {/* Adapted Recipe */}
      {adaptation.adaptedRecipe && (
        <Card>
          <CardHeader>
            <HStack justify="space-between">
              <HStack>
                <Icon as={FiCheckCircle} color="green.500" />
                <Text fontWeight="bold">Health-Optimized Version</Text>
              </HStack>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setShowAdapted(!showAdapted)}
              >
                {showAdapted ? 'Hide' : 'Show'} Adapted Recipe
              </Button>
            </HStack>
          </CardHeader>
          {showAdapted && (
            <CardBody>
              <VStack align="stretch" spacing={4}>
                <Box>
                  <Heading size="md" mb={2}>{adaptation.adaptedRecipe.title}</Heading>
                  
                  <Text fontWeight="semibold" mb={2}>Safe Ingredients:</Text>
                  <List spacing={1} mb={4}>
                    {adaptation.adaptedRecipe.ingredients.map((ing: string, idx: number) => (
                      <ListItem key={idx} fontSize="sm">
                        <ListIcon as={FiCheckCircle} color="green.500" />
                        {ing}
                      </ListItem>
                    ))}
                  </List>

                  {adaptation.adaptedRecipe.nutritionalBenefits && (
                    <Box p={3} bg="green.50" borderRadius="md" mb={4}>
                      <Text fontWeight="semibold" color="green.700" mb={1}>
                        Health Benefits:
                      </Text>
                      <Text fontSize="sm" color="green.600">
                        {adaptation.adaptedRecipe.nutritionalBenefits}
                      </Text>
                    </Box>
                  )}

                  {adaptation.adaptedRecipe.tips && (
                    <Box p={3} bg="blue.50" borderRadius="md">
                      <Text fontWeight="semibold" color="blue.700" mb={1}>
                        Safety Tips:
                      </Text>
                      <Text fontSize="sm" color="blue.600">
                        {adaptation.adaptedRecipe.tips}
                      </Text>
                    </Box>
                  )}
                </Box>
              </VStack>
            </CardBody>
          )}
        </Card>
      )}

      {/* Recommendations */}
      {adaptation.recommendations && adaptation.recommendations.length > 0 && (
        <VStack spacing={2} align="stretch">
          {adaptation.recommendations.map((rec: any, idx: number) => (
            <Alert
              key={idx}
              status={
                rec.type === 'critical' ? 'error' :
                rec.type === 'warning' ? 'warning' :
                rec.type === 'success' ? 'success' : 'info'
              }
              borderRadius="md"
            >
              <AlertIcon />
              <Text fontSize="sm">{rec.message}</Text>
            </Alert>
          ))}
        </VStack>
      )}
    </VStack>
  );
};

export default HealthAdaptedRecipe;