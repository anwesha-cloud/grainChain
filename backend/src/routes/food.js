const express = require('express');
const Food = require('../models/food');
const { authMiddleware } = require('../utils/auth');
const axios = require('axios');

const router = express.Router();

// POST /api/food/add
router.post('/add', authMiddleware, async (req, res) => {
  try {
    const { title, food_type, description, quantity, location, storage, temperature } = req.body;

    if (!food_type || !quantity) {
      return res.status(400).json({ error: 'food_type and quantity required' });
    }

    // call AI microservice to calculate expiry
    let expiry_hours = 2;
    let safe_till = null;
    try {
      const aiRes = await axios.post(process.env.ML_ENDPOINT || 'http://localhost:6000/predict', {
        food_type,
        upload_time: new Date().toISOString(),
        storage,
        temperature
      });
      expiry_hours = aiRes.data.adjusted_expiry;
      safe_till = aiRes.data.safe_till_iso;
    } catch (err) {
      console.error('AI service call failed, fallback expiry:', err.message);
    }

    const food = new Food({
      title,
      food_type,
      description,
      quantity,
      donor: req.user.id, // comes from auth middleware
      location: location ? { type: 'Point', coordinates: [location.lng, location.lat] } : undefined,
      expiry_hours,
      safe_till,
      status: 'pending'
    });

    await food.save();
    res.status(201).json(food);
  } catch (err) {
    console.error('POST /food/add error:', err);
    res.status(500).json({ error: 'internal server error' });
  }
});

// GET /api/food/list (all foods, e.g. for NGO)
router.get('/list', async (req, res) => {
  try {
    const { status } = req.query;
    const query = status ? { status } : {};
    const foods = await Food.find(query).populate('donor', 'name email').sort({ createdAt: -1 });
    res.json(foods);
  } catch (err) {
    console.error('GET /food/list error:', err);
    res.status(500).json({ error: 'internal server error' });
  }
});

// GET /api/food/my (foods created by logged-in donor)
router.get('/my', authMiddleware, async (req, res) => {
  try {
    const foods = await Food.find({ donor: req.user.id })
      .sort({ createdAt: -1 });
    res.json(foods);
  } catch (err) {
    console.error('GET /food/my error:', err);
    res.status(500).json({ error: 'internal server error' });
  }
});

// PUT /api/food/accept/:id
router.put('/accept/:id', authMiddleware, async (req, res) => {
  try {
    if (req.user.role !== 'ngo' && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Only NGOs can accept donations' });
    }

    const food = await Food.findById(req.params.id);
    if (!food) return res.status(404).json({ error: 'Donation not found' });

    if (food.status !== 'pending') {
      return res.status(400).json({ error: `Cannot accept donation with status: ${food.status}` });
    }

    food.status = 'claimed';
    await food.save();

    res.json({ message: 'Donation claimed successfully', food });
  } catch (err) {
    console.error('Accept donation error:', err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
