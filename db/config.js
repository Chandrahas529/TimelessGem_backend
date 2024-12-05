require('dotenv').config();
const mongoose = require("mongoose");
const uri = process.env.DB_URI;
mongoose.connect(uri);