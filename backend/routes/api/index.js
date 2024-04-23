const router = require('express').Router();

router.post('/test', (req, res) => {
    res.json({ requestBody: req.body });
});

// GET /api/set-token-cookie
const { setTokenCookie } = require('../../utils/auth.js');
const { User } = require('../../db/models');
router.get('/set-token-cookie', async (_req, res) => {
  const user = await User.findOne({
    where: {
      username: 'Demo-User'
    }
  });
  setTokenCookie(res, user);
  return res.json({ user: user });
});

module.exports = router;