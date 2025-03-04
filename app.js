const express = require("express");
const app = express();
const path = require("path");
const methodOverride = require("method-override");
const engine = require("ejs-mate");
const wrapAsync = require("./utils/wrapAsync.js");
const ExpressError = require("./utils/ExpressError.js");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");
const cors = require("cors");
let Review = require("./models/review.js");
const { listingSchema, reviewSchema } = require("./schema.js");

main()
  .then((res) => console.log("Connected to DB!"))
  .catch((err) =>
    next(new ExpressError(500, "Failed to connect with database!"))
  );

async function main() {
  await mongoose.connect("mongodb://127.0.0.1:27017/stayease");
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));
app.use(cors());

app.engine("ejs", engine);

app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

const validateListing = (req, res, next) => {
  // => Handling listing schema validation using joi
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((err) => err.message).join(", ");
    next(new ExpressError(400, errMsg));
  } else next();
};

const validateReview = (req, res, next) => {
  // => Handling review schema validation using joi
  let { error } = reviewSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((err) => err.message).join(", ");
    next(new ExpressError(400, errMsg));
  } else next();
};

app.get("/", (req, res) => {
  res.send("Server is on");
});

// app.get("/testListing", (req, res) => {
//   let sampleLisiting = new Listing({
//     title: "My Villa",
//     description: "By the beach",
//     price: 1200,
//     location: "Calangute, Goa",
//     country: "India",
//   });
//   sampleLisiting.save().then((result) => {
//     console.log("Success!");
//   });
// });

// Read Route
app.get(
  "/listings",
  wrapAsync(async (req, res) => {
    let allListings = await Listing.find({});
    res.render("listings/index.ejs", { allListings });
  })
);

// New Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// Create Route
app.post(
  "/listings/new",
  validateListing,
  wrapAsync(async (req, res, next) => {
    // let { title, description, image, price, location, country } = req.body;
    // let listing = new Listing({
    //   title: title,
    //   description: description,
    //   image: image,
    //   price: price,
    //   location: location,
    //   country: country,
    // });
    await new Listing(req.body.listing).save();
    res.redirect("/listings");
  })
);

// Show Route
app.get(
  "/listings/:id",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let listing = await Listing.findById(id).populate("reviews");
    res.render("listings/show.ejs", { listing });
  })
);

// Edit Route
app.get(
  "/listings/:id/edit",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    let data = await Listing.findById(id);
    res.render("listings/edit.ejs", { listing: data });
  })
);

// Update Route
app.patch(
  "/listings/:id/edit",
  validateListing,
  wrapAsync(async (req, res) => {
    if (!req.body.listing)
      next(new ExpressError(400, "Bad Request, Send valid data for listing!"));
    let { id } = req.params;
    await Listing.findByIdAndUpdate(id, { $set: { ...req.body.listing } });
    res.redirect(`/listings/${id}`);
  })
);

// Delete (listing) Route => Deleting reviews of the listing as well using post mongoose middleware.
app.delete(
  "/listings/:id/delete",
  wrapAsync(async (req, res) => {
    let { id } = req.params;
    await Listing.findByIdAndDelete(id);
    res.redirect("/listings");
  })
);

// Review Route
app.post(
  "/listings/:id/review",
  validateReview,
  wrapAsync(async (req, res, next) => {
    let { id } = req.params;
    let { review } = req.body;
    let data = await new Review(review).save();
    let listing = await Listing.findById(id);
    listing.reviews.push(data);
    await listing.save(); // Updates the listing review
    res.redirect(`/listings/${id}`);
  })
);

// Review Delete Route
app.delete(
  "/listings/:id/review/:rId",
  wrapAsync(async (req, res, next) => {
    let { id, rId } = req.params;
    // let listing = await Listing.findById(id);
    // listing.reviews.splice(listing.reviews.indexOf(rId), 1);
    // await listing.save();

    // OR

    await Listing.findByIdAndUpdate(id, { $pull: { reviews: rId } });
    await Review.findByIdAndDelete(rId);
    res.redirect(`/listings/${id}`);
  })
);

// Invalid / Page not found route
app.all("*", (req, res, next) => {
  next(new ExpressError(404, "Page not found!"));
});

// Error handling middleware
app.use((err, req, res, next) => {
  let { status = 500, message = "Something went wrong!" } = err;
  res.status(status).render("listings/error.ejs", { status, message, err });
});

app.listen(8080, () => {
  console.log("Server is listening to requests!");
});
