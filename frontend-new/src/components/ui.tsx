import React from 'react'
import '../styles.css'

// Simple UI components to replace Chakra UI

export const Box = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
)

export const Container = ({ children, maxW, ...props }: any) => (
  <div className="container" style={{ maxWidth: maxW }} {...props}>
    {children}
  </div>
)

export const Flex = ({ children, direction = 'row', justify = 'flex-start', align = 'stretch', gap = 0, ...props }: any) => (
  <div style={{ display: 'flex', flexDirection: direction, justifyContent: justify, alignItems: align, gap }} {...props}>
    {children}
  </div>
)

export const VStack = ({ children, spacing = 16, ...props }: any) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: spacing }} {...props}>
    {children}
  </div>
)

export const HStack = ({ children, spacing = 16, ...props }: any) => (
  <div style={{ display: 'flex', flexDirection: 'row', alignItems: 'center', gap: spacing }} {...props}>
    {children}
  </div>
)

export const Button = ({ children, onClick, disabled, colorScheme, variant = 'solid', size = 'md', isLoading, ...props }: any) => (
  <button 
    className={`btn ${variant} ${size}`}
    onClick={onClick}
    disabled={disabled || isLoading}
    {...props}
  >
    {isLoading ? 'Loading...' : children}
  </button>
)

export const Input = ({ ...props }: any) => (
  <input className="form-input" {...props} />
)

export const FormControl = ({ children, isRequired, ...props }: any) => (
  <div className="form-group" {...props}>
    {children}
  </div>
)

export const FormLabel = ({ children, ...props }: any) => (
  <label className="form-label" {...props}>
    {children}
  </label>
)

export const Heading = ({ children, size = 'xl', ...props }: any) => {
  const Tag = size === 'xl' ? 'h1' : size === 'lg' ? 'h2' : size === 'md' ? 'h3' : 'h4'
  return <Tag className={`heading-${size}`} {...props}>{children}</Tag>
}

export const Text = ({ children, ...props }: any) => (
  <p {...props}>{children}</p>
)

export const Link = ({ children, href, ...props }: any) => (
  <a href={href} {...props}>{children}</a>
)

export const Alert = ({ children, status = 'info', ...props }: any) => (
  <div className={`alert alert-${status}`} {...props}>
    {children}
  </div>
)

export const AlertIcon = () => <span>⚠️</span>

export const Spinner = ({ size = 'md' }: any) => (
  <div className={`spinner spinner-${size}`}>Loading...</div>
)

export const Grid = ({ children, columns = 1, gap = 16, ...props }: any) => (
  <div 
    style={{ 
      display: 'grid', 
      gridTemplateColumns: `repeat(${columns}, 1fr)`,
      gap 
    }} 
    {...props}
  >
    {children}
  </div>
)

export const Card = ({ children, ...props }: any) => (
  <div className="card" {...props}>
    {children}
  </div>
)

export const CardHeader = ({ children, ...props }: any) => (
  <div className="card-header" {...props}>
    {children}
  </div>
)

export const CardBody = ({ children, ...props }: any) => (
  <div className="card-body" {...props}>
    {children}
  </div>
)

export const IconButton = ({ icon, onClick, ...props }: any) => (
  <button className="icon-button" onClick={onClick} {...props}>
    {icon}
  </button>
)

export const Badge = ({ children, colorScheme = 'gray', ...props }: any) => (
  <span className={`badge badge-${colorScheme}`} {...props}>
    {children}
  </span>
)

export const Select = ({ children, ...props }: any) => (
  <select className="form-input" {...props}>
    {children}
  </select>
)

export const Textarea = ({ ...props }: any) => (
  <textarea className="form-input" {...props} />
)

export const useToast = () => {
  return () => {
    console.log('Toast shown')
  }
}

export const useColorMode = () => {
  return { colorMode: 'light', toggleColorMode: () => {} }
}

export const SimpleGrid = Grid
export const Stack = VStack
export const Center = ({ children, ...props }: any) => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }} {...props}>
    {children}
  </div>
)

// Stub function for theme compatibility
export const extendTheme = (config: any) => config

// ChakraProvider stub for compatibility
export const ChakraProvider = ({ children, theme }: any) => children