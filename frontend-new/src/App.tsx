import { Routes, Route, Navigate } from 'react-router-dom'
import { Box } from '@chakra-ui/react'
import Layout from './components/Layout'
import Dashboard from './pages/Dashboard'
import Login from './pages/Login'
import Register from './pages/Register'
import Recipes from './pages/Recipes'
import RecipeDetail from './pages/RecipeDetail'
import RecipeCapture from './pages/RecipeCapture'
import MealPlans from './pages/MealPlans'
import ShoppingLists from './pages/ShoppingLists'
import FamilyMembers from './pages/FamilyMembers'
import Profile from './pages/Profile'
import { useAuthStore } from './stores/authStore'

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <Box minH="100vh" bg="gray.50">
      <Routes>
        <Route path="/login" element={!isAuthenticated ? <Login /> : <Navigate to="/" />} />
        <Route path="/register" element={!isAuthenticated ? <Register /> : <Navigate to="/" />} />
        
        <Route path="/" element={isAuthenticated ? <Layout /> : <Navigate to="/login" />}>
          <Route index element={<Dashboard />} />
          <Route path="recipes" element={<Recipes />} />
          <Route path="recipes/new" element={<RecipeCapture />} />
          <Route path="recipes/:id" element={<RecipeDetail />} />
          <Route path="meal-plans" element={<MealPlans />} />
          <Route path="shopping-lists" element={<ShoppingLists />} />
          <Route path="family-members" element={<FamilyMembers />} />
          <Route path="profile" element={<Profile />} />
        </Route>
      </Routes>
    </Box>
  )
}

export default App