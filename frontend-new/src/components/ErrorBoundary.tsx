import React, { Component, ErrorInfo, ReactNode } from 'react'
import {
  Box,
  VStack,
  Heading,
  Text,
  Button,
  Icon,
  Alert,
  AlertIcon,
  AlertTitle,
  AlertDescription,
  Container,
  useColorModeValue
} from '@chakra-ui/react'
import { FiAlertTriangle, FiRefreshCw } from 'react-icons/fi'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundaryClass extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { 
      hasError: true, 
      error,
      errorInfo: null 
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo)
    
    // Report to error tracking service (e.g., Sentry)
    if (typeof window !== 'undefined' && (window as any).Sentry) {
      (window as any).Sentry.captureException(error, {
        contexts: {
          react: {
            componentStack: errorInfo.componentStack
          }
        }
      })
    }

    this.setState({
      error,
      errorInfo
    })
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  private handleReload = () => {
    window.location.reload()
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return <>{this.props.fallback}</>
      }

      return <ErrorFallback 
        error={this.state.error}
        errorInfo={this.state.errorInfo}
        onReset={this.handleReset}
        onReload={this.handleReload}
      />
    }

    return this.props.children
  }
}

interface ErrorFallbackProps {
  error: Error | null
  errorInfo: ErrorInfo | null
  onReset: () => void
  onReload: () => void
}

const ErrorFallback: React.FC<ErrorFallbackProps> = ({ error, errorInfo, onReset, onReload }) => {
  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('red.200', 'red.700')
  
  const isDevelopment = process.env.NODE_ENV === 'development'

  return (
    <Container maxW="container.md" py={10}>
      <Alert
        status="error"
        variant="subtle"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        textAlign="center"
        minHeight="200px"
        borderRadius="lg"
        borderWidth={2}
        borderColor={borderColor}
        bg={bgColor}
      >
        <AlertIcon boxSize="40px" mr={0} />
        <AlertTitle mt={4} mb={1} fontSize="lg">
          Oops! Something went wrong
        </AlertTitle>
        <AlertDescription maxWidth="sm" mb={4}>
          We're sorry for the inconvenience. The application encountered an unexpected error.
        </AlertDescription>
        
        {isDevelopment && error && (
          <Box 
            w="100%" 
            p={4} 
            mt={4} 
            bg="red.50" 
            borderRadius="md"
            textAlign="left"
            maxH="200px"
            overflowY="auto"
          >
            <Text fontSize="sm" fontFamily="mono" color="red.700">
              {error.toString()}
            </Text>
            {errorInfo && (
              <Text fontSize="xs" fontFamily="mono" color="red.600" mt={2}>
                {errorInfo.componentStack}
              </Text>
            )}
          </Box>
        )}

        <VStack spacing={3} mt={6}>
          <Button
            leftIcon={<FiRefreshCw />}
            colorScheme="purple"
            onClick={onReset}
          >
            Try Again
          </Button>
          <Button
            variant="outline"
            onClick={onReload}
          >
            Reload Page
          </Button>
        </VStack>
      </Alert>
    </Container>
  )
}

// Hook for functional components
export const useErrorHandler = () => {
  const [error, setError] = React.useState<Error | null>(null)

  React.useEffect(() => {
    if (error) {
      throw error
    }
  }, [error])

  return setError
}

// HOC for wrapping components with error boundary
export const withErrorBoundary = <P extends object>(
  Component: React.ComponentType<P>,
  fallback?: ReactNode
) => {
  return (props: P) => (
    <ErrorBoundaryClass fallback={fallback}>
      <Component {...props} />
    </ErrorBoundaryClass>
  )
}

export default ErrorBoundaryClass