const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const sendEmail = require('../utils/sendEmail');
const protect = require('../middleware/auth');

router.post('/signup', async (req, res) => {
  try {
    if (User.db.readyState !== 1) {
      return res.status(503).json({
        error: 'Database is unavailable. Check the backend MONGO_URI configuration.',
      });
    }

    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res
        .status(400)
        .json({ error: 'Username, email and password are required.' });
    }

    const existingUser = await User.findOne({ $or: [{ email }, { username }] });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: 'A user with this email or username already exists.' });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({ username, email, password: hashedPassword });
    await newUser.save();

    await sendEmail({
      email: newUser.email,
      subject: 'Welcome to Our Platform - Registration Successful',
      message: `Hello @${username}, your account has been created successfully! Welcome to our platform.`,
    });

    res
      .status(201)
      .json({ message: 'User registered successfully and welcome email sent!' });
  } catch (err) {
    console.error('Signup failed:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/login', async (req, res) => {
  try {
    if (User.db.readyState !== 1) {
      return res.status(503).json({
        error: 'Database is unavailable. Check the backend MONGO_URI configuration.',
      });
    }

    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }

    if (!user.password) {
      return res
        .status(400)
        .json({ error: 'Please sign in using Google for this account.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ error: 'Invalid username or password.' });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    res.json({
      message: 'Login successful',
      token,
      username: user.username,
      email: user.email,
    });
  } catch (err) {
    console.error('Login failed:', err);
    res.status(500).json({ error: err.message });
  }
});

router.post('/send-notification', protect, async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: 'A recipient email is required.' });
    }

    await sendEmail({
      email,
      subject: 'Notification subscription',
      message: 'Hi, you will be notified of each and every event through email.',
    });

    res.json({
      message: 'Notification email sent successfully!',
      recipient: email,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
