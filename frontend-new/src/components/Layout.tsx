import { Outlet, Link as RouterLink, useLocation, useNavigate } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import {
  FiHome,
  FiBook,
  FiCalendar,
  FiShoppingCart,
  FiUsers,
  FiUser,
  FiLogOut,
  FiMenu,
  FiX
} from 'react-icons/fi'
import { useState } from 'react'
import './Layout.css'

const navItems = [
  { path: '/', label: 'Dashboard', icon: FiHome },
  { path: '/recipes', label: 'Recipes', icon: FiBook },
  { path: '/meal-plans', label: 'Meal Plans', icon: FiCalendar },
  { path: '/shopping-lists', label: 'Shopping Lists', icon: FiShoppingCart },
  { path: '/family-members', label: 'Family Members', icon: FiUsers }
]

function Layout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuthStore()
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)

  const handleLogout = () => {
    logout()
    navigate('/login')
  }

  return (
    <div className="app-layout">
      {/* Sidebar */}
      <aside className={`sidebar ${sidebarOpen ? 'sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <h2 className="sidebar-title">Bronwyn's Guide</h2>
          <button 
            className="sidebar-close mobile-only"
            onClick={() => setSidebarOpen(false)}
          >
            <FiX />
          </button>
        </div>
        
        <nav className="sidebar-nav">
          {navItems.map((item) => {
            const Icon = item.icon
            return (
              <RouterLink
                key={item.path}
                to={item.path}
                className={`nav-item ${location.pathname === item.path ? 'active' : ''}`}
                onClick={() => setSidebarOpen(false)}
              >
                <Icon className="nav-icon" />
                <span>{item.label}</span>
              </RouterLink>
            )
          })}
        </nav>
      </aside>

      {/* Overlay for mobile */}
      {sidebarOpen && (
        <div 
          className="sidebar-overlay mobile-only" 
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Main Content */}
      <div className="main-content">
        {/* Header */}
        <header className="app-header">
          <button 
            className="menu-toggle mobile-only"
            onClick={() => setSidebarOpen(true)}
          >
            <FiMenu />
          </button>
          
          <div className="header-title mobile-only">Bronwyn's Guide</div>
          
          <div className="header-spacer" />
          
          <div className="user-menu">
            <button 
              className="user-menu-trigger"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
            >
              <div className="user-avatar">
                {user?.firstName?.charAt(0) || 'U'}
              </div>
              <div className="user-info desktop-only">
                <div className="user-name">
                  {user ? `${user.firstName} ${user.lastName}` : 'User'}
                </div>
                <div className="user-email">{user?.email}</div>
              </div>
            </button>
            
            {userMenuOpen && (
              <>
                <div 
                  className="dropdown-overlay" 
                  onClick={() => setUserMenuOpen(false)}
                />
                <div className="user-dropdown">
                  <RouterLink 
                    to="/profile" 
                    className="dropdown-item"
                    onClick={() => setUserMenuOpen(false)}
                  >
                    <FiUser /> Profile
                  </RouterLink>
                  <hr className="dropdown-divider" />
                  <button 
                    className="dropdown-item text-red"
                    onClick={handleLogout}
                  >
                    <FiLogOut /> Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </header>

        {/* Page Content */}
        <main className="page-content">
          <Outlet />
        </main>

        {/* Footer */}
        <footer className="app-footer">
          <p>&copy; 2024 Bronwyn's Personal Chief. All rights reserved.</p>
        </footer>
      </div>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-nav mobile-only">
        {navItems.slice(0, 4).map((item) => {
          const Icon = item.icon
          return (
            <RouterLink
              key={item.path}
              to={item.path}
              className={`mobile-nav-item ${location.pathname === item.path ? 'active' : ''}`}
            >
              <Icon className="mobile-nav-icon" />
              <span className="mobile-nav-label">{item.label.split(' ')[0]}</span>
            </RouterLink>
          )
        })}
      </nav>
    </div>
  )
}

export default Layout