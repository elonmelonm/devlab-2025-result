const express = require('express');
const fileUpload = require('express-fileupload');
// const swaggerUi = require('swagger-ui-express');
// const swaggerSpec = require('../config/swagger');
const batchesRoutes = require('./routes/batches.routes.js');

const app = express();

// Middleware
app.use(express.json());
app.use(fileUpload());

// Routes
app.use('/api/batches', batchesRoutes);

// Documentation Swagger
// app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

module.exports = app;