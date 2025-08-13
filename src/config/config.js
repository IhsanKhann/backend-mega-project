// src/config/config.js
export default {
  PORT: process.env.PORT || 3000,
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:3000',
  MONGO_URL: process.env.MONGO_URL || 'mongodb://localhost:27017/mydatabase',
};

