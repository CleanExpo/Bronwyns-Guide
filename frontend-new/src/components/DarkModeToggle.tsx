import React from 'react'
import {
  IconButton,
  useColorMode,
  useColorModeValue,
  Tooltip,
  Icon
} from '@chakra-ui/react'
import { FiSun, FiMoon } from 'react-icons/fi'

interface DarkModeToggleProps {
  size?: 'sm' | 'md' | 'lg'
  variant?: 'ghost' | 'solid' | 'outline'
  showTooltip?: boolean
}

export const DarkModeToggle: React.FC<DarkModeToggleProps> = ({
  size = 'md',
  variant = 'ghost',
  showTooltip = true
}) => {
  const { colorMode, toggleColorMode } = useColorMode()
  const SwitchIcon = useColorModeValue(FiMoon, FiSun)
  const tooltipLabel = useColorModeValue('Switch to dark mode', 'Switch to light mode')
  const iconColor = useColorModeValue('gray.600', 'gray.400')
  const hoverBg = useColorModeValue('gray.100', 'gray.700')

  const button = (
    <IconButton
      aria-label={tooltipLabel}
      icon={<Icon as={SwitchIcon} />}
      onClick={toggleColorMode}
      size={size}
      variant={variant}
      color={iconColor}
      _hover={{
        bg: hoverBg,
        transform: 'rotate(20deg)',
      }}
      transition="all 0.2s"
    />
  )

  if (showTooltip) {
    return (
      <Tooltip label={tooltipLabel} placement="bottom">
        {button}
      </Tooltip>
    )
  }

  return button
}

export default DarkModeToggle