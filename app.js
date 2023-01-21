require('dotenv').config()
require('express-async-errors') // allows you to not use try/catch in all of the controllers

const express = require('express');
const app = express();

// rest of packages
const morgan = require('morgan');
const cookieParser = require('cookie-parser')
const fileUpload = require('express-fileupload')
const rateLimiter = require('express-rate-limit')
const helmet = require('helmet')
const xss = require('xss-clean')
const cors = require('cors')
const mongoSanitize = require('express-mongo-sanitize')

// database
const mongoose = require('mongoose')
const connectDB = require('./db/connect')

// routers
const authRouter = require('./routes/authRoutes')
const userRouter = require('./routes/userRoutes')
const productRouter = require('./routes/productRoutes')
const reviewRouter = require('./routes/reviewRoutes')
const orderRouter = require('./routes/orderRoutes')

// middleware
const notFoundMiddleware = require('./middleware/not-found');
const errorHandlerMiddleware = require('./middleware/error-handler');

app.set('trust proxy', 1)
app.use(rateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 60,
}))

app.use(helmet())
app.use(cors())
app.use(xss())
app.use(mongoSanitize())

// removed for production
// app.use(morgan('tiny'))
app.use(express.json());
app.use(cookieParser(process.env.JWT_SECRET)) // this allows us to sign the cookie

app.use(express.static('./public'))
app.use(fileUpload())

//removed for production
// app.get('/', (req, res) => {
//   res.send('e-commerce api')
// })

// app.get('/api/v1', (req, res) => {
//   console.log(req.signedCookies) // just req.cookies for cookies that are not signed
//   res.send('e-commerce api')
// })

app.use('/api/v1/auth', authRouter);
app.use('/api/v1/users', userRouter);
app.use('/api/v1/products', productRouter);
app.use('/api/v1/reviews', reviewRouter);
app.use('/api/v1/orders', orderRouter);

app.use(notFoundMiddleware)
app.use(errorHandlerMiddleware)

//fixes deprecation error that came up when using Mongoose.
mongoose.set('strictQuery', true)
const port = process.env.PORT || 5000;
const start = async () => {
  try {
    await connectDB(process.env.MONGO_URI)
    app.listen(port, () => {
      console.log(`Server is listening on port ${port}...`)
    })
  } catch (error) {
    console.log(error)
  }
}

start()