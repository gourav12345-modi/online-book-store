const express = require('express')
const bodyParser = require('body-parser')
const dotenv = require('dotenv')
const connectDB = require('./config/db')
const swaggerSpec = require('./docs/swaggerConfig')
const swaggerUi = require("swagger-ui-express")
const userRoutes = require('./routes/userRoutes')
const bookRoutes = require('./routes/bookRoutes')
const cartRoutes = require('./routes/cartRoutes')
const orderRoutes = require('./routes/orderRoutes')
const errorMiddleware = require('./middleware/errorMiddleware')

dotenv.config()
const app = express()
app.use(bodyParser.json())

// Connect to MongoDB
if (process.env.NODE_ENV !== "test") {
  connectDB();
}


app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, { explorer: true }));
app.use('/api/users', userRoutes)
app.use('/api/books', bookRoutes)
app.use('/api/cart', cartRoutes)
app.use('/api/orders', orderRoutes)

app.use(errorMiddleware);

const port = process.env.PORT || 3000;
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});

module.exports = app;