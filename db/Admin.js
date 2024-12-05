const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
    name:String,
    email:String,
    username:String,
    mobile:Number,
    password:String,
    },{collection:"Admin"}
)
module.exports = mongoose.model("Admin",userSchema);