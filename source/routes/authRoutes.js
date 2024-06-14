const express = require('express');
const router = express.Router();
const { registerUser, loginUser, deleteUser } = require('../controllers/authController');
const { validateRegister, validateLogin } = require('../middlewares/validationMiddleware');

router.post('/register', validateRegister, registerUser);
router.post('/login', validateLogin, loginUser);
router.delete('/delete', deleteUser);

module.exports = router;
