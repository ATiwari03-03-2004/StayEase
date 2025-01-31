const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const Listing = require("./models/listing.js");

main()
  .then((res) => console.log("Connected to DB!"))
  .catch((err) => console.log(err));

async function main(params) {
  await mongoose.connect("mongodb://127.0.0.1:27017/stayease");
}

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

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
app.get("/listings", async (req, res) => {
  let allListings = await Listing.find({});
  res.render("listings/index.ejs", { allListings });
});

// New Route
app.get("/listings/new", (req, res) => {
  res.render("listings/new.ejs");
});

// Create Route
app.post("/listings/new", async (req, res) => {
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
});

// Show Route
app.get("/listings/:id", async (req, res) => {
  let { id } = req.params;
  let listing = await Listing.findById(id);
  res.render("listings/show.ejs", { listing });
});

app.listen(8080, () => {
  console.log("Server is listening to requests!");
});
