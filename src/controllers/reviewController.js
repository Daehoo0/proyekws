const User = require("../models/User");
const Review = require("../models/Review");
const multer = require('../config/multer');
const LocalGuide = require('../models/LocalGuide');
const EventParticipant = require('../models/EventParticipant');
const Event = require('../models/Event');
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const axios = require("axios");
const Joi = require("joi");

require("dotenv").config();

async function generateReviewId() {
    const maxId = await Review.max("review_id");
    const urutan = maxId ? Number(maxId.substr(3, 3)) + 1 : 1;
    return `REV${urutan.toString().padStart(3, "0")}`;
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
            body: { message: error.message },
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
            body: { message: error.message },
        });
    }

    const { ulasan_id, rating, review } = req.body;

    try {
        // Update the review
        const [updated] = await Review.update(
            { rating, review },
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
            body: { message: "Review not found" },
        });
    } catch (error) {
        console.error("Error updating review: ", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    addReview,
    getReviewsByUser,
    updateReview,
};
