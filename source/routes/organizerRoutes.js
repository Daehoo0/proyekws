const express = require("express");
const {
  getDestination,
  inviteTraveler,
  createEvent,
  manageParticipants,
  getAllEvents,
  managePayments,
  getEvents,
} = require("../controllers/organizerController");
const { verifyToken } = require("../middlewares/authMiddleware");
const upload = require("../middlewares/fileUpload");
const router = express.Router();

router.post("/invite", verifyToken, inviteTraveler);
router.post("/event", verifyToken, upload.single("photo"), createEvent);
router.get("/allevent", getAllEvents);
router.get("/event", verifyToken, getEvents);
router.put("/participants", verifyToken, manageParticipants);
router.get("/payments", verifyToken, managePayments);
router.get("/destination", getDestination);

module.exports = router;
