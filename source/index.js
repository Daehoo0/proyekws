const express = require('express');
const dotenv = require('dotenv');
const db = require('./config/sequelize');

dotenv.config();

const app = express();

app.use(express.json());

// routes
const authRoutes = require('./routes/authRoutes');

app.use('/api/auth', authRoutes);

const PORT = process.env.PORT || 3000;

db.authenticate()
  .then(() => {
    console.log('Database connected...');
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  })
  .catch((err) => console.log('Error: ' + err));
