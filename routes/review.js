const express = require("express");
const router = express.Router();
const Listing = require("../models/listing"); // Ensure the path to the model is correct
const Review = require("../models/review");
const wrapAsync = require("../utils/wrapAsync.js"); // Include your async wrapper if needed

// Add a new review
router.post("/:id/reviews", wrapAsync(async (req, res) => {
    const { id } = req.params;
    const listing = await Listing.findById(id);
    const newReview = new Review(req.body.review);

    listing.reviews.push(newReview);
    await newReview.save();
    await listing.save();

    res.redirect(`/listings/${id}`);
}));

// Delete a review
router.delete("/:id/reviews/:reviewId", wrapAsync(async (req, res) => {
    const { id, reviewId } = req.params;
    await Listing.findByIdAndUpdate(id, { $pull: { reviews: reviewId } });
    await Review.findByIdAndDelete(reviewId);
    res.redirect(`/listings/${id}`);
}));

module.exports = router;
