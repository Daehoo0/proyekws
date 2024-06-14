const express = require('express');
const dotenv = require('dotenv');
const db = require('./config/sequelize');

dotenv.config();

const app = express();
app.use(express.json());

db.authenticate()
  .then(() => console.log('Database connected...'))
  .catch(err => console.log('Error: ' + err));

const authRoutes = require('./routes/authRoutes');
const eventRoutes = require('./routes/eventRoutes');
const guideRoutes = require('./routes/guideRoutes');
const organizerRoutes = require('./routes/organizerRoutes');
const paymentRoutes = require('./routes/paymentRoutes');
const travelerProfileRoutes = require('./routes/travelerProfileRoutes');
const travelerRoutes = require('./routes/travelerRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/events', eventRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/organizers', organizerRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/traveler-profiles', travelerProfileRoutes);
app.use('/api/travelers', travelerRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, console.log(`Server running on port ${PORT}`));
