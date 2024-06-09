const { DataTypes } = require('sequelize');
const db = require('../config/sequelize');
const User = require('./User');
const LocalGuide = require('./LocalGuide');

const GuideRequest = db.define('GuideRequest', {
    request_id: {
        type: DataTypes.STRING,
        primaryKey: true
    },
    traveler_id: {
        type: DataTypes.STRING,
        references: {
            model: User,
            key: 'user_id'
        }
    },
    guide_id: {
        type: DataTypes.STRING,
        references: {
            model: LocalGuide,
            key: 'guide_id'
        }
    },
    request_date: {
        type: DataTypes.DATE
    },
    message: {
        type: DataTypes.TEXT
    },
    status: {
        type: DataTypes.STRING
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
    tableName: 'guide_requests',
    timestamps: false
});

module.exports = GuideRequest;
