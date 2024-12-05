const mongoose = require('mongoose');

const specificationSchema = new mongoose.Schema({
  id: { type: Number},
  speciality: { type: String},
  value: { type: String}
});

const imageSchema = new mongoose.Schema({
  id: { type: Number},
  src: { type: String}
});

const tagSchema = new mongoose.Schema({
  id: { type: Number},
  tag: { type: String}
});

const watchSchema = new mongoose.Schema({
  name: { type: String},
  brand: { type: String},
  modelNumber: { type: String},
  description: { type: String},
  todaysOffer: {type:Boolean},
  launched: {type:Boolean},
  bestSelling: {type:Boolean},
  specifications: [[specificationSchema]], // Nested array of specifications
  price: { type: Number},
  discount: { type: Number},
  discountedPrice: { type: Number},
  stockQuantity: { type: Number},
  images: [imageSchema], // Array of images
  availabilityStatus: { type: String},
  categorie: { type: String},
  tags: [tagSchema], // Array of tags
  publish: { type: String},
  date: { type: String}
    },{collection:"Products"}
);

const Watch = mongoose.model('Products', watchSchema);

module.exports = Watch;
