const express = require('express');
const {  getEventById, getAllEvent, getAllorganizer, getAllTravelers } = require('../controllers/guideController');
const { verifyToken } = require('../middlewares/authMiddleware');
const router = express.Router();

router.get('/searcing/id', verifyToken, getEventById);
router.get('/searcing', verifyToken, getAllEvent);
router.get('/traveller', verifyToken, getAllTravelers);
router.get('/organizer', verifyToken, getAllorganizer);

module.exports = router;