const mongoose = require('mongoose');

/**
 * Connects to MongoDB using the MONGO_URI environment variable.
 *
 * - Fails fast (and loudly) if MONGO_URI is missing.
 * - Never logs the raw connection string (it may contain a password).
 * - Resolves once the connection is open; rejects/throws on failure so the
 *   caller (server.js) can decide whether to start the HTTP server.
 */
async function connectDB() {
  const uri = process.env.MONGO_URI;

  if (!uri) {
    throw new Error(
      'MONGO_URI is not defined. Create backend/.env (see backend/.env.example) ' +
        'and set MONGO_URI to your MongoDB connection string.'
    );
  }

  // Extra Mongoose-level safety nets (do not print secrets on error).
  mongoose.connection.on('error', (err) => {
    console.error('[MongoDB] connection error:', err.message);
  });

  mongoose.connection.on('disconnected', () => {
    console.warn('[MongoDB] disconnected');
  });

  await mongoose.connect(uri, {
    // Mongoose 8 / modern MongoDB driver no longer needs
    // useNewUrlParser / useUnifiedTopology - they are defaults now.
    serverSelectionTimeoutMS: 10000,
  });

  const { host, name } = mongoose.connection;
  console.log(`[MongoDB] connected -> host: ${host}, database: ${name}`);
}

/**
 * Returns a small, human-readable snapshot of the current Mongoose
 * connection state. Used by the /api/health/db endpoint.
 */
function getDbStatus() {
  // 0 = disconnected, 1 = connected, 2 = connecting, 3 = disconnecting
  const stateMap = {
    0: 'disconnected',
    1: 'connected',
    2: 'connecting',
    3: 'disconnecting',
  };

  const readyState = mongoose.connection.readyState;

  return {
    readyState,
    state: stateMap[readyState] || 'unknown',
    healthy: readyState === 1,
  };
}

module.exports = { connectDB, getDbStatus };
