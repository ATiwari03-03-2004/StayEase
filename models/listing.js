const mongoose = require("mongoose");
const Review = require("./review.js");
const User = require("./user.js");
const { required } = require("joi");

const listingSchema = mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  image: {
    url: String,
    filename: String,
  },
  price: {
    type: Number,
    required: true,
  },
  location: {
    type: String,
    required: true,
  },
  country: {
    type: String,
    requied: true,
  },
  reviews: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },
  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  filters: {
    type: [String],
    enum: [
      "all_listings", "domes", "trending", "rooms", "beachfront", "amazing_pool", "iconic_city", "castles", "camping", "lakefront", "mountain", "farms", "arctic", "amazing_views", "boats", "park", "play", "bed_n_breakfast",
    ],
    required: true,
  },
});

listingSchema.post("findOneAndDelete", async (listing, next) => {
  if (listing) await Review.deleteMany({ _id: { $in: listing.reviews } });
  next();
});

const Listing = mongoose.model("Listing", listingSchema);
module.exports = Listing;
