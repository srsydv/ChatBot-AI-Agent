const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendOTPEmail } = require('../services/emailService');
const otpStore = require('../services/otpStore');

const router = express.Router();


const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '30d',
  });
};

router.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;

  
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Please provide all fields' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }

    
    const userExists = await User.findOne({ email });
    if (userExists) {
      return res.status(400).json({ error: 'User already exists with this email' });
    }

    
    const user = await User.create({
      name,
      email,
      password,
    });

    
    const token = generateToken(user._id);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    
    if (!email || !password) {
      return res.status(400).json({ error: 'Please provide email and password' });
    }

    
    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    
    const isMatch = await user.matchPassword(password);

    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

   
    const token = generateToken(user._id);

    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});


router.post('/send-otp', async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || typeof email !== 'string' || !email.trim()) {
      return res.status(400).json({ error: 'Please provide a valid email' });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const otp = otpStore.generateOTP();
    otpStore.set(normalizedEmail, otp);
    await sendOTPEmail(normalizedEmail, otp);
    res.json({ success: true, message: 'OTP sent to your email' });
  } catch (error) {
    console.error('Send OTP error:', error);
    res.status(500).json({ error: 'Failed to send OTP. Please try again.' });
  }
});


router.post('/verify-otp', async (req, res) => {
  try {
    const { email, otp } = req.body;
    if (!email || !otp) {
      return res.status(400).json({ error: 'Please provide email and OTP' });
    }
    const normalizedEmail = email.toLowerCase().trim();
    const valid = otpStore.verifyAndClear(normalizedEmail, otp);
    if (!valid) {
      return res.status(401).json({ error: 'Invalid or expired OTP' });
    }
    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      const nameFromEmail = normalizedEmail.split('@')[0] || 'User';
      const name = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1).toLowerCase();
      const randomPassword = require('crypto').randomBytes(12).toString('hex');
      user = await User.create({
        name,
        email: normalizedEmail,
        password: randomPassword,
      });
    }
    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Verify OTP error:', error);
    res.status(500).json({ error: 'Server error during verification' });
  }
});

/**
 * Exchange Supabase session (after OTP verify) for our JWT.
 * Body: { access_token } (Supabase access_token from verifyOtp).
 * Verifies JWT with SUPABASE_JWT_SECRET, finds/creates User by email, returns our token + user.
 */
router.post('/supabase-login', async (req, res) => {
  try {
    const { access_token } = req.body;
    if (!access_token || typeof access_token !== 'string') {
      return res.status(400).json({ error: 'Missing Supabase access token' });
    }
    const secret = process.env.SUPABASE_JWT_SECRET;
    if (!secret) {
      return res.status(500).json({ error: 'Supabase auth not configured' });
    }
    let payload;
    try {
      payload = jwt.verify(access_token, secret);
    } catch (err) {
      return res.status(401).json({ error: 'Invalid or expired token' });
    }
    const email = payload.email;
    if (!email) {
      return res.status(401).json({ error: 'Invalid token: no email' });
    }
    const normalizedEmail = email.toLowerCase().trim();
    let user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      const nameFromEmail = normalizedEmail.split('@')[0] || 'User';
      const name = nameFromEmail.charAt(0).toUpperCase() + nameFromEmail.slice(1).toLowerCase();
      const randomPassword = require('crypto').randomBytes(12).toString('hex');
      user = await User.create({
        name,
        email: normalizedEmail,
        password: randomPassword,
      });
    }
    const token = generateToken(user._id);
    res.json({
      success: true,
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Supabase login error:', error);
    res.status(500).json({ error: 'Server error during login' });
  }
});

router.post('/logout', protect, (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
});

router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

module.exports = router;
