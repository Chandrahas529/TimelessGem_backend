const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema({
    categorie:String,
    src:String,
    date:String
    },{collection:"Categories"}
);

module.exports = mongoose.model("Categories",categorySchema);