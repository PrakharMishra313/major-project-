const mongoose = require("mongoose");
const { Schema } = mongoose; // Destructure Schema from mongoose

const listingSchema = new Schema({
  title: {
    type: String,
    required: true, // This field is required
  },
  description: {
    type: String,
    required: true, // Adjust this based on your needs
  },
  price: {
    type: Number,
    required: true, // Adjust this based on your needs
  },
  location: {
    type: String,
    required: true, // Adjust this based on your needs
  },
  country: {
    type: String,
    required: true, // Adjust this based on your needs
  },
  image: {
    type: String, // Adjust based on whether you want to store it as a URL or an object
    required: false, // Set to true if you want this field to be required
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],
});

// Create the Listing model using the schema
const Listing = mongoose.model("Listing", listingSchema);

// Export the model
module.exports = Listing;