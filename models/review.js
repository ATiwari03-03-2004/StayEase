const { required } = require("joi");
const mongoose = require("mongoose");

const reviewSchema = mongoose.Schema({
  comment: {
    type: String,
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5,
  },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
});

module.exports = mongoose.model("Review", reviewSchema);
