const express = require('express');
const path = require('path');
const fs = require('fs');
require('dotenv').config();
const connectDB = require('./config/database');

const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Connect to MongoDB
connectDB();

// API Routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/chats', require('./routes/chats'));
app.use('/api', require('./routes/index'));

// Serve static files from the React app (only if public folder exists - for local development)
const publicPath = path.join(__dirname, 'public');
const publicExists = fs.existsSync(publicPath);

if (publicExists) {
  app.use(express.static(publicPath));
  
  // Catch all handler: send back React's index.html file for SPA routing
  // This must be after static files middleware
  app.use((req, res) => {
    // Only serve index.html for non-API routes
    if (!req.path.startsWith('/api')) {
      const indexPath = path.join(publicPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(404).json({ error: 'Route not found' });
      }
    } else {
      res.status(404).json({ error: 'Route not found' });
    }
  });
} else {
  // Backend-only deployment: only serve API routes
  app.use((req, res) => {
    if (!req.path.startsWith('/api')) {
      res.status(404).json({ 
        error: 'Route not found',
        message: 'This is a backend API server. Frontend is deployed separately.'
      });
    } else {
      res.status(404).json({ error: 'API route not found' });
    }
  });
}

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
