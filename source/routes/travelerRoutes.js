const express = require("express");
const {
  createProfile,
  searchTravelers,
  sendRequestToGuide,
  searchEvents,
  giveReview,
  makePayment,
  joinEvent,
  viewCart,
  processPayment,
  addToCart,
  deleteCart
} = require("../controllers/travelerController");
const { verifyToken } = require("../middlewares/authMiddleware");
const router = express.Router();

router.post('/cart',verifyToken, addToCart);
router.get('/cart',verifyToken ,viewCart);
router.delete('/cart',verifyToken ,deleteCart);
router.post('/cart/checkout',verifyToken, processPayment);

module.exports = router;
