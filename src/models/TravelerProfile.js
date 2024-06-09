const { DataTypes } = require('sequelize');
const db = require('../config/sequelize');
const User = require('./User');

const TravelerProfile = db.define('TravelerProfile', {
    traveler_id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    user_id: {
        type: DataTypes.STRING,
        references: {
            model: User,
            key: 'user_id'
        }
    },
    destination: {
        type: DataTypes.STRING
    },
    travel_time: {
        type: DataTypes.DATE
    },
    interests: {
        type: DataTypes.TEXT
    },
    created_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    update_at: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'traveler_profiles',
    timestamps: false
});

module.exports = TravelerProfile;
