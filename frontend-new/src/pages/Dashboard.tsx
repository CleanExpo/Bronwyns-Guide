import { FiBook, FiCalendar, FiShoppingCart, FiUsers, FiArrowRight } from 'react-icons/fi'
import { Link } from 'react-router-dom'
import { useAuthStore } from '../stores/authStore'
import './Dashboard.css'

function Dashboard() {
  const user = useAuthStore((state) => state.user)

  // Mock data for now - will connect to API later
  const stats = {
    recipes: 0,
    mealPlans: 0,
    shoppingLists: 0,
    familyMembers: 0
  }

  const statCards = [
    {
      label: 'Saved Recipes',
      value: stats.recipes,
      icon: FiBook,
      color: 'purple',
      link: '/recipes',
      bgColor: '#f3e8ff'
    },
    {
      label: 'Meal Plans',
      value: stats.mealPlans,
      icon: FiCalendar,
      color: 'blue',
      link: '/meal-plans',
      bgColor: '#e0f2ff'
    },
    {
      label: 'Shopping Lists',
      value: stats.shoppingLists,
      icon: FiShoppingCart,
      color: 'green',
      link: '/shopping-lists',
      bgColor: '#e6fffa'
    },
    {
      label: 'Family Members',
      value: stats.familyMembers,
      icon: FiUsers,
      color: 'orange',
      link: '/family-members',
      bgColor: '#fff5e6'
    }
  ]

  const quickActions = [
    { label: 'Add New Recipe', link: '/recipes/new', icon: FiBook },
    { label: 'Create Meal Plan', link: '/meal-plans/new', icon: FiCalendar },
    { label: 'Generate Shopping List', link: '/shopping-lists/new', icon: FiShoppingCart }
  ]

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1 className="dashboard-title">
          Welcome back, {user?.firstName || 'User'}!
        </h1>
        <p className="dashboard-subtitle">
          Here's an overview of your dietary management dashboard
        </p>
      </div>

      <div className="stats-grid">
        {statCards.map((stat) => {
          const Icon = stat.icon
          return (
            <Link to={stat.link} key={stat.label} className="stat-card">
              <div className="stat-icon" style={{ backgroundColor: stat.bgColor }}>
                <Icon />
              </div>
              <div className="stat-content">
                <div className="stat-label">{stat.label}</div>
                <div className="stat-value">{stat.value}</div>
                <div className="stat-link">
                  View all <FiArrowRight />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      <div className="quick-actions-section">
        <h2 className="section-title">Quick Actions</h2>
        <div className="quick-actions-grid">
          {quickActions.map((action) => {
            const Icon = action.icon
            return (
              <Link to={action.link} key={action.label} className="quick-action-card">
                <Icon className="quick-action-icon" />
                <span>{action.label}</span>
              </Link>
            )
          })}
        </div>
      </div>

      <div className="recent-activity-section">
        <h2 className="section-title">Recent Activity</h2>
        <div className="activity-card">
          <p className="empty-state">No recent activity to show</p>
          <Link to="/recipes/new" className="cta-button">
            Get started by adding your first recipe
          </Link>
        </div>
      </div>
    </div>
  )
}

export default Dashboard