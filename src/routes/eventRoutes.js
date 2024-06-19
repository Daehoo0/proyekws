const express = require('express');
const { addEvent, getEvents, registerForEvent, cancelEventRegistration } = require('../controllers/eventController');
const { verifyToken, verifyAccess } = require('../middlewares/authMiddleware');
const router = express.Router();

router.post('/add', [verifyToken, verifyAccess], addEvent); 
router.get('/find', [verifyToken, verifyAccess], getEvents); 
router.post('/:event_id/register', [verifyToken, verifyAccess], registerForEvent);
router.delete('/:event_id/unregister', [verifyToken, verifyAccess], cancelEventRegistration);

module.exports = router;