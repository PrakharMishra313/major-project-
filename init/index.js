const mongoose = require("mongoose");
const initData = require("./data.js");
const Listing = require("../models/listing.js");
const { object } = require("joi");

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
    initData.data = initData.data.map((obj)=>({...obj,owner:"674d8cca007dbde4878820cf"}));
    const result = await Listing.insertMany(initData.data);
    console.log("data was initialized");
    console.log(result); // Log the result of the insertMany operation
};

// Call the initDB function here if you want it to run automatically