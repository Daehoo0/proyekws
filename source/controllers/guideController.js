const { Guide, GuideRequest, Payment } = require('../models');
const Joi = require('joi');

const guideProfileSchema = Joi.object({
  user_id: Joi.string().required(),
  location: Joi.string().required(),
  experience: Joi.string().required(),
  rate: Joi.number().required(),
  photo: Joi.string().optional(),
});

const requestStatusSchema = Joi.object({
  request_id: Joi.string().required(),
  status: Joi.string().valid('pending', 'accepted', 'rejected').required(),
});

const createGuideProfile = async (req, res) => {
  try {
    const { error } = guideProfileSchema.validate(req.body);
    if (error) return res.status(400).json({ status: 400, message: error.details[0].message });

    const guide = await Guide.create(req.body);

    return res.status(201).json({
      status: 201,
      message: 'Profil guide berhasil dibuat',
      data: guide
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

const updateGuideProfile = async (req, res) => {
  try {
    const { error } = guideProfileSchema.validate(req.body);
    if (error) return res.status(400).json({ status: 400, message: error.details[0].message });

    const guide = await Guide.update(req.body, {
      where: { user_id: req.body.user_id }
    });

    return res.status(200).json({
      status: 200,
      message: 'Profil guide berhasil diperbarui',
      data: guide
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

const deleteGuideProfile = async (req, res) => {
  try {
    const { user_id } = req.body;

    await Guide.destroy({
      where: { user_id }
    });

    return res.status(200).json({
      status: 200,
      message: 'Profil guide berhasil dihapus'
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

const acceptOrRejectRequest = async (req, res) => {
  try {
    const { error } = requestStatusSchema.validate(req.body);
    if (error) return res.status(400).json({ status: 400, message: error.details[0].message });

    const request = await GuideRequest.update(
      { status: req.body.status },
      { where: { request_id: req.body.request_id } }
    );

    return res.status(200).json({
      status: 200,
      message: 'Status permintaan berhasil diperbarui',
      data: request
    });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

const getGuideRequests = async (req, res) => {
  try {
    const requests = await GuideRequest.findAll({
      where: { guide_id: req.user.id }
    });

    return res.status(200).json({ status: 200, data: requests });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

const managePayments = async (req, res) => {
  try {
    const payments = await Payment.findAll({
      where: { guide_id: req.user.id }
    });

    return res.status(200).json({ status: 200, data: payments });
  } catch (error) {
    return res.status(500).json({ status: 500, message: error.message });
  }
};

module.exports = { createGuideProfile, updateGuideProfile, deleteGuideProfile, acceptOrRejectRequest, getGuideRequests, managePayments };
