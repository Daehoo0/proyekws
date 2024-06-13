const User = require("../models/User");
const Review = require("../models/Review");
const multer = require('../config/multer');
const LocalGuide  = require('../models/LocalGuide');
const EventParticipant = require('../models/EventParticipant');
const Event = require('../models/Event');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const axios = require("axios");
const Joi = require("joi");

require("dotenv").config();

const getAirport = async (req, res) => {
  try {
    let { userdata } = req.body;
    if (!userdata.id) {
      return res.status(403).send({ message: "Not registered" });
    }

    const options = {
      method: "GET",
      url: "https://sky-scanner3.p.rapidapi.com/flights/airports",
      headers: {
        "x-rapidapi-key": process.env.RAPIDAPI_KEY,
        "x-rapidapi-host": process.env.RAPIDAPI_HOST,
      },
    };

    const response = await axios.request(options);
    return res.status(200).send(response.data);
  } catch (error) {
    console.error(error);
    if (error.response) {
      // The request was made, and the server responded with a status code
      // that falls out of the range of 2xx

      return res
        .status(error.response.status)
        .send({ message: error.response.data });
    } else if (error.request) {
      // The request was made, but no response was received
      return res
        .status(500)
        .send({ message: "No response received from the API" });
    } else {
      // Something happened in setting up the request that triggered an Error
      return res.status(500).send({ message: "Error fetching airport data" });
    }
  }
};

const recharge = async (req, res) => {
  try {
    let { userdata, money } = req.body;

    // Validate the recharge amount
    if ( isNaN(money) || !isFinite(money) || money <= 0) {
      return res.status(400).send({ message: "Invalid amount" });
    }

    // Find the user by user_id
    const user = await User.findOne({ where: { user_id: userdata.id } });
    if (!user) {
      return res.status(404).send({ message: "User not found" });
    }

    // Calculate new balance and update user's balance
    let newBalance = parseInt(user.balance) + parseInt(money);
    await User.update(
      { balance: newBalance },
      { where: { user_id: userdata.id } }
    );

    // Respond with success message and current balance
    return res.status(200).send({ message: "Saldomu saat ini: " + newBalance });

  } catch (error) {
    console.error(error);

    // Handle specific errors
    if (error.name === "JsonWebTokenError") {
      return res.status(403).send({ message: "Invalid token" });
    }

    // Handle other errors
    return res.status(500).send({ message: "Server error" });
  }
};

const findPlace = async (req, res) => {
  try {
    const clientId = process.env.CLIENT_ID;
    console.log(clientId);
    const clientSecret = process.env.CLIENT_SECRET;
    console.log(clientSecret);

    // Check if clientId and clientSecret are defined
    if (!clientId || !clientSecret) {
      throw new Error("Client ID or Client Secret is not defined");
    }

    const endpoint = "https://api.foursquare.com/v2/venues/search";

    const params = {
      client_id: clientId,
      client_secret: clientSecret,
      near: "Jakarta, Indonesia", // Example: searching near Jakarta
      radius: 5000, // 5km radius
      query: "restaurant", // Example: searching for restaurants
    };

    const response = await axios.get(endpoint, { params });

    // Send the response data back to the client
    res.json(response.data);
  } catch (error) {
    console.error("Error:", error);
    // Send an error response back to the client if something goes wrong
    res.status(500).json({ error: "Internal Server Error" });
  }
};

const getEvents = async (req, res) => {
  try {
    const { userdata } = req.body;
    if (!userdata.id) {
      return res.status(403).send({ message: "Not registered" });
    }

    const schema = Joi.object({
      location: Joi.string().optional(),
      category: Joi.string().optional(),
      event_time: Joi.date().optional(),
    });

    const validation = await schema.validateAsync(req.query);
    if (validation.error) {
      const errors = validation.error.details.map((err) => err.message);
      return res.status(400).json({ errors });
    }

    const { location, category, event_time } = req.query;
    const whereClause = {};

    if (location) {
      whereClause.location = location;
    }
    if (category) {
      whereClause.category = category;
    }
    if (event_time) {
      whereClause.event_time = event_time;
    }

    const events = await Event.findAll({ where: whereClause });

    res.status(200).json({
      status: 200,
      body: events,
    });
  } catch (error) {
    console.error("Error fetching events: ", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

async function generateReviewId() {
  const maxId = await Review.max("review_id");
  const urutan = maxId ? Number(maxId.substr(3, 3)) + 1 : 1;
  const review_id = `REV${urutan.toString().padStart(3, "0")}`;
  return review_id;
}

const addReview = async (req, res) => {
  try {
    const schema = Joi.object({
      rating: Joi.number().integer().min(1).max(5).required(),
      review: Joi.string().required(),
    });

    // Validate the request body
    await schema.validateAsync(req.body, { allowUnknown: true });

    const { rating, review } = req.body;
    const user_id = req.body.userdata.id;

    const review_id = await generateReviewId(); // Await the async function

    const currentDate = moment().format("YYYY-MM-DD HH:mm:ss");

    // Create a new review
    const newReview = await Review.create({
      review_id,
      user_id,
      rating,
      review,
      createdAt: currentDate,
      updatedAt: currentDate,
    });

    // Respond with success
    res.status(201).json({
      status: 201,
      body: {
        message: "Review added successfully",
        review: newReview,
      },
    });
  } catch (error) {
    console.error("Error adding review: ", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const getReviewsByUser = async (req, res) => {
  // Define the Joi schema for validation
  const schema = Joi.object({
    user_id: Joi.string().required().messages({
      "any.required": "User ID is required",
      "string.empty": "User ID is required",
    }),
  });

  // Validate the request body
  try {
    await schema.validateAsync(req.body);
  } catch (error) {
    return res.status(400).json({
      status: 400,
      body: {
        message: error.message,
      },
    });
  }

  const { user_id } = req.body;

  try {
    const reviews = await Review.findAll({ where: { user_id } });
    res.status(200).json({
      status: 200,
      body: reviews,
    });
  } catch (error) {
    console.error("Error fetching reviews: ", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

const findReview = async (ulasan_id) => {
  const review = await Review.findOne({ where: { review_id: ulasan_id } });
  if (!review) {
    throw new Error("Review not found");
  }
};

const updateReview = async (req, res) => {
  // Define the Joi schema for validation
  const schema = Joi.object({
    ulasan_id: Joi.string().external(findReview).required(),
    rating: Joi.number().integer().min(1).max(5).required(),
    review: Joi.string().required(),
  });

  // Validate the request body
  try {
    await schema.validateAsync(req.body, { allowUnknown: true });
  } catch (error) {
    return res.status(400).json({
      status: 400,
      body: {
        message: error.message,
      },
    });
  }

  const { ulasan_id, rating, review } = req.body;

  try {
    // Update the review
    const [updated] = await Review.update(
      { rating: rating, review: review },
      { where: { review_id: ulasan_id } }
    );

    // Check if any review was updated
    if (updated) {
      const updatedReview = await Review.findOne({ where: { review_id: ulasan_id } });
      return res.status(200).json({
        status: 200,
        body: updatedReview,
      });
    }

    // If no review was found to update
    return res.status(404).json({
      status: 404,
      body: {
        message: "Review not found",
      },
    });
  } catch (error) {
    console.error("Error updating review: ", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

const updateGuideProfile = async (req, res) => {
  const schema = Joi.object({
      location: Joi.string().required().messages({
          'any.required': 'Location is required',
      }),
      experience: Joi.string().required().messages({
          'any.required': 'Experience is required',
      }),
      rate: Joi.number().required().messages({
          'any.required': 'Rate is required',
          'number.base': 'Rate must be a number',
      }),
      userdata: Joi.object({
          id: Joi.number().required()
      }).required()
  });

  try {
      await schema.validateAsync(req.body);

      const { location, experience, rate } = req.body;
      const user_id = req.body.userdata.id;

      const guide = await LocalGuide.findOne({ where: { user_id } });
      if (!guide) {
          return res.status(404).send({ message: 'Guide not found' });
      }

      let photo;
      if (req.file) {
          photo = req.file.path;
      }

      await LocalGuide.update(
          { location, experience, rate, photo },
          { where: { user_id } }
      );

      res.status(200).json({
          status: 200,
          body: {
              message: 'Profile updated successfully',
          },
      });
  } catch (error) {
      if (error.isJoi) {
          return res.status(400).json({
              status: 400,
              error: error.details.map(detail => detail.message).join(', ')
          });
      }
      console.error('Error updating profile: ', error);
      return res.status(500).json({ error: 'Internal server error' });
  }
};

const getDestination = async (req, res) => {
  const fetch = (await import('node-fetch')).default;
  const url = `https://api.geoapify.com/v2/places?categories=tourism&filter=circle:112.7415854,-7.2477332,10000&bias=proximity:112.7415854,-7.2477332&lang=en&limit=20&apiKey=aaf5dcf528bb422f87b422c837630612`;
  try {
    const response = await fetch(url);
    const data = await response.json();
  //   res.send(data);

    const places = data.features.map(feature => {
          return {
              name: feature.properties.name,
              country: feature.properties.country,
              country_code: feature.properties.country_code,
              region: feature.properties.region,
              state: feature.properties.state,
              city: feature.properties.city,
              village: feature.properties.village,
              postcode: feature.properties.postcode,
              district: feature.properties.district,
              neighbourhood: feature.properties.neighbourhood,
              street: feature.properties.street,
              formatted: feature.properties.formatted,
              address_line1: feature.properties.address_line1,
              address_line2: feature.properties.address_line2,
              geometry: feature.geometry
          };
      });

      res.json(places);

  } catch (error) {
    res.status(500).send('Error fetching data');
  }
}

const deleteGuideProfile = async (req, res) => {
  const schema = Joi.object({
    user_id: Joi.string().required().messages({
      'any.required': 'User ID is required',
    }),
  });

  try {
    await schema.validateAsync(req.body);

    const user_id = req.body.userdata.id;

    const guide = await LocalGuide.findOne({ where: { user_id } });
    if (!guide) {
      return res.status(404).json({ message: 'Guide profile not found' });
    }

    await LocalGuide.destroy({ where: { user_id } });

    res.status(200).json({
      status: 200,
      body: {
        message: 'Guide profile deleted successfully',
      },
    });
  } catch (error) {
    console.error('Error deleting guide profile: ', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
};

async function generateRSVPId() {
  const maxId = await Review.max("review_id");
  const urutan = maxId ? Number(maxId.substr(3, 3)) + 1 : 1;
  const review_id = `REV${urutan.toString().padStart(3, "0")}`;
  return review_id;
}

const addRSVP = async (req,res) =>{
  try {
    const schema = Joi.object({
      RSVP: Joi.string().external(find).required(),
    });

    // Validate the request body
    await schema.validateAsync(req.body, { allowUnknown: true });

    const { rating, review } = req.body;
    const user_id = req.body.userdata.id;

    const review_id = await generateReviewId(); // Await the async function

    const currentDate = moment().format("YYYY-MM-DD HH:mm:ss");

    // Create a new review
    const newReview = await Review.create({
      review_id,
      user_id,
      rating,
      review,
      createdAt: currentDate,
      updatedAt: currentDate,
    });

    // Respond with success
    res.status(201).json({
      status: 201,
      body: {
        message: "Review added successfully",
        review: newReview,
      },
    });
  } catch (error) {
    console.error("Error adding review: ", error);
    return res.status(500).json({ error: "Internal server error" });
  }
}

const registerForEvent = async (req, res) => {
  const schema = Joi.object({
      event_id: Joi.string().required().messages({
          'any.required': 'Event ID is required',
      }),
  });

  try {
      await schema.validateAsync(req.params);

      const { event_id } = req.params;
      const user_id = req.body.userdata.id;

      const user = await User.findOne({ where: { user_id } });

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      if (user.role !== 'traveler') {
          return res.status(403).json({ message: 'Only travelers can register for events' });
      }

      const maxId = await EventParticipant.max('event_participant_id');
      const urutan = maxId ? Number(maxId.substr(3, 3)) + 1 : 1;
      const event_participant_id = `EPID${urutan.toString().padStart(3, '0')}`;

      await EventParticipant.create({
          event_participant_id,
          event_id,
          user_id,
          created_at: new Date(),
          update_at: new Date(),
      });

      return res.status(201).json({
          status: 201,
          body: {
              message: 'User registered for event successfully',
              participant: {
                  event_participant_id,
                  event_id,
                  user_id,
              }
          }
      });
  } catch (error) {
      console.error('Error registering for event: ', error);
      return res.status(500).json({ error: 'Internal server error' });
  }
};

const cancelEventRegistration = async (req, res) => {
  const schema = Joi.object({
      event_id: Joi.string().required().messages({
          'any.required': 'Event ID is required',
      }),
  });

  try {
      await schema.validateAsync(req.params);

      const { event_id } = req.params;
      const user_id = req.body.userdata.id;

      const user = await User.findOne({ where: { user_id } });

      if (!user) {
          return res.status(404).json({ message: 'User not found' });
      }

      const participant = await EventParticipant.findOne({
          where: {
              event_id,
              user_id,
          },
      });

      if (!participant) {
          return res.status(404).json({ message: 'Participation not found' });
      }

      await EventParticipant.destroy({
          where: {
              event_id,
              user_id,
          },
      });

      return res.status(200).json({
          status: 200,
          body: {
              message: 'User unregistered from event successfully',
          },
      });
  } catch (error) {
      console.error('Error unregistering from event: ', error);
      return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
  getAirport,
  recharge,
  findPlace,
  getEvents,
  addReview,
  getReviewsByUser,
  updateReview,
  updateGuideProfile,
  getDestination,
  deleteGuideProfile,
  registerForEvent,
  cancelEventRegistration,
};