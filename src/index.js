const express = require("express");
const app = express();
const database = require("./config/sequelize");
const bodyParser = require('body-parser');
const dotenv = require('dotenv');
const multer = require("./config/multer");
const authRoutes = require('./routes/authRoutes');
dotenv.config();

const {
  getAirport,
  recharge,
  findPlace,
  getEvents,
  addReview,
  getReviewsByUser,
  updateReview,
  updateGuideProfile,
  getDestination,
  deleteGuideProfile,
  registerForEvent,
  cancelEventRegistration,
} = require("./controllers/userController");

const { verifyToken } = require("./middlewares/authMiddleware"); 

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use('/api', authRoutes);

app.get("/api/getAirport", verifyToken, getAirport);
app.post("/api/recharge", verifyToken, recharge);
app.get("/api/findPlace", findPlace);
app.get("/api/events", verifyToken, getEvents);
app.post('/api/reviews', verifyToken, addReview); 
app.get('/api/reviews', verifyToken, getReviewsByUser); 
app.put('/api/reviews', verifyToken, updateReview); 
app.get("/api/destination", getDestination);
app.delete('/api/guideProfile', verifyToken, deleteGuideProfile);
app.post('/api/events/:event_id/register', verifyToken, registerForEvent);
app.delete('/api/events/:event_id/unregister', verifyToken, cancelEventRegistration);

app.put('/api/guideProfile', verifyToken, multer.single('photo'), updateGuideProfile);

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
