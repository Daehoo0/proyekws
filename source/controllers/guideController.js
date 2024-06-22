const { Review, Event, User } = require("../models");
const Joi = require("joi");
const Axios = require("axios");

const reviewSchema = Joi.object({
  travelerId: Joi.string().required(),
  rating: Joi.number().integer().min(1).max(5).required(),
  review: Joi.string().required()
});

const createTravelerReview = async (req, res) => {
  const { travelerId, rating, review } = req.body;

  // Validate request body
  const { error } = reviewSchema.validate({ travelerId, rating, review });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }
 const coun = "REV" + Review.count() + 1
  try {
    const newReview = await Review.create({
      review_id: coun,
      user_id: travelerId,
      rating,
      review,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    return res.status(201).json(newReview);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while creating the review' });
  }
};


const id_event = Joi.string().required();

const getEventById = async (req, res) => {
  const { eventId } = req.body;

  // Validate the eventId
  const { error } = id_event.validate(eventId);
  
  if (error) {
    return res.status(400).json({ message: 'Invalid event ID' });
  }

  try {
    const event = await Event.findByPk(eventId);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    return res.status(200).json(event);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while fetching the event' });
  }
};

const getAllEvent = async (req, res) => {

  try {
    const event = await Event.findAll();

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    return res.status(200).json(event);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while fetching the event' });
  }
};

const reviewUpdateSchema = Joi.object({
  rating: Joi.number().integer().min(1).max(5).required(),
  review: Joi.string().required()
});

const updateReviewById = async (req, res) => {
  const { reviewId } = req.params;
  const { rating, review } = req.body;

  // Validate request body
  const { error } = reviewUpdateSchema.validate({ rating, review });

  if (error) {
    return res.status(400).json({ message: error.details[0].message });
  }

  try {
    const existingReview = await Review.findByPk(reviewId);

    if (!existingReview) {
      return res.status(404).json({ message: 'Review not found' });
    }

    // Ensure that the user making the request is the owner of the review
    if (existingReview.user_id !== req.user.id) {
      return res.status(403).json({ message: 'You are not authorized to update this review' });
    }

    existingReview.rating = rating;
    existingReview.review = review;
    existingReview.updatedAt = new Date();

    await existingReview.save();

    return res.status(200).json(existingReview);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while updating the review' });
  }
};

const getAllTravelers = async (req, res) => {
  try {
    const travelers = await User.findAll({
      where: { role: 'traveler' }
    });

    return res.status(200).json(travelers);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while fetching the travelers' });
  }
};

const getAllorganizer = async (req, res) => {
  try {
    const organizer = await User.findAll({
      where: { role: 'organizer' }
    });

    return res.status(200).json(organizer);
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'An error occurred while fetching the organizer' });
  }
};

module.exports = {
  createTravelerReview,
  getAllEvent,
  getEventById,
  updateReviewById,
  getAllTravelers,
  getAllorganizer,
};
