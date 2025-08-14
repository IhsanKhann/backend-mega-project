import dotenv from 'dotenv';
dotenv.config({
  path: './.env'
}); // ✅ must be first

import express from 'express';
import cors from 'cors';
import config from './config/config.js';
import connectDB from './db/connection.js';
import cookieParser from 'cookie-parser';
import { urlencoded } from 'express';

// import { upload } from './src/middlewares/multerMiddleare.js';

const app = express();
// in production, we use these middlwares: built in middlewares.
app.use(express.json({
  limit:"16kb",
}));
app.use(cors({
  origin: config.CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials:true,
}));
app.use(urlencoded({
  extended: true,
  limit: "16kb",
}));
app.use(express.static("public"))
app.use(cookieParser());

// db connection:
connectDB();

// user routes: industry standard.
import userRouter from './routes/userRoutes.js' ;
app.use('/api/users', userRouter);

// test request:
app.get("/",(req,res)=> {
  res.status(200).json({
    message: "backend is working..",
    status:true,
  })
})

app.listen(config.PORT, () => {
  console.log(`Server is running on http://localhost:${config.PORT}`);
});
