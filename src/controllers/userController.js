const User = require("../models/User");
const Review = require("../models/Review");
const multer = require('../config/multer');
const LocalGuide  = require('../models/LocalGuide');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const axios = require("axios");
const Joi = require("joi");

require("dotenv").config();

const checkUniqueUsername = async (username) => {
  const user = await User.findOne({ where: { username } });
  if (user) {
    throw new Error("Username already exists");
  }
};

// Register
const registerUser = async (req, res) => {
  try {
    const schema = Joi.object({
      username: Joi.string()
        .min(4)
        .max(20)
        .external(checkUniqueUsername)
        .required()
        .messages({
          "any.required": "Username wajib diisi",
          "string.min": "Username minimal terdiri dari 4 karakter",
          "string.max": "Username tidak boleh melebihi 20 karakter",
        }),

      name: Joi.string().min(4).max(50).required().messages({
        "any.required": "Nama wajib diisi",
        "string.min": "Nama minimal terdiri dari 4 karakter",
        "string.max": "Nama tidak boleh melebihi 50 karakter",
      }),

      password: Joi.string()
        .min(4)
        .max(20)
        .pattern(
          /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()])[a-zA-Z\d!@#$%^&*()]+$/
        )
        .required()
        .messages({
          "any.required": "Password wajib diisi",
          "string.min": "Password minimal terdiri dari 4 karakter",
          "string.max": "Password tidak boleh melebihi 20 karakter",
          "string.pattern.base":
            "Password harus mengandung setidaknya 1 huruf kecil, 1 huruf besar, 1 angka, dan 1 simbol",
        }),

      confirm_password: Joi.string()
        .min(4)
        .max(20)
        .valid(Joi.ref("password"))
        .required()
        .messages({
          "any.required": "Konfirmasi password wajib diisi",
          "any.only": "Password tidak sesuai",
        }),

      email: Joi.string().email().required().messages({
        "any.required": "Email wajib diisi",
      }),

      role: Joi.string()
        .valid("traveler", "organizer", "guide")
        .required()
        .messages({
          "any.required": "Peran wajib diisi",
          "any.only":
            "Peran tidak valid, harus 'traveler', 'organizer', atau 'guide'",
        }),
    });

    try {
      await schema.validateAsync(req.body);
    } catch (error) {
      return res.status(400).send({
        status: 400,
        body: {
          message: error.message,
        },
      });
    }

    let user = {
      ...req.body,
    };

    const maxId = await User.max("user_id");
    const urutan = maxId ? Number(maxId.substr(3, 3)) + 1 : 1;
    const user_id = `UID${urutan.toString().padStart(3, "0")}`;

    const hashedPassword = await bcrypt.hash(user.password, 10);
    const currentDate = moment().format("YYYY-MM-DD HH:mm:ss");

    await User.create({
      user_id,
      username: user.username,
      name: user.name,
      password: hashedPassword,
      email: user.email,
      role: user.role,
      balance: 0,
      api_hit: 0,
      createdAt: currentDate,
      updatedAt: currentDate,
    });

    return res.status(201).json({
      status: 201,
      body: {
        message: "User registered successfully",
        user: {
          user_id,
          username: user.username,
          name: user.name,
          email: user.email,
          role: user.role,
          balance: 0,
          api_hit: 0,
          createdAt: currentDate,
          updatedAt: currentDate,
        },
      },
    });
  } catch (error) {
    console.error("Error during user registration: ", error);
    return res.status(500).json({ error: "Internal server error" });
  }
};

// Login user with POST method
const loginUser = async (req, res) => {
  try {
    const schema = Joi.object({
      username: Joi.string().min(4).max(20).required().messages({
        "any.required": "Username is required",
        "string.empty": "Username is required",
        "string.min": "Username must be at least 4 characters long",
        "string.max": "Username must not exceed 20 characters",
      }),
      password: Joi.string().required().messages({
        "any.required": "Password is required",
        "string.empty": "Password is required",
      }),
    });
    // Validate the request body
    const validation = await schema.validateAsync(req.body, {
      abortEarly: false,
    });

    if (validation.error) {
      const errors = validation.error.details.map((err) => err.message);
      return res.status(400).json({ errors });
    }

    const { username, password } = req.body;

    // Find the user by username
    const user = await User.findOne({ where: { username } });
    if (!user) {
      return res.status(404).json({
        status: 404,
        body: {
          message: "User not found",
        },
      });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.user_id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(200).json({
      status: 200,
      body: {
        username: user.username,
        token,
      },
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const verifyToken = async (req, res, next) => {
  let token = req.header("x-auth-token");
  if (!token) {
    return res.status(401).send({ message: "Unauthorized" });
  }

  try {
    req.body.userdata = jwt.verify(token, process.env.JWT_SECRET);
  } catch (error) {
    return res.status(401).send({ message: "Invalid token" });
  }
  next();
};

const deleteUser = async (req, res) => {
  try {
    const { user_id } = req.body; // Assuming the ID is sent as 'user_id'
    let token = req.header('x-auth-token')

    let userdata = jwt.verify(token, process.env.JWT_SECRET)
    if(userdata.id != user_id){
        return res.status(403).json({ message: "Can't delete other user" });
    }

    const user = await User.findOne({ where: { user_id } });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    await User.destroy({
      where: { user_id },
    });

    res.status(200).json({ message: "User deleted successfully" });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: error.message });
  }
};

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

const addReview = async (req, res) => {
  try {
    const schema = Joi.object({
      rating: Joi.number().integer().min(1).max(5).required(),
      review: Joi.string().required(),
    });

    const validation = await schema.validateAsync(req.body);
    if (validation.error) {
      const errors = validation.error.details.map((err) => err.message);
      return res.status(400).json({ errors });
    }

    const { rating, review } = req.body;
    const { user_id } = req.body.userdata;

    const review_id = generateReviewId(); // Assuming you have a function to generate review_id

    const currentDate = moment().format("YYYY-MM-DD HH:mm:ss");

    const newReview = await Review.create({
      review_id,
      user_id,
      rating,
      review,
      created_at: currentDate,
      update_at: currentDate,
    });

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

// Helper function to generate review_id
function generateReviewId() {
  // Implement your own logic to generate review_id
  // For example, using a random string or a combination of timestamp and user_id
  return "REVID123"; // Example review_id
}

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
        console.error('Error updating profile: ', error);
        return res.status(500).json({ error: 'Internal server error' });
    }
};


module.exports = {
  registerUser,
  loginUser,
  verifyToken,
  deleteUser,
  getAirport,
  recharge,
  findPlace,
  getEvents,
  addReview,
  getReviewsByUser,
  updateGuideProfile,
};
