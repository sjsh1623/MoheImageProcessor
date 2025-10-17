const express = require('express');

const imageRoutes = require('./routes/imageRoutes');

const app = express();

app.use(express.json());
app.use(imageRoutes);

module.exports = app;
