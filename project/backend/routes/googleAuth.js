const express = require('express');
const router = express.Router();
const passport = require('passport');
const jwt = require('jsonwebtoken');

const frontendUrl =
  process.env.FRONTEND_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://project-assignment-frontend-tau.vercel.app'
    : 'http://localhost:5173');

router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    failureRedirect: `${frontendUrl}/index.html?error=google_auth_failed`,
    session: false,
  }),
  (req, res) => {
    const user = req.user;

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: '1h' }
    );

    const params = new URLSearchParams({
      token,
      username: user.username,
      email: user.email || '',
    });

    res.redirect(
      `${frontendUrl}/dashboard.html?${params.toString()}`
    );
  }
);

router.get('/logout', (req, res, next) => {
  req.logout((err) => {
    if (err) return next(err);
    res.redirect(`${frontendUrl}/index.html`);
  });
});

module.exports = router;
