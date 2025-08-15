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

// give me access to the cookies in backend. Cookies probably i made in the auth/userController for login and signin. I would want the access in the middleware for verification of the token in the cookie coming back from frontend for verification upon a login.

// db connection
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
