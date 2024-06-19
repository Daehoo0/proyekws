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

async function generateEventId() {
    const maxId = await Event.max("event_id");
    const urutan = maxId ? Number(maxId.substr(3, 3)) + 1 : 1;
    return `EVE${urutan.toString().padStart(3, "0")}`;
}

const addEvent = async (req, res) => {
    try {
        const { userdata } = req.body;
        if (!userdata || !userdata.id) {
            return res.status(403).send({ message: "Not registered" });
        }

        const schema = Joi.object({
            name: Joi.string().required(),
            category: Joi.string().required(),
            location: Joi.string().required(),
            event_time: Joi.date().required(),
            description: Joi.string().required(),
        });

        await schema.validateAsync(req.body, { allowUnknown: true });

        const { name, category, location, event_time, description } = req.body;
        const organizer = userdata.id;
        const event_id = await generateEventId();
        const currentDate = new Date();

        const newEvent = await Event.create({
            event_id,
            organizer_id: organizer,
            event_name: name,
            category,
            location,
            event_time,
            description,
            photo: "sample.png",
            createdAt: currentDate,
            updatedAt: currentDate,
        });

        res.status(201).json({
            status: 201,
            body: {
                message: "Event added successfully",
                event: newEvent,
            },
        });
    } catch (error) {
        if (error.isJoi) {
            const errors = error.details.map((err) => err.message);
            return res.status(400).json({ errors });
        }
        console.error("Error adding events: ", error);
        return res.status(500).json({ error: "Internal server error" });
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

        await schema.validateAsync(req.query);

        const { location, category, event_time } = req.query;
        const whereClause = {};

        if (location) whereClause.location = location;
        if (category) whereClause.category = category;
        if (event_time) whereClause.event_time = event_time;

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
                },
            },
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
    addEvent,
    getEvents,
    registerForEvent,
    cancelEventRegistration,
};
