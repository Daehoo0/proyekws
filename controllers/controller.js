const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const moment = require("moment");
const axios = require("axios");
const Joi = require("joi");
const Traveler = require('../models/traveler');
const Guide = require('../models/guide');
const Organizer = require('../models/organizer');
const sequelize = require('../config/sequelize');

sequelize.sync({ force: true }).then(() => {
  console.log('Database & tables created without timestamps!');
});

// Schema validasi dengan Joi
const registerSchema = Joi.object({
  role: Joi.string().valid('traveler', 'guide', 'organizer').required(),
  username: Joi.string().min(3).required(),
  password: Joi.string().min(6).required(),
  confirm_password: Joi.string().valid(Joi.ref('password')).required(),
});

async function generateId(role) {
  let prefix = '';
  let count = 0;

  if (role === 'traveler') {
    prefix = 'TRVL';
    count = await Traveler.count();
  } else if (role === 'guide') {
    prefix = 'GDS';
    count = await Guide.count();
  } else if (role === 'organizer') {
    prefix = 'ORG';
    count = await Organizer.count();
  }

  return `${prefix}${(count + 1).toString().padStart(3, '0')}`;
}

const register = async (req, res) => {
  // Validasi data input
  const { error, value } = registerSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { role, username, password, confirm_password } = value;

  // Cek konfirmasi password
  if (password !== confirm_password) {
    return res.status(400).json({ error: 'Konfirmasi password tidak sesuai' });
  }

  // Cek username unik
  try {
    let existingUser;
    if (role === 'traveler') {
      existingUser = await Traveler.findOne({ where: { username } });
    } else if (role === 'guide') {
      existingUser = await Guide.findOne({ where: { username } });
    } else if (role === 'organizer') {
      existingUser = await Organizer.findOne({ where: { username } });
    }

    if (existingUser) {
      return res.status(400).json({ error: 'Username sudah digunakan' });
    }

    // Generate ID
    const id = await generateId(role);

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Buat pengguna baru
    let newUser;
    if (role === 'traveler') {
      newUser = await Traveler.create({
        traveler_id: id,
        username,
        password: hashedPassword,
        saldo: 0,
      });
    } else if (role === 'guide') {
      newUser = await Guide.create({
        guide_id: id,
        username,
        password: hashedPassword,
        location: '',
        experience: '',
        rate: 0,
        saldo: 0,
      });
    } else if (role === 'organizer') {
      newUser = await Organizer.create({
        organizer_id: id,
        username,
        password: hashedPassword,
        rate: 0,
        saldo: 0,
      });
    }

    res.json(newUser);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan saat registrasi' });
  }
};

// Schema validasi dengan Joi
const loginSchema = Joi.object({
  username: Joi.string().min(3).required(),
  password: Joi.string().min(6).required(),
});

const login = async (req, res) => {
  // Validasi data input
  const { error, value } = loginSchema.validate(req.body);
  if (error) {
    return res.status(400).json({ error: error.details[0].message });
  }

  const { username, password } = value;

  try {
    // Cari pengguna berdasarkan username
    const user = await Traveler.findOne({ where: { username } })
      || await Guide.findOne({ where: { username } })
      || await Organizer.findOne({ where: { username } });

    if (!user) {
      return res.status(404).json({ error: 'Username atau password salah' });
    }

    // Verifikasi password
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Username atau password salah' });
    }

    // Generate JWT token
    const token = jwt.sign(
      { id: user.traveler_id || user.guide_id || user.organizer_id, username: user.username, role: user.constructor.name.toLowerCase() },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({ message: 'Berhasil login', token });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Terjadi kesalahan saat login' });
  }
};
module.exports = { register , login };
