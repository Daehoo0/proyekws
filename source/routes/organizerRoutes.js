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

router.post("/invite", verifyToken, inviteTraveler);

router.post("/event", verifyToken, upload.single("photo"), createEvent);
router.get("/allevent", getAllEvents);
router.get("/event", verifyToken, getEvents);
router.delete("/event", verifyToken, deleteEvent);
// router.delete("/eventArray", verifyToken, deleteEventArray);
router.get("/destination", getDestination);

router.put("/participants", verifyToken, manageParticipants);
router.get("/payments", verifyToken, managePayments);

module.exports = router;
