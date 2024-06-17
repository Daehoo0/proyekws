const express = require('express');
const { addReview, getReviewsByUser, updateReview } = require('../controllers/reviewController');
const { verifyToken, verifyAccess } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/add', [verifyToken, verifyAccess], addReview); 
router.get('/find', [verifyToken, verifyAccess], getReviewsByUser); 
router.put('/update', [verifyToken, verifyAccess], updateReview);

module.exports = router;