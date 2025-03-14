const { required } = require("joi");
const mongoose = require("mongoose");
const User = require("./user.js");

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
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
});

module.exports = mongoose.model("Review", reviewSchema);
