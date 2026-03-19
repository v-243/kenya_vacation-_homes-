const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const apiRoutes = require('./routes/api');

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use('/api', apiRoutes);

const PORT = process.env.PORT || 5000;

// For Vercel serverless functions
module.exports = app;

// For local development
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}

// Define a route for the root path
app.get('/', (req, res) => {
  res.status(200).json({
    ok: true,
    service: 'house-kenya-backend',
    message: 'Backend is running',
  });
});

app.get('/api/health', (req, res) => {
  res.status(200).json({
    ok: true,
    service: 'house-kenya-backend',
    env: process.env.NODE_ENV || 'development',
  });
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});
