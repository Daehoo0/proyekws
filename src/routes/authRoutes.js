const express = require('express');
const { registerUser, loginUser, deleteUser } = require('../controllers/authController');
const { verifyToken } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/register', registerUser);
router.post('/login', loginUser);
router.delete('/delete', verifyToken, deleteUser);

module.exports = router;
