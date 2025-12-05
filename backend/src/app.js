const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
// const swaggerUi = require('swagger-ui-express');
// const swaggerSpec = require('../config/swagger');
const batchesRoutes = require('./routes/batches.routes.js');

const app = express();

// Configuration CORS
const corsOptions = {
  origin: ['http://localhost:8080', 'http://127.0.0.1:8080'],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Middleware
app.use(cors(corsOptions));
app.use(express.json());
app.use(fileUpload());

// Routes
app.use('/api/batches', batchesRoutes);

// Documentation Swagger
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = app;