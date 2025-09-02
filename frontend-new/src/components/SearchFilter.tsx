import React, { useState, useCallback, useEffect } from 'react'
import {
  Input,
  InputGroup,
  InputLeftElement,
  InputRightElement,
  IconButton,
  Select,
  HStack,
  VStack,
  Tag,
  TagLabel,
  TagCloseButton,
  Wrap,
  WrapItem,
  Menu,
  MenuButton,
  MenuList,
  MenuItem,
  MenuItemOption,
  MenuGroup,
  MenuOptionGroup,
  MenuDivider,
  Button,
  Badge,
  Box,
  useColorModeValue,
  Collapse,
  useDisclosure,
  Drawer,
  DrawerBody,
  DrawerHeader,
  DrawerOverlay,
  DrawerContent,
  DrawerCloseButton,
  useBreakpointValue
} from '../components/ui'
import { FiSearch, FiX, FiFilter, FiChevronDown } from 'react-icons/fi'
import { useDebounce } from '../hooks/useDebounce'

interface SearchFilterProps {
  onSearch: (query: string) => void
  onFilter?: (filters: FilterState) => void
  placeholder?: string
  filters?: FilterConfig[]
  tags?: string[]
  onTagSelect?: (tag: string) => void
  selectedTags?: string[]
}

interface FilterConfig {
  key: string
  label: string
  type: 'select' | 'multiselect' | 'range' | 'boolean'
  options?: { value: string; label: string }[]
  min?: number
  max?: number
}

interface FilterState {
  [key: string]: any
}

export const SearchFilter: React.FC<SearchFilterProps> = ({
  onSearch,
  onFilter,
  placeholder = 'Search...',
  filters = [],
  tags = [],
  onTagSelect,
  selectedTags = []
}) => {
  const [searchQuery, setSearchQuery] = useState('')
  const [filterState, setFilterState] = useState<FilterState>({})
  const [isFilterOpen, setIsFilterOpen] = useState(false)
  const debouncedSearch = useDebounce(searchQuery, 300)
  
  const { isOpen, onOpen, onClose } = useDisclosure()
  const isMobile = useBreakpointValue({ base: true, md: false })

  const bgColor = useColorModeValue('white', 'gray.800')
  const borderColor = useColorModeValue('gray.200', 'gray.600')

  useEffect(() => {
    onSearch(debouncedSearch)
  }, [debouncedSearch, onSearch])

  const handleClearSearch = () => {
    setSearchQuery('')
    onSearch('')
  }

  const handleFilterChange = (key: string, value: any) => {
    const newFilters = { ...filterState, [key]: value }
    setFilterState(newFilters)
    onFilter?.(newFilters)
  }

  const handleClearFilters = () => {
    setFilterState({})
    onFilter?.({})
  }

  const activeFilterCount = Object.keys(filterState).filter(
    key => filterState[key] !== undefined && filterState[key] !== ''
  ).length

  const FilterContent = () => (
    <VStack align="stretch" spacing={4}>
      {filters.map(filter => (
        <Box key={filter.key}>
          {filter.type === 'select' && (
            <Select
              placeholder={filter.label}
              value={filterState[filter.key] || ''}
              onChange={(e) => handleFilterChange(filter.key, e.target.value)}
            >
              {filter.options?.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          )}
          
          {filter.type === 'multiselect' && (
            <Menu closeOnSelect={false}>
              <MenuButton as={Button} rightIcon={<FiChevronDown />} w="full">
                {filter.label}
                {filterState[filter.key]?.length > 0 && (
                  <Badge ml={2} colorScheme="purple">
                    {filterState[filter.key].length}
                  </Badge>
                )}
              </MenuButton>
              <MenuList>
                <MenuOptionGroup
                  type="checkbox"
                  value={filterState[filter.key] || []}
                  onChange={(value) => handleFilterChange(filter.key, value)}
                >
                  {filter.options?.map(option => (
                    <MenuItemOption key={option.value} value={option.value}>
                      {option.label}
                    </MenuItemOption>
                  ))}
                </MenuOptionGroup>
              </MenuList>
            </Menu>
          )}
        </Box>
      ))}
      
      {activeFilterCount > 0 && (
        <Button
          size="sm"
          variant="ghost"
          colorScheme="red"
          onClick={handleClearFilters}
        >
          Clear All Filters
        </Button>
      )}
    </VStack>
  )

  return (
    <VStack spacing={4} align="stretch">
      <HStack spacing={2}>
        <InputGroup size="lg">
          <InputLeftElement pointerEvents="none">
            <FiSearch color="gray.400" />
          </InputLeftElement>
          <Input
            placeholder={placeholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            bg={bgColor}
            borderColor={borderColor}
            _focus={{
              borderColor: 'purple.500',
              boxShadow: '0 0 0 1px var(--chakra-colors-purple-500)'
            }}
          />
          {searchQuery && (
            <InputRightElement>
              <IconButton
                aria-label="Clear search"
                icon={<FiX />}
                size="sm"
                variant="ghost"
                onClick={handleClearSearch}
              />
            </InputRightElement>
          )}
        </InputGroup>
        
        {filters.length > 0 && (
          isMobile ? (
            <IconButton
              aria-label="Open filters"
              icon={<FiFilter />}
              size="lg"
              onClick={onOpen}
              position="relative"
            >
              {activeFilterCount > 0 && (
                <Badge
                  position="absolute"
                  top="-1"
                  right="-1"
                  colorScheme="purple"
                  borderRadius="full"
                >
                  {activeFilterCount}
                </Badge>
              )}
            </IconButton>
          ) : (
            <Button
              leftIcon={<FiFilter />}
              onClick={() => setIsFilterOpen(!isFilterOpen)}
              size="lg"
              position="relative"
            >
              Filters
              {activeFilterCount > 0 && (
                <Badge ml={2} colorScheme="purple">
                  {activeFilterCount}
                </Badge>
              )}
            </Button>
          )
        )}
      </HStack>

      {/* Tags */}
      {tags.length > 0 && (
        <Wrap spacing={2}>
          {tags.map(tag => (
            <WrapItem key={tag}>
              <Tag
                size="md"
                variant={selectedTags.includes(tag) ? 'solid' : 'outline'}
                colorScheme="purple"
                cursor="pointer"
                onClick={() => onTagSelect?.(tag)}
              >
                <TagLabel>{tag}</TagLabel>
              </Tag>
            </WrapItem>
          ))}
        </Wrap>
      )}

      {/* Desktop Filters */}
      {!isMobile && (
        <Collapse in={isFilterOpen} animateOpacity>
          <Box
            p={4}
            borderWidth={1}
            borderColor={borderColor}
            borderRadius="md"
            bg={bgColor}
          >
            <FilterContent />
          </Box>
        </Collapse>
      )}

      {/* Mobile Filters Drawer */}
      {isMobile && (
        <Drawer isOpen={isOpen} placement="bottom" onClose={onClose}>
          <DrawerOverlay />
          <DrawerContent>
            <DrawerCloseButton />
            <DrawerHeader>Filters</DrawerHeader>
            <DrawerBody pb={6}>
              <FilterContent />
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      )}
    </VStack>
  )
}


export default SearchFilter