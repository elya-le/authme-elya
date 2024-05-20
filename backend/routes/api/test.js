const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { jwtConfig } = require('../../config');
const { secret } = jwtConfig;

router.post('/', (req, res) => {
  res.json({ requestBody: req.body });
});

router.get('/jwt-secret', (req, res) => {
    res.json({ secret });
});
// test signing
router.get('/sign', (req, res) => {
    const token = jwt.sign({ data: { test: 'data' } }, secret, { expiresIn: '1h' });
    res.json({ token });
});

// test verifying
router.get('/verify', (req, res) => {
    const { token } = req.query;
    jwt.verify(token, secret, (err, decoded) => {
        if (err) return res.status(400).json({ error: err.message });
        res.json({ decoded });
    });
});

module.exports = router;