const express = require("express");
const app = express();
const database = require("./config/sequelize");
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const multer = require("./config/multer");
const authRoutes = require('./routes/authRoutes');
const reviewRoutes = require('./routes/reviewRoutes')
const eventRoutes = require("./routes/eventRoutes")
dotenv.config();

const {
  getAirport,
  recharge,
  findPlace,
  updateGuideProfile,
  getDestination,
  deleteGuideProfile,
} = require("./controllers/userController");

const { verifyToken, verifyAccess } = require("./middlewares/authMiddleware"); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', authRoutes);
app.use('/api/review', reviewRoutes)
app.use('/api/events', eventRoutes)

app.get("/api/getAirport", [verifyToken, verifyAccess], getAirport);
app.post("/api/recharge", [verifyToken], recharge);
app.get("/api/findPlace", findPlace);
app.get("/api/destination", getDestination);
app.delete('/api/guideProfile', [verifyToken, verifyAccess], deleteGuideProfile);
app.put('/api/guideProfile', [verifyToken, verifyAccess], multer.single('photo'), updateGuideProfile);

const port = 3000;
const init = async () => {
  console.log("Testing connection to the database");
  try {
    await database.authenticate();
    console.log("Database successfully connected!");
    app.listen(port, function () {
      console.log(`Application is running at http://localhost:${port}`);
    });
  } catch (error) {
    console.log(error);
  }
};

init();
