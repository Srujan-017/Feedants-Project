require('dotenv').config();

const express = require('express');
const helmet = require('helmet');
const cors = require('cors');

const { connectDB } = require('./config/db');
const healthRoutes = require('./routes/healthRoutes');
const competitionRoutes = require('./routes/competitionRoutes');
const { notFound, errorHandler } = require('./middleware/errorMiddleware');

const app = express();

// --- Security & parsing middleware ---
app.use(helmet());
app.use(cors());
app.use(express.json());

// --- Routes ---
app.use('/api/health', healthRoutes);
app.use('/api/competitions', competitionRoutes);

// --- 404 + centralized error handling (must be last) ---
app.use(notFound);
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

/**
 * Start the server only after MongoDB has connected successfully.
 * If the DB connection fails, we log the failure clearly and exit
 * instead of silently running an API that can never talk to the database.
 */
async function start() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`[Server] Feedants API listening on port ${PORT}`);
    });
  } catch (err) {
    console.error('[Startup] Failed to start server:', err.message);
    process.exit(1);
  }
}

start();
