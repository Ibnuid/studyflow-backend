const bcrypt = require('bcrypt');
const User = require('../models/userModel');

const authController = {
  register: async (req, res) => {
    const { username, email, password } = req.body;

    try {
      // Check if user exists
      const existingUser = await User.findByUsername(username) || await User.findByEmail(email);
      if (existingUser) {
        return res.status(400).json({ success: false, message: 'Username or email already exists' });
      }

      // Hash password
      const saltRounds = 10;
      const passwordHash = await bcrypt.hash(password, saltRounds);

      // Create user
      const userId = await User.create(username, email, passwordHash);

      // Set session
      req.session.userId = userId;

      return res.status(201).json({ success: true, message: 'User registered successfully', userId });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Registration failed' });
    }
  },

  login: async (req, res) => {
    const { username, password } = req.body;

    try {
      const user = await User.findByUsername(username);
      if (!user) {
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password_hash);
      if (!isValidPassword) {
        return res.status(401).json({ success: false, message: 'Invalid username or password' });
      }

      // Set session
      req.session.userId = user.id;

      return res.status(200).json({ success: true, message: 'Login successful', user: { id: user.id, username: user.username, email: user.email } });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Login failed' });
    }
  },

  logout: async (req, res) => {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ success: false, message: 'Logout failed' });
      }
      res.clearCookie('connect.sid');
      return res.status(200).json({ success: true, message: 'Logout successful' });
    });
  },

  getCurrentUser: async (req, res) => {
    if (!req.session.userId) {
      return res.status(401).json({ success: false, message: 'Not authenticated' });
    }

    try {
      const user = await User.findById(req.session.userId);
      if (!user) {
        return res.status(404).json({ success: false, message: 'User not found' });
      }

      return res.status(200).json({ success: true, user });
    } catch (error) {
      console.error(error);
      return res.status(500).json({ success: false, message: 'Failed to get user' });
    }
  }
};

module.exports = authController;
