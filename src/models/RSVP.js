const { DataTypes } = require('sequelize');
const db = require('../config/sequelize');
const User = require('./User');
const Event = require('./Event');

const RSVP = db.define('RSVP', {
    rsvp_id: {
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
    event_id: {
        type: DataTypes.STRING,
        references: {
            model: Event,
            key: 'event_id'
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
    tableName: 'rsvps',
    timestamps: false
});

module.exports = RSVP;
