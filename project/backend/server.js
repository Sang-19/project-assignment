const dns = require('dns');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const expressSession = require('express-session');
const mongoose = require('mongoose');

dotenv.config();

const authRoutes = require('./routes/authRoutes');
const googleAuthRoutes = require('./routes/googleAuth');

const passport = require('./config/passport');

const app = express();
const port = process.env.PORT || 5000;
const frontendUrl =
  process.env.FRONTEND_URL ||
  (process.env.NODE_ENV === 'production'
    ? 'https://project-assignment-frontend-tau.vercel.app'
    : 'http://localhost:5173');
const mongoUri = process.env.MONGO_URI && process.env.MONGO_URI.trim();

mongoose.set('bufferCommands', false);

app.use(cors({ origin: frontendUrl }));
app.use(express.json());

app.use(
  expressSession({
    secret: process.env.JWT_SECRET || 'development-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === 'production',
      maxAge: 1000 * 60 * 60,
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());
app.use('/api/auth', authRoutes);
app.use('/auth', googleAuthRoutes);

mongoose.connection.on('error', (error) => {
  console.error('MongoDB connection error:', {
    name: error.name,
    message: error.message,
    code: error.code,
    reason: error.reason?.message,
  });
});

mongoose.connection.on('disconnected', () => {
  console.error('MongoDB disconnected.');
});

app.get('/api/status', (req, res) => {
  const database = mongoose.connection.readyState === 1
    ? 'connected'
    : 'unavailable';

  res.json({
    status: 'API is running successfully',
    database,
  });
});

if (mongoUri) {
  mongoose
    .connect(mongoUri)
    .then(() => console.log('connected to MongoDB'))
    .catch((error) => {
      console.error('couldn\'t connect to MongoDB:', {
        name: error.name,
        message: error.message,
        code: error.code,
        reason: error.reason?.message,
        stack: error.stack,
      });
    });
} else {
  console.warn('MONGO_URI is not configured; database-backed routes may fail.');
}

app.use((error, req, res, next) => {
  console.error('backend error:', error);

  if (req.path === '/google/callback') {
    return res.redirect(`${frontendUrl}/index.html?error=google_auth_failed`);
  }

  res.status(500).json({ error: 'An unexpected server error occurred.' });
});

app.listen(port, () => {
  console.log(`backend listening on port ${port}`);
});
