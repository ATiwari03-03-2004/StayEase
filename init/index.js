const mongoose = require("mongoose");
const { data } = require("./data.js");
const Listing = require("../models/listing.js");
const axios = require("axios");

main()
  .then((res) => console.log("Connected to DB!"))
  .catch((err) => console.log(err));

async function main(params) {
  await mongoose.connect("mongodb://127.0.0.1:27017/stayease");
}

const initDB = async () => {
  await Listing.deleteMany({});

  const baseURL = "https://geocode.search.hereapi.com/v1/geocode?q=";
  const modifiedData = [];
  for (const listing of data) {
    const address = encodeURIComponent(listing.location + listing.country);
    const URL = `${baseURL}${address}&apiKey=IyZPVGWE40icMl5N39Fnc61Ltaae0r7zYzvrhJ_COdw`;
    let response = await axios.get(URL);
    let geometry = {
      type: "Point",
      coordinates: [
        response.data.items[0].position.lng,
        response.data.items[0].position.lat,
      ],
    };
    modifiedData.push({
      ...listing,
      owner: "67d081821c07cc7981639ccd",
      geometry,
    });
    await new Promise((resolve) => setTimeout(resolve, 1000));
  }
  await Listing.insertMany(modifiedData);
};
initDB();
