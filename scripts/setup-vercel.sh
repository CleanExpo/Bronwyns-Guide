#!/bin/bash

# Vercel Deployment Setup Script
# This script sets up the Vercel deployment pipeline

echo "🚀 Setting up Vercel deployment pipeline..."

# Export Vercel credentials
export VERCEL_TOKEN=8QzdzoQTduAQRPlsJhMWqFhf
export VERCEL_PROJECT_ID=prj_wNS42qz4RK46r2xNldigbMkL8aCi
export VERCEL_ORG_ID=unite-group

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo "📦 Installing Vercel CLI..."
    npm install -g vercel@latest
fi

echo "✅ Vercel CLI is installed"

# Link project to Vercel
echo "🔗 Linking project to Vercel..."
vercel link --yes --token $VERCEL_TOKEN --project $VERCEL_PROJECT_ID

# Pull environment variables
echo "📥 Pulling environment variables..."
vercel env pull --yes --token $VERCEL_TOKEN

# Set environment variables if needed
echo "⚙️ Setting environment variables..."
# Uncomment and add your OpenRouter API key when you have it
# vercel env add VITE_OPENROUTER_API_KEY production --token $VERCEL_TOKEN

echo "✅ Vercel setup complete!"
echo ""
echo "📝 Next steps:"
echo "1. Add your OpenRouter API key to Vercel environment variables"
echo "2. Set up GitHub secrets for automatic deployment:"
echo "   - VERCEL_TOKEN: $VERCEL_TOKEN"
echo "   - VERCEL_ORG_ID: $VERCEL_ORG_ID"
echo ""
echo "🚀 To deploy manually, run:"
echo "   vercel --prod --token $VERCEL_TOKEN"