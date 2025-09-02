# Bronwyn's Guide - Dietary Management Application 🍽️

A comprehensive mobile-first dietary management application designed for users with complex dietary restrictions, including conditions like Crohn's Disease and FND (Functional Neurological Disorder).

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Node](https://img.shields.io/badge/node-%3E%3D16.0.0-green.svg)
![React](https://img.shields.io/badge/react-18.3-blue.svg)

## 🌟 Features

### 📱 Mobile-Optimized Experience
- **Camera Integration** - Capture recipes directly from your phone
- **Touch-Optimized UI** - Designed for one-handed mobile use
- **PWA Support** - Install as a native app on your device
- **Responsive Design** - Works seamlessly on all screen sizes

### 🤖 AI-Powered Features (Dual AI Provider System)
- **Smart Image Recognition** - Identify ingredients and dishes from photos using GPT-4 Vision
- **Recipe Analysis** - Automatic ingredient and nutrition extraction from images
- **Recipe Extraction** - Extract complete recipes from recipe cards or handwritten notes
- **Safety Validation** - Checks recipes against dietary restrictions
- **Smart Modifications** - AI suggests safe alternatives for restricted ingredients
- **Meal Planning** - Intelligent meal plan generation based on dietary needs
- **Dual AI Providers** - Uses both OpenAI and OpenRouter for enhanced capabilities

### 👨‍👩‍👧‍👦 Family Management
- Multiple family member profiles
- Individual dietary restriction tracking
- Personalized recipe safety checks
- Shared meal planning

### 📋 Core Features
- Recipe management with image uploads
- Weekly meal planning
- Automated shopping list generation
- Dietary restriction tracking
- Nutritional information

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone https://github.com/yourusername/bronwyns-guide-app.git
cd bronwyns-guide-app
```

2. Install dependencies:
```bash
# Backend
cd backend && npm install

# Frontend
cd ../frontend-new && npm install
```

3. Set up environment variables:
```bash
# Backend
cp backend/.env.example backend/.env
# Add your OpenAI API key and other credentials
```

4. Start development servers:
```bash
# Backend (port 5001)
cd backend && npm run dev

# Frontend (port 3000)
cd frontend-new && npm run dev
```

5. Open http://localhost:3000 in your browser

## 📱 Mobile Access

To access on your mobile device:
1. Find your computer's IP address
2. Navigate to `http://[your-ip]:3000` on your phone
3. Add to home screen for app-like experience

## 🏗️ Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** - Fast build tool
- **Chakra UI** - Component library
- **React Query** - Data fetching
- **Zustand** - State management
- **React Router** - Navigation

### Backend
- **Node.js** with Express
- **SQLite** with Sequelize ORM (PostgreSQL in production)
- **JWT** authentication
- **Dual AI Integration** - OpenAI GPT-4 + OpenRouter (GPT-5, Claude)
- **Multer** for file uploads
- **AI Provider Fallback** - Automatic failover between providers

## 📦 Deployment

### Vercel Deployment

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy to Vercel:
```bash
vercel
```

3. Set environment variables in Vercel dashboard:
- `OPENAI_API_KEY` - Your OpenAI API key
- `OPENROUTER_API_KEY` - Your OpenRouter API key for advanced models
- `JWT_SECRET` - Secure secret for JWT tokens
- `DATABASE_URL` - PostgreSQL connection string
- `SUPABASE_URL` - Your Supabase project URL
- `SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_KEY` - Supabase service role key
- `FRONTEND_URL` - Your frontend deployment URL

### Environment Variables

Create a `.env` file in the backend directory:

```env
NODE_ENV=production
PORT=5001
DATABASE_URL=postgresql://user:password@host:port/database
JWT_SECRET=your-secure-secret

# AI Providers
OPENAI_API_KEY=your-openai-key
OPENROUTER_API_KEY=your-openrouter-key

# Supabase
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_KEY=your-service-key

FRONTEND_URL=https://your-app.vercel.app
```

## 🛠️ Development

### Project Structure
```
bronwyns-guide-app/
├── backend/               # Express API server
│   ├── src/
│   │   ├── models/       # Database models
│   │   ├── routes/       # API routes
│   │   ├── middleware/   # Express middleware
│   │   └── server.js     # Main server file
│   └── package.json
├── frontend-new/         # React application
│   ├── src/
│   │   ├── components/   # React components
│   │   ├── pages/        # Page components
│   │   ├── stores/       # State management
│   │   └── App.tsx       # Main app component
│   └── package.json
└── vercel.json          # Vercel configuration
```

### API Endpoints

- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/recipes` - Get all recipes
- `POST /api/recipes` - Create recipe
- `POST /api/recipes/upload-image` - Upload recipe image
- `GET /api/meal-plans` - Get meal plans
- `POST /api/meal-plans` - Create meal plan
- `GET /api/shopping-lists` - Get shopping lists
- `POST /api/ai/analyze-recipe` - AI recipe analysis
- `POST /api/image/analyze` - Analyze food images for ingredients
- `POST /api/image/extract-recipe` - Extract recipe from image
- `POST /api/ai/suggest-recipes` - Get recipe suggestions from ingredients

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Rate limiting on API endpoints
- Input validation and sanitization
- CORS configuration
- Helmet.js security headers

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

Built with ❤️ for people with dietary restrictions