const mongoose = require("mongoose");
const sponsorSchema = new mongoose.Schema({
    brand:String,
    src:String,
    date:String
    },{collection:"Sponsors"}
);
module.exports = mongoose.model("Sponsors",sponsorSchema);