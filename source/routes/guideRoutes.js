const express = require('express');
const { createGuideProfile, updateGuideProfile, deleteGuideProfile, acceptOrRejectRequest, getGuideRequests, managePayments } = require('../controllers/guideController');
const { verifyToken } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/profile', verifyToken, createGuideProfile);
router.put('/profile', verifyToken, updateGuideProfile);
router.delete('/profile', verifyToken, deleteGuideProfile);
router.post('/request', verifyToken, acceptOrRejectRequest);
router.get('/requests', verifyToken, getGuideRequests);
router.get('/payments', verifyToken, managePayments);

module.exports = router;
