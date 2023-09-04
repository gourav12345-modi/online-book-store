const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const swaggerSpec = require('./docs/swaggerConfig');
const swaggerUi = require("swagger-ui-express");
const userRoutes = require('./routes/userRoutes')

dotenv.config();
const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
connectDB();


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
app.use('/api/users', userRoutes)

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;