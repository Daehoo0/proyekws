const { Event, EventParticipant, Payment } = require("../models");
const Joi = require("joi");
const moment = require("moment");
const axios = require("axios");
const { v4: uuidv4 } = require('uuid');
require("dotenv").config();

const destinations = [];

// ===== Schema =====
const eventSchema = Joi.object({
  place_id: Joi.string().required(),
  category: Joi.string().optional(),
  event_time: Joi.date().required(),
  description: Joi.string().optional(),
  price: Joi.number().required()
});

const participantSchema = Joi.object({
  event_id: Joi.string().required(),
  participant_id: Joi.string().required(),
  status: Joi.string().valid("invited", "joined", "declined").required(),
});

const generateEventId = async () => {
  const events = await Event.findAll({
    attributes: ["event_id"],
    order: [["createdAt", "DESC"]],
  });

  if (events.length === 0) {
    return "E001";
  }

  const lastEventId = events[0].event_id;
  const number = parseInt(lastEventId.replace("E", ""), 10) + 1;
  return `E${number.toString().padStart(3, "0")}`;
};

// ===== Controllers =====
const getDestination = async (req, res) => {
  const apiKey = process.env.GEOAPIFY_API_KEY;
  const limit = 20;
  const placeId = process.env.PLACE;

  const url2 = `https://api.geoapify.com/v2/places?categories=tourism,building.tourism&filter=place:${placeId}&limit=${limit}&apiKey=${apiKey}`;

  try {
    const response = await axios.get(url2);
    const data = response.data;

    const places = data.features.map((feature, index) => ({
      place_id: `PL${String(index + 1).padStart(3, "0")}`, // PL001, PL002, etc.
      // name: feature.properties.name,
      // country: feature.properties.country,
      // country_code: feature.properties.country_code,
      // region: feature.properties.region,
      // state: feature.properties.state,
      // city: feature.properties.city,
      village: feature.properties.village,
      // postcode: feature.properties.postcode,
      district: feature.properties.district,
      // neighbourhood: feature.properties.neighbourhood,
      street: feature.properties.street,
      formatted: feature.properties.formatted,
      address_line1: feature.properties.address_line1,
      address_line2: feature.properties.address_line2,
      raw: feature.properties.datasource.raw,
    }));

    // Store places in memory
    destinations.length = 0; 
    destinations.push(...places);

    res.status(200).json({
      status: 200,
      data: places,
    });
  } catch (error) {
    res.status(500).json({
      status: 500,
      message: "Error fetching data",
      error: error.message,
    });
  }
};

const createEvent = async (req, res) => {
  try {
    if (req.user.role !== "organizer") {
      return res
        .status(403)
        .json({ status: 403, message: "Unauthorized access" });
    }

    const { error } = eventSchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json({ status: 400, message: error.details[0].message });

    const photo = req.file ? req.file.filename : null;

    const apiKey = process.env.GEOAPIFY_API_KEY;
    // const apiKey = dde4de0051c34511a2d00ff8f1b0abba;
    const radius = 10000;
    const limit = 20;
    const latitude = 112.7415854;
    const longitude = -7.2477332;

    const url = `https://api.geoapify.com/v2/places?categories=tourism,building.tourism&filter=circle:${latitude},${longitude},${radius}&bias=proximity:${latitude},${longitude}&lang=en&limit=${limit}&apiKey=${apiKey}`;


    const response = await axios.get(url);
    const feature = response.data.features[0];

    const location = {
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

    const eventId = await generateEventId();

    const event = await Event.create({
      event_id: eventId,
      organizer_id: req.user.user_id,
      event_name: req.body.event_name,
      category: req.body.category,
      location: location.formatted,
      event_time: req.body.event_time,
      description: req.body.description,
      photo: photo,
    });

    return res.status(201).json({
      status: 201,
      message: "Acara berhasil dibuat",
      data: {
        // event,
        event_id: event.event_id,
        organizer_id: event.organizer_id,
        event_name: event.event_name,
        category: event.category,
        location: event.location,
        event_time: moment(event.event_time).format("YYYY-MM-DD HH:mm:ss"),
        description: event.description,
        photo: event.photo,
        createdAt: moment(event.createdAt).format("YYYY-MM-DD HH:mm:ss"),
        updatedAt: moment(event.updatedAt).format("YYYY-MM-DD HH:mm:ss"),
      },
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

const inviteTraveler = async (req, res) => {
  try {
    const { event_id, participant_id, status } = req.body;

    const participant = await EventParticipant.create({
      event_id,
      user_id: participant_id,
      status,
    });

    return res.status(201).json({
      status: 201,
      message: "Traveler berhasil diundang",
      data: participant,
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};



const manageParticipants = async (req, res) => {
  try {
    const { error } = participantSchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json({ status: 400, message: error.details[0].message });

    const participant = await EventParticipant.update(
      { status: req.body.status },
      {
        where: {
          event_id: req.body.event_id,
          user_id: req.body.participant_id,
        },
      }
    );

    return res.status(200).json({
      status: 200,
      message: "Status peserta berhasil diperbarui",
      data: participant,
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

const deleteItinerary = async (req, res) => {
  try {
    const { event_id } = req.body;

    await Event.destroy({
      where: { event_id },
    });

    return res.status(200).json({
      status: 200,
      message: "Rencana perjalanan berhasil dihapus",
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

const managePayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { organizer_id: req.user.user_id },
    });

    return res.status(200).json({ status: 200, data: payments });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};



module.exports = {
  getDestination,
  inviteTraveler,
  createEvent,
  manageParticipants,
  managePayments,
};
