const express = require('express');
const { register, login, topUpBalance } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/topup', verifyToken, topUpBalance);

module.exports = router;