const express = require("express");
const {
  register,
  login,
  topUpBalance,
  updateUser,
  getAllUsers,
} = require("../controllers/authController");
const { verifyToken } = require("../middlewares/authMiddleware");

const router = express.Router();

router.post("/register", register);
router.post("/login", login);
router.post("/topup", verifyToken, topUpBalance);
router.put("/update", verifyToken, updateUser);
router.get("/users", getAllUsers);

module.exports = router;
