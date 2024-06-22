const {
  TravelerProfile,
  GuideRequest,
  Event,
  Review,
  Payment,
  EventParticipant,
  User,
  Cart,
} = require("../models");
const Joi = require("joi");
const { v4: uuidv4 } = require('uuid');


const reviewSchema = Joi.object({
  user_id: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
  review: Joi.string().required(),
});

const paymentSchema = Joi.object({
  amount: Joi.number().required(),
  guide_id: Joi.string().optional(),
  event_id: Joi.string().optional(),
});

const addToCartSchema = Joi.object({
  event_id: Joi.string().required(),
});

const deleteCartSchema = Joi.object({
  event_id: Joi.string().required(),
});

const processPaymentSchema = Joi.object({
  event_ids: Joi.array().items(Joi.string().required()).required(),
});



const giveReview = async (req, res) => {
  try {
    const { error } = reviewSchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json({ status: 400, message: error.details[0].message });

    const review = await Review.create(req.body);

    return res.status(201).json({
      status: 201,
      message: "Ulasan berhasil diberikan",
      data: review,
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

const makePayment = async (req, res) => {
  try {
    const { error } = paymentSchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json({ status: 400, message: error.details[0].message });

    const payment = await Payment.create(req.body);

    return res.status(201).json({
      status: 201,
      message: "Pembayaran berhasil",
      data: payment,
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

const viewCart = async (req, res) => {
  try {
    const cartItems = await Cart.findAll({
      where: { user_id: req.user.user_id, status: 'pending' },
      include: [Event],
    });

    return res.status(200).json({ status: 200, data: cartItems });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

const processPayment = async (req, res) => {
  try {
    // Mendapatkan semua item dari Cart yang dimiliki oleh user yang login
    const carts = await Cart.findAll({
      where: { user_id: req.user.user_id, status: 'pending' }, // ambil yang status pending saja jika ada
      include: [{ model: Event }], // sertakan model Event untuk mengambil detail event
    });

    if (!carts || carts.length === 0) {
      return res.status(400).json({ status: 400, message: "No pending events found in cart" });
    }

    // Menghitung total jumlah yang harus dibayar
    const totalAmount = carts.reduce((sum, cartItem) => sum + cartItem.Event.balance, 0);

    // Memeriksa saldo user
    const user = await User.findByPk(req.user.user_id);
    if (!user) {
      return res.status(400).json({ status: 400, message: "User not found" });
    }

    if (user.balance < totalAmount) {
      return res.status(400).json({ status: 400, message: "Insufficient balance" });
    }

    // Inisialisasi transaksi Sequelize
    const sequelize = require('../config/sequelize'); // Sesuaikan path sesuai dengan konfigurasi Anda
    const transaction = await sequelize.transaction();

    try {
      // Update carts to 'completed'
      await Cart.update({ status: 'completed' }, { 
        where: { 
          user_id: req.user.user_id, 
          status: 'pending' 
        },
        transaction, // pass transaction object for atomicity
      });

      // Deduct balance from user
      user.balance -= totalAmount;
      await user.save({ transaction });

      // Menambahkan saldo ke organizer untuk setiap event
      await Promise.all(carts.map(async (cartItem) => {
        const event = cartItem.Event;

        // Misalkan event memiliki field organizer_id untuk menentukan organizer yang terkait
        const organizer = await User.findOne({
          where: {
            user_id: event.organizer_id,
            role: 'organizer'
          }
        });

        if (organizer) {
          organizer.balance += event.balance;
          await organizer.save({ transaction });
        }
      }));

      // Commit transaction if all queries succeed
      await transaction.commit();

      // Record payment (if needed)

      return res.status(200).json({ status: 200, message: "Payment successful" });
    } catch (error) {
      // Rollback transaction if any error occurs
      await transaction.rollback();
      throw error; // re-throw the error to be caught by the outer catch block
    }
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

const addToCart = async (req, res) => {
  try {
    const { error } = addToCartSchema.validate(req.body);
    if (error) return res.status(400).json({ status: 400, message: error.details[0].message });

    const event = await Event.findByPk(req.body.event_id);
    if (!event) {
      return res.status(404).json({ status: 404, message: "Event not found" });
    }

    await Cart.create({
      cart_id: uuidv4(),
      user_id: req.user.user_id,
      event_id: req.body.event_id,
    });

    return res.status(201).json({ status: 201, message: "Event added to cart" });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

const deleteCart = async (req, res) => {
  try {
    const { error } = deleteCartSchema.validate(req.body);
    if (error) return res.status(400).json({ status: 400, message: error.details[0].message });

    const cartItem = await Cart.findOne({
      where: {
        user_id: req.user.user_id,
        event_id: req.body.event_id,
        status: 'pending',
      },
    });

    if (!cartItem) {
      return res.status(404).json({ status: 404, message: "Item not found in cart" });
    }

    await cartItem.destroy();

    return res.status(200).json({ status: 200, message: "Item removed from cart" });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};


module.exports = {
  giveReview,
  makePayment,
  viewCart,
  processPayment,
  addToCart,
  deleteCart
};
