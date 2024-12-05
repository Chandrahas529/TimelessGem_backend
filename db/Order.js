const mongoose = require("mongoose");
const orderSchema = new mongoose.Schema({
    name:String,
    mobile:Number,
    street:String,
    city:String,
    district:String,
    state:String,
    pincode:Number,
    date:Date,
    quantity:Number,
    amount:Number,
    productId:String,
    orderStatus:String,
    seenByAdmin:Boolean}
    ,{collection:"Orders"}
);
module.exports = mongoose.model("Orders",orderSchema);