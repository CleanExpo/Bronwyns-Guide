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

export const GridItem = ({ children, colSpan = 1, rowSpan = 1, ...props }: any) => (
  <div 
    style={{ 
      gridColumn: `span ${colSpan}`,
      gridRow: `span ${rowSpan}`
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

export const Avatar = ({ name = 'User', src, size = 'md', ...props }: any) => {
  const sizeMap: any = { sm: 32, md: 40, lg: 48 }
  const pixels = sizeMap[size] || 40
  
  if (src) {
    return <img src={src} alt={name} style={{ width: pixels, height: pixels, borderRadius: '50%' }} {...props} />
  }
  
  return (
    <div 
      style={{ 
        width: pixels, 
        height: pixels, 
        borderRadius: '50%', 
        background: '#6B4C93',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold'
      }} 
      {...props}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  )
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

export const useColorModeValue = (lightValue: any, darkValue: any) => {
  // Always return light value since we're not supporting dark mode yet
  return lightValue
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
export const Image = ({ src, alt, w, h, objectFit = 'cover', borderRadius, ...props }: any) => {
  const style: any = {
    maxWidth: '100%',
    height: 'auto',
    display: 'block',
    ...props.style
  }
  
  // Handle responsive width/height
  if (w === 'full' || w === '100%') style.width = '100%'
  if (h) {
    if (typeof h === 'object') {
      // Responsive heights like { base: '250px', md: '400px' }
      style.height = h.base || h.md || h
      // For mobile-first, use base value
      if (window.innerWidth <= 768 && h.base) {
        style.height = h.base
      }
    } else {
      style.height = h
    }
  }
  
  if (objectFit) style.objectFit = objectFit
  if (borderRadius) style.borderRadius = borderRadius === 'lg' ? '8px' : borderRadius
  
  return <img src={src} alt={alt} style={style} {...props} />
}
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

// Stat components
export const Stat = ({ children, ...props }: any) => (
  <div className="stat" {...props}>{children}</div>
)
export const StatLabel = ({ children, ...props }: any) => (
  <div className="stat-label" style={{ fontSize: '0.875rem', color: '#718096' }} {...props}>{children}</div>
)
export const StatNumber = ({ children, ...props }: any) => (
  <div className="stat-number" style={{ fontSize: '1.5rem', fontWeight: 'bold', color: '#2d3748' }} {...props}>{children}</div>
)
export const StatHelpText = ({ children, ...props }: any) => (
  <div className="stat-help" style={{ fontSize: '0.75rem', color: '#a0aec0' }} {...props}>{children}</div>
)

// Input group components
export const InputGroup = ({ children, ...props }: any) => (
  <div style={{ position: 'relative' }} {...props}>{children}</div>
)
export const InputLeftElement = ({ children, ...props }: any) => (
  <div style={{ position: 'absolute', left: 0, top: '50%', transform: 'translateY(-50%)', paddingLeft: '12px', pointerEvents: 'none' }} {...props}>
    {children}
  </div>
)
export const InputRightElement = ({ children, ...props }: any) => (
  <div style={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)', paddingRight: '12px' }} {...props}>
    {children}
  </div>
)

// Tag components
export const Tag = ({ children, variant = 'subtle', colorScheme = 'gray', size = 'md', ...props }: any) => (
  <span 
    className={`tag tag-${variant} tag-${colorScheme} tag-${size}`}
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      padding: size === 'sm' ? '2px 8px' : '4px 12px',
      borderRadius: '4px',
      fontSize: size === 'sm' ? '0.75rem' : '0.875rem',
      background: variant === 'solid' ? '#6B4C93' : 'transparent',
      color: variant === 'solid' ? 'white' : '#6B4C93',
      border: variant === 'outline' ? '1px solid #6B4C93' : 'none',
      cursor: props.onClick ? 'pointer' : 'default'
    }}
    {...props}
  >
    {children}
  </span>
)

export const TagLabel = ({ children, ...props }: any) => (
  <span {...props}>{children}</span>
)

export const TagCloseButton = ({ onClick, ...props }: any) => (
  <button 
    onClick={onClick}
    style={{ 
      marginLeft: '8px', 
      background: 'none', 
      border: 'none', 
      cursor: 'pointer',
      padding: '0 2px'
    }}
    {...props}
  >
    ×
  </button>
)

// Wrap components
export const Wrap = ({ children, spacing = 8, ...props }: any) => (
  <div style={{ display: 'flex', flexWrap: 'wrap', gap: spacing }} {...props}>
    {children}
  </div>
)

export const WrapItem = ({ children, ...props }: any) => (
  <div {...props}>{children}</div>
)

// Additional Menu components
export const MenuItemOption = ({ children, value, isChecked, ...props }: any) => (
  <label className="menu-item-option" style={{ display: 'flex', alignItems: 'center', padding: '8px 12px', cursor: 'pointer' }} {...props}>
    <input type="checkbox" checked={isChecked} value={value} style={{ marginRight: '8px' }} readOnly />
    {children}
  </label>
)

export const MenuGroup = ({ children, title, ...props }: any) => (
  <div className="menu-group" {...props}>
    {title && <div style={{ padding: '8px 12px', fontWeight: 'bold', fontSize: '0.875rem' }}>{title}</div>}
    {children}
  </div>
)

export const MenuOptionGroup = ({ children, type = 'checkbox', value, onChange, ...props }: any) => {
  const handleChange = (e: any) => {
    if (type === 'checkbox') {
      const newValue = [...(value || [])]
      const itemValue = e.target.value
      const index = newValue.indexOf(itemValue)
      if (e.target.checked && index === -1) {
        newValue.push(itemValue)
      } else if (!e.target.checked && index !== -1) {
        newValue.splice(index, 1)
      }
      onChange?.(newValue)
    } else {
      onChange?.(e.target.value)
    }
  }
  
  return (
    <div onChange={handleChange} {...props}>
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as any, {
            isChecked: type === 'checkbox' ? value?.includes(child.props.value) : value === child.props.value
          })
        }
        return child
      })}
    </div>
  )
}

// Collapse component
export const Collapse = ({ in: isOpen, children, animateOpacity, ...props }: any) => (
  <div 
    style={{ 
      display: isOpen ? 'block' : 'none',
      opacity: animateOpacity && isOpen ? 1 : animateOpacity ? 0 : 1,
      transition: animateOpacity ? 'opacity 0.2s' : undefined
    }} 
    {...props}
  >
    {children}
  </div>
)

// Responsive hook
export const useBreakpointValue = (values: any) => {
  const [value, setValue] = React.useState(values.base || values)
  
  React.useEffect(() => {
    const checkBreakpoint = () => {
      const width = window.innerWidth
      if (width >= 768 && values.md !== undefined) {
        setValue(values.md)
      } else if (width >= 1024 && values.lg !== undefined) {
        setValue(values.lg)
      } else {
        setValue(values.base || values)
      }
    }
    
    checkBreakpoint()
    window.addEventListener('resize', checkBreakpoint)
    return () => window.removeEventListener('resize', checkBreakpoint)
  }, [values])
  
  return value
}

// Modal components
export const Modal = ({ isOpen, onClose, children, size = 'md', ...props }: any) => {
  if (!isOpen) return null
  
  React.useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])
  
  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem'
      }}
      {...props}
    >
      {children}
    </div>
  )
}

export const ModalOverlay = ({ onClick, ...props }: any) => (
  <div 
    style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.5)',
      zIndex: -1
    }}
    onClick={onClick}
    {...props}
  />
)

export const ModalContent = ({ children, ...props }: any) => (
  <div 
    style={{
      background: 'white',
      borderRadius: '8px',
      maxWidth: '500px',
      width: '100%',
      maxHeight: '90vh',
      overflow: 'auto',
      position: 'relative',
      boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)'
    }}
    onClick={(e) => e.stopPropagation()}
    {...props}
  >
    {children}
  </div>
)

export const ModalHeader = ({ children, ...props }: any) => (
  <div 
    style={{
      padding: '1.5rem',
      borderBottom: '1px solid #e2e8f0',
      fontSize: '1.25rem',
      fontWeight: 'bold'
    }}
    {...props}
  >
    {children}
  </div>
)

export const ModalCloseButton = ({ onClick, ...props }: any) => (
  <button 
    style={{
      position: 'absolute',
      top: '1rem',
      right: '1rem',
      background: 'none',
      border: 'none',
      fontSize: '1.5rem',
      cursor: 'pointer',
      padding: '0.5rem',
      lineHeight: 1
    }}
    onClick={onClick}
    aria-label="Close"
    {...props}
  >
    ×
  </button>
)

export const ModalBody = ({ children, ...props }: any) => (
  <div style={{ padding: '1.5rem' }} {...props}>
    {children}
  </div>
)

export const ModalFooter = ({ children, ...props }: any) => (
  <div 
    style={{
      padding: '1.5rem',
      borderTop: '1px solid #e2e8f0',
      display: 'flex',
      justifyContent: 'flex-end',
      gap: '0.5rem'
    }}
    {...props}
  >
    {children}
  </div>
)

// Tooltip component
export const Tooltip = ({ children, label, placement = 'top', ...props }: any) => {
  const [showTooltip, setShowTooltip] = React.useState(false)
  
  return (
    <div 
      style={{ position: 'relative', display: 'inline-block' }}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      {...props}
    >
      {children}
      {showTooltip && label && (
        <div 
          style={{
            position: 'absolute',
            bottom: placement === 'top' ? '100%' : 'auto',
            top: placement === 'bottom' ? '100%' : 'auto',
            left: '50%',
            transform: 'translateX(-50%)',
            marginBottom: placement === 'top' ? '8px' : '0',
            marginTop: placement === 'bottom' ? '8px' : '0',
            padding: '6px 12px',
            background: '#2d3748',
            color: 'white',
            borderRadius: '4px',
            fontSize: '0.875rem',
            whiteSpace: 'nowrap',
            zIndex: 1000,
            pointerEvents: 'none'
          }}
        >
          {label}
        </div>
      )}
    </div>
  )
}

// Alert components
export const AlertTitle = ({ children, ...props }: any) => (
  <div style={{ fontWeight: 'bold', marginBottom: '0.25rem' }} {...props}>
    {children}
  </div>
)

export const AlertDescription = ({ children, ...props }: any) => (
  <div style={{ fontSize: '0.875rem' }} {...props}>
    {children}
  </div>
)

// Skeleton components for loading states
export const Skeleton = ({ height = '20px', width = '100%', startColor = '#f7fafc', endColor = '#e2e8f0', ...props }: any) => (
  <div 
    className="skeleton"
    style={{
      height,
      width,
      background: `linear-gradient(90deg, ${startColor} 25%, ${endColor} 50%, ${startColor} 75%)`,
      backgroundSize: '200% 100%',
      animation: 'skeleton-loading 1.5s infinite',
      borderRadius: '4px'
    }}
    {...props}
  />
)

export const SkeletonText = ({ noOfLines = 3, spacing = '0.5rem', skeletonHeight = '16px', ...props }: any) => (
  <div {...props}>
    {Array.from({ length: noOfLines }).map((_, i) => (
      <Skeleton 
        key={i} 
        height={skeletonHeight}
        width={i === noOfLines - 1 ? '80%' : '100%'}
        style={{ marginBottom: i < noOfLines - 1 ? spacing : 0 }}
      />
    ))}
  </div>
)

export const SkeletonCircle = ({ size = '40px', ...props }: any) => (
  <Skeleton 
    height={size}
    width={size}
    style={{ borderRadius: '50%' }}
    {...props}
  />
)

// List components
export const List = ({ children, spacing = 2, styleType = 'none', ...props }: any) => (
  <ul 
    style={{ 
      listStyle: styleType,
      padding: styleType === 'none' ? 0 : '0 0 0 1.5rem',
      margin: 0
    }}
    {...props}
  >
    {React.Children.map(children, (child, index) => 
      child ? React.cloneElement(child as any, { 
        style: { 
          ...((child as any).props?.style || {}),
          marginBottom: index < React.Children.count(children) - 1 ? `${spacing * 4}px` : 0 
        }
      }) : null
    )}
  </ul>
)

export const ListItem = ({ children, ...props }: any) => (
  <li 
    style={{ 
      display: 'flex',
      alignItems: 'center'
    }}
    {...props}
  >
    {children}
  </li>
)

export const ListIcon = ({ as: Component, color = '#48bb78', ...props }: any) => {
  const IconComponent = Component || (() => <span>•</span>)
  return (
    <span 
      style={{ 
        marginRight: '0.5rem',
        color,
        display: 'inline-flex',
        alignItems: 'center'
      }}
      {...props}
    >
      <IconComponent />
    </span>
  )
}

// Tab components
export const Tabs = ({ children, defaultIndex = 0, onChange, ...props }: any) => {
  const [selectedIndex, setSelectedIndex] = React.useState(defaultIndex)
  
  const handleTabChange = (index: number) => {
    setSelectedIndex(index)
    onChange?.(index)
  }
  
  return (
    <div {...props}>
      {React.Children.map(children, (child) => {
        if (React.isValidElement(child)) {
          return React.cloneElement(child as any, { selectedIndex, onTabChange: handleTabChange })
        }
        return child
      })}
    </div>
  )
}

export const TabList = ({ children, selectedIndex = 0, onTabChange, ...props }: any) => (
  <div 
    style={{ 
      display: 'flex',
      borderBottom: '2px solid #e2e8f0',
      marginBottom: '1rem'
    }}
    {...props}
  >
    {React.Children.map(children, (child, index) => {
      if (React.isValidElement(child)) {
        return React.cloneElement(child as any, { 
          isSelected: selectedIndex === index,
          onClick: () => onTabChange?.(index)
        })
      }
      return child
    })}
  </div>
)

export const Tab = ({ children, isSelected, onClick, ...props }: any) => (
  <button
    style={{
      padding: '0.75rem 1rem',
      background: 'none',
      border: 'none',
      borderBottom: isSelected ? '2px solid #6B4C93' : '2px solid transparent',
      color: isSelected ? '#6B4C93' : '#718096',
      fontWeight: isSelected ? 'bold' : 'normal',
      cursor: 'pointer',
      marginBottom: '-2px',
      transition: 'all 0.2s'
    }}
    onClick={onClick}
    {...props}
  >
    {children}
  </button>
)

export const TabPanels = ({ children, selectedIndex = 0, ...props }: any) => (
  <div {...props}>
    {React.Children.map(children, (child, index) => {
      if (React.isValidElement(child) && index === selectedIndex) {
        return child
      }
      return null
    })}
  </div>
)

export const TabPanel = ({ children, ...props }: any) => (
  <div {...props}>
    {children}
  </div>
)