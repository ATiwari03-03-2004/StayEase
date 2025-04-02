const express = require("express");
const router = express.Router();
const Listing = require("../models/listing.js");

const { userAuth } = require("../middleware.js");
const wrapAsync = require("../utils/wrapAsync");

router.get(
  "/",
  userAuth,
  wrapAsync(async (req, res, next) => {
    let listings = await Listing.find({});
    res.render("listings/map.ejs", { listings });
  })
);

module.exports = router;
