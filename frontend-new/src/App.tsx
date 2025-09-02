import { Routes, Route, Navigate } from 'react-router-dom'
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
import './styles.css'

function App() {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated)

  return (
    <div style={{ minHeight: '100vh', background: '#f7fafc' }}>
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
    </div>
  )
}

export default App