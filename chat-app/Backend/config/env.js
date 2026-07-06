const requiredEnvVars = [
  'MONGODB_URI',
  'JWT_SECRET',
  'CLOUDINARY_CLOUD_NAME',
  'CLOUDINARY_API_KEY',
  'CLOUDINARY_API_SECRET',
];

function getAllowedOrigins() {
  if (process.env.FRONTEND_URL) {
    return process.env.FRONTEND_URL.split(',').map((origin) => origin.trim()).filter(Boolean);
  }

  return ['http://localhost:5173', 'http://localhost:3000', 'http://localhost:4173'];
}

function validateEnv() {
  // Check for missing environment variables and log an error if any are missing, then exit the process to prevent the application from running with incomplete configuration.
  const missing = requiredEnvVars.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    process.exit(1);
  }

  if (process.env.NODE_ENV === 'production' && process.env.JWT_SECRET.length < 32) {
    console.error('JWT_SECRET must be at least 32 characters in production.');
    process.exit(1);
  }
}

module.exports = { getAllowedOrigins, validateEnv };
