const { DataTypes } = require('sequelize');
const db = require('../config/sequelize');
const User = require('./User');
const Event = require('./Event');

const EventParticipant = db.define('EventParticipant', {
    event_participant_id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    event_id: {
        type: DataTypes.STRING,
        references: {
            model: Event,
            key: 'event_id'
        }
    },
    user_id: {
        type: DataTypes.STRING,
        references: {
            model: User,
            key: 'user_id'
        }
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
    tableName: 'event_participants',
    timestamps: false
});

module.exports = EventParticipant;
