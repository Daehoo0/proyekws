const express = require('express');
const { createItinerary, inviteTraveler, createEvent, manageParticipants, deleteItinerary, managePayments } = require('../controllers/organizerController');
const { verifyToken } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/itinerary', verifyToken, createItinerary);
router.post('/invite', verifyToken, inviteTraveler);
router.post('/event', verifyToken, createEvent);
router.put('/participants', verifyToken, manageParticipants);
router.delete('/itinerary', verifyToken, deleteItinerary);
router.get('/payments', verifyToken, managePayments);

module.exports = router;
