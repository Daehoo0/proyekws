const express = require("express");
const app = express();
const database = require("./config/sequelize");
const bodyParser = require("body-parser");
const dotenv = require("dotenv");
const multer = require("./config/multer");
const authRoutes = require("./routes/authRoutes");
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

const { verifyToken, verifyAccess } = require("./middlewares/authMiddleware");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", authRoutes);

app.get("/api/getAirport", [verifyToken, verifyAccess], getAirport);
app.post("/api/recharge", [verifyToken], recharge);
app.get("/api/findPlace", findPlace);
app.get("/api/events", [verifyToken, verifyAccess], getEvents);
app.post("/api/reviews", [verifyToken, verifyAccess], addReview);
app.get("/api/reviews", [verifyToken, verifyAccess], getReviewsByUser);
app.put("/api/reviews", [verifyToken, verifyAccess], updateReview);
app.get("/api/destination", getDestination);
app.delete(
  "/api/guideProfile",
  [verifyToken, verifyAccess],
  deleteGuideProfile
);
app.post(
  "/api/events/:event_id/register",
  [verifyToken, verifyAccess],
  registerForEvent
);
app.delete(
  "/api/events/:event_id/unregister",
  [verifyToken, verifyAccess],
  cancelEventRegistration
);

app.put(
  "/api/guideProfile",
  [verifyToken, verifyAccess],
  multer.single("photo"),
  updateGuideProfile
);

const port = process.env.PORT || 3000;
const init = async () => {
  console.log("Testing connection to the database");
  try {
    await database.authenticate();
    console.log("Database successfully connected!");
    app.listen(port, function () {
      console.log(
        `Application is running at https://majestic-energy-426401-g7.et.r.appspot.com:${port}`
      );
    });
  } catch (error) {
    console.log(error);
  }
};

init();
