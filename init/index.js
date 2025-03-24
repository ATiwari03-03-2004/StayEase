const mongoose = require("mongoose");
const { data } = require("./data.js");
const Listing = require("../models/listing.js");

main()
  .then((res) => console.log("Connected to DB!"))
  .catch((err) => console.log(err));

async function main(params) {
  await mongoose.connect("mongodb://127.0.0.1:27017/stayease");
}

const initDB = async () => {
  await Listing.deleteMany({});
  // (or) use this
  const modifiedData = data.map((obj) => ({
    ...obj,
    owner: "67d081821c07cc7981639ccd",
  }));
  await Listing.insertMany(modifiedData);
};
// initDB();
