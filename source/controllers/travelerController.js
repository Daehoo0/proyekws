const {
  TravelerProfile,
  GuideRequest,
  Event,
  Review,
  Payment,
  User,
} = require("../models");
const Joi = require("joi");

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

module.exports = {
  createProfile,
  searchTravelers,
  sendRequestToGuide,
  searchEvents,
  giveReview,
  makePayment,
};
