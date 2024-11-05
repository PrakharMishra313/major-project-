const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");

const MONGO_URL = "mongodb://127.0.0.1:27017/wanderlust";

main()
    .then(() => {
        console.log("connected to DB");
        return initDB(); // Call to initialize the database
    })
    .catch((err) => {
        console.log(err);
    });

async function main() {
    await mongoose.connect(MONGO_URL);
}

const initDB = async () => {
    await Listing.deleteMany({});
    const result = await Listing.insertMany(initData.data);
    console.log("data was initialized");
    console.log(result); // Log the result of the insertMany operation
};

// Call the initDB function here if you want it to run automatically
