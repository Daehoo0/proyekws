const { User } = require("../models");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const Joi = require("joi");
require('dotenv').config();

const moment = require("moment");

const registerSchema = Joi.object({
  username: Joi.string().min(3).max(30).required(),
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
  role: Joi.string().valid("traveler", "guide", "organizer").required(),
});

const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required(),
});

const topUpSchema = Joi.object({
  amount: Joi.number().integer().min(1).required(),
});

const generateUserId = async () => {
  const users = await User.findAll({
    attributes: ["user_id"],
    order: [["createdAt", "DESC"]],
  });

  if (users.length === 0) {
    return "UID001";
  }

  const lastUserId = users[0].user_id;
  const number = parseInt(lastUserId.replace("UID", ""), 10) + 1;
  return `UID${number.toString().padStart(3, "0")}`;
};

function formatRupiah(number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR' }).format(number).replace('IDR', 'Rp').replace(',00', ',00');
}

const register = async (req, res) => {
  try {
    const { username, email, password, role } = req.body;

    const { error } = registerSchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json({ status: 400, message: error.details[0].message });

    const userId = await generateUserId();
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      user_id: userId,
      username,
      email,
      password: hashedPassword,
      role,
    });

    return res.status(201).json({
      status: 201,
      message: "Pengguna berhasil dibuat",
      data: {
        user: {
          user_id: user.user_id,
          username: user.username,
          role: user.role,
          email: user.email,
          balance: user.balance,
          createdAt: moment(user.createdAt).format("YYYY-MM-DD HH:mm:ss"),
          updatedAt: moment(user.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const { error } = loginSchema.validate(req.body);
    if (error) return res.status(400).json({ status: 400, message: error.details[0].message });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ status: 401, message: 'Email atau password salah' });

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) return res.status(401).json({ status: 401, message: 'Email atau password salah' });

    const token = jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

    return res.status(200).json({ status: 200, email: user.email, token });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

const topUpBalance = async (req, res) => {
  try {
    console.log("Top-up request received:", req.body);
    
    const { amount } = req.body;

    const { error } = topUpSchema.validate(req.body);
    if (error) {
      console.log("Validation error:", error.details[0].message);
      return res.status(400).json({ status: 400, message: error.details[0].message });
    }

    console.log("Token payload:", req.user);
    const user = await User.findByPk(req.user.id);
    if (!user) {
      console.log("User not found");
      return res.status(404).json({ status: 404, message: 'User not found' });
    }

    user.balance += parseInt(amount, 10);
    await user.save();

    console.log("Balance updated successfully");

    return res.status(200).json({
      status: 200,
      message: 'Balance successfully topped up',
      data: {
        user: {
          user_id: user.user_id,
          username: user.username,
          role: user.role,
          email: user.email,
          balance: formatRupiah(user.balance),
          createdAt: moment(user.createdAt).format("YYYY-MM-DD HH:mm:ss"),
          updatedAt: moment(user.updatedAt).format("YYYY-MM-DD HH:mm:ss")
        }
      }
    });
  } catch (error) {
    console.log("Error occurred:", error.message);
    return res.status(500).json({ status: 500, message: error.message });
  }
};

module.exports = { register, login, topUpBalance};
