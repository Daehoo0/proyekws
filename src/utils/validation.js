const Joi = require('joi');

const validateSchema = (schema) => {
  return async (req, res, next) => {
    try {
      await schema.validateAsync(req.body);
      next();
    } catch (error) {
      res.status(400).json({ message: error.message });
    }
  };
};

module.exports = validateSchema;