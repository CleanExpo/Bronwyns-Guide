/**
 * Environment Variable Validation
 * Ensures all required environment variables are set before starting the application
 */

const requiredEnvVars = {
  production: [
    'NODE_ENV',
    'JWT_SECRET',
    'DATABASE_URL',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'SUPABASE_SERVICE_KEY',
    'FRONTEND_URL',
    'OPENAI_API_KEY'
  ],
  development: [
    'NODE_ENV',
    'JWT_SECRET'
  ]
};

const optionalEnvVars = [
  'OPENROUTER_API_KEY',
  'OPENROUTER_GPT_KEY',
  'PORT',
  'DATABASE_PASSWORD',
  'SUPABASE_DB_URL'
];

export function validateEnvironment() {
  const env = process.env.NODE_ENV || 'development';
  const required = requiredEnvVars[env] || requiredEnvVars.development;
  const missing = [];
  const warnings = [];

  // Check required variables
  for (const varName of required) {
    if (!process.env[varName]) {
      missing.push(varName);
    }
  }

  // Validate JWT_SECRET strength
  if (process.env.JWT_SECRET) {
    if (process.env.JWT_SECRET.length < 32) {
      warnings.push('JWT_SECRET should be at least 32 characters long for security');
    }
    if (process.env.JWT_SECRET === 'your-secret-key' || 
        process.env.JWT_SECRET === 'development-only-secret-change-in-production') {
      warnings.push('JWT_SECRET appears to be a default value - please change it');
    }
  }

  // Check if at least one AI provider is configured
  const hasOpenAI = !!process.env.OPENAI_API_KEY;
  const hasOpenRouter = !!(process.env.OPENROUTER_API_KEY || process.env.OPENROUTER_GPT_KEY);
  
  if (!hasOpenAI && !hasOpenRouter) {
    warnings.push('No AI provider configured. Set either OPENAI_API_KEY or OPENROUTER_API_KEY');
  }

  // Validate database configuration
  if (env === 'production') {
    if (!process.env.DATABASE_URL || !process.env.DATABASE_URL.startsWith('postgresql://')) {
      warnings.push('DATABASE_URL should be a PostgreSQL connection string in production');
    }
    
    if (process.env.DATABASE_URL && process.env.DATABASE_URL.includes('sqlite')) {
      warnings.push('SQLite detected in production DATABASE_URL - PostgreSQL is recommended');
    }
  }

  // Validate Supabase configuration
  if (process.env.SUPABASE_URL) {
    if (!process.env.SUPABASE_URL.startsWith('https://')) {
      warnings.push('SUPABASE_URL should start with https://');
    }
    if (!process.env.SUPABASE_URL.includes('.supabase.co')) {
      warnings.push('SUPABASE_URL appears to be invalid');
    }
  }

  // Validate FRONTEND_URL
  if (process.env.FRONTEND_URL) {
    try {
      new URL(process.env.FRONTEND_URL);
    } catch (error) {
      warnings.push('FRONTEND_URL is not a valid URL');
    }
  }

  // Report results
  const report = {
    environment: env,
    valid: missing.length === 0,
    missing,
    warnings,
    configured: {
      database: !!process.env.DATABASE_URL,
      supabase: !!process.env.SUPABASE_URL,
      openai: hasOpenAI,
      openrouter: hasOpenRouter,
      jwt: !!process.env.JWT_SECRET
    }
  };

  // Log the report
  console.log('🔍 Environment Variable Validation Report:');
  console.log('==========================================');
  console.log(`Environment: ${report.environment}`);
  console.log(`Status: ${report.valid ? '✅ Valid' : '❌ Invalid'}`);

  if (missing.length > 0) {
    console.error('\n❌ Missing Required Variables:');
    missing.forEach(varName => {
      console.error(`  - ${varName}`);
    });
  }

  if (warnings.length > 0) {
    console.warn('\n⚠️ Warnings:');
    warnings.forEach(warning => {
      console.warn(`  - ${warning}`);
    });
  }

  console.log('\n📋 Configuration Status:');
  Object.entries(report.configured).forEach(([key, value]) => {
    console.log(`  - ${key}: ${value ? '✅' : '❌'}`);
  });

  console.log('==========================================\n');

  // Throw error if critical variables are missing in production
  if (env === 'production' && missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }

  return report;
}

// Auto-validate on import
if (process.env.NODE_ENV !== 'test') {
  validateEnvironment();
}

export default validateEnvironment;