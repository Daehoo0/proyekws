const express = require('express');
const { createProfile, searchTravelers, sendRequestToGuide, searchEvents, giveReview, makePayment, getDestination } = require('../controllers/travelerController');
const { verifyToken } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/profile', verifyToken, createProfile);
router.get('/search', verifyToken, searchTravelers);
router.post('/request', verifyToken, sendRequestToGuide);
router.get('/events', verifyToken, searchEvents);
router.post('/review', verifyToken, giveReview);
router.post('/payment', verifyToken, makePayment);
router.get('/destination', verifyToken, getDestination);

module.exports = router;
