const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const { router: authRouter, authenticateToken } = require('./routes/auth');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Kết nối MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/device_manager', {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
const connection = mongoose.connection;
connection.once('open', () => {
  console.log('MongoDB database connection established successfully');
});

// Routes
app.use('/api/auth', authRouter);
app.use('/api/devices', authenticateToken, require('./routes/device'));

app.listen(port, () => {
  console.log(`Server is running on port: ${port}`);
});
