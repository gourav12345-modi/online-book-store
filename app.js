const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const connectDB = require('./config/db');
const swaggerSpec = require('./docs/swaggerConfig');
const swaggerUi = require("swagger-ui-express");
const userRoutes = require('./routes/userRoutes')
const errorMiddleware = require('./middleware/errorMiddleware')

dotenv.config({ path: `.env.${process.env.NODE_ENV}` })
const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
if (process.env.NODE_ENV !== "test")
connectDB();


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
app.use('/api/users', userRoutes)
app.use(errorMiddleware);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;