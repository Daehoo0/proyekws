const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const axios = require('axios');
require('dotenv').config();

// Register a new user
const registerUser = async (req, res) => {
    try {
        const { username, name, password, email, role } = req.body;

        // Check if the user already exists
        const existingUser = await User.findOne({ where: { username } });
        if (existingUser) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await User.create({
            user_id: 'U' + Date.now(), // Generate a unique ID
            username,
            name,
            password: hashedPassword,
            email,
            role,
            balance: 0,
            api_hit: 0,
            created_at: new Date(),
            updated_at: new Date() // Corrected 'update_at' to 'updated_at'
        });

        res.status(201).json(user);
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};

// Login user with POST method
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        // Find the user by username
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '1h' });

        res.status(200).json({ token });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    let token = req.header('x-auth-token');
    if (!token) {
        return res.status(403).send({ message: 'No Authentication Found' });
    }

    try {
        let userdata = jwt.verify(token, process.env.JWT_SECRET);

        const { user_id } = req.body; // Assuming the ID is sent as 'user_id'

        const user = await User.findOne({ where: { user_id } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.destroy({
            where: { user_id }
        });

        res.status(200).json({ message: 'User deleted successfully' });
    } catch (error) {
        console.error(error);
        res.status(400).json({ message: error.message });
    }
};

const getAirport = async (req, res) => {
    let token = req.header("x-auth-token");
    if (!token) {
        return res.status(403).send({ message: "Unauthorized" });
    }

    try {
        let userdata = jwt.verify(token, process.env.JWT_SECRET);
        if (!userdata.id) {
            return res.status(403).send({ message: "Not registered" });
        }

        const options = {
            method: 'GET',
            url: 'https://sky-scanner3.p.rapidapi.com/flights/airports',
            headers: {
                'x-rapidapi-key': process.env.RAPIDAPI_KEY,
                'x-rapidapi-host': 'sky-scanner3.p.rapidapi.com'
            }
        };

        const response = await axios.request(options);
        return res.status(200).send(response.data); 
    } catch (error) {
        console.error(error);

        if (error.response) {
            // The request was made, and the server responded with a status code
            // that falls out of the range of 2xx
            return res.status(error.response.status).send({ message: error.response.data });
        } else if (error.request) {
            // The request was made, but no response was received
            return res.status(500).send({ message: "No response received from the API" });
        } else {
            // Something happened in setting up the request that triggered an Error
            return res.status(500).send({ message: "Error fetching airport data" });
        }
    }
};

const recharge = async (req, res) => {
    let token = req.header("x-auth-token");
    if (!token) {
        return res.status(403).send({ message: "Unauthorized" });
    }

    try {
        let userdata = jwt.verify(token, process.env.JWT_SECRET);
        if (!userdata.id) {
            return res.status(403).send({ message: "Not registered" });
        }

        let { money } = req.body;
        if (typeof money !== 'number' || money <= 0) {
            return res.status(400).send({ message: "Invalid amount" });
        }

        const user = await User.findOne({ where: { user_id: userdata.user_id } });
        if (!user) {
            return res.status(404).send({ message: "User not found" });
        }

        let newBalance = user.balance + money;

        await User.update({ balance: newBalance }, { where: { user_id: userdata.user_id } });

        return res.status(200).send({ message: "Saldomu saat ini: " + newBalance });
    } catch (error) {
        console.error(error);

        if (error.name === 'JsonWebTokenError') {
            return res.status(403).send({ message: "Invalid token" });
        }

        return res.status(500).send({ message: "Server error" });
    }
};

module.exports = {
    registerUser,
    loginUser,
    deleteUser,
    getAirport,
    recharge
};
