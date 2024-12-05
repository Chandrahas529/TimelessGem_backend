require('dotenv').config();
const mongoose = require("mongoose");
const uri = process.env.DB_URI;
console.log(uri);
mongoose.connect(uri);