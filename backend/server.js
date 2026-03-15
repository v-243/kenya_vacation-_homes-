const express = require('express');
const dotenv = require('dotenv');
const cors = require('cors');
const { connectDB } = require('./db');
const houseRoutes = require('./houseRoutes');
const apiRoutes = require('./routes/api');

dotenv.config();

connectDB();

const app = express();

app.use(cors());
app.use(express.json());

// Note: /api/houses and /api routes are now consolidated in apiRoutes
// houseRoutes is deprecated and should not be used
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
  res.send('Welcome to the House Kenya App Backend!');
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
});