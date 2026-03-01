const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const helmet = require('helmet');
const dotenv = require('dotenv');
const path = require('path');

dotenv.config();

const authRoutes = require('./routes/auth');
const resumeRoutes = require('./routes/resume');
const interviewRoutes = require('./routes/interview');

const app = express();

// Test route
app.get("/", (req, res) => {
  res.send("Backend working correctly");
});

// Middleware
app.use(helmet());
app.use(cors({
  origin: '*',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// MongoDB Connection - cached for serverless
const MONGO_URI = process.env.MONGO_URI || 'mongodb://localhost:27017/ai-interviewer';

let cached = global.mongoose;

if (!cached) {
  cached = global.mongoose = { conn: null, promise: null };
}

const connectDB = async () => {
  // If already connected, return cached connection
  if (cached.conn) {
    return cached.conn;
  }

  // If connection in progress, wait for it
  if (cached.promise) {
    return cached.promise;
  }

  // Start new connection with timeout
  const opts = {
    bufferCommands: false,
    serverSelectionTimeoutMS: 10000,
    socketTimeoutMS: 45000,
  };

  cached.promise = mongoose.connect(MONGO_URI, opts)
    .then((mongoose) => {
      console.log('MongoDB connected successfully');
      cached.conn = mongoose;
      return mongoose;
    })
    .catch((err) => {
      console.error('MongoDB connection error:', err.message);
      cached.promise = null;
      cached.conn = null;
      throw err;
    });

  return cached.promise;
};

// Initialize DB connection
connectDB()
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

// Ensure DB connection before each request - THIS MUST BE BEFORE THE ROUTES
app.use(async (req, res, next) => {
  try {
    await connectDB();
    next();
  } catch (err) {
    console.error('Database connection error:', err);
    res.status(503).json({ message: 'Service temporarily unavailable - database connection failed' });
  }
});

// Routes - ADDED AFTER DB MIDDLEWARE
app.use('/api/auth', authRoutes);
app.use('/api/resume', resumeRoutes);
app.use('/api/interview', interviewRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'AI Interviewer API is running' });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
