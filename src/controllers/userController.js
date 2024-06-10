const User = require('../models/User');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
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
            update_at: new Date()
        });

        res.status(201).json(user);
    } catch (error) {
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
        const token = jwt.sign({ id: user.user_id, role: user.role }, 'your_jwt_secret', { expiresIn: '1h' });

        res.status(200).json({ token });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const deleteUser = async (req, res) => {
    let token = req.header('x-auth-token')
         if(!token){
            return res.status(403).send('No Authentication Found')
        }

    try {    
        let userdata = jwt.verify(token, 'your_jwt_secret')

        const { ID } = req.body;

        const user = await User.findOne({ where: { ID } });
        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        await User.destroy({
            where:{
                user_id: ID
            }
        })

    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const testAxios = async (req,res) =>{
    const axios = require('axios');

const options = {
  method: 'GET',
  url: 'https://sky-scanner3.p.rapidapi.com/cars/search',
  params: {
    pickUpEntityId: '95565058'
  },
  headers: {
    'x-rapidapi-key': process.env.RAPIDAPI_KEY,
    'x-rapidapi-host': process.env.RAPIDAPI_HOST
  }
};

try {
	const response = await axios.request(options);
	console.log(response.data);
} catch (error) {
	console.error(error);
}
}


module.exports = {
    registerUser,
    loginUser,
    deleteUser,
    testAxios
};
