require('dotenv').config();
const express = require('express');
const { sequelize } = require('./app/models');
const apiRoutes = require('./app/api/routes');
const errorHandler = require('./app/middleware/error-handler');
const { NotFound } = require('./app/api/errors/common-errors');

/**
 * Validates the required environment variables for the application.
 * Should be called before starting the server to fail fast if configuration is missing.
 */
function validateEnvironment() {
  const requiredVars = ['JWT_SECRET'];
  const missing = requiredVars.filter(varName => !process.env[varName]);

  if (missing.length > 0) {
    console.error('Missing required environment variables:', missing.join(', '));
    console.error('Please set JWT_SECRET in your .env file');
    process.exit(1);
  }

  // Validate JWT_SECRET is not empty
  if (!process.env.JWT_SECRET || !process.env.JWT_SECRET.trim()) {
    console.error('JWT_SECRET cannot be empty');
    process.exit(1);
  }
}

const app = express();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api/v1/', apiRoutes);

// 404 handler for unmatched routes
app.use((req, res, next) => {
  next(new NotFound({ path: req.path, method: req.method }));
});

app.use(errorHandler);

async function start() {
  try {
    await sequelize.sync();
    console.log('Database Connected');
  } catch (err) {
    console.error('Database connection error:', err);
    process.exit(1);
  }

  const PORT = process.env.APP_PORT || process.env.PORT || 3000;
  return app.listen(Number(PORT), () => {
    console.log(`App is running on port ${PORT}`);
  });

}

if (require.main === module) {
  validateEnvironment();
  start();
}

module.exports = { app, start };
