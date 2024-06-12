const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const moment = require('moment');
const axios = require('axios');
const Joi = require('joi');

require('dotenv').config();

const checkUniqueUsername = async (username) => {
    const user = await User.findOne({ where: { username } });
    if (user) {
        throw new Error('Username already exists');
    }
};

// Register 
const registerUser = async (req, res) => {
    try {
        const schema = Joi.object({
            username: Joi.string().min(4).max(20).external(checkUniqueUsername).required()
                .messages({
                    "any.required": "Username wajib diisi",
                    "string.min": "Username minimal terdiri dari 4 karakter",
                    "string.max": "Username tidak boleh melebihi 20 karakter",
                }),

            name: Joi.string().min(4).max(50).required()
                .messages({
                    "any.required": "Nama wajib diisi",
                    "string.min": "Nama minimal terdiri dari 4 karakter",
                    "string.max": "Nama tidak boleh melebihi 50 karakter",
                }),

            password: Joi.string().min(4).max(20).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()])[a-zA-Z\d!@#$%^&*()]+$/).required()
                .messages({
                    "any.required": "Password wajib diisi",
                    "string.min": "Password minimal terdiri dari 4 karakter",
                    "string.max": "Password tidak boleh melebihi 20 karakter",
                    "string.pattern.base": "Password harus mengandung setidaknya 1 huruf kecil, 1 huruf besar, 1 angka, dan 1 simbol",
                }),

            confirm_password: Joi.string().min(4).max(20).valid(Joi.ref("password")).required()
                .messages({
                    "any.required": "Konfirmasi password wajib diisi",
                    "any.only": "Password tidak sesuai",
                }),

            email: Joi.string().email().required()
                .messages({
                    "any.required": "Email wajib diisi",
                }),

            role: Joi.string().valid("traveler", "organizer", "guide").required()
                .messages({
                    "any.required": "Peran wajib diisi",
                    "any.only": "Peran tidak valid, harus 'traveler', 'organizer', atau 'guide'",
                }),
        });

        try {
            await schema.validateAsync(req.body);
        } catch (error) {
            return res.status(400).send({ 
                status: 400,
                body: {
                    message: error.message 
                }
            });
        }

        let user = {
            ...req.body,
        };

        const maxId = await User.max("user_id");
        const urutan = maxId ? Number(maxId.substr(3, 3)) + 1 : 1;
        const user_id = `UID${urutan.toString().padStart(3, "0")}`;

        const hashedPassword = await bcrypt.hash(user.password, 10);
        const currentDate = moment().format('YYYY-MM-DD HH:mm:ss');  

        await User.create({
            user_id,
            username: user.username,
            name: user.name,
            password: hashedPassword,
            email: user.email,
            role: user.role,
            balance: 0,
            api_hit: 0,
            createdAt: currentDate,
            updatedAt: currentDate,  
        });

        return res.status(201).json({
            status: 201,
            body: {
                message: "User registered successfully",
                user: {
                    user_id,
                    username: user.username,
                    name: user.name, 
                    email: user.email,
                    role: user.role,
                    balance: 0,
                    api_hit: 0,
                    createdAt: currentDate,
                    updatedAt: currentDate,
                }
            }
        });
    } catch (error) {
        console.error("Error during user registration: ", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

// Login user with POST method
const loginUser = async (req, res) => {
    try {
        const schema = Joi.object({
            username: Joi.string().min(4).max(20).required().messages({
                "any.required": "Username is required",
                "string.empty": "Username is required",
                "string.min": "Username must be at least 4 characters long",
                "string.max": "Username must not exceed 20 characters",
            }),
            password: Joi.string().required().messages({
                "any.required": "Password is required",
                "string.empty": "Password is required",
            }),
        });

        // Validate the request body
        const validation = await schema.validateAsync(req.body, { abortEarly: false });

        if (validation.error) {
            const errors = validation.error.details.map((err) => err.message);
            return res.status(400).json({ errors });
        }

        const { username, password } = req.body;

        // Find the user by username
        const user = await User.findOne({ where: { username } });
        if (!user) {
            return res.status(400).json({ 
                status: 400,
                body: {
                    message: 'User not found' 
                }
            });
        }

        // Compare passwords
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(401).json({ 
                message: 'Invalid credentials' 
            });
        }

        // Generate JWT token
        const token = jwt.sign({ id: user.user_id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });

        res.status(200).json({ 
            status: 200,
            body: {
                username: user.username,
                token 
            }
        });
    } catch (error) {
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

    // try {
    //     let userdata = jwt.verify(token, process.env.JWT_SECRET);
    //     if (!userdata.id) {
    //         return res.status(403).send({ message: "Not registered" });
    //     }

    //     const options = {
    //         method: 'GET',
    //         url: 'https://sky-scanner3.p.rapidapi.com/flights/airports',
    //         headers: {
    //             'x-rapidapi-key': process.env.RAPIDAPI_KEY,
    //             'x-rapidapi-host': 'sky-scanner3.p.rapidapi.com'
    //         }
    //     };

    //     const response = await axios.request(options);
    //     return res.status(200).send(response.data); 
    // } catch (error) {
    //     console.error(error);

    //     if (error.response) {
    //         // The request was made, and the server responded with a status code
    //         // that falls out of the range of 2xx
    //         return res.status(error.response.status).send({ message: error.response.data });
    //     } else if (error.request) {
    //         // The request was made, but no response was received
    //         return res.status(500).send({ message: "No response received from the API" });
    //     } else {
    //         // Something happened in setting up the request that triggered an Error
    //         return res.status(500).send({ message: "Error fetching airport data" });
    //     }
    // }
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

const test = async (req,res) =>{

    const options = {
    method: 'GET',
    url: 'https://tripadvisor16.p.rapidapi.com/api/v1/test',
    headers: {
        'x-rapidapi-key': '2865e812acmshff540095f57d8f1p1e65b1jsn051cd0912cae',
        'x-rapidapi-host': 'tripadvisor16.p.rapidapi.com'
    }
    };

    try {
        const response = await axios.request(options);
        console.log(response.data);
        return res.status(200).send(response.data)
    } catch (error) {
        console.error(error);
    }
}

const findPlace = async (req, res) => {
    try {
        const clientId = process.env.CLIENT_ID;
        console.log(clientId)        
        const clientSecret = process.env.CLIENT_SECRET;
        console.log(clientSecret)

        // Check if clientId and clientSecret are defined
        if (!clientId || !clientSecret) {
            throw new Error('Client ID or Client Secret is not defined');
        }

        const endpoint = 'https://api.foursquare.com/v2/venues/search';

        const params = {
            client_id: clientId,
            client_secret: clientSecret,
            near: 'Jakarta, Indonesia', // Example: searching near Jakarta
            radius: 5000, // 5km radius
            query: 'restaurant' // Example: searching for restaurants
        };

        const response = await axios.get(endpoint, { params });

        // Send the response data back to the client
        res.json(response.data);
    } catch (error) {
        console.error('Error:', error);
        // Send an error response back to the client if something goes wrong
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

const getEvents = async (req, res) => {
    const token = req.header("x-auth-token");
    if (!token) {
        return res.status(403).send({ message: "Unauthorized" });
    }

    try {
        const userdata = jwt.verify(token, process.env.JWT_SECRET);
        if (!userdata.id) {
            return res.status(403).send({ message: "Not registered" });
        }

        const schema = Joi.object({
            location: Joi.string().optional(),
            category: Joi.string().optional(),
            event_time: Joi.date().optional(),
        });

        const validation = await schema.validateAsync(req.query);
        if (validation.error) {
            const errors = validation.error.details.map((err) => err.message);
            return res.status(400).json({ errors });
        }

        const { location, category, event_time } = req.query;
        const whereClause = {};

        if (location) {
            whereClause.location = location;
        }
        if (category) {
            whereClause.category = category;
        }
        if (event_time) {
            whereClause.event_time = event_time;
        }

        const events = await Event.findAll({ where: whereClause });

        res.status(200).json({
            status: 200,
            body: events,
        });
    } catch (error) {
        console.error("Error fetching events: ", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

module.exports = {
    registerUser,
    loginUser,
    deleteUser,
    getAirport,
    recharge,
    test,
    findPlace,
    getEvents
};
