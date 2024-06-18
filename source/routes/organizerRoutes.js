const express = require("express");
const {
  getDestination,
  createItinerary,
  inviteTraveler,
  createEvent,
  manageParticipants,
  deleteItinerary,
  managePayments,
} = require("../controllers/organizerController");
const { verifyToken } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/fileUpload");
const router = express.Router();

router.post("/itinerary", verifyToken, createItinerary);
router.post("/invite", verifyToken, inviteTraveler);
router.post("/event", verifyToken, upload.single("photo"), createEvent);
router.put("/participants", verifyToken, manageParticipants);
router.delete("/itinerary", verifyToken, deleteItinerary);
router.get("/payments", verifyToken, managePayments);
router.get("/destination", getDestination);

module.exports = router;
