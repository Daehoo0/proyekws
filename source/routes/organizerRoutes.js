const express = require("express");
const {
  getDestination,
  inviteTraveler,
  createEvent,
  manageParticipants,
  getAllEvents,
  managePayments,
  deleteEvent,
  getEvents,
} = require("../controllers/organizerController");
const { verifyToken } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/fileUpload");
const router = express.Router();


router.post("/event", verifyToken, upload.single("photo"), createEvent);
router.get("/allevent", getAllEvents);
router.get("/event", verifyToken, getEvents);
router.delete("/event", verifyToken, deleteEvent);
router.get("/destination", getDestination);

module.exports = router;
