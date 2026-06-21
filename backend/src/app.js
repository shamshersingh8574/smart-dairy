const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const routes = require('./routes');
const errorHandler = require('./middlewares/error.middleware');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// REST API Routes
app.use('/api/v1', routes);

// Base route for API Health Check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Dairy Farm Management API is running normally.'
  });
});

// Global Error Handler Middleware
app.use(errorHandler);

module.exports = app;
