const mongoose = require("mongoose");
const { Schema } = mongoose;

const reviewSchema = new Schema({
  rating: {
    type: Number,
    required: true,
  },
  comment: {
    type: String,
    required: true,
  },
  author: {
    type: Schema.Types.ObjectId,
    ref: "User",  // Assuming each review is linked to a user
  },
});

const Review = mongoose.model("Review", reviewSchema);

module.exports = Review;
