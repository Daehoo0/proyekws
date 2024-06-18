const { Event, EventParticipant, Payment } = require("../models");
const Joi = require("joi");
const moment = require("moment");

const itinerarySchema = Joi.object({
  user_id: Joi.string().required(),
  destination: Joi.string().required(),
  time: Joi.date().required(),
  details: Joi.string().required(),
});
const eventSchema = Joi.object({
  event_name: Joi.string().required(),
  category: Joi.string().optional(),
  location: Joi.string().required(),
  event_time: Joi.date().required(),
  description: Joi.string().optional()
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

const createItinerary = async (req, res) => {
  try {
    const { error } = itinerarySchema.validate(req.body);
    if (error)
      return res
        .status(400)
        .json({ status: 400, message: error.details[0].message });

    const itinerary = await Event.create(req.body);

    return res.status(201).json({
      status: 201,
      message: "Rencana perjalanan berhasil dibuat",
      data: itinerary,
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

const createEvent = async (req, res) => {
  try {
    if (req.user.role !== 'organizer') {
      return res.status(403).json({ status: 403, message: 'Unauthorized access' });
    }

    const { error } = eventSchema.validate(req.body);
    if (error) return res.status(400).json({ status: 400, message: error.details[0].message });

    const photo = req.file ? req.file.filename : null;

    const eventId = await generateEventId();

    const event = await Event.create({
      event_id: eventId,
      organizer_id: req.user.user_id,
      event_name: req.body.event_name,
      category: req.body.category,
      location: req.body.location,
      event_time: req.body.event_time,
      description: req.body.description,
      photo: photo,
    });

    return res.status(201).json({
      status: 201,
      message: 'Acara berhasil dibuat',
      data: {
        event_id: event.event_id,
        organizer_id: event.organizer_id,
        event_name: event.event_name,
        category: event.category,
        location: event.location,
        event_time: moment(event.event_time).format('YYYY-MM-DD HH:mm:ss'),
        description: event.description,
        photo: event.photo,
        createdAt: moment(event.createdAt).format('YYYY-MM-DD HH:mm:ss'),
        updatedAt: moment(event.updatedAt).format('YYYY-MM-DD HH:mm:ss'),
      },
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
  createItinerary,
  inviteTraveler,
  createEvent,
  manageParticipants,
  deleteItinerary,
  managePayments,
};
