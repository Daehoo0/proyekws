const express = require("express");
const app = express();
const database = require("./config/sequelize");
const {
  registerUser,
  loginUser,
  verifyToken,
  deleteUser,
  getAirport,
  recharge,
  findPlace,
  getEvents,
  addReview,
  getReviewsByUser,
  updateReview,
  updateGuideProfile,
} = require("./controllers/userController");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.post("/api/register", registerUser);
app.post("/api/login", loginUser);
app.delete("/api/delete", [verifyToken], deleteUser);
app.get("/api/getAirport", [verifyToken], getAirport);
app.post("/api/recharge", [verifyToken], recharge);
app.get("/api/findPlace", findPlace);
app.get("/api/events", [verifyToken], getEvents);
app.post('/api/reviews', [verifyToken], addReview); 
app.get('/api/reviews', [verifyToken], getReviewsByUser); 
app.put('/api/reviews', [verifyToken], updateReview); 
app.put('/api/guideProfile', [verifyToken], upload.single('photo'), updateGuideProfile); 

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
