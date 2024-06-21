const express = require('express');
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const errorHandler = require('./middlewares/errorHandler');
const authRoutes = require('./routes/authRoutes');
const travelerRoutes = require('./routes/travelerRoutes');
const guideRoutes = require('./routes/guideRoutes');
const organizerRoutes = require('./routes/organizerRoutes');

dotenv.config();

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.use('/api', authRoutes);
app.use('/api/travelers', travelerRoutes);
app.use('/api/guides', guideRoutes);
app.use('/api/organizers', organizerRoutes);

app.use(errorHandler);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
