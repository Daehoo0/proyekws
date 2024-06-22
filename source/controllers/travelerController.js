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


const createProfileSchema = Joi.object({
  user_id: Joi.string().required(),
  destination: Joi.string().required(),
  travel_time: Joi.date().required(),
  interests: Joi.string().required(),
});

const requestSchema = Joi.object({
  guide_id: Joi.string().required(),
  date: Joi.date().required(),
  message: Joi.string().required(),
});

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

const createProfile = async (req, res) => {
  try {
    const { error } = createProfileSchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json({ status: 400, message: error.details[0].message });

    const profile = await TravelerProfile.create(req.body);

    return res.status(201).json({
      status: 201,
      message: "Profil perjalanan berhasil dibuat",
      data: {
        profile: {
          profile_id: profile.profile_id,
          user_id: profile.user_id,
          destination: profile.destination,
          travel_time: profile.travel_time,
          interests: profile.interests,
          createdAt: profile.createdAt,
          updatedAt: profile.updatedAt,
        },
      },
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

const searchTravelers = async (req, res) => {
  const { destination, travel_time, interests } = req.query;

  try {
    const travelers = await TravelerProfile.findAll({
      where: {
        destination,
        travel_time,
        interests,
      },
      include: [User],
    });

    return res.status(200).json({ status: 200, data: travelers });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

const sendRequestToGuide = async (req, res) => {
  try {
    const { error } = requestSchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json({ status: 400, message: error.details[0].message });

    const guideRequest = await GuideRequest.create(req.body);

    return res.status(201).json({
      status: 201,
      message: "Permintaan berhasil dikirim",
      data: guideRequest,
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

const searchEvents = async (req, res) => {
  const { destination, category, time } = req.query;

  try {
    const events = await Event.findAll({
      where: {
        destination,
        category,
        event_time: time,
      },
    });

    return res.status(200).json({ status: 200, data: events });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

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

const joinEvent = async (req, res) => {
  try {
    const { event_id } = req.body;

    // Verifikasi bahwa event ada
    const event = await Event.findByPk(event_id);
    if (!event) {
      return res.status(404).json({ status: 404, message: "Event not found" });
    }

    // Verifikasi bahwa user tidak mencoba untuk bergabung ke event mereka sendiri
    if (event.organizer_id === req.user.user_id) {
      return res.status(400).json({ status: 400, message: "You cannot join your own event" });
    }

    // Tambahkan pengguna sebagai peserta event
    const participant = await EventParticipant.create({
      event_id: event_id,
      user_id: req.user.user_id,
      status: 'joined',
    });

    return res.status(201).json({
      status: 201,
      message: "Successfully joined the event",
      data: {
        event_id: participant.event_id,
        user_id: participant.user_id,
        status: participant.status,
      },
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
    const { error } = processPaymentSchema.validate(req.body);
    if (error) return res.status(400).json({ status: 400, message: error.details[0].message });

    const user = await User.findByPk(req.user.user_id);
    const events = await Event.findAll({
      where: { event_id: req.body.event_ids },
    });

    const totalAmount = events.reduce((sum, event) => sum + event.balance, 0);

    if (user.balance < totalAmount) {
      return res.status(400).json({ status: 400, message: "Insufficient balance" });
    }

    await Promise.all(events.map(async (event) => {
      await EventParticipant.create({
        event_id: event.event_id,
        user_id: req.user.user_id,
        status: 'joined',
      });

      await Cart.update({ status: 'completed' }, { where: { user_id: req.user.user_id, event_id: event.event_id } });
    }));

    user.balance -= totalAmount;
    await user.save();

    await Payment.create({
      amount: totalAmount,
      user_id: req.user.user_id,
    });

    return res.status(200).json({ status: 200, message: "Payment successful" });
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
};
