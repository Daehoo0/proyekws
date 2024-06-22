const Sequelize = require('sequelize');
const db = require('../config/sequelize');

const User = require('./User'); // Ensure this matches the actual filename
const TravelerProfile = require('./TravelerProfile'); // Ensure this matches the actual filename
const Guide = require('./Guide'); // Ensure this matches the actual filename
const Event = require('./Event'); // Ensure this matches the actual filename
const EventParticipant = require('./EventParticipant'); // Ensure this matches the actual filename
const GuideRequest = require('./GuideRequest'); // Ensure this matches the actual filename
const Review = require('./Review'); // Ensure this matches the actual filename
const Payment = require('./Payment'); // Ensure this matches the actual filename

// Define relationships
User.hasOne(TravelerProfile, { foreignKey: 'user_id' });
TravelerProfile.belongsTo(User, { foreignKey: 'user_id' });

User.hasOne(Guide, { foreignKey: 'user_id' });
Guide.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Event, { foreignKey: 'organizer_id' });
Event.belongsTo(User, { foreignKey: 'organizer_id' });

Event.hasMany(EventParticipant, { foreignKey: 'event_id' });
EventParticipant.belongsTo(Event, { foreignKey: 'event_id' });

User.hasMany(EventParticipant, { foreignKey: 'user_id' });
EventParticipant.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(GuideRequest, { foreignKey: 'traveler_id' });
GuideRequest.belongsTo(User, { foreignKey: 'traveler_id' });

Guide.hasMany(GuideRequest, { foreignKey: 'guide_id' });
GuideRequest.belongsTo(Guide, { foreignKey: 'guide_id' });

User.hasMany(Review, { foreignKey: 'user_id' });
Review.belongsTo(User, { foreignKey: 'user_id' });

User.hasMany(Payment, { foreignKey: 'user_id' });
Payment.belongsTo(User, { foreignKey: 'user_id' });

Guide.hasMany(Payment, { foreignKey: 'guide_id' });
Payment.belongsTo(Guide, { foreignKey: 'guide_id' });

Event.hasMany(Payment, { foreignKey: 'event_id' });
Payment.belongsTo(Event, { foreignKey: 'event_id' });

module.exports = {
  db,
  User,
  TravelerProfile,
  Guide,
  Event,
  EventParticipant,
  GuideRequest,
  Review,
  Payment,
};
