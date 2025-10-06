const express = require('express');
const cors = require('cors');
const { initializeDatabase } = require('./config/database');
const quizRoutes = require('./routes/quizRoutes');
const errorHandler = require('./middleware/errorHandler');
const swaggerUi = require('swagger-ui-express');
const swaggerSpecs = require('./config/swagger');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Swagger Documentation
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpecs));

// Routes
app.get("/", (req, res) => {
  res.json({ status: 'OK', message: 'Quiz API is running' });
});

app.use('/api/quizzes', quizRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Quiz API is running' });
});

// Error handling middleware
app.use(errorHandler);

// Initialize database and start server
initializeDatabase().then(() => {
  app.listen(PORT, () => {
    console.log(`Quiz API server running on port ${PORT}`);
  });
}).catch(err => {
  console.error('Failed to initialize database:', err);
  process.exit(1);
});

module.exports = app;