// src/index.js
import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import config from './src/config/config.js';
import connectDB from './src/db/connection.js';
// import userRoutes from './routes/userRoutes.js';

dotenv.config({ path: './.env.sample' });

const app = express();

app.use(express.json());
app.use(cors({
  origin: config.CLIENT_URL,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
}));

connectDB();

app.get("/",(req,res)=> {
  // res.send({
  //   message: "hello world"
  // })

  res.json({
    message: "backend is working.."
  })

  res.status(200).json({
    message: "backend is working..",
    status:true,
  })
})
// app.use('/api/users', userRoutes);

app.listen(config.PORT, () => {
  console.log(`Server is running on http://localhost:${config.PORT}`);
});
