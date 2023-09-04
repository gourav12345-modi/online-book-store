const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Function to register a new user
async function register(req, res) {
  try {
    const { username, password } = req.body;

    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: 'User already exists' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newUser = new User({
      username,
      password: hashedPassword,
    });

    await newUser.save();

    res.status(201).json({ message: 'User registered successfully' });
  } catch (error) {
    console.error('Error in user registration:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Function to log in a user and generate a JWT token
async function login(req, res) {
  try {
    const { username, password } = req.body;

    const user = await User.findOne({ username });

    if (!user) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }

    // Generate a JWT token
    const token = jwt.sign({ userId: user._id }, process.env.JWT_SECRET, {
      expiresIn: '1h', // Token expiration time
    });

    res.status(200).json({ token });
  } catch (error) {
    console.error('Error in user login:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
}

// Function to log out a user
function logout(req, res) {
  res.status(200).json({ message: 'User logged out' });
}

module.exports = {
  register,
  login,
  logout,
};
