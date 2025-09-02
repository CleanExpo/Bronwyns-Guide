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

export const Icon = ({ as: Component = 'span', ...props }: any) => {
  if (Component && typeof Component === 'function') {
    return <Component {...props} />
  }
  return <span {...props} />
}

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

export interface UseToastOptions {
  title?: string
  description?: string
  status?: 'success' | 'error' | 'warning' | 'info'
  duration?: number
  isClosable?: boolean
}

export const useToast = () => {
  return (options?: UseToastOptions) => {
    console.log('Toast shown', options)
  }
}

export const useChakraToast = useToast

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

// Additional exports for compatibility
export type ThemeConfig = any
export const Divider = () => <hr style={{ border: '1px solid #e2e8f0', margin: '1rem 0' }} />
export const Spacer = () => <div style={{ flex: 1 }} />
export const Image = ({ src, alt, ...props }: any) => <img src={src} alt={alt} {...props} />
export const Progress = ({ value, max = 100 }: any) => (
  <div style={{ background: '#e2e8f0', borderRadius: '4px', height: '8px', overflow: 'hidden' }}>
    <div style={{ background: '#6B4C93', width: `${(value / max) * 100}%`, height: '100%' }} />
  </div>
)

// Menu components
export const Menu = ({ children }: any) => <div className="menu">{children}</div>
export const MenuButton = Button
export const MenuList = ({ children }: any) => <div className="menu-list">{children}</div>
export const MenuItem = ({ children, onClick }: any) => (
  <button className="menu-item" onClick={onClick}>{children}</button>
)
export const MenuDivider = () => <hr className="menu-divider" />

// Drawer components
export const useDisclosure = () => {
  const [isOpen, setIsOpen] = React.useState(false)
  return {
    isOpen,
    onOpen: () => setIsOpen(true),
    onClose: () => setIsOpen(false),
    onToggle: () => setIsOpen(!isOpen)
  }
}

export const Drawer = ({ isOpen, onClose, children }: any) => {
  if (!isOpen) return null
  return (
    <div className="drawer-overlay" onClick={onClose}>
      <div className="drawer" onClick={(e) => e.stopPropagation()}>
        {children}
      </div>
    </div>
  )
}
export const DrawerBody = ({ children }: any) => <div className="drawer-body">{children}</div>
export const DrawerHeader = ({ children }: any) => <div className="drawer-header">{children}</div>
export const DrawerOverlay = ({ onClick }: any) => <div className="drawer-overlay" onClick={onClick} />
export const DrawerContent = ({ children }: any) => <div className="drawer-content">{children}</div>
export const DrawerCloseButton = ({ onClick }: any) => (
  <button className="drawer-close" onClick={onClick}>×</button>
)